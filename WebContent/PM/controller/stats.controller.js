/**
 * @module PM
 * @author Manh Phuoc Nguyen
 */
sap.ui.getCore().loadLibrary("openui5.googlemaps", "/Pm/libs/googlemaps/");
//   "/Pm/libs/googlemaps/" -> local
//   "/Pm/PM/libs/googlemaps/" -> remote

sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/Device",
  "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, Device, JSONModel) {
  "use strict";

  return Controller.extend("mpn.PM.controller.stats", {

    onInit: function () {
      // set device model
      var oDeviceModel = new JSONModel(Device);
      this.getView().setModel(oDeviceModel, "device");
      this.createCanvas();
      this.onRefreshStats();
    },

    onAfterRendering: function () {

    },

    /**
     * navigate back to master view
     */
    onNavBack: function () {
      this.getView().oParent.oParent.backToTopMaster();
    },

    getGeschaeftEntitySet: function (callback) {
      this.getView().setBusy(true);
      var oThat = this;

      $.ajax("http://192.168.20.20:3000/GeschaeftEntitySet")
        .done(function (data, textStatus, jqXHR) {
          callback(data, undefined);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          callback(undefined, errorThrown);
        })
        .always(function () {
          oThat.getView().setBusy(false);
        });

    },

    getEinkaufEntitySetWithRange: function (sFirstDayInYear, sLastDayInYear) {
      var oThat = this;
      //get einkaufEntitySet
      $.ajax({
        type: 'POST',
        data: JSON.stringify({
          'startDate': sFirstDayInYear,
          'endDate': sLastDayInYear
        }),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        url: "http://192.168.20.20:3000/EinkaufEntitySet",
      }).done(function (data, textStatus, jqXHR) {
        //parse to months
        var aMonthRevenues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (var array = 0; array < data.results.length; array++) {
          var iMonth = (new Date(data.results[array].eink_datum)).getMonth();

          switch (iMonth) {
            case 0:
              aMonthRevenues[0] = parseInt(aMonthRevenues[0] + data.results[array].eink_wert);
              break;
            case 1:
              aMonthRevenues[1] = parseInt(aMonthRevenues[1] + data.results[array].eink_wert);
              break;
            case 2:
              aMonthRevenues[2] = parseInt(aMonthRevenues[2] + data.results[array].eink_wert);
              break;
            case 3:
              aMonthRevenues[3] = parseInt(aMonthRevenues[3] + data.results[array].eink_wert);
              break;
            case 4:
              aMonthRevenues[4] = parseInt(aMonthRevenues[4] + data.results[array].eink_wert);
              break;
            case 5:
              aMonthRevenues[5] = parseInt(aMonthRevenues[5] + data.results[array].eink_wert);
              break;
            case 6:
              aMonthRevenues[6] = parseInt(aMonthRevenues[6] + data.results[array].eink_wert);
              break;
            case 7:
              aMonthRevenues[7] = parseInt(aMonthRevenues[7] + data.results[array].eink_wert);
              break;
            case 8:
              aMonthRevenues[8] = parseInt(aMonthRevenues[8] + data.results[array].eink_wert);
              break;
            case 9:
              aMonthRevenues[9] = parseInt(aMonthRevenues[9] + data.results[array].eink_wert);
              break;
            case 10:
              aMonthRevenues[10] = parseInt(aMonthRevenues[10] + data.results[array].eink_wert);
              break;
            case 11:
              aMonthRevenues[11] = parseInt(aMonthRevenues[11] + data.results[array].eink_wert);
              break;

            default:
              break;

          }
        }

        //setup chart with data
        oThat.setupChart(aMonthRevenues);
      })
        .fail(function (jqXHR, textStatus, errorThrown) {
          MessageToast.show("Es ist ein Fehler angefallen. Benachrichten Sie Herrn Nguyen.");
        })
        .always(function () {
          oThat.getView().setBusy(false);
        });
    },

    getEinkaufEntitySet: function (callback) {
      this.getView().setBusy(true);
      var oThat = this;

      $.ajax("http://192.168.20.20:3000/EinkaufEntitySet")
        .done(function (data, textStatus, jqXHR) {
          callback(data, undefined);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          callback(undefined, errorThrown);
        })
        .always(function () {
          oThat.getView().setBusy(false);
        });

    },

    onRefreshStats: function () {
      var oThat = this;
      var oDefGeschaeft = $.Deferred();
      var oDefEinkauf = $.Deferred();

      //init geschaefte entityset
      this.getGeschaeftEntitySet.call(this, (function (oData, oError) {
        if (oError === undefined) {
          oDefGeschaeft.resolve(oData);
        } else {
          MessageToast.show("Die Geschäfte konnten nicht geladen werden.");
          console.log(oError);

          oDefGeschaeft.reject();
        }
      }));


      //init einkaeufe entityset
      this.getEinkaufEntitySet(function (oData, oError) {
        if (oError === undefined) {
          oDefEinkauf.resolve(oData);
        } else {
          MessageToast.show("Die Einkäufe konnten nicht geladen werden.");
          console.log(oError);

          oDefEinkauf.reject();
        }
      });

      //set models
      $.when(oDefGeschaeft, oDefEinkauf).done(function (oGeschaeftCb, oEinkaufCb) {
        /**
         * geschaeft
         */
        var oModel = new JSONModel();
        oModel.setData(oGeschaeftCb);
        oThat.getView().setModel(oModel, "Geschaefte");

        /**
         * einkauf
         */
        oModel = new JSONModel();
        oModel.setData(oEinkaufCb);
        oThat.getView().setModel(oModel, "Einkaeufe");

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

          oSum.total = (oSum.total) + (aPurchases[i].eink_wert);
        }

        //sum model
        var oSumModel = new JSONModel();
        oSumModel.setData(oSum);
        oThat.getView().setModel(oSumModel, 'sum');

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

        if ((oSumNici.total + f20Per) < oSumMani.total) {
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
        oThat.getView().setModel(oManiModel, 'mani');

        var oNiciModel = new JSONModel();
        oNiciModel.setData(oSumNici);
        oThat.getView().setModel(oNiciModel, 'nici');

        /**
         * local with most revenue
         */
        var oGeschaeft = oThat.getView().getModel("Geschaefte").oData.results;
        var oEinkauf = oThat.getView().getModel("Einkaeufe").oData.results;
        var aRevenue = [];      //array with cumulated revenue
        var fTempCounter = 0;   // helper counter for highest location by revenue
        var oMostRevenueLoc;    // helper for highest location by revenue

        var iTempCounter = 0;   //helper counter for most frequently visited location
        var oFreqVisLoc;        //helper for most frequently visited location

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
        oModel.setData(oMostRevenueLoc);
        oThat.getView().setModel(oModel, 'HighRevLoc');


        /**
         * get most frequently visited location
         */
        //set model most frequently visited location
        var oModel2 = new JSONModel();
        oModel2.setData(oFreqVisLoc);
        oThat.getView().setModel(oModel2, 'MostFreqVisLoc');
      });
    },

    setupChart: function (aMonthRevenues) {
      var ctx = document.getElementById("statChartjsCanvas");
      var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
          datasets: [{
            label: 'Monatsausgaben',
            data: aMonthRevenues,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            // [
            // 'rgba(255, 99, 132, 0.2)',
            // 'rgba(54, 162, 235, 0.2)',
            // 'rgba(255, 206, 86, 0.2)',
            // 'rgba(75, 192, 192, 0.2)',
            // 'rgba(153, 102, 255, 0.2)',
            // 'rgba(255, 159, 64, 0.2)'
            // ],
            borderColor: 'rgba(54, 162, 235, 1)',
            // [
            // 'rgba(255,99,132,1)',
            // 'rgba(54, 162, 235, 1)',
            // 'rgba(255, 206, 86, 1)',
            // 'rgba(75, 192, 192, 1)',
            // 'rgba(153, 102, 255, 1)',
            // 'rgba(255, 159, 64, 1)'
            // ],

            borderWidth: 1
          }]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
    },

    //create canvas element to html 
    createCanvas: function () {
      this.getView().byId("htmlContainer").setContent('<canvas id="statChartjsCanvas" width="300px" height="300px"></canvas>');
    },

    // on click on tab bar filter 
    onSelectTabbarFilter: function (oEvent) {
      this.getView().setBusy(true);

      var dPicker = this.getView().byId("chartDatePicker").getDateValue();
      var dYear = dPicker.getFullYear();
      var sFirstDayInYear = String(dYear).concat("-01-01");
      var sLastDayInYear = String(dYear).concat("-12-31");

      this.getEinkaufEntitySetWithRange.apply(this, [sFirstDayInYear, sLastDayInYear]);

    },

    onChangeChartDate: function (oEvent) {
      this.getView().setBusy(true);
      var sYear = oEvent.oSource.getValue();
      var sFirstDayInYear = sYear.concat("-01-01");
      var sLastDayInYear = sYear.concat("-12-31");

      this.getEinkaufEntitySetWithRange.apply(this, [sFirstDayInYear, sLastDayInYear]);
    }

  });
});