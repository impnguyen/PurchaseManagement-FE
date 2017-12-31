/*jshint esversion: 6 */
sap.ui.define(["sap/ui/base/Object", "sap/ui/model/json/JSONModel"], function(
  BaseObject,
  JSONModel
) {
  var Payer = BaseObject.extend("mpn/PM/model/Payer", {
    constructor: function(payerId, fbIdToken) {
      this._payerId = payerId;
      this.sHostUrl = "http://192.168.20.20";
      this.sHostPort = "3000";
      this.sConnString = this.sHostUrl + ":" + this.sHostPort;
      this.sPayerEntityUrl = "/ZahlerEntitySet";

      this.firebaseIdToken = fbIdToken;
    },

    /**
				 * get payers entityset with promise
				 * 
				 */
    getPayers: function() {
      var oThat = this;
      var promise = new Promise(function(resolve, reject) {
        $.ajax({
          method: "GET",
          url: oThat.sConnString + oThat.sPayerEntityUrl,
          headers: {
            Authorization: oThat.firebaseIdToken
          }
        })
          .done(function(data, textStatus, jqXHR) {
            resolve(data);
          })
          .fail(function(jqXHR, textStatus, errorThrown) {
            reject(errorThrown);
          });
      });

      return promise;
    }
  });

  return Payer;
});
