/* Author: Adam Tait

*/

$(function(){

   window.expanz = window.expanz || {};
   window.expanz.Views = window.expanz.Views || {};
   window.expanz.Views.Login = {};


   window.expanz.Views.Login.FieldView = Backbone.View.extend({

      initialize: function(){
         this.model.bind( "change:label", this.modelUpdate('label'), this );
         this.model.bind( "change:value", this.modelUpdate('value'), this );
      },

      modelUpdate: function( attr ){
         return function(){
            var elem = this.el.find('[attribute='+ attr +']');
            updateViewElement( elem, this.model.get(attr) );
            this.el.trigger( 'update:field' );
         };
      },

      events:  {
         "change [attribute=value]":   "viewUpdate",
         "blur [attribute=value]":     "viewUpdate"
      },

      viewUpdate:  function(){
         this.model.set({ value:   this.el.find('[attribute=value]').val() });
         this.el.trigger( 'update:field' );
      }
      
   });

   window.expanz.Views.Login.DependantFieldView = Backbone.View.extend({

      initialize: function(){
         this.model.bind( "change:value", this.toggle, this );
         this.model.bind( "error", this.error, this );
         this.el.hide();
      },

      toggle:  function(){
         var elem = this.el.find('[attribute=value]');
         updateViewElement( elem, this.model.get('value') );

         if( this.model.get( 'value' ).length > 0 ){
            this.el.show( 'slow' );
         } else {
            this.el.hide( 'slow' );
         }
      },

      error:   function (model, error) {
         // stop from bubbling to Activity
         return false;
      }
      
   });

   window.expanz.Views.Login.MethodView = Backbone.View.extend({

      events:  {
         "click [attribute=submit]":   "attemptSubmit"
      },

      attemptSubmit: function(){
         this.el.trigger( 'attemptLogin' );
      }

   });


   window.expanz.Views.Login.ActivityView = Backbone.View.extend({

      initialize: function() {
         this.collection.bind( "error", this.updateError, this );
      },

      updateError: function (model, error) {
         var errorFieldModel = this.collection.get('error');
         if (errorFieldModel) {
            errorFieldModel.set({ value: error });
         }
      },

      events:  {
         "attemptLogin":   "attemptLogin",
         "update:field":   "update"
      },

      attemptLogin: function(){
         // call the server
         if(   !this.collection.get('username').get('error') &&
               !this.collection.get('password').get('error'))
         {
            this.collection.login();
         }
      },

      update: function(){
         if(   !this.collection.get('username').get('error') &&
               !this.collection.get('password').get('error'))
         {
            this.collection.get('error').set({ value: "" });
         }
      }

   });

   // Public Functions

   window.expanz.Views.redirect = function(destinationURL ){
      window.location.href = destinationURL;
   };



   // Private Functions

   function updateViewElement( elem, value ){
      if( $(elem).is('input') ){
         $(elem).val( value );
      } else {
         $(elem).html( value );
      }
      return elem;
   };

})





















