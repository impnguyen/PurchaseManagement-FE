/**
 * @module Menu
 * @author Manh Phuoc Nguyen
 */
sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], function (Controller, MessageToast) {
  "use strict";

  return Controller.extend("mpn.PM.controller.menu", {

    /**
     * set menu model
     * @memberOf module:Menu
     */
    onInit: function () {
      this.getView().setModel(this.getOwnerComponent().getModel("menu"), "menu");
    },

    /**
     * menu press handler: handles menu navigation
     * @memberOf module:Menu
     * @param {object} oEvent - item press event
     */
    onMenuPress: function (oEvent) {
      var sPath = oEvent.oSource.oBindingContexts.menu.sPath;
      var oMenuModel = this.getView().getModel("menu");
      var sPageId = oMenuModel.getProperty(sPath).pageId;

      this.getView().oParent.oParent.toDetail(sPageId);
      this.getView().oParent.oParent.hideMaster();
    }

  });
});