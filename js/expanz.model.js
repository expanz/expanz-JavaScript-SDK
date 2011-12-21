/* Author: Adam Tait

 */

$(function() {

	window.expanz = window.expanz || {};
	window.expanz.Model = {};
	window.expanz.Model.Login = {};

	window.expanz.Model.Bindable = Backbone.Model.extend({

		destroy : function() {
			// DO NOTHING
			// this will be used if server changes API to use proper REST model. In a REST model, Backbone can link Models to specific URLs and interact using HTTP GET/PUT/UPDATE/DELETE. When that happens this override should be removed.
		}

	});

	window.expanz.Collection = Backbone.Collection.extend({

	initialize : function(attrs, options) {
		this.attrs = {};
		this.setAttr(attrs);
		return;
	},

	getAttr : function(key) {
		if (this.attrs[key])
			return this.attrs[key];
		return false;
	},

	setAttr : function(attrs) {
		for ( var key in attrs) {
			if (key === 'id')
				this.id = attrs[key];
			this.attrs[key] = attrs[key];
		}
		return true;
	},

	destroy : function() {
		this.each(function(m) {
			m.destroy();
		});
		return;
	}
	});

	window.expanz.Model.Field = expanz.Model.Bindable.extend({

	defaults : function() {
		return {
			error : false
		};
	},

	validate : function(attrs) {
		// do validation on fields here
	},

	update : function(attrs) {

		expanz.Net.DeltaRequest(this.get('id'), attrs.value, this.get('parent'));
		return;
	}

	});

	window.expanz.Model.Method = expanz.Model.Bindable.extend({

		submit : function() {

			expanz.Net.MethodRequest(this.get('id'), this.get('contextObject'),
					null, this.get('parent'));
			return;
		}

	});

	window.expanz.Model.Activity = expanz.Collection.extend({

	model : expanz.Model.Bindable,

	initialize : function(attrs) {
		this.grids = {};
		this.dataControls = {};
		expanz.Collection.prototype.initialize.call(this, attrs);
	},

	getAll : function() {
		return this.reject(function(field) {
			// NOTE: 'this' has been set as expanz.Model.Activity
			return (field.get('id') === 'error') || (field.getAttr && field
					.getAttr('name'));
		}, this);
	},

	addGrid : function(grid) {
		this.grids[grid.id] = grid;
		return;
	},
	getGrid : function(id) {
		return this.grids[id];
	},
	getGrids : function() {
		return this.grids;
	},
	hasGrid : function() {
		return this.grids != {};
	},

	addDataControl : function(DataControl) {
		this.dataControls[DataControl.id] = DataControl;
		return;
	},
	getDataControl : function(id) {
		return this.dataControls[id];
	},
	getDataControls : function() {
		return this.dataControls;
	},
	hasDataControl : function() {
		return this.dataControls != {};
	},

	load : function(callbacks) {
		expanz.Net.CreateActivityRequest(this, callbacks);
	},

	destroy : function(callbacks) {
		expanz.Net.DestroyActivityRequest(this);
		expanz.Collection.prototype.destroy.call(this, callbacks);
	}
	});

});
