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
    },

    onAfterRendering: function () {

    }, 

    onAddLocation: function(oEvent){
      this.getView().byId("addShopDialog").open();
    }, 

    onAddShop: function(oEvent){
      this.getView().byId("addShopDialog").close();
    }, 

    onCancelShop: function(oEvent){
      this.getView().byId("addShopDialog").close();
    }, 

    onNavBack: function(){
      this.getView().oParent.oParent.backToTopMaster();
    }

  });
});