sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/Device",
  "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, Device, JSONModel) {
  "use strict";

  return Controller.extend("mpn.PM.controller.shop", {


    onInit: function () {
      // set device model
      var oDeviceModel = new JSONModel(Device);
      this.getView().setModel(oDeviceModel, "device");

      //init geschaefte entityset
      this.getGeschaeftEntitySet();
    },

    onAfterRendering: function () {

    },

    onAddLocation: function (oEvent) {
      this.getView().byId("addShopDialog").open();
    },

    onAddShop: function (oEvent) {
      this.getView().byId("addShopDialog").close();
    },

    onCancelShop: function (oEvent) {
      this.getView().byId("addShopDialog").close();
    },

    onNavBack: function () {
      this.getView().oParent.oParent.backToTopMaster();
    },

    getGeschaeftEntitySet: function (callback) {
      var oThat = this;

      $.ajax("http://192.168.20.20:3000/GeschaeftEntitySet")
        .done(function (data, textStatus, jqXHR) {
          var oModel = new JSONModel();
          oModel.setData(data);
          oThat.getView().setModel(oModel, "Geschaefte");
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          debugger
        });

    }

  });
});