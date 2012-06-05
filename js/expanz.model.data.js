$(function() {

	window.expanz = window.expanz || {};
	window.expanz.Model = window.expanz.Model || {};
	window.expanz.Model.Data = {};

	window.expanz.Model.Data.DataControl = expanz.Collection.extend({

		initialize : function(attrs) {
			expanz.Collection.prototype.initialize.call(this, attrs);
		},

		update : function(attrs) {

			expanz.Net.DeltaRequest(this.getAttr('fieldId'), attrs.value, this.getAttr('parent'));
			return;
		},

		updateItemSelected : function(selectedId, callbacks) {
			// window.expanz.logToConsole("DataControl:updateItemSelected id:" + selectedId);

			/* anonymous activity case */
			if (this.getAttr('parent').isAnonymous()) {
				/* if we are in anonymous mode and the data control is a tree we need to call a method on selection change instead of a delta */
				if (this.getAttr('renderingType') == 'tree') {
					var anonymousFields = [
						{
							id : this.getAttr('fieldId'),
							value : selectedId
						}
					];

					expanz.Net.MethodRequest(this.getAttr('selectionChangeAnonymousMethod'), [
						{
							name : "contextObject",
							value : this.getAttr('selectionChangeAnonymousContextObject')
						}
					], null, this.getAttr('parent'), anonymousFields,callbacks);
				}
				/* if we are in anonymous mode and the data control is a checkboxes control we need to store the value to send it later */
				else {
					var lastValues = this.getAttr('lastValues');
					if (!lastValues) {
						lastValues = "";
					}

					/* unticked */
					if (selectedId < 0) {
						var re = new RegExp("(" + (-selectedId) + ";)|(;?" + (-selectedId) + "$)", "g");
						lastValues = lastValues.replace(re, "")
					}
					/* ticked */
					else {
						if (lastValues.length > 0)
							lastValues += ";";
						lastValues += selectedId;
					}

					this.setAttr({
						lastValues : lastValues
					});
				}
			}
			/* logged in case */
			else {
				/* exception for documents we have to send a MenuAction request */
				if (this.getAttr('id') == 'documents') {
					expanz.Net.CreateMenuActionRequest(this.getAttr('parent'), selectedId, "File", null, "1", callbacks);
				}
				/* normal case we send a delta request */
				else {
					expanz.Net.DeltaRequest(this.getAttr('fieldId'), selectedId, this.getAttr('parent'), callbacks);
				}
			}
		}
	});

	window.expanz.Model.Data.Cell = expanz.Model.Bindable.extend({

		initialize : function(attrs, options) {
			expanz.Model.Bindable.prototype.initialize.call(this, attrs, options);
			this.set({
				selected : false
			});
		}

	});

	window.expanz.Model.Data.Row = expanz.Collection.extend({

		model : expanz.Model.Data.Cell,

		initialize : function(attrs, options) {
			expanz.Collection.prototype.initialize.call(this, attrs, options);
			this.setAttr({
				selected : false
			});
			this.setAttr(attrs);
		},

		getAllCells : function() {

			// remove/reject cells without value attribute
			// :this can happen b/c Backbone inserts a recursive/parent cell into the collection
			var cells = this.reject(function(cell) {
				return cell.get('value') === undefined;
			}, this);

			return cells;
		},

		getCellsMapByField : function() {

			// remove/reject cells without value attribute
			// :this can happen b/c Backbone inserts a recursive/parent cell into the collection
			var cells = this.reject(function(cell) {
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
			map['rowId'] = this.getAttr('id');
			map['rowType'] = this.getAttr('type');

			/* using a data to put the data to avoid underscore 'variable is not defined' error */
			return {
				data : map,
				sortedValues : sortedMap
			};
		}
	});

	window.expanz.Model.Data.Grid = expanz.Collection.extend({

		model : expanz.Model.Data.Row,

		// header : [],
		//		
		// actions : [],

		initialize : function(attrs) {
			expanz.Collection.prototype.initialize.call(this, attrs);
			this.setAttr({
				lockedColumns : false
			});
			this.add([
				{
					id : '_header'
				}, {
					id : '_actions'
				}
			]);
		},

		clear : function() {
			var that = this;
			_.each(this.getAllRows(), function(row) {
				that.remove(row);
			});
			this.removeColumns();
		},

		removeColumns : function() {
			var that = this;
			_.each(this.getAllColumns(), function(col) {
				that.get('_header').remove(col);
			});
		},

		getColumn : function(id) {
			return this.get('_header').get(id);
		},
		getAllColumns : function() {
			return this.get('_header').reject(function(cell) {
				return cell.get('id') === '_header';
			}, this);
		},
		getActions : function() {
			return this.get('_actions').reject(function(cell) {
				return cell.get('id') === '_actions';
			}, this);
		},
		getAction : function(actionName) {
			return this.get('_actions').reject(function(cell) {
				return cell.get('id') === '_actions' || cell.get('actionName') != actionName;
			}, this);
		},
		addAction : function(_type, _id, _label, _width, _name, _params) {
			this.setAttr({
				hasActions : true
			});

			this.get('_actions').add({
				id : _id,
				type : _type,
				label : _label,
				width : _width,
				actionName : _name,
				actionParams : _params
			});
		},
		addColumn : function(_id, _field, _label, _datatype, _width) {
			this.get('_header').add({
				id : _id,
				field : _field,
				label : _label,
				datatype : _datatype,
				width : _width
			});
		},

		getAllRows : function() {
			return this.reject(function(row) {
				// NOTE: 'this' has been set as expanz.Model.DataGrid
				return (row.getAttr('id') === '_header') || (row.getAttr('id') === '_actions') || (this.getAttr('id') === row.getAttr('id')) || (this.getAttr('activityId') === row.getAttr('id'));
			}, this);
		},

		sortRows : function(columnName, ascending) {
			this.comparator = function(rowA) {
				var sortValue = rowA.getCellsMapByField().sortedValues[columnName] || "";
				return sortValue.toLowerCase();
			};
			this.sort();

			if (!ascending)
				this.models.reverse();

		},

		addRow : function(_id, _type) {

			this.add({
				id : _id,
				type : _type,
				gridId : this.getAttr('id')
			});
		},

		addCell : function(_rowId, _cellId, _value, _field, _sortValue) {

			this.get(_rowId).add({
				id : _cellId,
				value : _value,
				field : _field,
				sortValue : _sortValue
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

		refresh : function() {
			expanz.Net.DataRefreshRequest(this.getAttr('id'), this.getAttr('parent'));
		}

	});

});
