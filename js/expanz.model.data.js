$(function() {

	window.expanz = window.expanz || {};
	window.expanz.Model = window.expanz.Model || {};
	window.expanz.Model.Data = {};

	window.expanz.Model.Data.DataControl = expanz.Model.Bindable.extend({

		update : function(attrs) {

			expanz.Net.DeltaRequest(this.get('id'), attrs.value, this.get('parent'));
			return;
		},

		updateItemSelected : function(selectedId, callbacks) {
			window.expanz.logToConsole("DataControl:updateItemSelected id:" + selectedId);

			/* exception for documents we have to send a MenuAction request */
			if (this.get('id') == 'documents') {
				expanz.Net.CreateMenuActionRequest(this.get('parent'), selectedId, "File", null, "1", callbacks);
			}
			/* normal case we send a delta request */
			else {
				expanz.Net.DeltaRequest(this.get('id'), selectedId, this.get('parent'), callbacks);
			}
		},
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

			var map = new Object();
			_.each(cells, function(cell) {
				map[cell.get('field')] = cell.get('value');
			});
			/* using a data to put the data to avoid underscore 'variable is not defined' error */
			return {
				data : map
			};
		}
	});

	window.expanz.Model.Data.Grid = expanz.Collection.extend({

		model : expanz.Model.Data.Row,

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
		getAction : function(methodName) {
			return this.get('_actions').reject(function(cell) {
				return cell.get('id') === '_actions' || cell.get('methodName') != methodName;
			}, this);
		},
		addAction : function(_id, _label, _width, _methodName, _methodParams) {
			this.setAttr({
				hasActions : true
			});

			this.get('_actions').add({
				id : _id,
				label : _label,
				width : _width,
				methodName : _methodName,
				methodParams : _methodParams
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
		addRow : function(_id, _type) {

			this.add({
				id : _id,
				type : _type,
				gridId : this.getAttr('id')
			});
		},

		addCell : function(_rowId, _cellId, _value, _field) {

			this.get(_rowId).add({
				id : _cellId,
				value : _value,
				field : _field
			});
		},

		updateRowSelected : function(selectedId, type) {
			window.expanz.logToConsole("GridModel:updateRowSelected id:" + selectedId + ' ,type:' + type);
		},

		actionSelected : function(selectedId, methodName, methodParams) {
			window.expanz.logToConsole("GridModel:actionSelected id:" + selectedId + ' ,methodName:' + methodName + ' ,methodParams:' + JSON.stringify(methodParams));
		},

		refresh : function() {
			expanz.Net.DataRefreshRequest(this.getAttr('id'), this.getAttr('parent'));
		}

	});

});
