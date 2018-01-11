/**
 * @module PM
 * @author Manh Phuoc Nguyen
 */
sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "mpn/PM/model/Purchase",
    "mpn/PM/js/formatter",
    "sap/ui/model/Filter"
  ],
  function(
    Controller,
    MessageToast,
    Device,
    JSONModel,
    Purchase,
    formatter,
    Filter
  ) {
    "use strict";
    return Controller.extend("mpn.PM.controller.shop", {
      formatter: formatter,

      onInit: function() {
        // set device model
        var oDeviceModel = new JSONModel(Device);
        this.getView().setModel(oDeviceModel, "device");

        //init geschaefte entityset
        this.getGeschaeftEntitySet();
      },

      onAfterRendering: function() {},

      onAddLocation: function(oEvent) {
        this.getView().byId("addShopDialog").open();
      },

      /**
		 * add new shop request
		 */
      onAddShop: function(oEvent) {
        var oThat = this;
        var oRequestBody = {
          ges_id: 0,
          ges_name: this.getView().byId("storeNameInput").getValue(),
          ges_stadt: this.getView().byId("cityNameInput").getValue(),
          ges_besuche: 0
        };
        this.getView().setBusy(true);

        $.ajax({
          dataType: "json",
          contentType: "application/json",
          method: "POST",
          url: "http://192.168.20.20:3000/GeschaeftEntity",
          data: JSON.stringify(oRequestBody)
        })
          .done(function(data, textStatus, jqXHR) {
            //oThat.getView().getModel("Geschaefte").oData.results.push(data.result);
            oThat.onRefreshGeschaefte();

            oThat.getView().byId("storeNameInput").setValue();
            oThat.getView().byId("cityNameInput").setValue();

            MessageToast.show("Das Geschäft wurde erfolgreich angelegt.");
          })
          .fail(function(jqXHR, textStatus, errorThrown) {
            MessageToast.show("Fehler. Probiere es später aus.");
          })
          .always(function() {
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
        var sId = this.getView()
          .getModel("Geschaefte")
          .getProperty(oList.getSwipedItem().oBindingContexts.Geschaefte.sPath)
          .ges_id;
        var oThat = this;
        this.getView().setBusy(true);

        $.ajax({
          method: "DELETE",
          url: "http://192.168.20.20:3000/GeschaeftEntity/" + sId
        })
          .done(function(data, textStatus, jqXHR) {
            // oList.removeAggregation("items", oList.getSwipedItem());
            // oList.swipeOut();

            if (data === undefined || data.errorMessage === undefined) {
              MessageToast.show("Das Geschäft wurde erfolgreich gelöscht.");
            } else {
              oList.swipeOut();
              MessageToast.show(data.errorMessage);
            }
            oThat.onRefreshGeschaefte();
          })
          .fail(function(jqXHR, textStatus, errorThrown) {
            MessageToast.show("Fehler. Probiere es später aus.");
          })
          .always(function() {
            oThat.getView().byId("addShopDialog").close();
            oThat.getView().setBusy(false);
          });
      },

      /**
		 * refresh geschaeft
		 */
      onRefreshGeschaefte: function() {
        this.getView().getModel("Geschaefte").refresh(true, true);
        this.getGeschaeftEntitySet();
      },

      onCancelShop: function(oEvent) {
        this.getView().byId("addShopDialog").close();
      },

      onNavBack: function() {
        this.getView().oParent.oParent.backToTopMaster();
      },

      getGeschaeftEntitySet: function(callback) {
        this.getView().setBusy(true);
        var oThat = this;

        $.ajax("http://192.168.20.20:3000/GeschaeftEntitySet")
          .done(function(data, textStatus, jqXHR) {
            var oModel = new JSONModel();
            oModel.setData(data);
            oThat.getView().setModel(oModel, "Geschaefte");
          })
          .fail(function(jqXHR, textStatus, errorThrown) {
            MessageToast.show("Die Geschäfte konnten nicht geladen werden.");
          })
          .always(function() {
            oThat.getView().setBusy(false);
          });
      },

      /**
		 * on press shop list item handlers;
		 * open items based on selected shop
		 */
      onPressShopItem: function(oEvent) {
        var sSelPath = oEvent.oSource.oBindingContexts.Geschaefte.sPath;
        var oModel = oEvent.oSource.oBindingContexts.Geschaefte.oModel;
        var oSelObj = oModel.getProperty(sSelPath);
        var iSelGesId = oSelObj.ges_id;
        var oThat = this;

        //get shops purchases
        this.getView().setBusy(true);
        var purchase = new Purchase();
        purchase.getPurchasesByShopId()
        .then(function(data){
          var oModel2 = new JSONModel();
          oModel2.setData(data.results);
          oThat.getView().setModel(oModel2, "shopPurchases");
          oThat.getView().setBusy(false);
        })
        .catch(function(error){
          MessageToast.show(
            "Die Einkäufe konnten nicht geladen werden. Bitte wende dich an den Entwickler."
          );
          oThat.getView().setBusy(false);
        });
        // purchase.getPurchasesByShopId(iSelGesId, function(data, error) {
        //   if (error === undefined) {
        //     var oModel2 = new JSONModel();
        //     oModel2.setData(data.results);
        //     oThat.getView().setModel(oModel2, "shopPurchases");
        //   } else {
        //     MessageToast.show(
        //       "Die Einkäufe konnten nicht geladen werden. Bitte wende dich an den Entwickler."
        //     );
        //   }
        // });

        this.getView().byId("purchasesFromShop").open();
      },

      /**
		 * on close purchases by shop dialog
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
      }
    });
  }
);
