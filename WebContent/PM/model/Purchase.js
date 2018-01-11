/*jshint esversion: 6 */
sap.ui.define(["sap/ui/base/Object", "sap/ui/model/json/JSONModel"], function(
  BaseObject,
  JSONModel
) {
  var Purchase = BaseObject.extend("mpn/PM/model/Purchase", {
    constructor: function(oPurchase) {
      this._purchaseId = oPurchase.purchaseId;
      this._purchaseDate = oPurchase.purchaseDate;
      this._purchaseValue = oPurchase.purchaseValue;
      this._shopId = oPurchase.shopId;
      this._payerId = oPurchase.payerId;

      this.sHostUrl = "http://192.168.20.20";
      this.sHostPort = "3000";
      this.sConnString = this.sHostUrl + ":" + this.sHostPort;
      this.sPurchaseEntityUrl = "/EinkaufEntity";
      this.sPurchaseEntitySetUrl = "/EinkaufEntitySet";
      this.sExpandByLocation = "byGeschaeft";

      this.firebaseIdToken = oPurchase.fbIdToken;
    },

    /**
		 *  get purchase object as json object
		 */
    getPurchaseJson: function() {
      return {
        eink_id: this._purchaseId,
        eink_datum: this._purchaseDate,
        eink_wert: this._purchaseValue,
        ges_id: this._shopId,
        zah_id: this._payerId
      };
    },

    /**
		  * create a new purchase
		  * post request
		  */
    createPurchase: function() {
      var oThat = this;
      var promise = new Promise(function(resolve, reject) {
        $.ajax({
          dataType: "json",
          contentType: "application/json",
          method: "POST",
          url: oThat.sConnString + oThat.sPurchaseEntityUrl,
          data: JSON.stringify(oThat.getPurchaseJson()),
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
    },

    /**
		 * delete a purchase
		 * delete request
		 */
    deletePurchase: function(sPurchaseId) {
      var oThat = this;
      var promise = new Promise(function(resolve, reject) {
        $.ajax({
          method: "DELETE",
          url: oThat.sConnString + oThat.sPurchaseEntityUrl + "/" + sPurchaseId,
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
    },

    /**
		 * get purchases
		 * get request
		 */
    getAllPurchases: function() {
      var oThat = this;
      var promise = new Promise(function(resolve, reject) {
        $.ajax({
          method: "GET",
          url: oThat.sConnString + oThat.sPurchaseEntitySetUrl,
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
    },

    /**
		 * get purchases by ges_id
		 */
    getPurchasesByShopId: function(iGesId, callback) {
      $.ajax(
        this.sConnString +
          this.sPurchaseEntitySetUrl +
          "/" +
          this.sExpandByLocation +
          "/" +
          iGesId
      )
        .done(function(data, textStatus, jqXHR) {
          callback(data, undefined);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          callback(undefined, errorThrown);
        });
    },

    /**
     * get purchases between range parameters
     */
    getPurchasesInRange: function(oRange) {
      var oThat = this;
      var promise = new Promise(function(resolve, reject) {
        $.ajax({
          type: "POST",
          data: JSON.stringify({
            startDate: oRange.firstDayInYear,
            endDate: oRange.lastDayInYear
          }),
          dataType: "json",
          headers: {
            Authorization: oThat.firebaseIdToken,
            "Content-Type": "application/json; charset=UTF-8"
          },
          url: oThat.sConnString + oThat.sPurchaseEntitySetUrl
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

  return Purchase;
});
