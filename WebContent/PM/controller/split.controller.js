/**
 * @module PM
 * @author Manh Phuoc Nguyen
 */
sap.ui.define([
  "mpn/PM/controller/BaseController",
  "sap/m/MessageToast"
], function (BaseController, MessageToast) {
  "use strict";

  return BaseController.extend("mpn.PM.controller.split", {

    onInit: function () {
      //set menu model based on language
      if(sap.ui.getCore().getConfiguration().getLanguage() === 'de'){
    	  this.getView().setModel(this.getOwnerComponent().getModel("menu_de"), "menu");
      }else{
    	  this.getView().setModel(this.getOwnerComponent().getModel("menu_en"), "menu");
      }
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
    }, 

    onCloseGroup: function(){
      this.getRouter().navTo("dashboard");
    }

  });
});