/* Author: Adam Tait

*/

$(function(){

   window.expanz = window.expanz || {};
   window.expanz.Model = {};
   window.expanz.Model.Login = {};

   window.expanz.Model.Bindable = Backbone.Model.extend({

   });

   window.expanz.Collection = Backbone.Collection.extend({

      initialize: function( attrs, options ){
         this.attrs = {};
         this.setAttr( attrs );
      },

      getAttr:  function( key ){
         if( this.attrs[key] )
            return this.attrs[key];
         return false;
      },

      setAttr:  function( attrs ){
         for( var key in attrs ){
            if( key === 'id' )   this.id = attrs[key];
            this.attrs[key] = attrs[key];
         }
         return true;
      }
   });


   window.expanz.Model.Field = expanz.Model.Bindable.extend({

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
      },

      update:  function( attrs ){
         
         expanz.Net.DeltaRequest( this.get('id'), attrs.value, this.get('parent') );
         return;
      }

   });

   window.expanz.Model.Method = expanz.Model.Bindable.extend({

      submit:  function() {
         
         expanz.Net.MethodRequest( this.get('id'), this.get('parent') );
         return;
      }

   });





   window.expanz.Model.Activity = expanz.Collection.extend({

      model:   expanz.Model.Bindable,

      initialize: function( attrs ){
         this.grids = {};
         expanz.Collection.prototype.initialize.call( this, attrs );
      },

      addGrid: function( grid ){
         this.grids[ grid.id ] = grid;
         return;
      },
      getGrid: function( id ){
         return this.grids[ id ];
      },
      getGrids:   function(){
         return this.grids;
      },
      hasGrid: function(){
         return this.grids != {};
      },

      load: function(){
         expanz.Net.CreateActivityRequest( this);
      },
   });





   window.expanz.Model.Login.Activity = expanz.Model.Activity.extend({

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





