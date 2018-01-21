/*jshint esversion: 6 */
sap.ui.define(["sap/ui/base/Object", "sap/ui/model/json/JSONModel"], function(
  BaseObject,
  JSONModel
) {
  var Group = BaseObject.extend("mpn/PM/model/Group", {
    constructor: function(oGroup) {
      this._payerId = oGroup.payerId;
      this.sHostUrl = "http://192.168.20.20";
      this.sHostPort = "3000";
      this.sConnString = this.sHostUrl + ":" + this.sHostPort;
      this.sPayerEntityUrl = "/GroupEntitySet";
      this.firebaseIdToken = oGroup.fbIdToken;
    },

    /**
     * get group entityset with promise
     */
    getGroups: function() {
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

  return Group;
});
