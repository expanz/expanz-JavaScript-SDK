/* Author: Adam Tait

*/
$(function () {

   //
   // Global Namespace definitions
   //
   window.App = [];
   window.expanz = window.expanz || {};
   window.expanz._error =  window.expanz._error
                           || function (error) {
                                 console.log("Expanz JavaScript SDK has encountered an error: " + error);
                              };

   // Load the Expanz Process Area menu
   expanz.Views.loadMenu($('[bind=menu]'));



   //
   // Public Functions & Objects in the Expanz Namespace
   //

   window.expanz.CreateActivity = function (DOMObject) {

      //
      DOMObject || (DOMObject = $('body'));
      var viewNamespace = expanz.Views;

      var activities = createActivity(viewNamespace, DOMObject);
      _.each( activities, function( activity ){ window.App.push(activity); }); 
   };

   window.expanz.DestroyActivity = function (DOMObject) {

      //
      //expanz.Views.destroy( DOMObject );
   };

   window.expanz.SetErrorCallback = function (fn) {

      //
      expanz._error = fn;
   };

   function createActivity(viewNamespace, dom) {

      var activities = [];
      if ($(dom).attr('bind').toLowerCase() === 'activity') {

         var activityView = expanz.Factory.Activity(viewNamespace, dom);
         activityView.collection.load();
         activities.push(activityView);

      } else {
         // search through DOM body, looking for elements with 'bind' attribute
         _.each($(dom).find('[bind=activity]'), function (activityEl) {
            var activityView = expanz.Factory.Activity(dom);
            activityView.collection.load();
            activities.push(activityView);
         }); // _.each activity
      }
      return activities;
   };






}) // $(function() --

