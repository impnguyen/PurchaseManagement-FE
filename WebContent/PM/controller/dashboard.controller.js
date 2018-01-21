/**
 * @module dashboard
 * @author Manh Phuoc Nguyen
 */
sap.ui.define([
  "mpn/PM/controller/BaseController",
  "sap/m/MessageToast"
], function (BaseController, MessageToast) {
  "use strict";

  return BaseController.extend("mpn.PM.controller.dashboard", {

    /**
     * set up dashboard
     * @memberOf module:dashboard
     */
    onInit: function () {
    },

    /**
     * @memberOf module:dashboard
     * @param {object} oEvent - item press event
     */
    onShowGroup: function (oEvent) {
      this.getRouter().navTo("myGroup", {
        groupId: '3849234783294'
      });
    }, 

  });
});