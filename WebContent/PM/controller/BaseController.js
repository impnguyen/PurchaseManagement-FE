sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History"],
  function(Controller, History) {
    "use strict";
    return Controller.extend("mpn.PM.controller.BaseController", {
      getRouter: function() {
        return sap.ui.core.UIComponent.getRouterFor(this);
      },

      // get firebase user id token
      getFireBaseIdToken: function() {
        var promise = new Promise(function(resolve, reject) {
          try {
            firebase
              .auth()
              .currentUser.getIdToken(true)
              .then(function(idToken) {
                resolve(idToken);
              })
              .catch(function(error) {
                console.error(error);
                throw error;
              });
          } catch (error) {
            reject(error);
          }
        });

        return promise;
      }, 

      //get group id
      getSelectedGroupId: function(){
        return this.getOwnerComponent().getModel('selectedgroup').oData.gr_id;
      }
    });
  }
);
