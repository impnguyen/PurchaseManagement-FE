/*jshint esversion: 6 */
sap.ui.define([ "sap/ui/base/Object", "sap/ui/model/json/JSONModel" ], function(BaseObject, JSONModel) {

	var Purchase = BaseObject.extend("mpn/PM/model/Purchase", {
		constructor : function(purchaseId, purchaseDate, purchaseValue, shopId, payerId, fbIdToken) {
			this._purchaseId = purchaseId;
			this._purchaseDate = purchaseDate;
			this._purchaseValue = purchaseValue;
			this._shopId = shopId;
			this._payerId = payerId;
			
			this.sHostUrl = 'http://192.168.20.20';
			this.sHostPort = '3000';
			this.sConnString = this.sHostUrl + ':' + this.sHostPort;
			this.sPurchaseEntityUrl = '/EinkaufEntity';
			this.sPurchaseEntitySetUrl = '/EinkaufEntitySet';
			this.sExpandByLocation = 'byGeschaeft';

			this.firebaseIdToken = fbIdToken;
		},

		/**
		 *  get purchase object as json object
		 */
		getPurchaseJson : function() {
			return {
				eink_id : this._purchaseId,
				eink_datum : this._purchaseDate,
				eink_wert : this._purchaseValue,
				ges_id : this._shopId,
				zah_id : this._payerId
			};
		},

		/**
		  * create a new purchase
		  * post request
		  */
		createPurchase : function(callback) {
			$.ajax({
				dataType : "json",
				contentType : "application/json",
				method : "POST",
				url : this.sConnString + this.sPurchaseEntityUrl,
				data : JSON.stringify(this.getPurchaseJson())
			})
				.done(function(data, textStatus, jqXHR) {
					callback(null, data);
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					callback(errorThrown, null);
				});
		},

		/**
		 * delete a purchase
		 * delete request
		 */
		deletePurchase : function(sPurchaseId, callback) {
			$.ajax({
				method : "DELETE",
				url : this.sConnString + this.sPurchaseEntityUrl + '/' + sPurchaseId
			})
				.done(function(data, textStatus, jqXHR) {
					callback(null, data);
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					callback(errorThrown, null);
				});
		},

		/**
		 * get purchases
		 * get request
		 */
		getAllPurchases : function(callback) {
			$.ajax(this.sConnString + this.sPurchaseEntitySetUrl)
				.done(function(data, textStatus, jqXHR) {
					callback(data, null);
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					callback(null, errorThrown);
				});
		}, 
		
		/**
		 * get purchases by ges_id
		 */
		getPurchasesByShopId: function(iGesId, callback){
			$.ajax(this.sConnString + this.sPurchaseEntitySetUrl + '/' + this.sExpandByLocation + '/' + iGesId)
			.done(function(data, textStatus, jqXHR) {
				callback(data, undefined);
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				callback(undefined, errorThrown);
			});
		}
	});

	return Purchase;
});