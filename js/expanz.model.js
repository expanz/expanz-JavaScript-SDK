/* Author: Adam Tait

*/

$(function(){

   window.expanz = window.expanz || {};
   window.expanz.Models = {};
   window.expanz.Models.Bindable = Backbone.Model.extend({

   });


   window.expanz.Models.Field = expanz.Models.Bindable.extend({

      defaults: function(){
         return { error: false };
      },
      
      validate:   function( attrs ){
         if( ! attrs.value || attrs.value.length < 1 ){
            this.set({ error: true }, {silent: true});
            return "Please enter your " + this.get('label');
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

      validate: function(){
         var error = this.get('username').validate() || this.get('password').validate();
         if( !error ){
            // fire off login event to server
            return;
         }
         else {
            return error;
         }
      }
               
   });

});





