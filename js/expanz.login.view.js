/* Author: Adam Tait

*/

$(function(){

   window.expanz = window.expanz || {};
   window.expanz.Views = {};

   window.expanz.Views.FieldView = Backbone.View.extend({

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

   window.expanz.Views.DependantFieldView = Backbone.View.extend({

      initialize: function(){
         this.model.bind( "change:value", this.toggle, this );
      },

      toggle:  function(){
         var elem = this.el.find('[attribute=value]');
         updateViewElement( elem, this.model.get('value') );

         if( this.model.get( 'value' ).length > 0 ){
            this.el.show( 'slow' );
         } else {
            this.el.hide( 'slow' );
         }
      }

      
   });

   window.expanz.Views.MethodView = Backbone.View.extend({

      events:  {
         "click [attribute=submit]":   "attemptSubmit"
      },

      attemptSubmit: function(){
         // expanz.Activity['login'].validate()
         // trigger attamptSubmit on el
         this.el.trigger( 'attemptLogin' );
      }

   });

   window.expanz.Views.ActivityView = Backbone.View.extend({

      initialize: function() {
         this.collection.bind( "error", this.updateError, this );
      },

      updateError: function( model, error ){
         this.collection.get('error').set({ value: error });
      },

      events:  {
         "attemptLogin":   "attemptLogin",
         "update:field":   "update"
      },

      attemptLogin: function(){
         // call the server
         this.collection.login();
      },

      update: function(){
         if(   !this.collection.get('username').get('error') &&
               !this.collection.get('password').get('error'))
         {
            this.collection.get('error').set({ value: "" });
         }
      },

   });


   // Private Functions

   function updateViewElement( elem, value ){
      if( $(elem).is('input') ){
         $(elem).val( value );
      } else {
         $(elem).html( value );
      }
      return elem;
   }

})





















