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

    if (firebase !== 'undefined' && !firebase.apps.length) {
        // Initialize the default app
        firebase.initializeApp(config);
    }

    // database creation through firebase hosting
    var database = firebase.database();
    var storage = firebase.storage();

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
            unsubscribe();
        });
    };

    this.getAvailableWidgets = function(callback) {
        var widgets = database.ref('widgetList/');
        widgets.once('value').then(function (snapshot) {
            callback(snapshot.val());
        })
    };

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
            var key = database.ref('userWidgets/'+currentUser.uid+'/'+widgetData.id+'/');
            key.set(widgetData, function (error) {
                if (error !== null) {
                    callback(error);
                }
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
            var map = [];
            var data = snapshot.val();
            //Change the id of the widget.
            data.id = new Date().getTime()+data.id;

            for (componentIndex in snapshot.val().components) {
                var id = data.components[componentIndex].id;

                if (typeof id !== 'undefined') {
                	var timestamp = new Date();
                	var nId = timestamp.getTime()+id;

	        	    map[map.length] = { oldId : id, newId : nId };
      	     	 	  //Change the ID of the component;
               		data.components[componentIndex].id = nId;
            	}
	        }

            //Reiterate over components for actions. Rename all actions
            for (componentIndex in data.components) {
                var action = data.components[componentIndex].action;
                if (typeof action === 'undefined' || action === null) {
                    continue;
                }

                //Change the ids in the action
                for (idIndex in map) {
                    oldId = map[idIndex].oldId;
                    newId = map[idIndex].newId;

                    var regex = "(.*(,|\\())"+oldId+"(.*)";
                        var re = new RegExp(regex,"g");
                    while (action.match(re) !== null) {
                        action = action.replace(re, "$1"+newId+"$3");
                        console.log("FROM "+oldId+" TO "+newId+" Action: "+action);
                    }
                }
                data.components[componentIndex].action = action;
            }
	        console.log(data.components);
            callback(data);
        })
    };
    
    this.storeFile = function (file, callback) {
        var storageRef = storage.ref(new Date().getTime()+"_"+file.name);
        var uploadTask = storageRef.put(file);
        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
            function(snapshot) {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                        console.log('Upload is paused');
                        break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                        console.log('Upload is running');
                        break;
                }
            }, function(error) {
                alert(error);
            }, function() {
                // Upload completed successfully, now we can get the download URL
                var downloadURL = uploadTask.snapshot.downloadURL;
                callback(downloadURL);
            });
    }
}
