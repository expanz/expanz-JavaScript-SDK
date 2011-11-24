/* Author: Adam Tait

*/

$(function(){

   window.expanz = window.expanz || {};
   window.expanz.Models = {};
   window.expanz.Models.Login = {};

   window.expanz.Models.Bindable = Backbone.Model.extend({

   });

   window.expanz.Collection = Backbone.Collection.extend({

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
      }
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
      },

      update:  function( attrs ){
         
         expanz.Net.DeltaRequest( this.get('id'), attrs.value, this.get('parent') );
         return;
      }

   });

   window.expanz.Models.Method = expanz.Models.Bindable.extend({

      submit:  function() {
         
         expanz.Net.MethodRequest( this.get('id'), this.get('parent') );
         return;
      }

   });

   window.expanz.Models.DataGridRow = expanz.Collection.extend({

      model: expanz.Models.Bindable,

      initialize: function( attrs ){
         this.setAttr({ selected: false });
         this.setAttr( attrs );
      },

      getAll: function( order ){

         var cells = this.reject(  function( cell ) { 
                                 return   !cell.get('value');  //(this.getAttr('gridId') === cell.get('id')) 
                                          //|| (this.getAttr('activityId') === cell.get('id'))
                                          //|| !cell.get('value');
                                 },
                              this
                     );
         if( order && _.reduce( order, function(memo,map){ return memo && map.id; }, true) ) {
            
            // filter for only cells that are in the given order
            //    :necessary in case there are too many or too few
            var unorderedCells = _.filter(  cells, function( cell ) {
                                             return _.find( order, function( column ) { 
                                                if( cell.get('id') )
                                                   return cell.get('id') === column.id;
                                                if( cell.get('field') )
                                                   return cell.get('field') === column.field;
                                                return cell.get('label') === column.label;
                                             });
                                          });

            // generate of map of the cells in the given 'order'
            var mappedCells = _.map( order, function( map ) { 
                                 var cell = _.find( unorderedCells, function( cell ) {
                                                      return   (cell.get('id') === map.id)
                                                               || (cell.get('field') === map.field)
                                                               || (cell.get('label') === map.label); 
                                             });
                                 if( !cell )
                                    cell = new expanz.Models.Bindable({ id:   map.id });
                                 return { id:   map.id, 
                                          cell: cell
                                          }; 
                              });
            // var filteredCells = _.filter( mappedCells, function( dict ) { return dict.cell; });
            // take the mapped ordered cells and put them into an array, in order
            var orderedCells = _.reduce( mappedCells, function( memo, map ) {
                                                         memo.push( map.cell ); 
                                                         return memo;
                                                      },
                                                      [] 
                                       );
            return orderedCells;
         } 
         return cells;
      },


   });

   window.expanz.Models.DataGrid = expanz.Collection.extend({

      model: expanz.Models.DataGridRow,

      initialize: function( attrs ){

         this.setAttr({ activityId:       attrs.parent.getAttr('name'),
                        lockedColumns:    false
                        });
         this.add({  id:   '_header' });
         expanz.Collection.prototype.initialize.call( this, attrs );
      },

      getColumn:  function( id ) {
         return this.get( '_header' ).get( id );
      },
      getColumns: function() {
         return   this.get( '_header' )
                     .reject( function( cell ){
                                 return cell.get('id') === '_header';
                              }, this );
      },
      addColumnDefault:  function( _id, _field, _label, _datatype, _width ) {
         
         this.setAttr({ lockedColumns: true });

         this.get( '_header' ).add({   id:         _id,
                                       field:      _field,
                                       label:      _label,
                                       datatype:   _datatype,
                                       width:      _width,
                                       });
      },
      addColumn:  function( _id, _field, _label, _datatype, _width ) {
         
         // columns have already been defaulted in formmapping.xml
         if( this.getAttr('lockedColumns') ) {

            //var existingCell = this.get( '_header' ).get( _id );
            var existingCell = this.get('_header').find( 
                                          function( cell ){
                                             return   (cell.get('id') === _id)
                                                      || (cell.get('field') === _field)
                                                      || (cell.get('label') === _label);
                                          });
            // if fields are missing from the existing cells, fill them in with new fields
            if( existingCell ) {
               if( !existingCell.get('id'))
                  existingCell.set({ id:  _id });
               if( !existingCell.get('field'))
                  existingCell.set({ field:  _field });
               if( !existingCell.get('label'))
                  existingCell.set({ label:  _label });
               if( !existingCell.get('datatype'))
                  existingCell.set({ datatype:  _datatype });
               if( !existingCell.get('width'))
                  existingCell.set({ width:  _width });
            }
         } else {
            this.get( '_header' ).add({   id:         _id,
                                          field:      _field,
                                          label:      _label,
                                          datatype:   _datatype,
                                          width:      _width,
                                          });
         }
      },

      getAll: function(){
            return this.reject(  function( row ) {
                        // NOTE: 'this' has been set as expanz.Models.DataGrid
                        return   (row.getAttr('id') == '_header')
                                 || (this.getAttr('id') == row.getAttr('id'))
                                 || (this.getAttr('activityId') === row.getAttr('id'));
                        },
                        this
               );
      },
      addRow:  function( _id, _type ) {
         
         this.add({  id:      _id,
                     type:    _type,
                     gridId:  this.getAttr('id')
                     });
      },

      addCell: function( _rowId, _cellId, _value ) {
         
         this.get( _rowId ).add({   id:      _cellId,
                                    value:   _value
                                    });
      },


   });


   window.expanz.Models.Activity = expanz.Collection.extend({

      model:   expanz.Models.Bindable,

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





