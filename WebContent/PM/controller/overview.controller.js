sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/Device",
  "sap/ui/model/json/JSONModel",
  "mpn/PM/js/formatter"
], function (Controller, MessageToast, Device, JSONModel, formatter) {
  "use strict";

  return Controller.extend("mpn.PM.controller.overview", {

    formatter: formatter,

    onInit: function () {
      // set device model
      var oDeviceModel = new JSONModel(Device);
      this.getView().setModel(oDeviceModel, "device");
      this.setupOverview();

    },

    onAfterRendering: function () {

    },

    onNavBack: function () {
      this.getView().oParent.oParent.backToTopMaster();
    },

    onCal: function (oEvent) {
      this.getView().byId("calendarPopover").openBy(oEvent.getSource());
    },

    getEinkaufEntitySet: function (callback) {
      this.getView().setBusy(true);
      var oThat = this;

      $.ajax("http://192.168.20.20:3000/EinkaufEntitySet")
        .done(function (data, textStatus, jqXHR) {
          callback(data, undefined);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          callback(undefined, errorThrown);
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
          callback(data, undefined);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          callback(undefined, oError);
        })
        .always(function () {
          oThat.getView().setBusy(false);
        });

    },

    /**
   * get geschaefte entity setModel
   */
    getGeschaeftEntitySet: function (callback) {
      this.getView().setBusy(true);
      var oThat = this;

      $.ajax("http://192.168.20.20:3000/GeschaeftEntitySet")
        .done(function (data, textStatus, jqXHR) {
          callback(data, undefined);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          callback(undefined, errorThrown);
        })
        .always(function () {
          oThat.getView().setBusy(false);
        });

    },

    /**
     * setup overview models and binding
     */
    setupOverview: function () {
      //deferred objects
      var oDefEinkauf = jQuery.Deferred();
      var oDefZahler = jQuery.Deferred();
      var oDefGeschaeft = jQuery.Deferred();

      //global vars
      var oThat = this;

      //get einkauf
      this.getEinkaufEntitySet(function (oData, oError) {
        if (oError === undefined) {
          var oModel = new JSONModel();
          oModel.setData(oData);
          oDefEinkauf.resolve(oModel);
        } else {
          MessageToast.show("Die Einkäufe konnten nicht geladen werden.");
          oDefEinkauf.reject();
        }
      });

      //set zahler
      this.getZahlerEntitySet(function (oData, oError) {
        if (oError === undefined) {
          var oModel = new JSONModel();
          oModel.setData(oData);
          oDefZahler.resolve(oModel);
        } else {
          MessageToast.show("Die Zahler konnten nicht geladen werden.");
          oDefZahler.reject();
        }
      });

      //set geschaefte
      this.getGeschaeftEntitySet(function (oData, oError) {
        if (oError === undefined) {
          var oModel = new JSONModel();
          oModel.setData(oData);
          oDefGeschaeft.resolve(oModel);
        } else {
          MessageToast.show("Die Geschäfte konnten nicht geladen werden.");
          oDefGeschaeft.reject();
        }
      });


      //check for deferred objects
      $.when(oDefGeschaeft, oDefZahler, oDefEinkauf).
        done(function (oGeschaeft, oZahler, oEinkauf) {
          //set raw model
          var oModel = new JSONModel();
          oModel.setData({
            geschaeft: oGeschaeft.oData.results,
            zahler: oZahler.oData.results,
            einkauf: oEinkauf.oData.results
          });
          oThat.getView().setModel(oModel, "raw");

          //setup month
          oThat.setUpTableModelByDate();
        }).
        fail(function () {
          MessageToast.show("Es ist ein Fehler aufgetreten. Probiere es später noch einmal.");
        });

    },

    /**
     * setup model for table by month
     */
    setUpTableModelByDate: function (dSelMonth) {
      var oEinkaeufe = this.getView().getModel("raw").oData.einkauf;
      var oZahler    = this.getView().getModel("raw").oData.zahler;
      var oModel = new JSONModel();
      var oTmpModel = { results: [] };
      var dStartDate = this.getView().byId("overviewCalendar").getStartDate();
      var dEndDate   = this.getLastDayOfMonth(dStartDate.getFullYear(), dStartDate.getMonth() + 1);

      console.log(this.getView().getModel("raw").oData);
      
      //build temp einkaeufe model
      for (var i = 0; i < oEinkaeufe.length; i++) {
        if(new Date(oEinkaeufe[i].eink_datum) >= dStartDate && new Date(oEinkaeufe[i].eink_datum) <= dEndDate){
          oTmpModel.results.push(oEinkaeufe[i]);
        }
      }

      //set zahler to temp einkaeufe model
      for(var i = 0; i < oTmpModel.results.length; i++ ){
        for(var j = 0; j <oZahler.length; j++){
          if (oTmpModel.results[i].zah_id === oZahler[j].zah_id){
            //add zah_alias to oTmpModel
            oTmpModel.results[i].zah_alias = oZahler[j].zah_alias;
          }
        }
      }

      oModel.setData(oTmpModel),
      this.getView().setModel(oModel, "Einkaeufe");
    },

    /**
     * get last date of month
     */
     getLastDayOfMonth: function(Year, Month) {
      return new Date((new Date(Year, Month, 1)) - 1);
    }

  });
});