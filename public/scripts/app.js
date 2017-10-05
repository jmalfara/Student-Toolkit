(function() {
  'use strict';

  var app = {
    isLoading: true,
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container')
  };


  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/
  document.getElementById('addWidgetButton').addEventListener('click', function() {
    app.openAddDialog();
  });

  document.getElementById('cancelButton').addEventListener('click', function() {
    app.closeAddDialog();
  });

  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/
  app.openAddDialog = function () {
      app.addDialog.classList.add('dialog-container--visible');
  };

  app.closeAddDialog = function () {
      app.addDialog.classList.remove('dialog-container--visible');
  };

  //Main Method run after startup run everything in here.
    app.main = function() {
      //  Run the main logic here.
      //  Get the Widgets list
      //  Draw the widget list
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
             .then(function() { console.log('Service Worker Registered :)'); });
  }
})();
