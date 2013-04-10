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
		    this.cells = new expanz.models.data.CellCollection();
		    this.dataPublication = null; // Will be set in populateDataPublicationModel in responseParser
		},

		addCell: function (cellId, value, column, sortValue, displayStyle) {
		    this.cells.add({
		        id: cellId,
		        value: value,
		        row: this,
		        column: column,
		        sortValue: sortValue,
		        displayStyle: displayStyle
		    });
		},

		getCellValues : function() {
		    var values = {};
			var sortValues = {};
		    
			this.cells.each(function(cell) {
			    var key = cell.get("column").get("safeFieldName") || cell.get("id");
			    
			    values[key] = cell.get('value');
				sortValues[key] = cell.get('sortValue') || cell.get('value');
			});

			return {
			    data: values,
				sortValues: sortValues
			};
		}
	});

	window.expanz.models.data.RowCollection = expanz.Collection.extend({
	    model: expanz.models.data.Row
	});
});
