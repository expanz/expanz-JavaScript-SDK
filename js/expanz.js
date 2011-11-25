/* Author: Adam Tait

*/
$(function () {

   //
   // Global Namespace definitions
   //
   window.App = [];
   window.expanz = window.expanz || {};
   window.expanz._error = window.expanz._error ||
   function (error) {
      console.log("Expanz JavaScript SDK has encountered an error: " + error);
   };

   // Load the Expanz Process Area menu
   loadMenu($('[bind=menu]'));



   //
   // Public Functions & Objects in the Expanz Namespace
   //
   window.expanz.CreateActivity = function (DOMObject) {

      //
      DOMObject || (DOMObject = $('body'));
      var viewNamespace = expanz.Views;
      var modelNamespace = expanz.Model;

      var activities = createActivity(viewNamespace, modelNamespace, DOMObject);
      _.each(activities, function (activity) {
         window.App.push(activity);
      });
      return;
   };

   window.expanz.DestroyActivity = function (DOMObject) {

      // find the given activity in list from the DOMObject
      if ($(DOMObject).attr('bind').toLowerCase() === 'activity') {
         var activityEl = DOMObject;
         var activity = popActivity( window.App, $(activityEl).attr('name'), $(activityEl).attr('key') );
         activity.model.destroy();
         activity.remove(); // remove from DOM
      } else {
         _.each($(dom).find('[bind=activity]'), function (activityEl) {
            var activity = popActivity( window.App, $(activityEl).attr('name'), $(activityEl).attr('key') );
            activity.model.destroy();
            activity.remove(); // remove from DOM
         });
      }
      return;
   };

   window.expanz.SetErrorCallback = function (fn) {

      //
      expanz._error = fn;
   };


   //
   // Private Functions
   //
   function createActivity(viewNamespace, modelNamespace, dom) {

      var activities = [];
      if ($(dom).attr('bind').toLowerCase() === 'activity') {

         var activityView = expanz.Factory.Activity(viewNamespace, modelNamespace, dom);
         activityView.collection.load();
         activities.push(activityView);

      } else {
         // search through DOM body, looking for elements with 'bind' attribute
         _.each($(dom).find('[bind=activity]'), function (activityEl) {
            var activityView = expanz.Factory.Activity(viewNamespace, modelNamespace, dom);
            activityView.collection.load();
            activities.push(activityView);
         }); // _.each activity
      }
      return activities;
   };

   function loadMenu(el) {

      // Load Menu & insert it into #menu
      var menu = new expanz.Storage.AppSiteMenu();
      _.each(expanz.Storage.getProcessAreaList(), function (processArea) {
         var menuItem = new expanz.Storage.ProcessAreaMenu(processArea.id, processArea.title);
         menu.processAreas.push(menuItem);

         _.each(processArea.activities, function (activity) {
            menuItem.activities.push(new expanz.Storage.ActivityMenu(activity.name, activity.title, activity.url));
         });
      });

      menu.load(el);
   };

   function popActivity( ary, name, key ) {
      
      for( var i=0; i < ary.length; i++ ) {
         if(   (ary[i].id === name)
               && (key? (ary[i].key === key): true) )
         {
            var found = ary[i];
            ary.remove( i );
            return found;
         }
      }
      return null;
   };

   // Array Remove - By John Resig (MIT Licensed)
   Array.remove = function(array, from, to) {
      var rest = array.slice((to || from) + 1 || array.length);
      array.length = from < 0 ? array.length + from : from;
      return array.push.apply(array, rest);
   };


}) // $(function() --

