/* Author: Adam Tait

*/

$(function(){

   //
   // Global Namespace definitions
   //
   window.App = [];
   window.expanz = window.expanz || {};
   window.expanz._error = window.expanz._error ||
   function (error) {
      console.log("Expanz JavaScript SDK has encountered an error: " + error);
   };


   //
   // Public Functions & Objects in the Expanz Namespace
   //
   window.expanz.CreateActivity = function (DOMObject) {

      DOMObject || (DOMObject = $('body'));
      var viewNamespace = expanz.Views.Login;
      var modelNamespace = expanz.Model.Login;

      var activities = createActivity(viewNamespace, modelNamespace, DOMObject);
      _.each(activities, function (activity) {
         window.App.push(activity);
      });
      return;
   };

   window.expanz.SetErrorCallback = function (fn) {

      expanz._error = fn;
   };

   //
   // Private Functions
   //
   function createActivity(viewNamespace, modelNamespace, dom) {

      var activities = [];
      if ($(dom).attr('bind').toLowerCase() === 'activity') {

         var activityView = expanz.Factory.Activity(viewNamespace, modelNamespace, dom);
         //activityView.collection.load();   // NOTE: this load (CreateActivity request) is not necessary for login
         activities.push(activityView);

      } else {
         // search through DOM body, looking for elements with 'bind' attribute
         _.each($(dom).find('[bind=activity]'), function (activityEl) {
            var activityView = expanz.Factory.Activity(viewNamespace, modelNamespace, dom);
            //activityView.collection.load();   // NOTE: this load (CreateActivity request) is not necessary for login
            activities.push(activityView);
         }); // _.each activity
      }
      return activities;
   };

})





















