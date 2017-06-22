/*jshint esversion: 6 */
sap.ui.define([ "sap/ui/base/Object", "sap/ui/model/json/JSONModel" ], function(BaseObject, JSONModel) {

	var Payer = BaseObject.extend("mpn/PM/model/Payer", {
		constructor : function(payerId) {
			this._payerId = payerId;
		},

		/**
		 * get payers
		 * get request
		 */
		getPayers : function(callback) {
			$.ajax("http://192.168.20.20:3000/ZahlerEntitySet")
				.done(function(data, textStatus, jqXHR) {
					callback(undefined, data);
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					callback(errorThrown, undefined);
				});
		}
	});

	return Payer;
});