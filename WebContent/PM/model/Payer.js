/*jshint esversion: 6 */
sap.ui.define([ "sap/ui/base/Object", "sap/ui/model/json/JSONModel" ],
		function(BaseObject, JSONModel) {

			var Payer = BaseObject.extend("mpn/PM/model/Payer", {
				
				constructor : function(payerId) {
					this._payerId = payerId;
					this.sHostUrl = 'http://192.168.20.20';
					this.sHostPort = '3000';
					this.sConnString = this.sHostUrl + ':' + this.sHostPort;
					this.sPayerEntityUrl = '/ZahlerEntitySet';
				},

				/**
				 * get payers get request
				 */
				getPayers : function(callback) {
					$.ajax(this.sConnString + this.sPayerEntityUrl).done(
							function(data, textStatus, jqXHR) {
								callback(null, data);
							}).fail(function(jqXHR, textStatus, errorThrown) {
						callback(errorThrown, null);
					});
				}
			});

			return Payer;
		});