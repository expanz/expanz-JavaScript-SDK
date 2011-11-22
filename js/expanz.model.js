/* Author: Adam Tait

*/

$(function(){

   window.expanz = window.expanz || {};
   window.expanz.Models = {};
   window.expanz.Models.Login = {};

   window.expanz.Models.Bindable = Backbone.Model.extend({

   });


   window.expanz.Models.Field = expanz.Models.Bindable.extend({

      defaults: function(){
         return { error: false };
      },
      
      validate:   function( attrs ){
         if( ! attrs.value || attrs.value.length < 1 ){
            this.set({ error: true }, {silent: true});
            return this.get('label') + " is missing.";
         }
         this.set({ error: false }, {silent: true});
         return;
      }

   });

   window.expanz.Models.Method = expanz.Models.Bindable.extend({

   });


   window.expanz.Models.Activity = Backbone.Collection.extend({

      model:   expanz.Models.Bindable,

      initialize: function( attrs ){
         this.set( attrs );
      },

      set:  function( attrs ){
         for( var key in attrs ){
            this[key] = attrs[key];
         }
      },
   });

   window.expanz.Models.Login.Activity = expanz.Models.Activity.extend({

      validate: function(){
         if(   ! this.get('username').get('error') &&
               ! this.get('password').get('error'))
         {
            return true;
         } else {
            return false;
         }
      },

      login:   function(){
         if( this.validate() ){
            expanz.Net.CreateSessionRequest( this.get('username').get('value'),
                                             this.get('password').get('value'),
                                             loginCallback
                                             );
         }
      },
   });


      var loginCallback = function( error ){
         if( error && error.length > 0 ){
            this.get('error').set({ value: error });
         } else {
            expanz.Net.GetSessionDataRequest( getSessionCallback );
         }
      };
      var getSessionCallback = function( url, error ){
         if( error && error.length > 0 ){
            this.get('error').set({ value: error });
         } else {
            // redirect to first activity
            expanz.Views.redirect( url );
         }
      };
               
});





