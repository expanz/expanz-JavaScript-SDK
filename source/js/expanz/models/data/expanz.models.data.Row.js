////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////

$(function() {

	window.expanz = window.expanz || {};
	window.expanz.models = window.expanz.models || {};
	window.expanz.models.data = window.expanz.models.data || {};

	window.expanz.models.data.Row = expanz.models.Bindable.extend({

	    defaults: function () {
	        return {
	            selected: false
	        };
	    },

		initialize: function () {
		    this.cells = new expanz.models.data.RowCollection();
		},

		getAllCells : function() {

			// remove/reject cells without value attribute
			// :this can happen b/c Backbone inserts a recursive/parent cell into the collection
			var cells = this.cells.reject(function(cell) {
				return cell.get('value') === undefined;
			}, this);

			return cells;
		},

		getCellsMapByField : function() {

			// remove/reject cells without value attribute
			// :this can happen b/c Backbone inserts a recursive/parent cell into the collection
			var cells = this.cells.reject(function(cell) {
				return cell.get('value') === undefined;
			}, this);

			var map = {};
			var sortedMap = {};
		    
			_.each(cells, function(cell) {
				var key = cell.get('field') || cell.get('label');
				map[key] = cell.get('value');
				sortedMap[key] = cell.get('sortValue') || cell.get('value');
			});

			/* add row id and type to the map */
			map['rowId'] = this.id;
			map['rowType'] = this.type;

			/* using a data to put the data to avoid underscore 'variable is not defined' error */
			return {
				data : map,
				sortedValues : sortedMap
			};
		}
	});

	window.expanz.models.data.RowCollection = expanz.Collection.extend({
	    model: expanz.models.data.Row
	});
});
