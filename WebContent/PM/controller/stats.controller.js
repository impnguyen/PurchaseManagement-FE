sap.ui.getCore().loadLibrary("openui5.googlemaps", "/Pm/libs/googlemaps/");
//../libs/googlemaps
//"/Pm/libs/googlemaps/"

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

    getGeschaeftEntitySet: function () {
      this.getView().setBusy(true);
      var oThat = this;

      $.ajax("http://192.168.20.20:3000/GeschaeftEntitySet")
        .done(function (data, textStatus, jqXHR) {
          var oModel = new JSONModel();
          oModel.setData(data);
          oThat.getView().setModel(oModel, "Geschaefte");
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          MessageToast.show("Die Geschäfte konnten nicht geladen werden.");
        })
        .always(function () {
          oThat.getView().setBusy(false);
        });

    },

    getEinkaufEntitySet: function () {
      this.getView().setBusy(true);
      var oThat = this;

      $.ajax("http://192.168.20.20:3000/EinkaufEntitySet")
        .done(function (data, textStatus, jqXHR) {
          var oModel = new JSONModel();
          oModel.setData(data);
          oThat.getView().setModel(oModel, "Einkaeufe");

          //build purchase overview stats model
          var aPurchases = data.results;
          var aMani = []; // 1
          var aNici = []; // 2
          var oSum = {total:0};
          var oSumMani = {total: 0, indicator: "", valueColor: ""};
          var oSumNici = {total: 0, indicator: "", valueColor: ""};

          for(var i = 0; i < aPurchases.length; i++){
            if(aPurchases[i].zah_id === 1){
              aMani.push(aPurchases[i]);
            }else{
              aNici.push(aPurchases[i]);
            }

            oSum.total = (oSum.total) + (aPurchases[i].eink_wert);
          }

          //sum model
          var oSumModel = new JSONModel();
          oSumModel.setData(oSum);
          oThat.getView().setModel(oSumModel, 'sum');

          // mani model
          for(var i = 0; i < aMani.length; i++){
            oSumMani.total = oSumMani.total + aMani[i].eink_wert;
          }

          // nici model
          for(var i = 0; i < aNici.length; i++){
            oSumNici.total = oSumNici.total + aNici[i].eink_wert;
          }

          //set meta inf
          var fDiff = oSumMani.total - oSumNici.total;
          var f20Per = oSumMani.total / 100 * 20;

          if( (oSumNici.total + f20Per) < oSumMani.total){
            oSumNici.valueColor = "Error";
            oSumMani.valueColor = "Good";
            oSumNici.indicator = "Up";
            oSumMani.indicator = "Down";
          }else {
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


        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          MessageToast.show("Die Einkäufe konnten nicht geladen werden.");
        })
        .always(function () {
          oThat.getView().setBusy(false);
        });

    },

    onRefreshStats: function () {
      //init geschaefte entityset
      this.getGeschaeftEntitySet();

      //init einkaeufe entityset
      this.getEinkaufEntitySet();
    }

  });
});