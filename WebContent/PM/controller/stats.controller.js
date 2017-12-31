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
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "mpn/PM/model/Shop",
    "mpn/PM/model/Purchase"
  ],
  function(BaseController, MessageToast, Device, JSONModel, Shop, Purchase) {
    "use strict";
    return BaseController.extend("mpn.PM.controller.stats", {
      onInit: function() {
        // set device model
        var oDeviceModel = new JSONModel(Device);
        this.getView().setModel(oDeviceModel, "device");
        this.createCanvas();
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
            purchase = new Purchase(null, null, null, null, null, token);
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
        for (var array = 0; array < aRevenue.results.length; array++) {
          var iMonth = new Date(aRevenue.results[array].eink_datum).getMonth();

          switch (iMonth) {
            case 0:
              aMonthRevenues[0] = parseInt(
                aMonthRevenues[0] + aRevenue.results[array].eink_wert
              );
              break;

            case 1:
              aMonthRevenues[1] = parseInt(
                aMonthRevenues[1] + aRevenue.results[array].eink_wert
              );
              break;

            case 2:
              aMonthRevenues[2] = parseInt(
                aMonthRevenues[2] + aRevenue.results[array].eink_wert
              );
              break;

            case 3:
              aMonthRevenues[3] = parseInt(
                aMonthRevenues[3] + aRevenue.results[array].eink_wert
              );
              break;

            case 4:
              aMonthRevenues[4] = parseInt(
                aMonthRevenues[4] + aRevenue.results[array].eink_wert
              );
              break;

            case 5:
              aMonthRevenues[5] = parseInt(
                aMonthRevenues[5] + aRevenue.results[array].eink_wert
              );
              break;

            case 6:
              aMonthRevenues[6] = parseInt(
                aMonthRevenues[6] + aRevenue.results[array].eink_wert
              );
              break;

            case 7:
              aMonthRevenues[7] = parseInt(
                aMonthRevenues[7] + aRevenue.results[array].eink_wert
              );
              break;

            case 8:
              aMonthRevenues[8] = parseInt(
                aMonthRevenues[8] + aRevenue.results[array].eink_wert
              );
              break;

            case 9:
              aMonthRevenues[9] = parseInt(
                aMonthRevenues[9] + aRevenue.results[array].eink_wert
              );
              break;

            case 10:
              aMonthRevenues[10] = parseInt(
                aMonthRevenues[10] + aRevenue.results[array].eink_wert
              );
              break;

            case 11:
              aMonthRevenues[11] = parseInt(
                aMonthRevenues[11] + aRevenue.results[array].eink_wert
              );
              break;

            default:
              break;
          }
        }

        return aRevenue;
      },

      /**
     * refresh stats view with new data
     */
      onRefreshStats: function() {
        var oThat = this;
        var oDefGeschaeft = $.Deferred();
        var oDefEinkauf = $.Deferred();
        var purchase;

        //init geschaefte entityset
        var shop = new Shop();
        shop.getShops().then(
          function(data) {
            oDefGeschaeft.resolve(data);
          },
          function(error) {
            MessageToast.show("Die Geschäfte konnten nicht geladen werden.");
            console.warn(oError);

            oDefGeschaeft.reject();
          }
        );

        //get purchases
        oThat
          .getFireBaseIdToken()
          .then(function(token) {
            return token;
          })
          .then(function(token) {
            //TODO: refactor contructor as object
            purchase = new Purchase(null, null, null, null, null, token);
            return purchase.getAllPurchases();
          })
          .then(function(oData) {
            oDefEinkauf.resolve(oData);
          })
          .catch(function(oError) {
            MessageToast.show("Die Einkäufe konnten nicht geladen werden.");
            console.warn(oError);

            oDefEinkauf.reject();
          });

        //set models
        $.when(oDefGeschaeft, oDefEinkauf).done(function(
          oGeschaeftCb,
          oEinkaufCb
        ) {
          /**
         * geschaeft
         */
          oThat.getView().setModel(new JSONModel(oGeschaeftCb), "Geschaefte");

          /**
         * einkauf
         */
          oThat.getView().setModel(new JSONModel(oEinkaufCb), "Einkaeufe");

          //build purchase overview stats model
          var aPurchases = oEinkaufCb.results;
          var aMani = []; // 1
          var aNici = []; // 2
          var oSum = { total: 0 };
          var oSumMani = { total: 0, indicator: "", valueColor: "" };
          var oSumNici = { total: 0, indicator: "", valueColor: "" };

          for (var i = 0; i < aPurchases.length; i++) {
            if (aPurchases[i].zah_id === 1) {
              aMani.push(aPurchases[i]);
            } else {
              aNici.push(aPurchases[i]);
            }

            oSum.total = oSum.total + aPurchases[i].eink_wert;
          }

          //sum model
          var oSumModel = new JSONModel();
          oSumModel.setData(oSum);
          oThat.getView().setModel(oSumModel, "sum");

          // mani model
          for (var i1 = 0; i1 < aMani.length; i1++) {
            oSumMani.total = oSumMani.total + aMani[i1].eink_wert;
          }

          // nici model
          for (var i2 = 0; i2 < aNici.length; i2++) {
            oSumNici.total = oSumNici.total + aNici[i2].eink_wert;
          }

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

          var oManiModel = new JSONModel();
          oManiModel.setData(oSumMani);
          oThat.getView().setModel(oManiModel, "mani");

          var oNiciModel = new JSONModel();
          oNiciModel.setData(oSumNici);
          oThat.getView().setModel(oNiciModel, "nici");

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

          for (var i3 = 0; i3 < oGeschaeft.length; i3++) {
            var oTmp = {
              ges_id: oGeschaeft[i3].ges_id,
              ges_name: oGeschaeft[i3].ges_name,
              eink_wert: 0,
              ges_count: oGeschaeft[i3].ges_besuche
            };

            for (var j = 0; j < oEinkauf.length; j++) {
              if (oGeschaeft[i3].ges_id === oEinkauf[j].ges_id) {
                oTmp.eink_wert = oTmp.eink_wert + oEinkauf[j].eink_wert;
              }
            }

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
          }

          //set model for highest location by revenue
          oThat
            .getView()
            .setModel(new JSONModel(oMostRevenueLoc), "HighRevLoc");

          /**
         * get most frequently visited location
         */
          //set model most frequently visited location
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

      setupChart: function(aMonthRevenues) {
        var ctx = document.getElementById("statChartjsCanvas");
        var myChart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: [
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
            ],
            datasets: [
              {
                label: "Monatsausgaben",
                data: aMonthRevenues,
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                // [
                // 'rgba(255, 99, 132, 0.2)',
                // 'rgba(54, 162, 235, 0.2)',
                // 'rgba(255, 206, 86, 0.2)',
                // 'rgba(75, 192, 192, 0.2)',
                // 'rgba(153, 102, 255, 0.2)',
                // 'rgba(255, 159, 64, 0.2)'
                // ],
                borderColor: "rgba(54, 162, 235, 1)",
                // [
                // 'rgba(255,99,132,1)',
                // 'rgba(54, 162, 235, 1)',
                // 'rgba(255, 206, 86, 1)',
                // 'rgba(75, 192, 192, 1)',
                // 'rgba(153, 102, 255, 1)',
                // 'rgba(255, 159, 64, 1)'
                // ],

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
      createCanvas: function() {
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
        var sFirstDayInYear = String(dYear).concat("-01-01");
        var sLastDayInYear = String(dYear).concat("-12-31");

        this.setPurchaseInRange.apply(this, [sFirstDayInYear, sLastDayInYear]);
      },

      onChangeChartDate: function(oEvent) {
        this.getView().setBusy(true);
        var sYear = oEvent.oSource.getValue();
        var sFirstDayInYear = sYear.concat("-01-01");
        var sLastDayInYear = sYear.concat("-12-31");

        this.setPurchaseInRange.apply(this, [sFirstDayInYear, sLastDayInYear]);
      }
    });
  }
);
