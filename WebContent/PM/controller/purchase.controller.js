/**
 * @module PM
 * @author Manh Phuoc Nguyen
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"mpn/PM/model/Purchase",
	"mpn/PM/model/Shop", 
	"mpn/PM/model/Payer"
], function(Controller, MessageToast, Device, JSONModel, Purchase, Shop, Payer) {
	"use strict";

	return Controller.extend("mpn.PM.controller.purchase", {
		/**
		 * on init handler
		 */
		onInit : function() {
			var oThat = this;

			// on before show
			this.getView().addDelegate({
				onBeforeShow : function(oEvent) {
					//set geschaefte
					oThat.getGeschaeftEntitySet();
				}
			});

			// set device model
			var oDeviceModel = new JSONModel(Device);
			this.getView().setModel(oDeviceModel, "device");

			//set zahler
			this.getZahlerEntitySet();

			//globals
			var oGlobal = {
				newEink_id : 0
			};
			this.getView().setModel(oGlobal, 'PurchaseTemp');
		},
		
		/**
		 * on after rendering handler
		 */
		onAfterRendering: function(){
			this.byId("purchaseDate").setDateValue(new Date());
		},

		/**
		 * on navigate back to top master
		 */
		onNavBack : function() {
			this.getView().oParent.oParent.backToTopMaster();
		},

		/**
		 * get geschaefte entity setModel
		 */
		getGeschaeftEntitySet : function(callback) {
			this.getView().setBusy(true);
			var oThat = this;
			
			var shop = new Shop();
			
			shop.getShops(function(oError, oData){
				if(oError === undefined){
					var oModel = new JSONModel();
					oModel.setData(oData);
					oThat.getView().setModel(oModel, "Geschaefte");
				}else{
					MessageToast.show("Die Geschäfte konnten nicht geladen werden.");
				}
				oThat.getView().setBusy();
			});

		},

		/**
		 * get zahler entity setModel
		 */
		getZahlerEntitySet : function() {
			this.getView().setBusy(true);
			var oThat = this;
			
			var payer = new Payer();
			
			payer.getPayers(function(oError, oData){
				if(oError === undefined){
					var oModel = new JSONModel();
					oModel.setData(oData);
					oThat.getView().setModel(oModel, "Zahler");
				}else{
					MessageToast.show("Die Zahler konnten nicht geladen werden.");
				}
				oThat.getView().setBusy();
			});
		},

		/**
		 * add purchase
		 */
		onAddPurchase : function() {

			if (this.getView().byId("purchaseDate").mProperties.dateValue === null ||
				this.getView().byId("geschaefteCb").getSelectedKey() === "" ||
				this.getView().byId("zahlerCb").getSelectedKey() === "" ||
				this.getView().byId("purchaseValInput").getValue() === "") {

				MessageToast.show("Bitte alle Felder ausfüllen!");
			} else {
				this.getView().setBusy(true);
				var oThat = this;

				var purchase = new Purchase(0,
					new Date(this.getView().byId("purchaseDate").mProperties.dateValue.setDate(this.getView().byId("purchaseDate").mProperties.dateValue.getDate() + 1)).toISOString(),
					parseFloat(this.getView().byId("purchaseValInput").getValue()),
					parseInt(this.getView().byId("geschaefteCb").getSelectedKey()),
					parseInt(this.getView().byId("zahlerCb").getSelectedKey())
				);

				purchase.createPurchase(function(oError, oData) {
					if (oError === undefined) {
						oThat.getView().getModel("PurchaseTemp").newEink_id = oData.insertedId.eink_id;
						oThat.getView().byId("successMs").setVisible(true);
						//reset geschaefte count
						oThat.getGeschaeftEntitySet();
					} else {
						MessageToast.show("Fehler. Probiere es später aus.");
					}
				});
			}
		},

		/**
		 * on delete new purchase
		 */
		onDeleteNewPurchase : function() {
			var oThat = this;
			this.getView().setBusy(true);

			var purchase = new Purchase();
			purchase.deletePurchase(this.getView().getModel("PurchaseTemp").newEink_id, function(oError, oData) {
				if (oError === undefined) {
					oThat.getView().byId("successMs").setVisible(false);
					MessageToast.show("Der Einkauf wurde wieder gelöscht.");
				} else {
					MessageToast.show("Fehler. Probiere es später aus.");
				}
				oThat.getView().setBusy(false);
			});
		}
	});
});