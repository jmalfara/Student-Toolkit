
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
        dialogIsOpen: false,
		widgets: []
    };


    /*****************************************************************************
    *
    * Event listeners for UI elements
    *
    ****************************************************************************/
    document.getElementById('addWidgetButton').addEventListener('click', function() {
        if (!app.dialogIsOpen && !app.isLoading) {
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

    document.getElementById('addConfirmButton').addEventListener('click', function() {
        //Get the selected Widget Data
        //TODO This is not done.
        selector = document.getElementById('selectWidgetToAdd')
        widgetToAdd = selector.options[selector.selectedIndex].text;

        // Add the widget components into the dashboard in a specific grid location
        api.getWidgetTemplate(widgetToAdd, function(data) {
            widget = new Widget(data);
            //Close the dialog
            app.dialogContainer.classList.remove('dialog-container--visible');
            app.addDialog.classList.remove('dialog--visible');
            app.dialogIsOpen = false;
	    	app.addWidgetToDashboard(widget, data.id);
        });
    });

	function showLoader() {
		//Turn off the loader.
		if (!app.isLoading) {
			app.spinner.setAttribute('visible', true);
			app.container.removeAttribute('visible');
			app.isLoading = true;
      		}
    	}

	function hideLoader() {
		//Turn off the loader.
		if (app.isLoading) {
			app.spinner.setAttribute('hidden', true);
			app.container.removeAttribute('hidden');
			app.isLoading = false;
      		}
	}

	function pushWidget(widgetId) {
		widget = app.widgets[widgetId];
		if (widget !== null && widget !== undefined) {
			widget.getUpdatedData(function(data) {
				console.log(data);
			});
		}
	}

    /*****************************************************************************
    *
    * Methods to update/refresh the UI
    *
    ****************************************************************************/
    app.addWidgetToDashboard = function(widget, id) {
        widget.getHTML(function (data) {
			// Create a inner div as a container for the entire widget
			var innerDiv = document.createElement('div');
			innerDiv.className = 'col';

			// Add unique ID for each widget container
			var uniqid = Date.now();
			innerDiv.id = uniqid;

			// Dump widget template data onto the div container
			innerDiv.setAttribute("style","width:32.26%");
			innerDiv.innerHTML = data;

			// Add the newly created div into the dashboard container
			document.getElementById("gridContainer").appendChild(innerDiv);
        });

		// Add the widget to the widget list.
		app.widgets[id] = widget;
    }

    //Main Method run after startup run everything in here.
    app.main = function(data) {

    	// Retrieve The list of available widget templates
	api.getAvailableWidgets(function (widgets) {
		// Dynamically load the values from the widget list to html DOM
		var select = document.getElementById("selectWidgetToAdd")
		for(index in widgets) {
			select.options[select.options.length] = new Option(widgets[index], index);
		}

		//Turn off the loader.
		hideLoader();

	    	// User authentication process
		api.isSignedIn(function (signedIn) {
    			console.log(signedIn);

    			if (!signedIn) {
				//Force Login. make the dialog visible;
				app.dialogContainer.classList.add('dialog-container--visible');
				app.loginDialog.classList.add('dialog--visible');
				app.dialogIsOpen = true;


				// Prompt the login screen
				api.startLoginDialog(function () {
		    			console.log("Login successfully complete!");

			    		//Make the dialog invisible
			    		app.dialogContainer.classList.remove('dialog-container--visible');
			    		app.loginDialog.classList.remove('dialog--visible');
		    			app.dialogIsOpen = false;

			    		// Fetch all the available widgets for the signed in user
					showLoader();
					api.getUserWidgets(function (widgets) {
						//Implement this.
						console.log("Got widgets: "+widgets);
						hideLoader();
    					});
				});
			} else {
		    		// Fetch all the available widgets for the signed in user
				showLoader();
				api.getUserWidgets(function (widgets) {
					
					// Implement this.
					console.log("Got widgets: "+ widgets);
					hideLoader();
				});
			}
		});
	});
    };

    app.main();

    // TODO add service worker code here
    //if ('serviceWorker' in navigator) {
    //navigator.serviceWorker
    //         .register('./service-worker.js')
    //         .then(function() { console.log('Service Worker Registered'); });
    //}
