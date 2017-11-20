/*jshint esversion: 6 */
sap.ui.define([ "sap/ui/base/Object", "sap/ui/model/json/JSONModel" ],
		function(BaseObject, JSONModel) {

			var BaseModel = BaseObject.extend("mpn/PM/model/BaseModel", {
				
				constructor : function() {
					this.sHostUrl = 'http://192.168.20.20';
					this.sHostPort = '3000';
					this.sConnString = sHostUrl + ':' + sHostPort;
				}

			});

			return BaseModel;
		});