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
      },

      destroy: function(){
         this.each( function( m ){
                     m.destroy();
         });
         return;
      },
   });


   window.expanz.Model.Field = expanz.Model.Bindable.extend({

      defaults: function(){
         return { error: false };
      },
      
      validate:   function( attrs ){
         
         this.set({ error: false }, {silent: true});
         if( !attrs.value ) {
            this.set({ error: true }, {silent: true});
            return   this.get('label')? this.get('label'): this.get('id')
                     + " is missing.";
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


});


