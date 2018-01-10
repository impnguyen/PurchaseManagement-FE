/*jshint esversion: 6 */

/**
 * @module Overview
 * @author Manh Phuoc Nguyen
 */
sap.ui.define(
  [
    "mpn/PM/controller/BaseController",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "mpn/PM/js/formatter",
    "sap/ui/unified/DateTypeRange",
    "mpn/PM/model/Shop",
    "mpn/PM/model/Purchase",
    "mpn/PM/model/Payer"
  ],
  function(
    BaseController,
    MessageToast,
    JSONModel,
    formatter,
    DateTypeRange,
    Shop,
    Purchase,
    Payer
  ) {
    "use strict";
    return BaseController.extend("mpn.PM.controller.overview", {
      formatter: formatter,

      /**
		 * set device model 
		 * @memberOf module:Overview
		 */
      onInit: function() {
        this.setupDeviceModel();
      },

      /**
		 * triggers overview setup
		 * @memberOf module:Overview
		 */
      onAfterRendering: function() {
        this.setupOverview();
      },

      /**
		 * navigate back to top master view
		 * @memberOf module:Overview
		 */
      onNavBack: function() {
        this.getView().oParent.oParent.backToTopMaster();
      },

      /**
		 * open calendar popover
		 * @memberOf module:Overview
		 * @param {object} oEvent - item press event
		 */
      onCal: function(oEvent) {
        this.getView().byId("calendarPopover").openBy(oEvent.getSource());
      },

      /**
		 * setup overview models and binding
		 * @memberOf module:Overview
		 */
      setupOverview: function() {
        //deferred objects
        var oDefEinkauf = jQuery.Deferred();
        var oDefZahler = jQuery.Deferred();
        var oDefGeschaeft = jQuery.Deferred();

        //global vars
        var oThat = this;

        //promise super objects
        var purchase;
        var payer;
        var shop;

        //get purchases
        this.getFireBaseIdToken()
          .then(function(token) {
            return token;
          })
          .then(function(token) {
            //TODO: refactor contructor as object
            purchase = new Purchase(null, null, null, null, null, token);
            return purchase.getAllPurchases();
          })
          .then(function(oData) {
            oDefEinkauf.resolve(new JSONModel(oData));
          })
          .catch(function(oError) {
            //error handling
            MessageToast.show("Die Einkäufe konnten nicht geladen werden.");
            oDefEinkauf.reject();
          });

        //get payers
        this.getFireBaseIdToken()
          .then(function(token) {
            return token;
          })
          .then(function(token) {
            payer = new Payer({ fbIdToken: token });
            return payer.getPayers();
          })
          .then(function(oData) {
            oDefZahler.resolve(new JSONModel(oData));
          })
          .catch(function(oError) {
            //error handling
            MessageToast.show("Die Zahler konnten nicht geladen werden.");
            oDefZahler.reject();
          });

        //get shops
        this.getFireBaseIdToken()
          .then(function(token) {
            return token;
          })
          .then(function(token) {
            shop = new Shop(null, token);
            return shop.getShops();
          })
          .then(function(oData) {
            oDefGeschaeft.resolve(new JSONModel(oData));
          })
          .catch(function(oError) {
            //error handling
            MessageToast.show("Die Geschäfte konnten nicht geladen werden.");
            oDefGeschaeft.reject();
          });

        //check for deferred objects
        $.when(oDefGeschaeft, oDefZahler, oDefEinkauf)
          .done(function(oShops, oPayer, oEinkauf) {
            //set raw model
            oThat.getView().setModel(
              new JSONModel({
                geschaeft: oShops.oData.results,
                zahler: oPayer.oData.results,
                einkauf: oEinkauf.oData.results
              }),
              "raw"
            );

            //setup month
            oThat.setUpTableModelByDate.apply(oThat);
          })
          .fail(function() {
            MessageToast.show(
              "Es ist ein Fehler aufgetreten. Probiere es später noch einmal."
            );
            console.warn(
              "request queue konnte nicht erfolgreich abgeschlossen werden"
            );
          });
      },

      /**
		 * setup model for table by month
		 * @memberOf module:Overview
		 */
      setUpTableModelByDate: function() {
        var oPurchases = this.getView().getModel("raw").oData.einkauf;
        var oPayer = this.getView().getModel("raw").oData.zahler;
        var oShops = this.getView().getModel("raw").oData.geschaeft;
        var oTmpModel = { results: [] };
        var dStartDate = this.getView().byId("overviewCalendar").getStartDate();
        var dEndDate = this.getLastDayOfMonth(
          dStartDate.getFullYear(),
          dStartDate.getMonth() + 1
        );

        //set title
        this.setPageTitle(dStartDate.getMonth());

        //build temp purchases model
        oPurchases.forEach(function(oPurch) {
          if (
            new Date(oPurch.eink_datum) >= dStartDate &&
            new Date(oPurch.eink_datum) <= dEndDate
          ) {
            oTmpModel.results.push(oPurch);
          }
        });

        //add zahler and geschaeft  to temp einkaeufe model
        oTmpModel.results.forEach(function(oTmp) {
          // add zah_alias to tmp
          oPayer.forEach(function(oPayer) {
            if (oTmp.zah_id === oPayer.zah_id) {
              oTmp.zah_alias = oPayer.zah_alias;
            }
          });

          //add ges_name to tmp
          oShops.forEach(function(oShop) {
            if (oTmp.ges_id === oShop.ges_id) {
              oTmp.ges_name = oShop.ges_name;
            }
          });
        });

        this.getView().setModel(new JSONModel(oTmpModel), "Einkaeufe");

        //setup calendar
        this.setupCalendarSpecialDates();

        //set footer summary
        this.setPageFooter();
      },

      /**
		 * get last date of month
		 * @memberOf module:Overview
		 * @param {string} Year - year as string
		 * @param {string} Month - month as string
		 * @return {Date} - returns the date
		 */
      getLastDayOfMonth: function(Year, Month) {
        return new Date(new Date(Year, Month, 1) - 1);
      },

      /**
		  * set page title
		  * @memberOf module:Overview
		  * @param {integer} iMonth - month as integer [0...11]
		  */
      setPageTitle: function(iMonth) {
        var month = [];
        month[0] = "January";
        month[1] = "February";
        month[2] = "March";
        month[3] = "April";
        month[4] = "May";
        month[5] = "June";
        month[6] = "July";
        month[7] = "August";
        month[8] = "September";
        month[9] = "October";
        month[10] = "November";
        month[11] = "December";
        var sMonth = month[iMonth];

        this.getView().byId("overviewPage").setTitle("Purchases: " + sMonth);
      },

      /**
		 * set view footer with summary
		 * @memberOf module:Overview
		 */
      setPageFooter: function() {
        var oThat = this;
        var oPurchases = this.getView().getModel("Einkaeufe").oData.results;
        var oPayers = oThat.getView().getModel("raw").oData.zahler;
        var oPayerExt = jQuery.extend(
          true,
          [],
          this.getView().getModel("raw").oData.zahler
        );

        oPurchases.forEach(function(oPurch) {
          oPayers.forEach(function(oPayer) {
            if (oPurch.zah_id === oPayer.zah_id) {

              oPayerExt.forEach(function(oPayExt) {
                if (oPayExt.zah_id === oPurch.zah_id) {
                  if (oPayExt.zah_count === undefined) {
                    oPayExt.zah_count = 0;
                  }
                  oPayExt.zah_count = parseFloat(oPayExt.zah_count) + parseFloat(oPurch.eink_wert);
                }
              });
            }
          });
        });

        try {
          //try to fix decimals
          this.getView()
            .byId("userMani")
            .setText("Mani: " + oPayerExt[0].zah_count.toFixed(2) + " €");
        } catch (error) {
          if (error.name === "TypeError") {
            console.warn("no payments for mani in selected month");
          } else {
            throw "uncaught error: in setPageFooter method (overview.controller.js)";
          }
        }

        try {
          //try to fix decimals
          this.getView()
            .byId("userNici")
            .setText("Nici: " + oPayerExt[1].zah_count.toFixed(2) + " €");
        } catch (error) {
          if (error.name === "TypeError") {
            console.warn("no payments for nicole in selected month");
          } else {
            throw "uncaught error: in setPageFooter method (overview.controller.js)";
          }
        }
      },

      /**
		 * on change calendar handler; setup table model; close the calendar popover
		 * @memberOf module:Overview
		 */
      onChangeCal: function() {
        this.setUpTableModelByDate();
        this.getView().byId("calendarPopover").close();
      },

      /**
		 * set special dates
		 * @memberOf module:Overview
		 */
      setupCalendarSpecialDates: function() {
        let oCal = this.getView().byId("overviewCalendar");
        oCal.destroySpecialDates();

        this.getView().getModel("raw").oData.einkauf.forEach(function(oPurch) {
          oCal.addSpecialDate(
            new DateTypeRange({
              startDate: new Date(oPurch.eink_datum),
              type: "Type10"
            })
          );
        });
      },

      // set device model
      setupDeviceModel: function() {
        this.getView().setModel(new JSONModel(sap.ui.Device), "device");
      }
    });
  }
);
