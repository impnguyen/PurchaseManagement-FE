/*jshint esversion: 6 */
sap.ui.define([ "sap/ui/base/Object", "sap/ui/model/json/JSONModel" ], function(BaseObject, JSONModel) {

	var Shop = BaseObject.extend("mpn/PM/model/Shop", {
		constructor : function(shopId) {
			this._shopId = shopId;
		},

		/**
		 * get shops 
		 * get request
		 */
		getShops : function(callback) {
			$.ajax("http://192.168.20.20:3000/GeschaeftEntitySet")
				.done(function(data, textStatus, jqXHR) {
					callback(undefined, data);
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					callback(errorThrown, undefined);
				});
		}
	});

	return Shop;
});