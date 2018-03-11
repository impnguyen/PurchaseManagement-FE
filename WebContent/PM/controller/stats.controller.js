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
        this.getRouter().navTo("myGroup", {
          groupId: this.getSelectedGroupId()
        });
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
            purchase = new Purchase({ fbIdToken: token });
            return purchase.getPurchasesInRange(
              {
                firstDayInYear: sFirstDayInYear,
                lastDayInYear: sLastDayInYear
              },
              {
                sGroupId: oThat.getSelectedGroupId()
              }
            );
          })
          .then(function(oData) {
            //setup chart with data
            oThat.setupChart.call(oThat, oThat._parseRevenuesToMonths(oData));
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
            return shop.getShops({ sGroupId: oThat.getSelectedGroupId() });
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
          .then(token => {
            return token;
          })
          .then(token => {
            purchase = new Purchase({ fbIdToken: token });
            return purchase.getAllPurchases({
              sGroupId: this.getSelectedGroupId()
            });
          })
          .then(oData => {
            oDefEinkauf.resolve(oData);
          })
          .catch(oError => {
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
        if (this.chartjs !== undefined) {
          try {
            this.chartjs.destroy();
          } catch (error) {
            console.log(error);
          }
        }
        this.createChart(aMonthRevenues, "horizontalBar");
      },

      //create canvas element to html
      createChartCanvas: function() {
        this.getView()
          .byId("htmlContainer")
          .setContent(
            '<canvas id="statChartjsCanvas" width="100%" height="70%%"></canvas>'
          );
      },

      // on click on tab bar filter
      onSelectTabbarFilter: function(oEvent) {
        if (oEvent.mParameters.selectedKey === "mapsFilter") {
          this.getView().setBusy(true);
          var dPicker = this.getView().byId("chartDatePicker").getDateValue();
          var dYear = dPicker.getFullYear();
          this.setPurchaseInRange.apply(this, [
            String(dYear).concat("-01-01"),
            String(dYear).concat("-12-31")
          ]);
        }
      },

      /**
       * on change date
       */
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
        this.sInitChartType = "horizontalBar";
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
      },

      /**
       * remove data from chart
       */
      removeChartData: function(chart) {
        chart.data.labels.pop();
        chart.data.datasets.forEach(dataset => {
          dataset.data.pop();
        });
        chart.update();
      },

      /**
       * create data for chart
       */
      createChart: function(aMonthRevenues, sChartType) {
        var ctx = document.getElementById("statChartjsCanvas");
        this.chartjs = new Chart(ctx, {
          type: sChartType,
          data: {
            labels: this.getChartLabel(),
            datasets: [
              {
                label: "Monatsausgaben",
                data: aMonthRevenues,
                backgroundColor: "rgb(251, 198, 100)",
                borderColor: "rgb(251, 198, 100)",
                borderWidth: 0.5,
                hoverBackgroundColor: "rgb(255, 140, 0)",
                hoverBorderColor: "rgb(255, 140, 0)",
                hoverBorderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            responsiveAnimationDuration: 100,
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

      /**
       * on change chart type
       */
      onChangeChartType: function() {
        var aMonthReveneus = this.chartjs.data.datasets.slice(0);
        this.chartjs.destroy();

        if (this.sInitChartType === "horizontalBar") {
          //vertical
          this.sInitChartType = "bar";
          this.createChart(aMonthReveneus[0].data, this.sInitChartType);
        } else {
          //horizontal
          this.sInitChartType = "horizontalBar";
          this.createChart(aMonthReveneus[0].data, this.sInitChartType);
        }
      }
    });
  }
);
