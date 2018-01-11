/*jshint esversion: 6 */

/**
 * @module PM
 * @author Manh Phuoc Nguyen
 */
sap.ui.getCore().loadLibrary("openui5.googlemaps", "/Pm/libs/googlemaps/");
//   "/Pm/libs/googlemaps/" -> local
//   "/Pm/PM/libs/googlemaps/" -> remote

sap.ui.define(
  [
    "mpn/PM/controller/BaseController",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "mpn/PM/model/Shop",
    "mpn/PM/model/Purchase"
  ],
  function(BaseController, MessageToast, JSONModel, Shop, Purchase) {
    "use strict";
    return BaseController.extend("mpn.PM.controller.stats", {
      onInit: function() {
        this.setModels();
        this.createChartCanvas();
        this.onRefreshStats();
      },

      /**
     * navigate back to master view
     */
      onNavBack: function() {
        this.getView().oParent.oParent.backToTopMaster();
      },

      setPurchaseInRange: function(sFirstDayInYear, sLastDayInYear) {
        var oThat = this;
        var purchase;

        //get purchases in range
        this.getFireBaseIdToken()
          .then(function(token) {
            return token;
          })
          .then(function(token) {
            //TODO: refactor contructor as object
            purchase = new Purchase({ fbIdToken: token });
            return purchase.getPurchasesInRange({
              firstDayInYear: sFirstDayInYear,
              lastDayInYear: sLastDayInYear
            });
          })
          .then(function(oData) {
            //setup chart with data
            oThat.setupChart(oThat._parseRevenuesToMonths(oData));
          })
          .catch(function(oError) {
            MessageToast.show(
              "Es ist ein Fehler in der Jahresansicht angefallen. Benachrichten Sie Herrn Nguyen."
            );
          })
          .then(function() {
            //always to this
            oThat.getView().setBusy(false);
          });
      },

      /**
       * parse revenue to months and return an year with months array
       */
      _parseRevenuesToMonths: function(aRevenue) {
        var aMonthRevenues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        aRevenue.results.forEach((oRev, index) => {
          var iMonth = new Date(oRev.eink_datum).getMonth();
          aMonthRevenues[iMonth] = parseInt(
            aMonthRevenues[iMonth] + oRev.eink_wert
          );
        });

        return aMonthRevenues;
      },

      /**
     * refresh stats view with new data
     */
      onRefreshStats: function() {
        var oThat = this;
        var oDefGeschaeft = $.Deferred();
        var oDefEinkauf = $.Deferred();
        var purchase;
        var shop;

        //get shops
        this.getFireBaseIdToken()
          .then(function(token) {
            return token;
          })
          .then(function(token) {
            shop = new Shop({ fbIdToken: token });
            return shop.getShops();
          })
          .then(function(oData) {
            oDefGeschaeft.resolve(oData);
          })
          .catch(function(oError) {
            MessageToast.show("Die Geschäfte konnten nicht geladen werden.");
            oDefGeschaeft.reject();
          });

        //get purchases
        this.getFireBaseIdToken()
          .then(function(token) {
            return token;
          })
          .then(function(token) {
            //TODO: refactor contructor as object
            purchase = new Purchase({ fbIdToken: token });
            return purchase.getAllPurchases();
          })
          .then(function(oData) {
            oDefEinkauf.resolve(oData);
          })
          .catch(function(oError) {
            MessageToast.show("Die Einkäufe konnten nicht geladen werden.");
            oDefEinkauf.reject();
          });

        //set models
        $.when(oDefGeschaeft, oDefEinkauf).done(function(
          oGeschaeftCb,
          oEinkaufCb
        ) {
          oThat.getView().setModel(new JSONModel(oGeschaeftCb), "Geschaefte");
          oThat.getView().setModel(new JSONModel(oEinkaufCb), "Einkaeufe");

          //build purchase overview stats model
          var aPurchases = oEinkaufCb.results;
          var aMani = []; // 1
          var aNici = []; // 2
          var oSum = { total: 0 };
          var oSumMani = { total: 0, indicator: "", valueColor: "" };
          var oSumNici = { total: 0, indicator: "", valueColor: "" };

          aPurchases.forEach(function(oPurch) {
            if (oPurch.zah_id === 1) {
              aMani.push(oPurch);
            } else {
              aNici.push(oPurch);
            }
            oSum.total = oSum.total + oPurch.eink_wert;
          });

          //sum model
          oThat.getView().setModel(new JSONModel(oSum), "sum");

          aMani.forEach(function(aPurch) {
            oSumMani.total = oSumMani.total + aPurch.eink_wert;
          });

          aNici.forEach(function(aPurch) {
            oSumNici.total = oSumNici.total + aPurch.eink_wert;
          });

          //set meta inf
          var fDiff = oSumMani.total - oSumNici.total;
          // var f20Per = oSumMani.total / 100 * 20;
          var f20Per = oSumMani.total / 100 * (40 * 100 / 90);

          if (oSumNici.total + f20Per < oSumMani.total) {
            oSumNici.valueColor = "Error";
            oSumMani.valueColor = "Good";
            oSumNici.indicator = "Up";
            oSumMani.indicator = "Down";
          } else {
            oSumNici.valueColor = "Good";
            oSumMani.valueColor = "Error";
            oSumNici.indicator = "Down";
            oSumMani.indicator = "Up";
          }

          oThat.getView().setModel(new JSONModel(oSumMani), "mani");
          oThat.getView().setModel(new JSONModel(oSumNici), "nici");

          /**
           * local with most revenue
           */
          var oGeschaeft = oThat.getView().getModel("Geschaefte").oData.results;
          var oEinkauf = oThat.getView().getModel("Einkaeufe").oData.results;
          var aRevenue = []; //array with cumulated revenue
          var fTempCounter = 0; // helper counter for highest location by revenue
          var oMostRevenueLoc; // helper for highest location by revenue
          var iTempCounter = 0; //helper counter for most frequently visited location
          var oFreqVisLoc; //helper for most frequently visited location

          oGeschaeft.forEach(function(oShop) {
            var oTmp = {
              ges_id: oShop.ges_id,
              ges_name: oShop.ges_name,
              eink_wert: 0,
              ges_count: oShop.ges_besuche
            };

            oEinkauf.forEach(function(oPurch) {
              if (oShop.ges_id === oPurch.ges_id) {
                oTmp.eink_wert = oTmp.eink_wert + oPurch.eink_wert;
              }
            });

            aRevenue.push(oTmp);

            //helper for highest location by revenue
            if (oTmp.eink_wert > fTempCounter) {
              fTempCounter = oTmp.eink_wert;
              oMostRevenueLoc = jQuery.extend(true, {}, oTmp);
            }

            //helper for most frequently visited location
            if (oTmp.ges_count > iTempCounter) {
              iTempCounter = oTmp.ges_count;
              oFreqVisLoc = jQuery.extend(true, {}, oTmp);
            }
          });

          //set model for highest location by revenue
          oThat
            .getView()
            .setModel(new JSONModel(oMostRevenueLoc), "HighRevLoc");

          /**
           * set most frequently visited location
           */
          oThat
            .getView()
            .setModel(new JSONModel(oFreqVisLoc), "MostFreqVisLoc");

          /**
           * get arithm. cost average
           */
          try {
            let sArithMonthAmount =
              oThat.getView().getModel("sum").oData.total /
              oThat.getView().getModel("Einkaeufe").oData.results.length;

            oThat
              .getView()
              .setModel(
                new JSONModel({ averageCost: sArithMonthAmount }),
                "average"
              );
          } catch (error) {
            MessageToast.show(
              "Die durchschnittle Monatskosten konnten nicht berechnet werden."
            );
          }
        });
      },

      /**
       * setup chart control with incoming revuenue per month array
       */
      setupChart: function(aMonthRevenues) {
        var ctx = document.getElementById("statChartjsCanvas");
        var chartjs = new Chart(ctx, {
          type: "bar",
          data: {
            labels: this.getChartLabel(),
            datasets: [
              {
                label: "Monatsausgaben",
                data: aMonthRevenues,
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1
              }
            ]
          },
          options: {
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true
                  }
                }
              ]
            }
          }
        });
      },

      //create canvas element to html
      createChartCanvas: function() {
        this.getView()
          .byId("htmlContainer")
          .setContent(
            '<canvas id="statChartjsCanvas" width="300px" height="auto"></canvas>'
          );
      },

      // on click on tab bar filter
      onSelectTabbarFilter: function(oEvent) {
        this.getView().setBusy(true);
        var dPicker = this.getView().byId("chartDatePicker").getDateValue();
        var dYear = dPicker.getFullYear();
        this.setPurchaseInRange.apply(this, [
          String(dYear).concat("-01-01"),
          String(dYear).concat("-12-31")
        ]);
      },

      onChangeChartDate: function(oEvent) {
        this.getView().setBusy(true);
        var sYear = oEvent.oSource.getValue();
        this.setPurchaseInRange.apply(this, [
          sYear.concat("-01-01"),
          sYear.concat("-12-31")
        ]);
      },

      /**
       * set device model
       */
      setModels: function() {
        this.getView().setModel(new JSONModel(sap.ui.Device), "device");
      },

      /**
       * array of months
       */
      getChartLabel: function() {
        return [
          "Januar",
          "Februar",
          "März",
          "April",
          "Mai",
          "Juni",
          "Juli",
          "August",
          "September",
          "Oktober",
          "November",
          "Dezember"
        ];
      }
    });
  }
);
