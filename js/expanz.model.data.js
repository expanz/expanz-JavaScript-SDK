$(function () {

   window.expanz = window.expanz || {};
   window.expanz.Model = window.expanz.Model || {};
   window.expanz.Model.Data = {};

   window.expanz.Model.Data.Cell = expanz.Model.Bindable.extend({

      initialize: function ( attrs, options ) {
         expanz.Model.Bindable.prototype.initialize.call(this, attrs, options);
         this.set({
            selected: false
         });
      }

   });

   window.expanz.Model.Data.Row = expanz.Collection.extend({

      model: expanz.Model.Data.Cell,

      initialize: function ( attrs, options ) {
         expanz.Collection.prototype.initialize.call( this, attrs, options );
         this.setAttr({
            selected: false
         });
         this.setAttr(attrs);
      },

      getAllCells: function (order) {

         // remove/reject cells without value attribute
         //    :this can happen b/c Backbone inserts a recursive/parent cell into the collection
         var cells = this.reject(function (cell) {
            return !cell.get('value');
         }, this);
         // if order has been provided and all cells in order have an 'id' attribute
         if (order && _.reduce(order, function (memo, map) {
            return memo && map.id;
         }, true)) {

            // filter for only cells that are in the given order
            //    :necessary in case there are too many or too few
            var unorderedCells = _.filter(cells, function (cell) {
               return _.find(order, function (column) {
                  if (cell.get('id')) return cell.get('id') === column.id;
                  if (cell.get('field')) return cell.get('field') === column.field;
                  return cell.get('label') === column.label;
               });
            });

            // generate of map of the cells in the given 'order'
            var mappedCells = _.map(order, function (map) {
               var cell = _.find(unorderedCells, function (cell) {
                  return (cell.get('id') === map.id) || (cell.get('field') === map.field) || (cell.get('label') === map.label);
               });
               if (!cell) cell = new expanz.Model.Bindable({
                  id: map.id
               });
               return {
                  id: map.id,
                  cell: cell
               };
            });
            // take the mapped ordered cells and put them into an array, in order
            var orderedCells = _.reduce(mappedCells, function (memo, map) {
               memo.push(map.cell);
               return memo;
            }, []);
            return orderedCells;
         }
         return cells;
      }


   });
   
   window.expanz.Model.Data.DataControl =  expanz.Model.Bindable.extend({
       
       update:  function( attrs ){
           
           expanz.Net.DeltaRequest( this.get('id'), attrs.value, this.get('parent') );
           return;
        }
   });
   

   window.expanz.Model.Data.Grid = expanz.Collection.extend({

      model: expanz.Model.Data.Row,

      initialize: function (attrs) {
         expanz.Collection.prototype.initialize.call(this, attrs);
         this.setAttr({
            lockedColumns: false
         });
         this.add([{
            id: '_header'
         }]);
      },

      getColumn: function (id) {
         return this.get('_header').get(id);
      },
      getAllColumns: function () {
         return this.get('_header').reject(function (cell) {
            return cell.get('id') === '_header';
         }, this);
      },
      addColumnDefault: function (_id, _field, _label, _datatype, _width) {

         this.setAttr({
            lockedColumns: true
         });

         this.get('_header').add({
            id: _id,
            field: _field,
            label: _label,
            datatype: _datatype,
            width: _width
         });
      },
      addColumn: function (_id, _field, _label, _datatype, _width) {

         // columns have already been defaulted in formmapping.xml
         if (this.getAttr('lockedColumns')) {

            //var existingCell = this.get( '_header' ).get( _id );
            var existingCell = this.get('_header').find(

            function (cell) {
               return (cell.get('id') === _id) || (cell.get('field') === _field) || (cell.get('label') === _label);
            });
            // if fields are missing from the existing cells, fill them in with new fields
            if (existingCell) {
               if (!existingCell.get('id')) existingCell.set({
                  id: _id
               });
               if (!existingCell.get('field')) existingCell.set({
                  field: _field
               });
               if (!existingCell.get('label')) existingCell.set({
                  label: _label
               });
               if (!existingCell.get('datatype')) existingCell.set({
                  datatype: _datatype
               });
               if (!existingCell.get('width')) existingCell.set({
                  width: _width
               });
            }
         } else {
            this.get('_header').add({
               id: _id,
               field: _field,
               label: _label,
               datatype: _datatype,
               width: _width
            });
         }
      },

      getAllRows: function () {
         return this.reject(function (row) {
            // NOTE: 'this' has been set as expanz.Model.DataGrid
            return (row.getAttr('id') === '_header') || (this.getAttr('id') === row.getAttr('id')) || (this.getAttr('activityId') === row.getAttr('id'));
         }, this);
      },
      addRow: function (_id, _type) {

         this.add({
            id: _id,
            type: _type,
            gridId: this.getAttr('id')
         });
      },

      addCell: function (_rowId, _cellId, _value) {

         this.get(_rowId).add({
            id: _cellId,
            value: _value
         });
      },
      
      updateRowSelected: function(selectedId,type){
    	  console.log("GridModel:updateRowSelected id:"+selectedId + ' ,type:' + type);
      }

 
   });


});

