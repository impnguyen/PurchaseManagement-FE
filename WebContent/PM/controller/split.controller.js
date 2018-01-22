/**
 * @module PM
 * @author Manh Phuoc Nguyen
 */
sap.ui.define(
  [
    "mpn/PM/controller/BaseController",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
  ],
  function(BaseController, MessageToast, JSONModel) {
    "use strict";
    return BaseController.extend("mpn.PM.controller.split", {
      onInit: function() {
        //handle routing
        this.getRouter()
          .getRoute("myGroup")
          .attachMatched(this._onRouteMatched, this);

        //set menu model based on language
        if (sap.ui.getCore().getConfiguration().getLanguage() === "de") {
          this.getView().setModel(
            this.getOwnerComponent().getModel("menu_de"),
            "menu"
          );
        } else {
          this.getView().setModel(
            this.getOwnerComponent().getModel("menu_en"),
            "menu"
          );
        }
      },

      /**
     * handle route matched
     */
      _onRouteMatched: function(oEvent) {
        var oArgs, oView, groupId, usergroups;

        oArgs = oEvent.getParameter("arguments");
        groupId = oArgs.groupId;
        usergroups = this.getOwnerComponent().getModel("usergroups").oData
          .results;

        //set selected group model
        usergroups.forEach(element => {
          if (element.gr_id.toString() === groupId) {
            this.getOwnerComponent().setModel(
              new JSONModel(element),
              "selectedgroup"
            );
          }
        });
      },

      /**
	 * menu press
	 */
      onMenuPress: function(oEvent) {
        var sPath = oEvent.oSource.oBindingContexts.menu.sPath;
        var oMenuModel = this.getView().getModel("menu");
        var sViewName = oMenuModel.getProperty(sPath).viewName;

        this.getRouter().navTo(sViewName, {
          groupId: this.getSelectedGroupId()
        });
      },

      onCloseGroup: function() {
        this.getRouter().navTo("dashboard");
      }
    });
  }
);
