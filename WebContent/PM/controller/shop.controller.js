sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/Device",
  "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, Device, JSONModel) {
  "use strict";

  return Controller.extend("mpn.PM.controller.shop", {


    onInit: function () {
      // set device model
      var oDeviceModel = new JSONModel(Device);
      this.getView().setModel(oDeviceModel, "device");

      //init geschaefte entityset
      this.getGeschaeftEntitySet();
    },

    onAfterRendering: function () {

    },

    onAddLocation: function (oEvent) {
      this.getView().byId("addShopDialog").open();
    },

    /**
     * add new shop request
     */
    onAddShop: function (oEvent) {
      var oThat = this;
      var oRequestBody = {
        "ges_id": 0,
        "ges_name": this.getView().byId("storeNameInput").getValue(),
        "ges_stadt": this.getView().byId("cityNameInput").getValue(),
        "ges_besuche": 0
      };

      $.ajax({
        dataType: "json",
        contentType: "application/json",
        method: "POST",
        url: "http://192.168.20.20:3000/GeschaeftEntity",
        data: JSON.stringify(oRequestBody)
      })
        .done(function (data, textStatus, jqXHR) {
          oThat.getView().getModel("Geschaefte").oData.results.push(data.result);
          oThat.getView().getModel("Geschaefte").refresh(true);
          MessageToast.show("Das Geschäft wurde erfolgreich angelegt.");
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          MessageToast.show("Fehler. Probiere es später aus.");
        })
        .always(function () {
          oThat.getView().byId("addShopDialog").close();
        });
    },

    onCancelShop: function (oEvent) {
      this.getView().byId("addShopDialog").close();
    },

    onNavBack: function () {
      this.getView().oParent.oParent.backToTopMaster();
    },

    getGeschaeftEntitySet: function (callback) {
      var oThat = this;

      $.ajax("http://192.168.20.20:3000/GeschaeftEntitySet")
        .done(function (data, textStatus, jqXHR) {
          var oModel = new JSONModel();
          oModel.setData(data);
          oThat.getView().setModel(oModel, "Geschaefte");
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          debugger
        });

    }

  });
});