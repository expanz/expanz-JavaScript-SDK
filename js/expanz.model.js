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
         
         this.set({ error: false }, {silent: true});
         if( attrs.value && attrs.value.length < 1 ) {
            this.set({ error: true }, {silent: true});
            return this.get('label') + " is missing.";
         }
         return;
      }

   });

   window.expanz.Models.Method = expanz.Models.Bindable.extend({

   });

   window.expanz.Models.Data = Backbone.Collection.extend({

   });


   window.expanz.Models.Activity = Backbone.Collection.extend({

      model:   expanz.Models.Bindable,

      initialize: function( attrs ){
         this.setAttr( attrs );
      },

      getAttr:  function( key ){
         if( this[key] )
            return this[key];
         return false;
      },

      setAttr:  function( attrs ){
         for( var key in attrs ){
            this[key] = attrs[key];
         }
         return true;
      },

      load: function(){
         expanz.Net.CreateActivityRequest( this);
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
                                             config._AppSite,
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





