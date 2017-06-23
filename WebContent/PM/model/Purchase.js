/*jshint esversion: 6 */
sap.ui.define([ "sap/ui/base/Object", "sap/ui/model/json/JSONModel" ], function(BaseObject, JSONModel) {

	var Purchase = BaseObject.extend("mpn/PM/model/Purchase", {
		constructor : function(purchaseId, purchaseDate, purchaseValue, shopId, payerId) {
			this._purchaseId = purchaseId;
			this._purchaseDate = purchaseDate;
			this._purchaseValue = purchaseValue;
			this._shopId = shopId;
			this._payerId = payerId;
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
				url : "http://192.168.20.20:3000/EinkaufEntity",
				data : JSON.stringify(this.getPurchaseJson())
			})
				.done(function(data, textStatus, jqXHR) {
					callback(undefined, data);
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					callback(errorThrown, undefined);
				});
		},

		/**
		 * delete a purchase
		 * delete request
		 */
		deletePurchase : function(sPurchaseId, callback) {
			$.ajax({
				method : "DELETE",
				url : "http://192.168.20.20:3000/EinkaufEntity/" + sPurchaseId
			})
				.done(function(data, textStatus, jqXHR) {
					callback(undefined, data);
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					callback(errorThrown, undefined);
				});
		},

		/**
		 * get purchases
		 * get request
		 */
		getAllPurchases : function(callback) {
			$.ajax("http://192.168.20.20:3000/EinkaufEntitySet")
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