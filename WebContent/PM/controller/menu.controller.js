sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], function (Controller, MessageToast) {
  "use strict";

  return Controller.extend("mpn.PM.controller.menu", {


    onInit: function () {
      this.getView().setModel(this.getOwnerComponent().getModel("menu"), "menu");
    },

    onAfterRendering: function () {
    }

  });
});