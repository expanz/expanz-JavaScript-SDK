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
      },

      viewUpdate:  function(){
         this.model.update({ value:   this.el.find('[attribute=value]').val() });
         this.el.trigger( 'update:field' );
      }
      
   });

   window.expanz.Views.DependantFieldView = Backbone.View.extend({

      initialize: function(){
         this.model.bind( "change:value", this.toggle, this );
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
      }

      
   });

   window.expanz.Views.MethodView = Backbone.View.extend({

      events:  {
         "click [attribute=submit]":   "submit"
      },

      submit: function(){
         this.model.submit();
         this.el.trigger( 'submit:' + this.model.get('id') );
      }

   });

   window.expanz.Views.GridView = Backbone.View.extend({
      
      initialize: function(){
         this.model.bind( "add", this.render, this );
         this.model.bind( "change", this.render, this );
      },

      render:  function(){

         // set table scaffold
         var tableEl = this.el.find('table#' + this.model.getAttr('id') );
         if( tableEl.length < 1 ) {
            this.el.append( '<table id="' + this.model.getAttr('id') + '"></table>' );
            tableEl = this.el.find('table#' + this.model.getAttr('id') );
         }
         $(tableEl).html('<thead><tr></tr></thead><tbody></tbody>');
         
         // render column header
         var el = $(tableEl).find('thead tr');
         _.each( this.model.getAllColumns(), function( cell ) {
            var html = '<td';
            html += cell.get('width')? ' width="' + cell.get('width') + '"': '';
            html += '>' + cell.get('label') + '</td>';
            el.append( html );
         });
         

         // render rows
         var model = this.model;
         el = $(tableEl).find('tbody');
         _.each( this.model.getAllRows(), function( row ) {

            var html = '<tr id="' + row.getAttr('id') + '">';

            var columnOrder = _.map( this.model.getAllColumns(), function( cell ){ 
                                       return { id:      cell.get('id'),
                                                field:   cell.get('field'),
                                                label:   cell.get('label')
                                                };
                                       });
            _.each( row.getAllCells( columnOrder ), function( cell ) {

               html += '<td id="' + cell.get('id') + '" class="row' + row.getAttr('id') + ' column' + cell.get('id') + '">';
               if( model.getColumn( cell.get('id') ) && model.getColumn( cell.get('id') ).get('datatype') === 'BLOB' ){
                  html += '<img width="' + model.getColumn( cell.get('id') ).get('width') + '" src="' + cell.get('value') + '"/>';
               } else if( cell.get('value') ) {
                  html += '<span>' + cell.get('value') + '</span>';
               }
               html += '</td>';
            }, row);
            html += '</tr>';
            el.append( html );
         }, this);

         return this;
      },
   });

   window.expanz.Views.ActivityView = Backbone.View.extend({

      initialize: function() {
         this.collection.bind( "error", this.updateError, this );
      },

      updateError: function( model, error ){
         this.collection.get('error').set({ value: error });
      },

      events:  {
         "update:field":   "update"
      },

      update: function(){
         // perform full activity validation after a field updates ... if necessary
      },

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





















