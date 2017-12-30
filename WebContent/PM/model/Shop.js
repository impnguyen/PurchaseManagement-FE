/*jshint esversion: 6 */
sap.ui.define([ "sap/ui/base/Object", "sap/ui/model/json/JSONModel" ],
		function(BaseObject, JSONModel) {

			var Shop = BaseObject.extend("mpn/PM/model/Shop", {

				constructor : function(shopId, fbIdToken) {
					this._shopId = shopId;
					this.sHostUrl = 'http://192.168.20.20';
					this.sHostPort = '3000';
					this.sConnString = this.sHostUrl + ':' + this.sHostPort;
					this.sShopEntityUrl = '/GeschaeftEntitySet';

					this.firebaseIdToken = fbIdToken;
				},

				/**
				 * get shops
				 */
				getShops : function() {
					var oThat = this;
					var promise = new Promise(function(resolve, reject) {
						$.ajax(oThat.sConnString + oThat.sShopEntityUrl).done(
								function(data, textStatus, jqXHR) {
									resolve(data);
								}).fail(
								function(jqXHR, textStatus, errorThrown) {
									reject(errorThrown);
								});
					});

					return promise;
				}
			});

			return Shop;
		});