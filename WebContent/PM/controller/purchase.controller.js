/*jshint esversion: 6 */ 
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
			
			//setup models
			this.setupModels();
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
			//this.getView().setBusy(true);
			var oThat = this;
			
			var shop = new Shop();
			shop.getShops().then(
				function(data){
					oThat.getView().setModel(new JSONModel(data), "Geschaefte");
					oThat.getView().setBusy(false);
				},
				function(error){
					MessageToast.show("Die Geschäfte konnten nicht geladen werden.");
					console.warn('Shops Entity konnte nicht aufgerufen werden.');
					oThat.getView().setBusy(false);
				}
			).catch(function (err) {
				  console.warn(err);
			});
		},

		/**
		 * get zahler entity model and set to view
		 */
		setPayerToView : function() {
			this.getView().setBusy(true);
			var oThat = this;
			var payer = new Payer();
			
			payer.getPayers().then(
				function(oData){
					oThat.getView().setModel(new JSONModel(oData), "Zahler");
					oThat.getView().setBusy(false);
				}, 
				function(error){
					MessageToast.show("Die Zahler konnten nicht geladen werden.");
					console.warn('Payer entity konnte im promise nicht requestet werden');
					oDefZahler.reject();
					oThat.getView().setBusy(false);
				}
			).catch(function (err) {
				  console.warn(err);
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
				// transform , to .
				let svalInput = this.getView().byId('purchaseValInput').getValue();
				if(svalInput.includes(',')){
					this.getView().byId('purchaseValInput').setValue(svalInput.replace(',', '.'));
				}

				this.getView().setBusy(true);
				var oThat = this;

				var purchase = new Purchase(
					0,
					new Date(this.getView().byId("purchaseDate").mProperties.dateValue.setDate(this.getView().byId("purchaseDate").mProperties.dateValue.getDate() + 1)).toISOString(),
					parseFloat(this.getView().byId("purchaseValInput").getValue()),
					parseInt(this.getView().byId("geschaefteCb").getSelectedKey()),
					parseInt(this.getView().byId("zahlerCb").getSelectedKey())
				);

				purchase.createPurchase(function(oError, oData) {
					if (oError === null) {
						oThat.getView().getModel("PurchaseTemp").newEink_id = oData.insertedId.eink_id;
						oThat.getView().byId("successMs").setVisible(true);
						//reset geschaefte count
						oThat.getGeschaeftEntitySet();
					} else {
						MessageToast.show("Fehler. Probiere es später aus.");
					}
					
					oThat.getView().setBusy(false);
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
				if (oError === null) {
					oThat.getView().byId("successMs").setVisible(false);
					MessageToast.show("Der Einkauf wurde wieder gelöscht.");
				} else {
					MessageToast.show("Fehler. Probiere es später aus.");
				}
				oThat.getView().setBusy(false);
			});
		}, 
		
		/**
		 * set device model to view
		 */
		setDeviceModel: function(){
			var oDeviceModel = new JSONModel(Device);
			this.getView().setModel(oDeviceModel, "device");
		}, 
		
		/**
		 * setup models and set to view
		 */
		setupModels: function(){
			this.setDeviceModel();
			this.setPayerToView();
			this.getView().setModel({newEink_id : 0}, 'PurchaseTemp'); //temp added purchase obj
		}
	});
});