function Api() {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyDLb_EBKjJLAS9sZEtc4gJ0x5sS53k268M",
        authDomain: "student-toolkit-d9c41.firebaseapp.com",
        databaseURL: "https://student-toolkit-d9c41.firebaseio.com",
        projectId: "student-toolkit-d9c41",
        storageBucket: "student-toolkit-d9c41.appspot.com",
        messagingSenderId: "712182325492"
    };

    // Initialize the default app
    firebase.initializeApp(config);
    var database = firebase.database();

    this.startLoginDialog = function(callback) {
        // FirebaseUI config.
        var uiConfig = {
            signInOptions: [
                // Leave the lines as is for the providers you want to offer your users.
                // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID
            ],
            signInFlow: "popup",
            credentialHelper: firebaseui.auth.CredentialHelper.NONE
        };

        var unsubscribe = firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                callback();
                unsubscribe();
            }
        }, function(error) {
            console.log(error);
            unsubscribe();
        });


        // Initialize the FirebaseUI Widget using Firebase.
        var ui = new firebaseui.auth.AuthUI(firebase.auth());
        // The start method will wait until the DOM is loaded.
        ui.start('#firebaseui-auth-container', uiConfig);
    };

    this.isSignedIn = function(callback) {
        var unsubscribe = firebase.auth().onAuthStateChanged(function (currentUser) {
            callback(!!currentUser);
            unsubscribe();
        }, function(error) {
            console.log(error);
            callback(false);
            unsubscribe();
        });
    };

    this.getAvailableWidgets = function(callback) {
        var widgets = database.ref('widgetList/');
        widgets.once('value').then(function (snapshot) {
            callback(snapshot.val());
        })
    }

    this.getUserWidgets = function(callback) {
        var unsubscribe = firebase.auth().onAuthStateChanged(function (currentUser) {
            var widgets = database.ref('userWidgets/'+currentUser.uid+'/');
            widgets.once('value').then(function (snapshot) {
                callback(snapshot.val());
            });
            unsubscribe();
        }, function(error) {
            console.error("User is not signed in: "+error);
            unsubscribe();
        });
    };

    this.postUserWidgets = function(widgetData, callback) {
        //Get the ID from the widget and use that for the push.
        var unsubscribe = firebase.auth().onAuthStateChanged(function (currentUser) {
            var key = database.ref('userWidgets/'+currentUser.uid+'/').push();
            key.set(widgetData, function (error) {
                callback(error);
            });
            unsubscribe();
        }, function(error) {
            console.error("User is not signed in: "+error);
            unsubscribe();
        });
    };

    this.getWidgetTemplate = function(widgetName, callback) {
        var widgets = database.ref('widgetTemplates/'+widgetName);
        widgets.once('value').then(function (snapshot) {
            callback(snapshot.val());
        })
    }
}

window.onload = function () {
    //do work
    var api = new Api();

    var app = {
        isLoading: true,
        spinner: document.querySelector('.loader'),
        cardTemplate: document.querySelector('.cardTemplate'),
        container: document.querySelector('.main'),
        dialogContainer: document.querySelector('.dialog-container'),
        addDialog: document.querySelector('#addWidgetDialog'),
        loginDialog: document.querySelector('#loginDialog'),
        dialogIsOpen: false
    };


    /*****************************************************************************
    *
    * Event listeners for UI elements
    *
    ****************************************************************************/
    document.getElementById('addWidgetButton').addEventListener('click', function() {
        if (!app.dialogIsOpen) {
            app.dialogContainer.classList.add('dialog-container--visible');
            app.addDialog.classList.add('dialog--visible');
            app.dialogIsOpen = true;
        }
    });

    document.getElementById('cancelButton').addEventListener('click', function() {
        app.dialogContainer.classList.remove('dialog-container--visible');
        app.addDialog.classList.remove('dialog--visible');
        app.dialogIsOpen = false;
    });

    /*****************************************************************************
    *
    * Methods to update/refresh the UI
    *
    ****************************************************************************/

    //Main Method run after startup run everything in here.
    app.main = function(data) {
      api.isSignedIn(function (signedIn) {
          console.log(signedIn);
          if (!signedIn) {
              //Force Login. make the dialog visible;
              app.dialogContainer.classList.add('dialog-container--visible');
              app.loginDialog.classList.add('dialog--visible');
              app.dialogIsOpen = true;
              api.startLoginDialog(function () {
                  console.log("Login Complete!");
                  //Make the dialog invisible
                  app.dialogContainer.classList.remove('dialog-container--visible');
                  app.loginDialog.classList.remove('dialog--visible');
                  app.dialogIsOpen = false;
              });
          }
      });

      if (app.isLoading) {
          app.spinner.setAttribute('hidden', true);
          app.container.removeAttribute('hidden');
          app.isLoading = false;
      }
    };
    app.main();

    // TODO add service worker code here
    if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function() { console.log('Service Worker Registered'); });
    }

};
