/*jshint esversion: 6 */
sap.ui.define([ "sap/ui/base/Object", "sap/ui/model/json/JSONModel" ], function(BaseObject, JSONModel) {

	var Shop = BaseObject.extend("mpn/PM/model/Shop", {
		
		constructor : function(shopId) {
			this._shopId = shopId;
			this.sHostUrl = 'http://192.168.20.20';
			this.sHostPort = '3000';
			this.sConnString = this.sHostUrl + ':' + this.sHostPort;
			this.sShopEntityUrl = '/GeschaeftEntitySet';
		},

		/**
		 * get shops 
		 */
		getShops : function(callback) {
			$.ajax(this.sConnString + this.sShopEntityUrl)
				.done(function(data, textStatus, jqXHR) {
					callback(null, data);
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					callback(errorThrown, null);
				});
		}
	});

	return Shop;
});