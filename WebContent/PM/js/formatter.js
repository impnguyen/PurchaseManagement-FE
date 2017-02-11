sap.ui.define([
    "sap/m/Text"
], function (Text) {
    "use strict";
    return {

        /**
         * format timestamp string to date format (einkauf)
         */
        overviewPurchaseDateFormatter: function(sTimestamp){
            var dIncoming = new Date(sTimestamp);

            return dIncoming.toLocaleDateString().toString();
        }

    };
});