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

        //get firebase id
        this.getFireBaseIdToken().then(
          function(token) {
            //get purchases
            var purchase = new Purchase(null, null, null, null, null, token);
            purchase.getAllPurchases(function(oData, oError) {
              if (oError === null) {
                oDefEinkauf.resolve(new JSONModel(oData));
              } else {
                MessageToast.show("Die Einkäufe konnten nicht geladen werden.");
                console.warn(oError);
                oDefEinkauf.reject();
              }
            });
          },
          function(error) {
            if (
              window.confirm(
                "Wir konnten dich nicht eindeutig identifizieren. Die App wird neu geladen."
              )
            ) {
              location.reload();
            }
          }
        );

        //set payer
        var payer = new Payer();
        payer
          .getPayers()
          .then(
            function(oData) {
              oDefZahler.resolve(new JSONModel(oData));
            },
            function(error) {
              MessageToast.show("Die Zahler konnten nicht geladen werden.");
              console.warn(
                "Payer entity konnte im promise nicht requestet werden"
              );
              oDefZahler.reject();
            }
          )
          .catch(function(err) {
            console.warn(err);
          });

        //set shops
        var shop = new Shop();
        shop
          .getShops()
          .then(
            function(oData) {
              oDefGeschaeft.resolve(new JSONModel(oData));
            },
            function(error) {
              MessageToast.show("Die Geschäfte konnten nicht geladen werden.");
              console.warn("Shops Entity konnte nicht aufgerufen werden.");
              oDefGeschaeft.reject();
            }
          )
          .catch(function(err) {
            console.warn(err);
          });

        //check for deferred objects
        $.when(oDefGeschaeft, oDefZahler, oDefEinkauf)
          .done(function(oGeschaeft, oZahler, oEinkauf) {
            //set raw model
            oThat.getView().setModel(
              new JSONModel({
                geschaeft: oGeschaeft.oData.results,
                zahler: oZahler.oData.results,
                einkauf: oEinkauf.oData.results
              }),
              "raw"
            );

            //setup month
            oThat.setUpTableModelByDate();
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
        var oEinkaeufe = this.getView().getModel("raw").oData.einkauf;
        var oZahler = this.getView().getModel("raw").oData.zahler;
        var oGeschaeft = this.getView().getModel("raw").oData.geschaeft;
        var oModel2 = new JSONModel();
        var oTmpModel = {
          results: []
        };
        var dStartDate = this.getView().byId("overviewCalendar").getStartDate();
        var dEndDate = this.getLastDayOfMonth(
          dStartDate.getFullYear(),
          dStartDate.getMonth() + 1
        );

        //set title
        this.setPageTitle(dStartDate.getMonth());

        //build temp einkaeufe model
        for (var i1 = 0; i1 < oEinkaeufe.length; i1++) {
          if (
            new Date(oEinkaeufe[i1].eink_datum) >= dStartDate &&
            new Date(oEinkaeufe[i1].eink_datum) <= dEndDate
          ) {
            oTmpModel.results.push(oEinkaeufe[i1]);
          }
        }

        //add zahler and geschaeft  to temp einkaeufe model
        for (var i = 0; i < oTmpModel.results.length; i++) {
          //add zah_alias to oTmpModel
          for (var j = 0; j < oZahler.length; j++) {
            if (oTmpModel.results[i].zah_id === oZahler[j].zah_id) {
              oTmpModel.results[i].zah_alias = oZahler[j].zah_alias;
            }
          }

          //add ges_name to oTmpModel
          for (var k = 0; k < oGeschaeft.length; k++) {
            if (oTmpModel.results[i].ges_id === oGeschaeft[k].ges_id) {
              oTmpModel.results[i].ges_name = oGeschaeft[k].ges_name;
            }
          }
        }

        oModel2.setData(oTmpModel);
        this.getView().setModel(oModel2, "Einkaeufe");

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
        var oEinkaeufe = this.getView().getModel("Einkaeufe").oData.results;
        var oZahlerExt = jQuery.extend(
          true,
          [],
          this.getView().getModel("raw").oData.zahler
        );
        var oZah1Count = 0.0;
        var oZah2Count = 0.0;

        for (var i = 0; i < oEinkaeufe.length; i++) {
          for (
            var j = 0;
            j < this.getView().getModel("raw").oData.zahler.length;
            j++
          ) {
            if (
              oEinkaeufe[i].zah_id ===
              this.getView().getModel("raw").oData.zahler[j].zah_id
            ) {
              //ext zahler model with count
              for (var k = 0; k < oZahlerExt.length; k++) {
                if (oZahlerExt[k].zah_id === oEinkaeufe[i].zah_id) {
                  if (oZahlerExt[k].zah_count === undefined) {
                    oZahlerExt[k].zah_count = 0;
                  }

                  oZahlerExt[k].zah_count =
                    parseFloat(oZahlerExt[k].zah_count) +
                    parseFloat(oEinkaeufe[i].eink_wert);
                }
              }
            }
          }
        }

        try {
          //try to fix decimals
          this.getView()
            .byId("userMani")
            .setText("Mani: " + oZahlerExt[0].zah_count.toFixed(2) + " €");
          this.getView()
            .byId("userNici")
            .setText("Nici: " + oZahlerExt[1].zah_count.toFixed(2) + " €");
        } catch (error) {
          if (error.name === "TypeError") {
            console.warn("no payments in selected month");
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
        var oEinkaeufe = this.getView().getModel("raw").oData.einkauf;
        var oCal = this.getView().byId("overviewCalendar");
        oCal.destroySpecialDates();

        for (var i = 0; i < oEinkaeufe.length; i++) {
          //add special date to cal
          oCal.addSpecialDate(
            new DateTypeRange({
              startDate: new Date(oEinkaeufe[i].eink_datum),
              type: "Type10"
            })
          );
        }
      },

      // set device model
      setupDeviceModel: function() {
        this.getView().setModel(new JSONModel(sap.ui.Device), "device");
	  }
	  
    });
  }
);
