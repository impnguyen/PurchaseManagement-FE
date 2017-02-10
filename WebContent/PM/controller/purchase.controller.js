sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/Device",
  "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, Device, JSONModel) {
  "use strict";

  return Controller.extend("mpn.PM.controller.purchase", {


    onInit: function () {
      // set device model
      var oDeviceModel = new JSONModel(Device);
      this.getView().setModel(oDeviceModel, "device");

      //set geschaefte
      this.getGeschaeftEntitySet();
      //set zahler
      this.getZahlerEntitySet();
    },

    onAfterRendering: function () {

    },

    onNavBack: function () {
      this.getView().oParent.oParent.backToTopMaster();
    },

    /**
     * get geschaefte entity setModel
     */
    getGeschaeftEntitySet: function (callback) {
      this.getView().setBusy(true);
      var oThat = this;

      $.ajax("http://192.168.20.20:3000/GeschaeftEntitySet")
        .done(function (data, textStatus, jqXHR) {
          var oModel = new JSONModel();
          oModel.setData(data);
          oThat.getView().setModel(oModel, "Geschaefte");
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          MessageToast.show("Die Geschäfte konnten nicht geladen werden.");
        })
        .always(function () {
          oThat.getView().setBusy(false);
        });

    },

    /**
     * get zahler entity setModel
     */
    getZahlerEntitySet: function (callback) {
      this.getView().setBusy(true);
      var oThat = this;

      $.ajax("http://192.168.20.20:3000/ZahlerEntitySet")
        .done(function (data, textStatus, jqXHR) {
          var oModel = new JSONModel();
          oModel.setData(data);
          oThat.getView().setModel(oModel, "Zahler");
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          MessageToast.show("Die Zahler konnten nicht geladen werden.");
        })
        .always(function () {
          oThat.getView().setBusy(false);
        });

    },

    /**
     * add purchase
     */
    onAddLocation: function () {

      if (this.getView().byId("purchaseDate").mProperties.dateValue === null ||
        this.getView().byId("geschaefteCb").getSelectedKey() === "" ||
        this.getView().byId("zahlerCb").getSelectedKey() === "" ||
        this.getView().byId("purchaseValInput").getValue() === "") {

        MessageToast.show("Bitte alle Felder ausfüllen!");
      } else {
        var oRequestBody = {
          "eink_id": 0,
          "eink_datum": new Date(this.getView().byId("purchaseDate").mProperties.dateValue.setDate(this.getView().byId("purchaseDate").mProperties.dateValue.getDate() + 1)).toISOString(),
          "eink_wert": parseInt(this.getView().byId("purchaseValInput").getValue()),
          "ges_id": parseInt(this.getView().byId("geschaefteCb").getSelectedKey()),
          "zah_id": parseInt(this.getView().byId("zahlerCb").getSelectedKey())
        }
        this.getView().setBusy(true);
        var oThat = this;

        $.ajax({
          dataType: "json",
          contentType: "application/json",
          method: "POST",
          url: "http://192.168.20.20:3000/EinkaufEntity",
          data: JSON.stringify(oRequestBody)
        })
          .done(function (data, textStatus, jqXHR) {
            MessageToast.show("Erfolgreich angelegt");
          })
          .fail(function (jqXHR, textStatus, errorThrown) {
            MessageToast.show("Fehler. Probiere es später aus.");
          })
          .always(function () {
            //reset input fields
            oThat.getView().byId("purchaseDate").setValue();
            oThat.getView().byId("purchaseValInput").setValue();
            oThat.getView().setBusy(false);
          });
      }


    }

  });
});