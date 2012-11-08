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
	window.expanz.Model = {};
	window.expanz.Model.Login = {};

	window.expanz.Model.Bindable = Backbone.Model.extend({

		destroy : function() {
			// DO NOTHING
			// this will be used if server changes API to use proper REST model. In a REST model, Backbone can link Models to specific URLs and interact using HTTP GET/PUT/UPDATE/DELETE. When that happens this override should be removed.
		}

	});

	window.expanz.Model.Field = expanz.Model.Bindable.extend({

		_type : 'Field',

		defaults: function () {
		    
			return {
			    error: false
			};
		},

		validate : function(attrs) {
			// window.expanz.logToConsole("validating field " + this.get('id'));
		},

		update : function(attrs) {
			if (this.get('parent').isAnonymous()) {
				this.set({
					lastValue : attrs.value
				});
			}
			else {
				expanz.Net.DeltaRequest(this.get('id'), attrs.value, this.get('parent'));
			}
			return;
		},
		
		publish : function (xml) {
			if (xml.attr !== undefined) {
				if ((this.get('value') && (this.get('value') != xml.attr('value'))) || !this.get('value')) {

					if (xml.attr('disabled')) {
						this.set({
							disabled : boolValue(xml.getAttribute !== undefined ? xml.getAttribute('disabled') : xml.attr('disabled'))
						});
					}

					this.set({
						items : xml.find("Item"),
						text : xml.attr('text'),
						value : xml.attr('value') == '$longData$' ? xml.text() : xml.attr('value')
					});
				}

				if (xml.attr('text')) {
				    this.set({
				        text: xml.attr('text')
				    });
				}
				
				if (xml.attr('visualType')) {
				    this.set({
				        visualType: xml.attr('visualType')
				    });
				}

				/* remove error message if field is valid */
				if (boolValue(xml.attr('valid')) && this.get('errorMessage') !== undefined) {
					this.set({
						'errorMessage' : undefined
					});

				}

				if (this.get('url') && (this.get('url') != xml.attr('url'))) {
					this.set({
						value : xml.attr('url')
					});
				}
			} else {
				window.expanz.logToConsole("window.expanz.Model.Field: xml.attr is undefined");
			}
		},
		
		publishData: function (xml) {
		    // Only variant panels will use this method. They consume data publications, but 
		    // they behave more like fields than data publications (ie. they don't register as 
		    // data publications with the activity).
		    if (xml.attr !== undefined) {
		        // Unset required, as the set function in FireFox and IE doesn't seem to recognise
		        // that the data has changed, and thus doesn't actually change the value or raise
		        // the change event
		        this.unset("data", {
		            silent: true
		        });
		        
		        this.set({
		            data : xml
		        });
		    }
	    }
	});

	window.expanz.Model.DashboardField = window.expanz.Model.Field.extend({

		update : function(attrs) {
			/* only read only field -> no delta send */
			return;
		}

	});

	window.expanz.Model.Method = expanz.Model.Bindable.extend({

		_type : 'Method',

		submit : function() {

			var anonymousFields = [];
			if (this.get('anonymousFields')) {
				$.each(this.get('anonymousFields'), function(index, value) {
					if (value instanceof expanz.Model.Data.DataControl) {
						anonymousFields.push({
							id : value.getAttr('dataId'),
							value : value.getAttr('lastValues') || ""
						});
					}
					else {
						anonymousFields.push({
							id : value.get('id'),
							value : value.get('lastValue') || ""
						});
					}
				});
			}

			var methodAttributes = [
				{
					name : "contextObject",
					value : this.get('contextObject')
				}
			];

			if (this.get('methodAttributes')) {
				methodAttributes = methodAttributes.concat(this.get('methodAttributes'));
			}

			/* bind eventual dynamic values -> requiring user input for example, format is %input_id% */
			/* input id must be unique in the page */
			methodAttributes = methodAttributes.clone();
			for ( var i = 0; i < methodAttributes.length; i++) {
				var value = methodAttributes[i].value;
				var inputField = /^%(.*)%$/.exec(value);
				if (inputField) {
					methodAttributes[i].value = $("#" + inputField[1]).val();
				}
			}

			expanz.Net.MethodRequest(this.get('id'), methodAttributes, null, this.get('parent'), anonymousFields);
			return;

		},

		/* add an anonymous field or datacontrol to the method, will be added to the xml message when the method is called */
		addAnonymousElement : function(element) {
			var anonymousFields = this.get('anonymousFields');
			if (anonymousFields === undefined || anonymousFields === null) {
				anonymousFields = [];
			}
			anonymousFields.push(element);
			this.set({
				anonymousFields : anonymousFields
			});
		}

	});

	window.expanz.Model.MenuAction = window.expanz.Model.Method.extend({

		menuItemSelected : function(action) {

			expanz.Net.CreateMenuActionRequest(this.get('parent'), null, null, action);
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

									/*
									 * NOT IMPLEMENTED YET...problem with url where sessionHandle and activityHandle are GET parameters var urlBeforeLogin = expanz.Storage.getLastURL(); if(urlBeforeLogin !== null && urlBeforeLogin != ''){ expanz.Storage.clearLastURL(); expanz.Views.redirect(urlBeforeLogin);
									 * return; }
									 */
									// redirect to default activity
									expanz.Views.redirect(url);
								}

							}
						});
					}
				};
				expanz.Net.CreateSessionRequest(this.get('username').get('value'), this.get('password').get('value'), {
					success : loginCallback,
					error : function(message) {
						expanz.messageController.addErrorMessageByText(message);
					}
				});
			}
		}
	});

	window.expanz.Model.Dashboards = expanz.Collection.extend({
		model : expanz.Model.DashboardField
	});

	window.expanz.Model.Activity = expanz.Collection.extend({

		model : expanz.Model.Bindable,

		isAnonymous : function() {
			return !this.getAttr('handle');
		},

		callbacks : {
			success : function(message) {
				expanz.messageController.addSuccessMessageByText(message);
			},
			error : function(message) {
				expanz.messageController.addErrorMessageByText(message);
			},
			info : function(message) {
				expanz.messageController.addInfoMessageByText(message);
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

		addDataControl: function (DataControl) {
		    var id = DataControl.id || DataControl.getAttr('dataId');
		    
			if (this.dataControls[id] === undefined)
				this.dataControls[id] = [];
			this.dataControls[id].push(DataControl);
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
