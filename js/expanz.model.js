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
				if (key === 'id') {
					this.id = attrs[key];
				}
				var oldValue = this.attrs[key];
				this.attrs[key] = attrs[key];
				if (oldValue != this.attrs[key]) {
					this.trigger('update:' + key);
				}
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

		_type : 'Field',

		defaults : function() {
			return {
				error : false
			};
		},

		validate : function(attrs) {
			// window.expanz.logToConsole("validating field " + this.get('id'));
		},

		update : function(attrs) {

			expanz.Net.DeltaRequest(this.get('id'), attrs.value, this.get('parent'));
			return;
		}

	});

	window.expanz.Model.Method = expanz.Model.Bindable.extend({

		_type : 'Method',

		submit : function() {

			expanz.Net.MethodRequest(this.get('id'), [
				{
					name : "contextObject",
					value : this.get('contextObject')
				}
			], null, this.get('parent'));
			return;

		}

	});

	window.expanz.Model.ContextMenu = window.expanz.Model.Method.extend({

		menuItemSelected : function(action) {

			expanz.Net.CreateMenuActionRequest(this.get('parent'), null, null, action);
			return;

		}

	});

	window.expanz.Model.Login = expanz.Collection.extend({

		collection : expanz.Model.Bindable,

		initialize : function(attrs) {
			expanz.Collection.prototype.initialize.call(this, attrs);
		},

		validate : function() {
			if (!this.get('username').get('error') && !this.get('password').get('error')) {
				return true;
			}
			else {
				return false;
			}
		},

		login : function() {
			if (this.validate()) {
				var that = this;
				var loginCallback = function(error) {
					if (error && error.length > 0) {
						this.get('error').set({
							value : error
						});
					}
					else {
						expanz.Net.GetSessionDataRequest({
							success : function(url) {
								if (that.getAttr('type') == 'popup') {
									// reload the page
									window.location.reload();
								}
								else {
									// redirect to default activity
									expanz.Views.redirect(url);
								}

							}
						});
					}
				};
				expanz.Net.CreateSessionRequest(this.get('username').get('value'), this.get('password').get('value'), {
					success : loginCallback,
					error : expanz._error
				});
			}
		}
	});

	window.expanz.Model.Activity = expanz.Collection.extend({

		model : expanz.Model.Bindable,

		callbacks : {
			success : function(message) {
			},
			error : function(message) {
				expanz._error(message);
			},
			info : function(message) {
				expanz._info(message);
			}
		},

		initialize : function(attrs) {
			this.dataControls = {};
			this.loading = false;
			expanz.Collection.prototype.initialize.call(this, attrs);
		},

		getAll : function() {
			return this.reject(function(field) {
				// NOTE: 'this' has been set as expanz.Model.Activity
				return (field.get('id') === 'error') || (field.getAttr && field.getAttr('name'));
			}, this);
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

		load : function() {
			expanz.Net.CreateActivityRequest(this, this.callbacks);
		},

		destroy : function() {
			expanz.Net.DestroyActivityRequest(this.getAttr('handle'));
			expanz.Collection.prototype.destroy.call(this, this.callbacks);
		}
	});

	window.expanz.Model.ClientMessage = expanz.Collection.extend({

		model : expanz.Model.Bindable,

		initialize : function(attrs) {
			expanz.Collection.prototype.initialize.call(this, attrs);
		}

	});

});
