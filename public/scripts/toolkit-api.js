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
var user = firebase.auth().currentUser;
var database = firebase.database();

if (user) {
    console.log("User is signed in already")
} else {
    console.log("User is not signed in already")
}

function apiIsSignedIn() {
    return !!user;
}

function apiSignIn (username, password, callback) {
    firebase.auth().signInWithEmailAndPassword(username, password).catch(function(error) {
        console.log(error);
        callback(false)
    }).then(function () {
        user = firebase.auth().currentUser;
        callback(true)
    });
}

function apiGetAvailableWidgets(callback) {
    var widgets = database.ref('widgetList/');
    widgets.once('value').then(function (snapshot) {
        callback(snapshot.val());
    })
}

function apiGetUserWidgets(callback) {
    if (user) {
        var widgets = database.ref('userWidgets/'+user.uid+'/');
        widgets.once('value').then(function (snapshot) {
            callback(snapshot.val());
        })
    } else {
        console.error("User is not signed in")
    }
}

function apiPostUserWidgets(widgetData, callback) {
    //Get the ID from the widget and use that for the push.
}

function apiGetWidgetTemplate(widgetName, callback) {
    var widgets = database.ref('widgetTemplates/'+widgetName);
    widgets.once('value').then(function (snapshot) {
        callback(snapshot.val());
    })
}


