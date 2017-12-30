window.PmAuth = (function() {
  // firebase config
  var config = {
    apiKey: "AIzaSyAoti_-8NdkreAYc6NyIiDqjcQgfTUDr4A",
    authDomain: "purchasemanager-adf6a.firebaseapp.com",
    databaseURL: "https://purchasemanager-adf6a.firebaseio.com",
    projectId: "purchasemanager-adf6a",
    storageBucket: "purchasemanager-adf6a.appspot.com",
    messagingSenderId: "438322802973"
  };

  // FirebaseUI config.
  var uiConfig = {
    callbacks: {
      signInSuccess: function(currentUser, credential, redirectUrl) {
        //hide firebaseUi
        hideAllFirebaseAuthUi();

        //setup ui5 app if sign in successful
        setupPm();

        return false;
      },
      uiShown: function() {
        // The widget is rendered.
        hideFirebaseUILoader();
      }
    },
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ]
  };

  // hide loader control
  function hideFirebaseUILoader() {
    document.getElementById("loader").style.display = "none";
  }

  // hide loader control and auth container
  function hideAllFirebaseAuthUi() {
    document.getElementById("firebaseui-auth-container").style.display = "none";
    document.getElementById("loader").style.display = "none";
  }

  // hide ui5 body
  function hidePmContainer() {
    document.getElementById("content").style.display = "none";
  }

  // hide ui5 body
  function showPmContainer() {
    document.getElementById("content").style.display = "block";
  }

  // setup pm ui app
  function setupPurchaseManagerUi5Container() {
    sap.ui.getCore().attachInit(function() {
      new sap.ui.core.ComponentContainer({
        name: "mpn.PM"
      }).placeAt("content");
    });
  }

  // public methods
  return {
    getFirebaseConfig: function() {
      return config;
    },
    getUiConfig: function() {
      return uiConfig;
    },
    hideFirebaseAuthUiLoader: function() {
      hideFirebaseUILoader();
    },
    setupPm: function() {
      setupPurchaseManagerUi5Container();
    },
    hidePm: function() {
      hidePmContainer();
    },
    showPm: function() {
      showPmContainer();
    }
  };
})();
