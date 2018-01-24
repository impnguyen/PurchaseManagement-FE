/*jshint esversion: 6 */
sap.ui.define(["sap/ui/base/Object", "sap/ui/model/json/JSONModel"], function(
  BaseObject,
  JSONModel
) {
  var Shop = BaseObject.extend("mpn/PM/model/Shop", {
    constructor: function(oShop) {
      this._shopId = oShop.shopId;
      this._shopName = oShop.shopName;
      this._shopCity = oShop.shopCity;
      this._shopVisits = oShop.shopVisits;

      this.sHostUrl = "http://192.168.20.20";
      this.sHostPort = "3000";
      this.sConnString = this.sHostUrl + ":" + this.sHostPort;
      this.sShopEntityUrl = "/GeschaeftEntitySet";
      this.sShopSingleEntityUrl = "/GeschaeftEntity";
      this.firebaseIdToken = oShop.fbIdToken;
    },

    /**
     * get shop object from constructor 
     */
    getShopObj: function() {
      return {
        ges_id: this._shopId,
        ges_name: this._shopName,
        ges_stadt: this._shopCity,
        ges_besuche: this._shopVisits
      };
    },

    /**
     * get shops
     */
    getShops: function(onConf) {
      var oThat = this;
      var promise = new Promise(function(resolve, reject) {
        $.ajax({
          url: oThat.sConnString + oThat.sShopEntityUrl,
          method: "GET",
          headers: {
            Authorization: oThat.firebaseIdToken,
            "Content-Type": "application/json; charset=UTF-8",
            'group': onConf.sGroupId
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
    },

    /**
     * add shop
     */
    createShop: function(onConf) {
      var oThat = this;
      var promise = new Promise(function(resolve, reject) {
        $.ajax({
          dataType: "json",
          contentType: "application/json",
          method: "POST",
          url: oThat.sConnString + oThat.sShopSingleEntityUrl,
          data: JSON.stringify(oThat.getShopObj()),
          headers: {
            Authorization: oThat.firebaseIdToken,
            "Content-Type": "application/json; charset=UTF-8",
            'group': onConf.sGroupId
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
    },

    /**
     * delete shop
     */
    deleteShop() {
      var oThat = this;
      var promise = new Promise(function(resolve, reject) {
        $.ajax({
          method: "DELETE",
          url: oThat.sConnString + oThat.sShopSingleEntityUrl + "/" +  oThat._shopId,
          headers: {
            Authorization: oThat.firebaseIdToken,
            "Content-Type": "application/json; charset=UTF-8"
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

  return Shop;
});
