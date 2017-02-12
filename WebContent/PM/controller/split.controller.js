sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], function (Controller, MessageToast) {
  "use strict";

  return Controller.extend("mpn.PM.controller.split", {


    onInit: function () {
      this.getView().setModel(this.getOwnerComponent().getModel("menu"), "menu");
    },

    onAfterRendering: function () {
      
    }, 


    /**
     * menu press
     */
    onMenuPress: function(oEvent){
      var sPath = oEvent.oSource.oBindingContexts.menu.sPath;
      var oMenuModel = this.getView().getModel("menu");
      var sPageId = oMenuModel.getProperty(sPath).pageId;

      this.getView().byId("pmSplitApp").to(this.createId(sPageId));
      this.getView().byId("pmSplitApp").hideMaster();
    }

  });
});