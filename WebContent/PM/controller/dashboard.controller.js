/**
 * @module dashboard
 * @author Manh Phuoc Nguyen
 */
sap.ui.define([
  "mpn/PM/controller/BaseController",
  "sap/m/MessageToast",
  "mpn/PM/model/Group",
  "sap/ui/model/json/JSONModel"
], function (BaseController, MessageToast, Group, JSONModel) {
  "use strict";

  return BaseController.extend("mpn.PM.controller.dashboard", {

    /**
     * set up dashboard
     * @memberOf module:dashboard
     */
    onInit: function () {
      this.setupModels();
    },

    onRefreshDb: function(){
      this.setupModels();
    },

    /**
     * setup groups by user
     * @memberOf module:dashboard
     */
    setupModels: function(){
      this.getView().setBusy(true);
      var group;
      var oThat = this;
      
      //get user groups
      this.getFireBaseIdToken()
      .then(function(token) {
        return token;
      })
      .then(function(token) {
        group = new Group({ fbIdToken: token });
        return group.getGroups();
      })
      .then(function(oData) {
        oThat.getOwnerComponent().setModel(new JSONModel(oData), "usergroups");
      })
      .catch(function(oError) {
        MessageToast.show("Deine Gruppen konnten nicht geladen werden. Versuche es später noch einmal. ");
      })
      .then(function(){
        oThat.getView().setBusy(false);
      });
    }, 

    /**
     * on press tile
     */
    onPressTile: function(oEvent){
      var sSelPath = oEvent.oSource.oBindingContexts.usergroups.sPath;
      var oModel = oEvent.oSource.oBindingContexts.usergroups.oModel;
      var oSelItem = oModel.getProperty(sSelPath);

      this.getRouter().navTo("myGroup", {
        groupId: oSelItem.gr_id
      });
    }

  });
});