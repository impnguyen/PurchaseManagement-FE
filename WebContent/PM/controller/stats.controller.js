sap.ui.getCore().loadLibrary("openui5.googlemaps", "/Pm/libs/googlemaps/");
//   "/Pm/libs/googlemaps/" -> local
//   "/Pm/PM/libs/googlemaps/" -> remote
//   "../libs/googlemaps" -> remote

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

      this.onRefreshStats();
    },

    onAfterRendering: function () {

    },

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
      $.when(oDefGeschaeft, oDefEinkauf).done(function (oGeschaeft, oEinkauf) {
        /**
         * geschaeft
         */
         var oModel = new JSONModel();
          oModel.setData(oGeschaeft);
          oThat.getView().setModel(oModel, "Geschaefte");

        /**
         * einkauf
         */
        var oModel = new JSONModel();
          oModel.setData(oEinkauf);
          oThat.getView().setModel(oModel, "Einkaeufe");

          //build purchase overview stats model
          var aPurchases = oEinkauf.results;
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
          for (var i = 0; i < aMani.length; i++) {
            oSumMani.total = oSumMani.total + aMani[i].eink_wert;
          }

          // nici model
          for (var i = 0; i < aNici.length; i++) {
            oSumNici.total = oSumNici.total + aNici[i].eink_wert;
          }

          //set meta inf
          var fDiff = oSumMani.total - oSumNici.total;
          // var f20Per = oSumMani.total / 100 * 20;
          var f20Per = oSumMani.total / 100 * (40*100/90);

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
          var oEinkauf   = oThat.getView().getModel("Einkaeufe").oData.results;
          var aRevenue = []; //array with cumulated revenue
          var fTempCounter = 0;
          var oMostRevenueLoc;

          for(var i = 0; i < oGeschaeft.length; i++){
            var oTmp = {
              ges_id: oGeschaeft[i].ges_id,
              ges_name: oGeschaeft[i].ges_name,
              eink_wert: 0,
              ges_count: oGeschaeft[i].ges_besuche
            };

            for(var j = 0; j < oEinkauf.length; j++){
              if(oGeschaeft[i].ges_id === oEinkauf[j].ges_id){
                oTmp.eink_wert = oTmp.eink_wert +  oEinkauf[j].eink_wert
              }
            }

            aRevenue.push(oTmp);

            //helper for  highest location by revenue
            if(oTmp.eink_wert > fTempCounter){
              fTempCounter = oTmp.eink_wert;
              oMostRevenueLoc = oTmp;
            }
          }

          oModel.setData(oMostRevenueLoc);
          oThat.getView().setModel(oModel, 'HighRevLoc');
      });
    }

  });
});