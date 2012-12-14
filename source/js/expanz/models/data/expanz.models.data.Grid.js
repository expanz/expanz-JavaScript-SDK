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

	window.expanz.models.data.Grid = Backbone.Model.extend({

	    initialize: function () {
	        this.rows = new expanz.models.data.RowCollection();
	        //this.columns = new expanz.Collection(); // TODO: Use this instead of proxy row
	        this.hasActions = false;
	        
	        this.rows.add([
				{
					id : '_header'
				}, {
					id : '_actions'
				}
			]);
		},

		clear : function() {
		    var grid = this;
		    
			_.each(this.getAllRows(), function(row) {
				grid.rows.remove(row);
			});
		    
			this.removeColumns();
		},

		removeColumns : function() {
		    var grid = this;
		    
			_.each(this.getAllColumns(), function(col) {
				grid.rows.get('_header').cells.remove(col);
			});
		},

		getColumn : function(id) {
			return this.rows.get('_header').cells.get(id);
		},
	    
		getAllColumns : function() {
		    return this.rows.get('_header').cells.reject(function (cell) {
				return cell.get('id') === '_header';
			}, this);
		},
	    
		getActions : function() {
		    return this.rows.get('_actions').cells.reject(function (cell) {
				return cell.get('id') === '_actions';
			}, this);
		},
	    
		getAction : function(actionName) {
		    return this.rows.get('_actions').cells.reject(function (cell) {
				return cell.get('id') === '_actions' || cell.get('actionName') != actionName;
			}, this);
		},
	    
		addAction : function(type, id, label, width, name, params) {
		    this.hasActions = true;

		    this.rows.get('_actions').cells.add({
				id : id,
				type : type,
				label : label,
				width : width,
				actionName : name,
				actionParams : params
			});
		},
	    
		addColumn : function(id, field, label, datatype, width) {
		    this.rows.get('_header').cells.add({
				id : id,
				field : field,
				label : label,
				datatype : datatype,
				width : width
			});
		},

		getAllRows : function() {
			return this.rows.reject(function(row) {
				// NOTE: 'this' has been set as expanz.models.DataGrid
				return (row.id === '_header') || (row.id === '_actions') || (this.id === row.id) || (this.activityId === row.id);
			}, this);
		},

		sortRows : function(columnName, ascending) {
			this.rows.comparator = function(rowA) {
				var sortValue = rowA.getCellsMapByField().sortedValues[columnName] || "";
				return sortValue.toLowerCase();
			};
		    
			this.rows.sort();

			if (!ascending)
			    this.rows.models.reverse();
		},

		addRow : function(id, type, displayStyle) {
		    this.rows.add({
				id : id,
				type: type,
				displayStyle: displayStyle,
				gridId : this.id
			});
		},

		addCell : function(rowId, cellId, value, field, sortValue) {
		    this.rows.get(rowId).cells.add({
				id : cellId,
				value : value,
				field : field,
				sortValue : sortValue
			});
		},

		updateRowSelected : function(selectedId, type) {
			window.expanz.logToConsole("GridModel:updateRowSelected id:" + selectedId + ' ,type:' + type);
		},

		updateRowDoubleClicked : function(selectedId, type) {
			window.expanz.logToConsole("GridModel:updateRowDoubleClicked id:" + selectedId + ' ,type:' + type);
		},

		actionSelected : function(selectedId, name, params) {
			window.expanz.logToConsole("GridModel:actionSelected id:" + selectedId + ' ,methodName:' + name + ' ,methodParams:' + JSON.stringify(params));
		},

		menuActionSelected : function(selectedId, name, params) {
			window.expanz.logToConsole("GridModel:menuActionSelected id:" + selectedId + ' ,menuActionName:' + name + ' , menuActionParams:' + JSON.stringify(params));
		},

		contextMenuSelected : function(selectedId, contextMenuType, contextObject, params) {
			window.expanz.logToConsole("GridModel:contextMenuSelected type:" + contextMenuType + " ,id:" + selectedId + ' ,contextObject:' + contextObject + ' , contextMenuParams:' + JSON.stringify(params));
		},
		
		refresh : function() {
			expanz.net.DataRefreshRequest(this.id, this.parent);
		}
	});
});
