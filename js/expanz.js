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
   
   window.expanz._info = window.expanz._info ||
   function (info) {
      console.log("Info received: " + info);
   };   
   
   

   // Load the Expanz Process Area menu
   loadMenu($('[bind=menu]'));



   //
   // Public Functions & Objects in the Expanz Namespace
   //
   window.expanz.CreateActivity = function (DOMObject, callbacks) {

      //
      DOMObject || (DOMObject = $('body'));
      var viewNamespace = expanz.Views;
      var modelNamespace = expanz.Model;

      var activities = createActivity(viewNamespace, modelNamespace, DOMObject, callbacks);
      _.each(activities, function (activity) {
         window.App.push(activity);
      });
      return;
   };  
   

   window.expanz.DestroyActivity = function (DOMObject) {

      // find the given activity in list from the DOMObject
      if ($(DOMObject).attr('bind').toLowerCase() === 'activity') {
         var activityEl = DOMObject;
         var activity = pop( window.App, {name: $(activityEl).attr('name'), key: $(activityEl).attr('key')} );
         activity.collection.destroy();
         activity.remove(); // remove from DOM
      } else {
         // top-level DOMObject wasn't an activity, let's go through the entire DOMObject looking for activities
         _.each($(dom).find('[bind=activity]'), function (activityEl) {
            var activity = popActivity( window.App, $(activityEl).attr('name'), $(activityEl).attr('key') );
            activity.model.destroy();
            activity.remove(); // remove from DOM
         });
      }
      return;
   };

   window.expanz.Logout = function() {
      function redirect(){ expanz.Views.redirect( expanz.Storage.getLoginURL() ) };
      expanz.Net.ReleaseSessionRequest({ success: redirect, error: redirect });
   };

   window.expanz.SetErrorCallback = function (fn) {

      expanz._error = fn;
   };

   
   window.expanz.SetInfoCallback = function (fn) {

      expanz._info = fn;
   };


   //
   // Private Functions
   //
   function createActivity(viewNamespace, modelNamespace, dom, callbacks) {

      var activities = [];
      if( $(dom).attr('bind') && ($(dom).attr('bind').toLowerCase() === 'activity')) {

         var activityView = expanz.Factory.Activity(viewNamespace, modelNamespace, dom);
         activityView.collection.load( callbacks );
         activities.push(activityView);

      } else {
         // search through DOM body, looking for elements with 'bind' attribute
         _.each($(dom).find('[bind=activity]'), function (activityEl) {
            var activityView = expanz.Factory.Activity(viewNamespace, modelNamespace, dom);
            activityView.collection.load( callbacks );
            activities.push(activityView);
         }); // _.each activity
      }
      return activities;
   };
   
   
   
   function findActivity(activityId) {
	   if( window && window.App){
		   for( var i=0; i < window.App.length; i++ ) {
		         if(window.App[i].id == activityId) {
		            return window.App[i];
		         }
		      }
   		}
		return null;
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

   function pop( ary, map ) { //, name, key ) {
      
      for( var i=0; i < ary.length; i++ ) {
         if(_.reduce( map, function(memo, key){return memo && (map.key === ary[i].key);}, true ))
         {
            var found = ary[i];
            ary.remove( i );
            return found;
         }
      }
      return null;
   };

   // Array Remove - By John Resig (MIT Licensed)
   Array.prototype.remove = function(from, to) {
      var rest = this.slice((to || from) + 1 || this.length);
      this.length = from < 0 ? this.length + from : from;
      return this.push.apply(this, rest);
   };
   


}) // $(function() --

