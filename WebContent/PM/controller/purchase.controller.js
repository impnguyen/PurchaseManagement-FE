/*jshint esversion: 6 */

/**
 * @module PM
 * @author Manh Phuoc Nguyen
 */
sap.ui.define(
  [
    "mpn/PM/controller/BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "mpn/PM/model/Purchase",
    "mpn/PM/model/Shop",
    "mpn/PM/model/Payer"
  ],
  function(
    BaseController,
    Controller,
    MessageToast,
    JSONModel,
    Purchase,
    Shop,
    Payer
  ) {
    "use strict";
    return BaseController.extend("mpn.PM.controller.purchase", {
      /**
		 * setup models and setup shop entity
		 */
      onInit: function() {
        var oThat = this;

        // on before show
        this.getView().addDelegate({
          onBeforeShow: function(oEvent) {
            //set geschaefte
            oThat.getGeschaeftEntitySet();
          }
        });

        //setup models
        this.setupModels();
      },

      /**
		 * on after rendering handler: set current date to form
		 */
      onAfterRendering: function() {
        this.setCurrentDateToForm();
      },

      /**
		 * on navigate back to top master
		 */
      onNavBack: function() {
        this.getView().oParent.oParent.backToTopMaster();
      },

      /**
		 * get geschaefte entity setModel
		 */
      getGeschaeftEntitySet: function(callback) {
        this.getView().setBusy(true);
        var oThat = this;
        var shop;

        this.getFireBaseIdToken()
          .then(function(token) {
            return token;
          })
          .then(function(token) {
            shop = new Shop({fbIdToken: token});
            return shop.getShops();
          })
          .then(function(oData) {
            oThat.getView().setModel(new JSONModel(oData), "Geschaefte");
            oThat.getView().setBusy(false);
          })
          .catch(function(oError) {
            //error handling
            MessageToast.show("Die Geschäfte konnten nicht geladen werden.");
            oThat.getView().setBusy(false);
          });
      },

      /**
		 * get zahler entity model and set to view
		 */
      setPayerToView: function() {
        this.getView().setBusy(true);
        var oThat = this;
        var payer;

        //get payers
        this.getFireBaseIdToken()
          .then(function(token) {
            return token;
          })
          .then(function(token) {
            //TODO: refactor contructor as object
            payer = new Payer({ fbIdToken: token });
            return payer.getPayers();
          })
          .then(function(oData) {
            oThat.getView().setModel(new JSONModel(oData), "Zahler");
            oThat.getView().setBusy(false);
          })
          .catch(function(oError) {
            MessageToast.show("Die Zahler konnten nicht geladen werden.");
            oDefZahler.reject();
            oThat.getView().setBusy(false);
          });
      },

      /**
		 * add purchase
		 */
      onAddPurchase: function() {
        //check valid form values
        if (
          this.getView().byId("purchaseDate").mProperties.dateValue === null ||
          this.getView().byId("geschaefteCb").getSelectedKey() === "" ||
          this.getView().byId("zahlerCb").getSelectedKey() === "" ||
          this.getView().byId("purchaseValInput").getValue() === ""
        ) {
          MessageToast.show("Bitte alle Felder ausfüllen!");
        } else {
          // transform , to .
          let svalInput = this.getView().byId("purchaseValInput").getValue();
          if (svalInput.includes(",")) {
            this.getView()
              .byId("purchaseValInput")
              .setValue(svalInput.replace(",", "."));
          }

          this.getView().setBusy(true);
          var oThat = this;
          var purchase;

          //create new purchase
          this.getFireBaseIdToken()
            .then(function(token) {
              return token;
            })
            .then(function(token) {
              //TODO: refactor contructor as object
              purchase = new Purchase(oThat.createNewPurchaseObject(token));
              return purchase.createPurchase();
            })
            .then(function(oData) {
              oThat.getView().getModel("PurchaseTemp").newEink_id =
                oData.insertedId.eink_id;
              oThat.getView().byId("successMs").setVisible(true);
              //reset geschaefte count
              oThat.getGeschaeftEntitySet();
              oThat.getView().setBusy(false);
            })
            .catch(function(oError) {
              //error handling
              MessageToast.show("Fehler. Probiere es später aus.");
              oThat.getView().setBusy(false);
            });
        }
      },

      /**
		 * on delete new purchase
		 */
      onDeleteNewPurchase: function() {
        this.getView().setBusy(true);
        var oThat = this;
        var purchase;

        //get purchases
        this.getFireBaseIdToken()
          .then(function(token) {
            return token;
          })
          .then(function(token) {
            //TODO: refactor contructor as object
            purchase = new Purchase({ fbIdToken: token });
            return purchase.deletePurchase(
              oThat.getView().getModel("PurchaseTemp").newEink_id
            );
          })
          .then(function(oData) {
            oThat.getView().byId("successMs").setVisible(false);
            oThat.getView().setBusy(false);
            MessageToast.show("Der Einkauf wurde wieder gelöscht.");
          })
          .catch(function(oError) {
            //error handling
            oThat.getView().byId("successMs").setVisible(false);
            MessageToast.show("Fehler. Probiere es später aus.");
            oThat.getView().setBusy(false);
          });
      },

      /**
		 * set device model to view
		 */
      setDeviceModel: function() {
        this.getView().setModel(new JSONModel(sap.ui.Device), "device");
      },

      /**
		 * setup models and set to view
		 */
      setupModels: function() {
        this.setDeviceModel();
        this.setPayerToView();
        this.getView().setModel({ newEink_id: 0 }, "PurchaseTemp"); //temp added purchase obj
      },

      /**
       * set current date to form
       */
      setCurrentDateToForm: function() {
        this.byId("purchaseDate").setDateValue(new Date());
      },

      /**
       * create new purchase object
       */
      createNewPurchaseObject: function(sFbToken) {
        return {
          purchaseId: 0,
          purchaseDate: new Date(
            this
              .getView()
              .byId("purchaseDate")
              .mProperties.dateValue.setDate(
                this
                  .getView()
                  .byId("purchaseDate")
                  .mProperties.dateValue.getDate() + 1
              )
          ).toISOString(),
          purchaseValue: parseFloat(
            this.getView().byId("purchaseValInput").getValue()
          ),
          shopId: parseInt(
            this.getView().byId("geschaefteCb").getSelectedKey()
          ),
          payerId: parseInt(this.getView().byId("zahlerCb").getSelectedKey()),
          fbIdToken: sFbToken
        };
      }
    });
  }
);
