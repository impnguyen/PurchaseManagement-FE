/**
 * @module PM
 * @author Manh Phuoc Nguyen
 */
sap.ui.define(
  [
    "mpn/PM/controller/BaseController",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "mpn/PM/model/Purchase",
    "mpn/PM/js/formatter",
    "sap/ui/model/Filter",
    "mpn/PM/model/Shop"
  ],
  function(
    BaseController,
    MessageToast,
    JSONModel,
    Purchase,
    formatter,
    Filter,
    Shop
  ) {
    "use strict";
    return BaseController.extend("mpn.PM.controller.shop", {
      formatter: formatter,

      onInit: function() {
        //handle routing
        this.getRouter()
          .getRoute("shop")
          .attachMatched(this._onRouteMatched, this);
      },

      onAfterRendering: function(){
        //this.setupModels();
      },

      _onRouteMatched: function(oEvent){
        var oArgs = oEvent.getParameter("arguments");
        this.setupModels(oArgs.groupId);
      },

      /**
       * open add location fragment
       */
      onAddLocation: function(oEvent) {
        this.getView().byId("addShopDialog").open();
      },

      /**
		 * add new shop request
		 */
      onAddShop: function(oEvent) {
        var oThat = this;
        var shop;
        var oNewShop = {
          shopId: 0,
          shopName: this.getView().byId("storeNameInput").getValue(),
          shopCity: this.getView().byId("cityNameInput").getValue(),
          shopVisits: 0,
          fbIdToken: ""
        };

        this.getView().setBusy(true);

        this.getFireBaseIdToken()
          .then(function(token) {
            return token;
          })
          .then(function(token) {
            oNewShop.fbIdToken = token;
            shop = new Shop(oNewShop);
            return shop.createShop();
          })
          .then(function(oData) {
            oThat.onRefreshShops();
            oThat.resetAddShopForm.call(oThat);
            MessageToast.show("Das Geschäft wurde erfolgreich angelegt.");
            oThat.getView().byId("addShopDialog").close();
            oThat.getView().setBusy(false);
          })
          .catch(function(oError) {
            MessageToast.show("Fehler. Probiere es später aus.");
            oThat.getView().byId("addShopDialog").close();
            oThat.getView().setBusy(false);
          });
      },

      /**
		 * delete selected shop
		 */
      onDeleteShop: function(oEvent) {
        var oList = oEvent.getSource().getParent();
        var oSwipedItem = oList.getSwipedItem();
        var oThat = this;
        var shop;
        var oShopToDel = {
          shopId: this.getView()
            .getModel("Geschaefte")
            .getProperty(
              oList.getSwipedItem().oBindingContexts.Geschaefte.sPath
            ).ges_id,
          fbIdToken: ""
        };
        this.getView().setBusy(true);

        this.getFireBaseIdToken()
          .then(function(token) {
            return token;
          })
          .then(function(token) {
            oShopToDel.fbIdToken = token;
            shop = new Shop(oShopToDel);
            return shop.deleteShop();
          })
          .then(function(oData) {
            MessageToast.show("Das Geschäft wurde erfolgreich gelöscht.");
            oThat.resetAddShopForm();
            oList.swipeOut();
            oThat.getView().byId("addShopDialog").close();
            oThat.getView().setBusy(false);
          })
          .catch(function(oError) {
            MessageToast.show("Fehler. Probiere es später aus.");
            oThat.getView().byId("addShopDialog").close();
            oThat.getView().setBusy(false);
          });
      },

      /**
		 * refresh shop model
		 */
      onRefreshShops: function() {
        this.getView().getModel("Geschaefte").refresh(true, true);
        this.setShopsToView();
      },

      /**
       * close add shop fragment
       */
      onCloseDialog: function(oEvent) {
        this.getView().byId("addShopDialog").close();
      },

      /**
       * navigate back to top master list
       */
      onNavBack: function() {
        this.getRouter().navTo("myGroup", {
          groupId: this.getSelectedGroupId()
        });
      },

      /**
       * set shops entities to view list
       */
      setShopsToView: function(sGroupId) {
        this.getView().setBusy(true);
        var oThat = this;
        var shop;

        this.getFireBaseIdToken()
          .then(function(token) {
            return token;
          })
          .then(function(token) {
            shop = new Shop({ fbIdToken: token });
            return shop.getShops({sGroupId: sGroupId});//oThat.getSelectedGroupId
          })
          .then(function(oData) {
            oThat.getView().setModel(new JSONModel(oData), "Geschaefte");
          })
          .catch(function(oError) {
            MessageToast.show("Die Geschäfte konnten nicht geladen werden.");
            oThat.getView().setBusy(false);
          })
          .then(function(){
            oThat.getView().setBusy(false);
          });
      },

      /**
		 * on press shop list item handler;
		 * open items based on selected shop
		 */
      onPressShopItem: function(oEvent) {
        // var sSelPath = oEvent.oSource.oBindingContexts.Geschaefte.sPath;
        // var oModel = oEvent.oSource.oBindingContexts.Geschaefte.oModel;
        // var oSelObj = oModel.getProperty(sSelPath);
        // var iSelGesId = oSelObj.ges_id;
        // var oThat = this;

        // //get shops purchases
        // this.getView().setBusy(true);
        // var purchase = new Purchase();
        // purchase
        //   .getPurchasesByShopId()
        //   .then(function(data) {
        //     var oModel2 = new JSONModel();
        //     oModel2.setData(data.results);
        //     oThat.getView().setModel(oModel2, "shopPurchases");
        //     oThat.getView().setBusy(false);
        //   })
        //   .catch(function(error) {
        //     MessageToast.show(
        //       "Die Einkäufe konnten nicht geladen werden. Bitte wende dich an den Entwickler."
        //     );
        //     oThat.getView().setBusy(false);
        //   });

        // this.getView().byId("purchasesFromShop").open();
      },

      /**
		 * close purchases list dialog
		 */
      onClosePurchasesDialog: function(oEvent) {
        this.getView().byId("purchasesFromShop").close();
      },

      /**
		 * on live shop search
		 */
      onShopSearch: function(oEvent) {
        // add filter for search
        var aFilters = [];
        var sQuery = oEvent.getSource().getValue();

        var filter = new Filter(
          "ges_name",
          sap.ui.model.FilterOperator.Contains,
          sQuery
        );
        var filter2 = new Filter(
          "ges_stadt",
          sap.ui.model.FilterOperator.Contains,
          sQuery
        );

        aFilters.push(filter, filter2);

        var oFilter = new sap.ui.model.Filter({
          aFilters: aFilters,
          bAnd: false,
          _bMultiFilter: true
        }); // true = AND, false = OR

        // update list binding
        var list = this.getView().byId("shopList");
        var binding = list.getBinding("items");
        binding.filter(oFilter);
      },

      /**
       * setup models: device; shop entities
       */
      setupModels: function(sGroupId) {
        //setup device model
        this.getView().setModel(new JSONModel(sap.ui.Device), "device");
        //set geschaefte entityset
        this.setShopsToView(sGroupId);
      },

      /**
       * reset add shop dialog form elements
       */
      resetAddShopForm: function() {
        this.getView().byId("storeNameInput").setValue();
        this.getView().byId("cityNameInput").setValue();
      }
    });
  }
);
