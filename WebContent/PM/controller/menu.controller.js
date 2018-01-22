/**
 * @module Menu
 * @author Manh Phuoc Nguyen
 * @deprecated unused
 */
sap.ui.define(
  ["mpn/PM/controller/BaseController", "sap/m/MessageToast"],
  function(BaseController, MessageToast) {
    "use strict";
    return BaseController.extend("mpn.PM.controller.menu", {
      /**
     * set menu model
     * @memberOf module:Menu
     */
      onInit: function() {
        this.getView().setModel(
          this.getOwnerComponent().getModel("menu"),
          "menu"
        );
      },

      /**
     * menu press handler: handles menu navigation
     * @memberOf module:Menu
     * @param {object} oEvent - item press event
     */
      onMenuPress: function(oEvent) {
        var sPath = oEvent.oSource.oBindingContexts.menu.sPath;
        var oMenuModel = this.getView().getModel("menu");
        var sPageId = oMenuModel.getProperty(sPath).pageId;

        // this.getView().oParent.oParent.toDetail(sPageId);
        // this.getView().oParent.oParent.hideMaster();

        this.getRouter().navTo("shops", {
          groupId: oThat.getSelectedGroupId,
          funcId: sPageId
        });
      }
    });
  }
);
