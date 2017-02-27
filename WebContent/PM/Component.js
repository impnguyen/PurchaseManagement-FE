sap.ui.getCore().loadLibrary("openui5.simplecharts", "/Pm/libs/simplecharts/resources/openui5/simplecharts");

sap.ui.define([
    "sap/ui/core/UIComponent"
], function (UIComponent) {
    "use strict";
    return UIComponent.extend("mpn.PM.Component", {
        metadata: {
            manifest: "json"
        }
    });

});