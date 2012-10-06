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

});

////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function() {

	window.expanz = window.expanz || {};

	window.expanz.Component = Backbone.View
		.extend({
			componentName : '',
			
			activity : null, /* initialised when the activity is created */
			
			modules: [],
			
			initialize : function() {
				var that = this;
				/* render component if present in the page */
				_.each(this.modules, function(module) {
					var moduleEl = window.expanz.html.findComponentModuleElement(that.componentName, module);
					if (moduleEl !== undefined) {
						moduleEl.each(function() {
							// if (moduleEl.attr('loaded') === undefined) {
							var moduleContent = that['render' + module + 'Module']($(this));
							$(this).append(moduleContent);
							moduleEl.attr('loaded', '1');
							// }
						});

					}
				});
			},
			
			_executeAfterInitalize : function(that) {
				_.each(this.modules, function(module) {
					var componentEl = window.expanz.html.findComponentModuleElement(that.componentName, module);
					if (componentEl !== undefined) {
						componentEl.each(function() {
							/* execute script after adding to content to the dom */
							if (that['_executeAfterRender' + module + 'Module']) {
								that['_executeAfterRender' + module + 'Module']($(this));
							}
						});

					}
				});
			}
		
	});
	
});

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

	window.expanz.Factory = {

		Login : function(loginEl) {

			var loginModel = new window.expanz.Model.Login({
				name : $(loginEl).attr('name'),
				type : $(loginEl).attr('type')
			});
			var loginView = new window.expanz.Views.LoginView({
				el : $(loginEl),
				id : $(loginEl).attr('name'),
				collection : loginModel
			});

			return loginView;
		},

		Activity : function(activityEl) {
			// create a collection for each activity
			var activityModel = new expanz.Model.Activity({ // expanz.Model.Login.Activity
				name : $(activityEl).attr('name'),
				title : $(activityEl).attr('title'),
				url : $(activityEl).attr('url'),
				key : $(activityEl).attr('key'),
				style : $(activityEl).attr('activityStyle'),
				optimisation : $(activityEl).attr('optimisation') ? boolValue($(activityEl).attr('optimisation')) : true,
				allowAnonymous : $(activityEl).attr('allowAnonymous') ? boolValue($(activityEl).attr('allowAnonymous')) : false
			});
			var activityView = new expanz.Views.ActivityView({
				el : $(activityEl),
				id : $(activityEl).attr('name'),
				key : $(activityEl).attr('key'),
				collection : activityModel
			});

			expanz.Factory.bindMethods(activityModel, activityEl);
			expanz.Factory.bindDataControls(activityModel, activityEl);
			expanz.Factory.bindFields(activityModel, activityEl);
			return activityView;
		},

		bindFields : function(activityModel, el) {
			_.each(expanz.Factory.Field($(el).find('[bind=field]')), function(fieldModel) {
				fieldModel.set({
					parent : activityModel
				}, {
					silent : true
				});
				activityModel.add(fieldModel);

				/* add anonymous fields bound to method */
				if (fieldModel.get('anonymousBoundMethod') != null && fieldModel.get('anonymousBoundMethod') != '') {
					var boundMethod = activityModel.get(fieldModel.get('anonymousBoundMethod'));
					if (boundMethod) {
						boundMethod.addAnonymousElement(fieldModel);
					}
				}

			});

			_.each(expanz.Factory.DashboardField($(el).find('[bind=dashboardfield]')), function(dashboardFieldModel) {
				var fieldSessionValue = expanz.Storage.getDashboardFieldValue(dashboardFieldModel.get('dashboardName'), dashboardFieldModel.get('name'));
				dashboardFieldModel.set({
					value : fieldSessionValue || ''
				});

				expanz.Dashboards.add(dashboardFieldModel);
			});

			_.each(expanz.Factory.DependantField($(el).find('[bind=dependant]')), function(dependantFieldModel) {
				dependantFieldModel.set({
					parent : activityModel
				}, {
					silent : true
				});
				activityModel.add(dependantFieldModel);
			});
		},

		bindMethods : function(activityModel, el) {
			_.each(expanz.Factory.Method($(el).find('[bind=method]')), function(methodModel) {
				methodModel.set({
					parent : activityModel
				}, {
					silent : true
				});
				activityModel.add(methodModel);
			});
		},

		/**
		 * bindDataControls
		 */
		bindDataControls : function(activityModel, el) {
			_.each(expanz.Factory.DataControl(activityModel.getAttr('name'), activityModel.getAttr('style'), $(el).find('[bind=DataControl]')), function(DataControlModel) {
				DataControlModel.setAttr({
					parent : activityModel,
					activityId : activityModel.getAttr('name')
				});
				activityModel.addDataControl(DataControlModel);

				/* add anonymous datacontrol field bound to method */
				if (DataControlModel.getAttr('anonymousBoundMethod') != null && DataControlModel.get('anonymousBoundMethod') != '') {
					var boundMethod = activityModel.get(DataControlModel.getAttr('anonymousBoundMethod'));
					if (boundMethod) {
						boundMethod.addAnonymousElement(DataControlModel);
					}
				}

			});
		},

		Field : function(DOMObjects) {

			var fieldModels = [];
			_.each(DOMObjects, function(fieldEl) {
				// create a model for each field
				var field = new expanz.Model.Field({
					id : $(fieldEl).attr('name'),
					anonymousBoundMethod : $(fieldEl).attr('anonymousBoundMethod')
				});
				var view = new expanz.Views.FieldView({
					el : $(fieldEl),
					id : $(fieldEl).attr('id'),
					className : $(fieldEl).attr('class'),
					model : field,
					textTransformFunction : $(fieldEl).attr('textTransformFunction')
				});

				fieldModels.push(field);

			});
			return fieldModels;
		},

		DashboardField : function(DOMObjects) {

			var fieldModels = [];
			_.each(DOMObjects, function(fieldEl) {
				// create a model for each field
				var field = new expanz.Model.DashboardField({
					id : $(fieldEl).attr('dashboardName') + "_" + $(fieldEl).attr('name'),
					name : $(fieldEl).attr('name'),
					dashboardName : $(fieldEl).attr('dashboardName')
				});
				var view = new expanz.Views.FieldView({
					el : $(fieldEl),
					id : $(fieldEl).attr('id'),
					className : $(fieldEl).attr('class'),
					model : field,
					textTransformFunction : $(fieldEl).attr('textTransformFunction')
				});

				fieldModels.push(field);

			});
			return fieldModels;
		},

		DependantField : function(DOMObjects) {

			var fieldModels = [];
			_.each(DOMObjects, function(fieldEl) {
				// create a model for each field
				var field = new expanz.Model.Bindable({
					id : $(fieldEl).attr('name')
				});
				var view = new expanz.Views.DependantFieldView({
					el : $(fieldEl),
					id : $(fieldEl).attr('id'),
					className : $(fieldEl).attr('class'),
					model : field
				});

				fieldModels.push(field);
			});
			return fieldModels;
		},

		Method : function(DOMObjects) {

			var methodModels = [];
			_.each(DOMObjects, function(methodEl) {
				// create a model for each method
				var method;
				if ($(methodEl).attr('type') == 'ContextMenu') {
					method = new expanz.Model.ContextMenu({
						id : $(methodEl).attr('name'),
						contextObject : $(methodEl).attr('contextObject')
					});

					var ctxMenuview = new expanz.Views.ContextMenuView({
						el : $(methodEl),
						id : $(methodEl).attr('id'),
						className : $(methodEl).attr('class'),
						model : method
					});
				}
				else {
					/* look for potential methodAttributes - format is name:value;name2:value2; */

					var methodAttributes = [];
					if ($(methodEl).attr('methodAttributes')) {
						_.each($(methodEl).attr('methodAttributes').split(';'), function(val) {
							var split = val.split(':');
							if (split.length == 2) {
								methodAttributes.push({
									name : split[0],
									value : split[1]
								});
							}
						});
					}

					method = new expanz.Model.Method({
						id : $(methodEl).attr('name'),
						contextObject : $(methodEl).attr('contextObject'),
						methodAttributes : methodAttributes
					});

					var view = new expanz.Views.MethodView({
						el : $(methodEl),
						id : $(methodEl).attr('id'),
						className : $(methodEl).attr('class'),
						model : method
					});
				}

				methodModels.push(method);
			});
			return methodModels;
		},

		DataControl : function(activityName, activityStyle, DOMObjects) {

			var DataControlModels = [];

			_.each(DOMObjects, function(dataControlEl) {

				/* case rendering as a grid */
				if ($(dataControlEl).attr('renderingType') == 'grid' || $(dataControlEl).attr('renderingType') == 'popupGrid' || $(dataControlEl).attr('renderingType') == 'rotatingBar') {
					var dataControlModel = new expanz.Model.Data.Grid({
						id : $(dataControlEl).attr('name'),
						fieldId : $(dataControlEl).attr('fieldName') || $(dataControlEl).attr('name'),
						query : $(dataControlEl).attr('query'),
						populateMethod : $(dataControlEl).attr('populateMethod'),
						autoPopulate : $(dataControlEl).attr('autoPopulate'),
						contextObject : $(dataControlEl).attr('contextObject'),
						renderingType : $(dataControlEl).attr('renderingType'),
						selectionChangeAnonymousMethod : $(dataControlEl).attr('selectionChangeAnonymousMethod'),
						selectionChangeAnonymousContextObject : $(dataControlEl).attr('selectionChangeAnonymousContextObject'),
						anonymousBoundMethod : $(dataControlEl).attr('anonymousBoundMethod')
					});

					var view = new expanz.Views.GridView({
						el : $(dataControlEl),
						id : $(dataControlEl).attr('id'),
						className : $(dataControlEl).attr('class'),
						itemsPerPage : $(dataControlEl).attr('itemsPerPage'),
						templateName : $(dataControlEl).attr('templateName'),
						isHTMLTable : $(dataControlEl).attr('isHTMLTable'),
						enableConfiguration : $(dataControlEl).attr('enableConfiguration'),
						noItemText : $(dataControlEl).attr('noItemText'),
						model : dataControlModel
					});

					// load pre-defined gridview information from formmapping.xml
					$.ajax({
						url : './formmapping.xml',
						async : false,
						success : function(defaultsXML) {
							var activityInfo = _.find($(defaultsXML).find('activity'), function(activityXML) {
								return $(activityXML).attr('name') === activityName && $(activityXML).attr('style') === activityStyle;
							});
							if (activityInfo) {
								var gridviewInfo = _.find($(activityInfo).find('gridview'), function(gridviewXML) {
									return $(gridviewXML).attr('id') === dataControlModel.getAttr('id');
								});
								if (gridviewInfo) {
									// add actions
									_.each($(gridviewInfo).find('action'), function(action) {
										var params = [];
										_.each($(action).find('param'), function(param) {
											params.push({
												name : $(param).attr('name'),
												value : $(param).attr('value'),
												label : $(param).attr('label'),
												bindValueFromCellId : $(param).attr('bindValueFromCellId')
											});
										});
										var actionName = $(action).attr('methodName') || $(action).attr('menuAction');
										var type = $(action).attr('methodName') ? 'method' : 'menuAction';
										dataControlModel.addAction(type, $(action).attr('id'), $(action).attr('label'), $(action).attr('width'), actionName, params);
									});
								}
							}
						}
					});

				}
				/* renderingType is not grid: 'tree' or 'combobox' or checkboxes or empty */
				/* the attribute fieldName might be defined in case, the datacontrol updates a field value if not specified taking the name */
				else {
					var dataControlModel = new expanz.Model.Data.DataControl({
						id : $(dataControlEl).attr('name'),
						fieldId : $(dataControlEl).attr('fieldName') || $(dataControlEl).attr('name'),
						populateMethod : $(dataControlEl).attr('populateMethod'),
						type : $(dataControlEl).attr('type'),
						contextObject : $(dataControlEl).attr('contextObject'),
						autoPopulate : $(dataControlEl).attr('autoPopulate'),
						renderingType : $(dataControlEl).attr('renderingType'),
						selectionChangeAnonymousMethod : $(dataControlEl).attr('selectionChangeAnonymousMethod'),
						selectionChangeAnonymousContextObject : $(dataControlEl).attr('selectionChangeAnonymousContextObject'),
						anonymousBoundMethod : $(dataControlEl).attr('anonymousBoundMethod')
					});

					if ($(dataControlEl).attr('renderingType') == 'checkboxes') {
						var view = new expanz.Views.CheckboxesView({
							el : $(dataControlEl),
							id : $(dataControlEl).attr('id'),
							className : $(dataControlEl).attr('class'),
							model : dataControlModel
						});
					}
					else if ($(dataControlEl).attr('renderingType') == 'radiobuttons') {
						var view = new expanz.Views.RadioButtonsView({
							el : $(dataControlEl),
							id : $(dataControlEl).attr('id'),
							className : $(dataControlEl).attr('class'),
							model : dataControlModel
						});
					}
					else {
						var view = new expanz.Views.DataControlView({
							el : $(dataControlEl),
							id : $(dataControlEl).attr('id'),
							className : $(dataControlEl).attr('class'),
							model : dataControlModel
						});
					}
				}

				DataControlModels.push(dataControlModel);
			});
			return DataControlModels;
		}

	};

});

////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function() {

	window.expanz = window.expanz || {};
	
	/*
	 * static html rendering functions
	 */
	window.expanz.html = window.expanz.html || {};

	window.expanz.html.startDiv = function(className) {
		if (!className)
			className = '';
		return '<div class="' + className + '" >';
	};

	window.expanz.html.endDiv = function() {
		return '</div>';
	};

	window.expanz.html.clearBoth = function() {
		return '<div style="clear:both"></div>';
	};

	/**
	 * renderHeaderGridField
	 */
	window.expanz.html.renderHeaderGridField = function(label, width) {
		var className = 'gridHeader';
		if (!label)
			label = '';
		if (label != '') {
			className += ' gridHeader' + label;
		}
		
		if (!width)
			width = 100;
		return '<div class="' + className + '" style="width:' + width + 'px;float:left">' + label + '</div>';
	};

	window.expanz.html.renderGridTemplateField = function(fieldName, width) {
		if (!width)
			width = 100;
		return '<div class="' + fieldName + '" style="width:' + width + 'px;float:left"><%= data.' + fieldName + ' %>&nbsp;</div>';
	};

	window.expanz.html.renderField = function(fieldName, showLabel, placeHolderText, anonymousBoundMethod, showError) {
		if (!showError)
			showError = 'false';
		var field = '';
		field += '<div showError="' + showError + '" id="' + fieldName + '"  bind="field" name="' + fieldName + '" class="field ' + fieldName + '" anonymousBoundMethod=' + anonymousBoundMethod + '>';
		if (showLabel === true)
			field += '<label attribute="label"></label>';
		field += '<input type="text" attribute="value"  class="k-textbox" placeholder="' + placeHolderText + '"/>';
		field += '</div>';
		return field;
	};

	window.expanz.html.renderReadOnlyField = function(fieldName, showLabel, sameLine, width) {
		var field = '';
		var style = sameLine ? 'float:left;' : '';
		style += width ? 'width:' + width + 'px' : '';
		field += '<div style="' + style + '" id="' + fieldName + '"  bind="field" name="' + fieldName + '" class="readonlyField ' + fieldName + '">';
		if (showLabel === true)
			field += '<div class="fieldLabel" style="float:left"><label attribute="label"></label></div> ';
		field += '<div class="fieldValue"><label attribute="value"></label></div><div style="clear:both" ></div>';
		field += '</div>';
		return field;
	};

	window.expanz.html.renderMethod = function(methodName, buttonLabel, contextObject, hidden) {
		var method = '';
		var ctx = contextObject ? ' contextObject = "' + contextObject + '" ' : '';
		var visible = hidden ? ' style="display:none" ' : '';
		method += '<span bind="method" id="' + methodName + '" name="' + methodName + '" ' + ctx + visible + ' class="method" >';
		method += '<button type="button" attribute="submit" >' + buttonLabel + '</button>';
		method += '</span>';
		return method;
	};
	 
	 
	window.expanz.html.renderHeader = function(siteName, siteUrl) {
		var html = '';
		if (!siteName)
			siteName = '';
		if (!siteUrl)
			siteUrl = getSiteUrl();
	 
		html += '<div id="headBackground">';
		html += '<div class="centerLogoArea">';
		html += '<div id="siteName">' + siteName + '</div>';
		if (siteUrl != '')
			html += '<a href="' + siteUrl + '"><div id="logo"></div></a>';
		html += '</div>';
		html += '</div>';
		return html;
	}
	
	/*window.expanz.html.renderMainMenu = function() {
		var html = '';
		
		html += '<div id="menuMainContainer">';
		html += '<div id="menuContainer" bind="menu" homeLabel=" " logoutLabel="Log Out" backLabel=" " ></div>';
		html += '</div>';
		return html;
	}
	
	window.expanz.html.renderNotification = function() {
		var html = '';
		
		html += '<div class="spacer30">';
		html += '<div class="notificationOuter">';
		html += '<ul class="notificationArea">';
		html += '<li bind="message" type="error" class="error"><span attribute="value"></span></li>';
		html += '<li bind="message" type="warning" class="warning"><span attribute="value"></span></li>';
		html += '<li bind="message" type="info" class="info"><span attribute="value"></span></li>';
		html += '</ul>';
		html += '</div>';
		html += '</div>';
		return html;
	}*/
	
	window.expanz.html.renderFooter = function(copyrightText, footerLinks) {
		var html = '';
		html += '<div class="footer">';
		html += '<div class="footerContainer">';
		html += '<div class="left footerCopyright">';
		if (!copyrightText)
			copyrightText = '';
		if (copyrightText != '')
			html += '<div>' + copyrightText + '</div>';
		html += '<div class="footerLinks">';
		if (!footerLinks)
			footerLinks = '';
		if (footerLinks != '')
			html += footerLinks;//'<a href="">Contact Us</a> <a href="">Feedback</a>';
		html += '</div>';
		html += '</div>';
		html += '<div class="right topContainer">';
		html += '<a class="top" href="javascript:void(0);"> Top&nbsp;&nbsp;&nbsp; </a>';
		html += '</div>';
		html += '</div>';
		html += '</div>';
		return html;
	};
	
	window.expanz.html.addNameToImageURL = function(currentUrl, name) {
		if (!currentUrl || !name)
			return "";
		var lastSlashPos = currentUrl.replace(/\\/g, "/").lastIndexOf("/");
		if (lastSlashPos >= 0) {
			return currentUrl.splice(lastSlashPos + 1, 0, escapeBadCharForURL(name) + "-");
		}
		return "";
	};

	window.expanz.html.isEmpty = function(value) {
		if (value === undefined)
			return true;
		return value == "";
	};
	
	window.expanz.html.findComponentModuleElement = function(component, module) {
		var el = component + "\\:" + module;
		if ($(el).length > 0) {
			return $(el);
		}
		/* search for class (old browsers support) */
		el = "." + component + "-" + module;
		if ($(el).length > 0) {
			return $(el);
		}
		return undefined;
	}
});

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

		defaults : function() {
			return {
				error : false
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
							id : value.getAttr('fieldId'),
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
			if (anonymousFields == null) {
				anonymousFields = [];
			}
			anonymousFields.push(element);
			this.set({
				anonymousFields : anonymousFields
			});
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
									 * NOT IMPLEMENTED YET...problem with url where sessionHandle and activityHandle are GET parameters var urlBeforeLogin = expanz.Storage.getLastURL(); if(urlBeforeLogin != null && urlBeforeLogin != ''){ expanz.Storage.clearLastURL(); expanz.Views.redirect(urlBeforeLogin);
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

		addDataControl : function(DataControl) {
			if (this.dataControls[DataControl.id] === undefined)
				this.dataControls[DataControl.id] = [];
			this.dataControls[DataControl.id].push(DataControl);
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

/*!
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Usage: http://expanz.com/docs/client-technologies/javascript-sdk/
//  Author: Kim Damevin
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
 */
$(function() {

	window.expanz = window.expanz || {};

	window.expanz.clientVersion = "1.0";

	window.expanz.helper = window.expanz.helper || {};

	window.expanz.Net = {

		// Request Objects -> to be passed to SendRequest
		CreateSessionRequest : function(username, password, callbacks) {
			expanz.Storage.clearSession(); /* clear previous existing sessions */
			var appsite = config._AppSite;
			var authenticationMode = config._AuthenticationMode;
			SendRequest(RequestObject.CreateSession(username, password, appsite, authenticationMode), parseCreateSessionResponse(callbacks));
		},

		WebServerPing : function(nbAttempts) {
			if (nbAttempts == undefined)
				nbAttempts = 3;
			if (window.expanz.pingError === undefined)
				window.expanz.pingError = 0;

			SendRequest(RequestObject.WebServerPing(), function(data) {
				var res = ($(data).find("WebServerPingResult"));
				if (res.length > 0 && res.text() == "true") {
					window.expanz.pingError = 0;
					window.expanz.Storage.setPingSuccess();
					window.expanz.logToConsole("WEB SERVER PING OK");
				}
				else {
					window.expanz.pingError++;
					if (window.expanz.pingError === nbAttempts) {
						expanz.Views.redirect(window.expanz.getMaintenancePage());
					}
					else {
						// ping again
						window.expanz.Net.WebServerPing(nbAttempts);
					}
				}
			});

		},

		GetSessionDataRequest : function(callbacks) {

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.Views.requestLogin();
				return;
			}

			SendRequest(RequestObject.GetSessionData(expanz.Storage.getSessionHandle()), parseGetSessionDataResponse(callbacks));
		},

		CreateActivityRequest : function(activity, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

			if (activity.getAttr('allowAnonymous') === false) {
				if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
					expanz.Views.requestLogin();
					return;
				}
			}

			/* if allow anonymous and session doesn't exist we don't create anything on the server */
			if (expanz.Storage.getSessionHandle() && expanz.Storage.getSessionHandle() !== "") {

				/* check if an activity has already been created, if so specify it instead of creating a new one */
				var activityHandle = expanz.Storage.getActivityHandle(activity.getAttr('name'), activity.getAttr('style'));

				if (activityHandle && activityHandle !== undefined) {
					activity.setAttr({
						'handle' : activityHandle
					});
				}

				activity.setAttr({
					loading : true
				});

				SendRequest(RequestObject.CreateActivity(activity, expanz.Storage.getSessionHandle()), parseCreateActivityResponse(activity, callbacks));
			}
			else {
				/* anonymous case because no session handle is set */
			}
		},

		GetSavePreferencesRequest : function(activity, key, value, updateClientStorage, callbacks) {

			if (activity.getAttr('allowAnonymous') === false) {
				if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
					expanz.Views.requestLogin();
					return;
				}
			}

			if (updateClientStorage === true) {
				window.expanz.Storage.setUserPreference(key, value);
			}

			if (!activity.isAnonymous()) {
				// TODO check if we need a callback
				SendRequest(RequestObject.GetSavePreferences(key, value, expanz.Storage.getSessionHandle()));
			}
		},

		DeltaRequest : function(id, value, activity, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

			if (activity.getAttr('allowAnonymous') === false) {
				if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
					expanz.Views.requestLogin();
					return;
				}
			}

			var initiator = {
				type : "field",
				id : id
			};

			activity.setAttr({
				'deltaLoading' : {
					isLoading : true,
					initiator : initiator
				}
			});

			SendRequest(RequestObject.Delta(id, value, activity, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, initiator, callbacks));
		},

		MethodRequest : function(name, methodAttributes, context, activity, anonymousFields, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

			if (activity.getAttr('allowAnonymous') === false) {
				if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
					expanz.Views.requestLogin();
					return;
				}
			}

			var initiator = {
				type : "method",
				id : name
			};

			activity.setAttr({
				'deltaLoading' : {
					isLoading : true,
					initiator : initiator
				}
			});

			// activity allows anonymous and user not logged in
			if (activity.isAnonymous()) {
				SendRequest(RequestObject.AnonymousMethod(name, methodAttributes, context, activity, anonymousFields), parseDeltaResponse(activity, initiator, callbacks));
			}
			else {
				SendRequest(RequestObject.Method(name, methodAttributes, context, activity, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, initiator, callbacks));
			}

		},

		/* only use on load of the page to load the datapublications in anonymous context */
		AnonymousMethodsRequest : function(methods, activity, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

			var initiator = {
				type : "anonymous",
				id : "anonymous"
			};

			activity.setAttr({
				'deltaLoading' : {
					isLoading : true,
					initiator : initiator
				}
			});

			SendRequest(RequestObject.AnonymousMethods(methods, activity), parseDeltaResponse(activity, initiator, callbacks));

		},

		DestroyActivityRequest : function(activityHandle, callbacks) {

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.Views.requestLogin();
				return;
			}

			SendRequest(RequestObject.DestroyActivity(activityHandle, expanz.Storage.getSessionHandle()), parseDestroyActivityResponse(callbacks));
		},

		DataRefreshRequest : function(dataId, activity, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.Views.requestLogin();
				return;
			}

			var initiator = {
				type : "resfresh",
				id : dataId
			};

			activity.setAttr({
				'deltaLoading' : {
					isLoading : true,
					initiator : initiator
				}
			});

			SendRequest(RequestObject.DataRefresh(dataId, activity, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, initiator, callbacks));
		},

		ReleaseSessionRequest : function(callbacks) {
			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.Views.requestLogin();
				return;
			}
			SendRequest(RequestObject.ReleaseSession(expanz.Storage.getSessionHandle()), parseReleaseSessionResponse(callbacks));
		},

		GetBlobRequest : function(blobId, activity, initiator) {

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.Views.requestLogin();
				return;
			}

			/* even if the file is not opened yet, we consider the delta loading is finished */
			activity.setAttr({
				'deltaLoading' : {
					isLoading : false,
					initiator : initiator
				}
			});

			SendNormalRequest(RequestObject.GetBlob(blobId, activity, expanz.Storage.getSessionHandle()));
		},

		GetFileRequest : function(filename, activity, initiator) {

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.Views.requestLogin();
				return;
			}

			/* even if the file is not opened yet, we consider the delta loading is finished */
			activity.setAttr({
				'deltaLoading' : {
					isLoading : false,
					initiator : initiator
				}
			});

			SendNormalRequest(RequestObject.GetFile(filename, activity, expanz.Storage.getSessionHandle()));
		},

		/* call when selecting something from the tree view (file) or menu action */
		CreateMenuActionRequest : function(activity, contextId, contextType, menuAction, defaultAction, setIdFromContext, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.Views.requestLogin();
				return;
			}

			var initiator = {
				type : "menuaction",
				id : contextId
			};

			activity.setAttr({
				'deltaLoading' : {
					isLoading : true,
					initiator : initiator
				}
			});

			SendRequest(RequestObject.CreateMenuAction(activity, contextId, contextType, menuAction, defaultAction, setIdFromContext, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, initiator, callbacks));
		},

		/* create an anonymous request */
		CreateAnonymousRequest : function(xmlData, callbacks) {
			if (callbacks === undefined)
				callbacks = window.expanz.defaultCallbacks;
			SendRequest(RequestObject.CreateAnonymousRequest(xmlData), parseExecAnonymousResponse(callbacks));
		}

	};

	//
	// Request Objects (used when passed to SendRequest( ... )
	//
	var XMLNamespace = window.config._XMLNamespace || XMLNamespace; // TODO: throw an error here, saying that window.config._XMLNamespace is required
	var RequestObject = {

		CreateSession : function(username, password, appsite, authenticationMode) {
			return {
				data : buildRequest('CreateSessionX', XMLNamespace)(RequestBody.CreateSession(username, password, appsite, authenticationMode)),
				url : 'CreateSessionX'
			};
		},

		Ping : function() {
			return {
				data : buildRequest('Ping', XMLNamespace)(""),
				url : 'Ping'
			};
		},

		WebServerPing : function() {
			return {
				data : "",
				url : 'WebServerPing',
				method : "GET"
			};
		},

		GetSessionData : function(sessionHandle) {
			return {
				data : buildRequest('ExecX', XMLNamespace, sessionHandle)(RequestBody.GetSessionData()),
				url : 'ExecX'
			};
		},

		GetSavePreferences : function(key, value, sessionHandle) {
			return {
				data : buildRequest('ExecX', XMLNamespace, sessionHandle)(RequestBody.CreateSavePreferences(key, value)),
				url : 'ExecX'
			};
		},

		CreateActivity : function(activity, sessionHandle) {
			return {
				data : buildRequest('ExecX', XMLNamespace, sessionHandle)(RequestBody.CreateActivity(activity)),
				url : 'ExecX'
			};
		},

		Delta : function(id, value, activity, sessionHandle) {
			return {
				data : buildRequest('ExecX', XMLNamespace, sessionHandle)(RequestBody.Delta(id, value, activity)),
				url : 'ExecX'
			};
		},

		Method : function(name, methodAttributes, context, activity, sessionHandle) {
			return {
				data : buildRequest('ExecX', XMLNamespace, sessionHandle)(RequestBody.CreateMethod(name, methodAttributes, context, activity)),
				url : 'ExecX'
			};
		},

		AnonymousMethod : function(name, methodAttributes, context, activity, anonymousFields) {
			return {
				data : buildRequest('ExecAnonymousX', XMLNamespace, null, true)(RequestBody.CreateMethod(name, methodAttributes, context, activity, anonymousFields)),
				url : 'ExecAnonymousX'
			};
		},

		AnonymousMethods : function(methods, activity) {
			return {
				data : buildRequest('ExecAnonymousX', XMLNamespace, null, true)(RequestBody.CreateAnonymousMethods(methods, activity)),
				url : 'ExecAnonymousX'
			};
		},

		DestroyActivity : function(activityHandle, sessionHandle) {
			return {
				data : buildRequest('ExecX', XMLNamespace, sessionHandle)(RequestBody.DestroyActivity(activityHandle)),
				url : 'ExecX'
			};
		},

		ReleaseSession : function(sessionHandle) {
			return {
				data : buildRequest('ReleaseSession', XMLNamespace, sessionHandle)(RequestBody.CreateReleaseSession()),
				url : 'ReleaseSession'
			};
		},

		GetBlob : function(blobId, activity, sessionHandle) {
			return {
				data : buildRequestWithoutESA('GetBlob', XMLNamespace, sessionHandle)(RequestBody.GetBlob(blobId, activity)),
				url : 'GetBlob'
			};
		},

		GetFile : function(filename, activity, sessionHandle) {
			return {
				data : buildRequestWithoutESA('GetFile', XMLNamespace, sessionHandle)(RequestBody.GetFile(filename, activity)),
				url : 'GetFile'
			};
		},

		DataRefresh : function(dataId, activity, sessionHandle) {
			return {
				data : buildRequest('ExecX', XMLNamespace, sessionHandle)(RequestBody.DataRefresh(dataId, activity)),
				url : 'ExecX'
			};
		},

		CreateMenuAction : function(activity, contextId, contextType, menuAction, defaultAction, setIdFromContext, sessionHandle) {
			return {
				data : buildRequest('ExecX', XMLNamespace, sessionHandle)(RequestBody.CreateMenuAction(activity, contextId, contextType, menuAction, defaultAction, setIdFromContext)),
				url : 'ExecX'
			};
		},

		CreateAnonymousRequest : function(xmlData) {
			return {
				data : buildRequest('ExecAnonymousX', XMLNamespace, null, true)(xmlData),
				url : 'ExecAnonymousX'
			};
		}

	};

	var buildRequest = function(requestType, xmlns, sessionHandle, includeSite) {
		return function insertBody(body) {
			var site = includeSite ? '<site>' + config._AppSite + '</site>' : '';
			var namespace = xmlns ? ' xmlns="' + xmlns + '" ' : '';
			var head = '<' + requestType + namespace + '>' + site + '<xml><ESA>';
			var tail = '</ESA>' + '</xml>';
			tail += sessionHandle ? '<sessionHandle>' + sessionHandle + '</sessionHandle>' : '';
			tail += '</' + requestType + '>';

			return head + body + tail;
		};
	};

	var buildRequestWithoutESA = function(requestType, xmlns, sessionHandle) {
		return function insertBody(body) {

			var head = '<' + requestType + ' xmlns="' + xmlns + '">';
			head += sessionHandle ? '<sessionHandle>' + sessionHandle + '</sessionHandle>' : '';
			var tail = '';
			tail += '</' + requestType + '>';

			return head + body + tail;
		};
	};

	var RequestBody = {

		CreateSession : function(username, password, appsite, authenticationMode) {
			if (authenticationMode === undefined)
				authenticationMode = "Primary";
			return '<CreateSession user="' + username + '" password="' + password + '" appSite="' + appsite + '" authenticationMode="' + authenticationMode + '" clientType="HTML" clientVersion="' + window.expanz.clientVersion + '" schemaVersion="2.0"/>';
		},

		GetSessionData : function() {
			return '<GetSessionData/>';
		},

		CreateSavePreferences : function(key, value) {
			return '<SavePreferences><UserPreference key="' + key + '" value="' + value + '" /></SavePreferences>';
		},

		CreateActivity : function(activity) {
			var handle = activity.getAttr('handle');
			var center = '';

			var unmaskedFields = '';
			/* if optimisation is true, ask for fields we want to avoid getting everything */
			if (activity.getAttr('optimisation') === true) {
				var fields = activity.getAll();
				if (fields) {
					_.each(fields, function(field) {
						if (field._type == 'Field') {
							unmaskedFields += '<Field id="' + field.get('id') + '" masked="0" />';
						}
					});
				}
			}

			center = '';
			if (handle) {
				if (activity.getAttr('optimisation') === true) {
					center += '<Activity activityHandle="' + handle + '">' + unmaskedFields + '</Activity> ';
				}
				center += '<PublishSchema activityHandle="' + handle + '"> ';
			}
			else {
				center += '<CreateActivity ';
				center += 'name="' + activity.getAttr('name') + '"';
				activity.getAttr('style') ? center += ' style="' + activity.getAttr('style') + '"' : '';
				activity.getAttr('optimisation') ? center += ' suppressFields="1"' : '';
				center += activity.getAttr('key') ? ' initialKey="' + activity.getAttr('key') + '">' : '>';

				if (activity.getAttr('optimisation') === true) {
					center += unmaskedFields;
				}
			}

			/* add datapublication for data controls */
			if (activity.hasDataControl()) {
				_.each(activity.getDataControls(), function(dataControl, dataControlId) {
					/* dataControl is an array if many UI element are using the same data but they should all be for the same parameters, we take only the first one then */
					dataControl = dataControl[0];

					var populateMethod = dataControl.getAttr('populateMethod') ? ' populateMethod="' + dataControl.getAttr('populateMethod') + '"' : '';
					var query = dataControl.getAttr('query') ? ' query="' + dataControl.getAttr('query') + '"' : '';
					var autoPopulate = dataControl.getAttr('autoPopulate') ? ' autoPopulate="' + dataControl.getAttr('autoPopulate') + '"' : '';
					var type = dataControl.getAttr('type') ? ' type="' + dataControl.getAttr('type') + '"' : '';

					center += '<DataPublication id="' + dataControlId + '"' + query + populateMethod + autoPopulate + type;
					dataControl.getAttr('contextObject') ? center += ' contextObject="' + dataControl.getAttr('contextObject') + '"' : '';
					center += '/>';

				});

			}
			if (handle) {
				center += '</PublishSchema>';
			}
			else {
				center += '</CreateActivity>';
			}
			return center;
		},

		Delta : function(id, value, activity) {
			return '<Activity activityHandle="' + activity.getAttr('handle') + '">' + '<Delta id="' + id + '" value="' + value + '"/>' + '</Activity>';
		},

		CreateMethod : function(name, methodAttributes, context, activity, anonymousFields) {
			var body = '<Activity ';
			if (activity.isAnonymous()) {
				body += 'id="' + activity.getAttr('name') + '" >';
				/* add all DataPublication as well since no activity exists, we just need id and populate method */
				if (activity.hasDataControl()) {
					_.each(activity.getDataControls(), function(dataControl, dataControlId) {
						dataControl = dataControl[0];
						var populateMethod = dataControl.getAttr('populateMethod') ? ' populateMethod="' + dataControl.getAttr('populateMethod') + '"' : '';
						var query = dataControl.getAttr('query') ? ' query="' + dataControl.getAttr('query') + '"' : '';
						var autoPopulate = dataControl.getAttr('autoPopulate') ? ' autoPopulate="' + dataControl.getAttr('autoPopulate') + '"' : '';
						var type = dataControl.getAttr('type') ? ' type="' + dataControl.getAttr('type') + '"' : '';

						body += '<DataPublication id="' + dataControlId + '"' + query + populateMethod + autoPopulate + type;
						dataControl.getAttr('contextObject') ? body += ' contextObject="' + dataControl.getAttr('contextObject') + '"' : '';
						body += '/>';
					});
				}

			}
			else {
				body += ' activityHandle="' + activity.getAttr('handle') + '">';
			}

			if (context !== null && context.id) {
				body += '<Context contextObject="' + context.contextObject + '" id="' + context.id + '" type="' + context.type + '" />';
			}

			body += '<Method name="' + name + '"';
			if (methodAttributes !== undefined && methodAttributes.length > 0) {
				_.each(methodAttributes, function(attribute) {
					if (attribute.value !== undefined) {
						body += " " + attribute.name + "='" + attribute.value + "' ";
					}
				});
			}

			/* add company code if anonymous */
			if (activity.isAnonymous()) {
				body += " company='" + config._anonymousCompanyCode + "' ";
			}

			body += '>';

			/* add all bound fields in anonymous activity case */
			if (activity.isAnonymous() && anonymousFields && anonymousFields.length > 0) {
				_.each(anonymousFields, function(field) {
					body += '<' + field.id + '>' + field.value + '</' + field.id + '>';
				});
			}

			body += '</Method>';

			body += '</Activity>';
			return body;
		},

		CreateAnonymousMethods : function(methods, activity) {
			var body = '<Activity ';
			body += 'id="' + activity.getAttr('name') + '" >';
			/* add all DataPublication as well since no activity exists, we just need id and populate method */
			if (activity.hasDataControl()) {
				_.each(activity.getDataControls(), function(dataControl, dataControlId) {
					dataControl = dataControl[0];
					var populateMethod = dataControl.getAttr('populateMethod') ? ' populateMethod="' + dataControl.getAttr('populateMethod') + '"' : '';
					var query = dataControl.getAttr('query') ? ' query="' + dataControl.getAttr('query') + '"' : '';
					var autoPopulate = dataControl.getAttr('autoPopulate') ? ' autoPopulate="' + dataControl.getAttr('autoPopulate') + '"' : '';
					var type = dataControl.getAttr('type') ? ' type="' + dataControl.getAttr('type') + '"' : '';

					body += '<DataPublication id="' + dataControlId + '"' + query + populateMethod + autoPopulate + type;
					dataControl.getAttr('contextObject') ? body += ' contextObject="' + dataControl.getAttr('contextObject') + '"' : '';
					body += '/>';
				});
			}

			$.each(methods, function(index, value) {
				body += '<Method name="' + value.name + '"';
				body += " contextObject='" + value.contextObject + "' ";
				body += " company='" + config._anonymousCompanyCode + "' ";
				body += '>';
				if (value.additionalElement) {
					body += value.additionalElement;
				}
				body += '</Method>';
			});

			body += '</Activity>';
			return body;
		},

		CreateMenuAction : function(activity, contextId, contextType, menuAction, defaultAction, setIdFromContext) {
			var mnuActionStr = '<Activity activityHandle="' + activity.getAttr('handle') + '">';
			var contextObjectStr = contextType ? ' contextObject="' + contextType + '"' : '';

			if (contextId) {
				mnuActionStr += '<Context id="' + contextId + '"' + contextObjectStr;
				mnuActionStr += setIdFromContext ? " setIdFromContext='1' " : "";
				mnuActionStr += '/>';
			}
			mnuActionStr += '<MenuAction ';
			if (menuAction) {
				mnuActionStr += ' action="' + menuAction + '" ';
			}
			else {
				mnuActionStr += ' defaultAction="' + defaultAction + '" ';
			}
			mnuActionStr += contextObjectStr + '/>' + '</Activity>';
			return mnuActionStr;
		},

		DestroyActivity : function(activityHandle, sessionHandle) {
			return '<Close activityHandle="' + activityHandle + '"/>';
		},

		CreateReleaseSession : function() {
			return '<ReleaseSession/>';
		},

		GetBlob : function(blobId, activity) {
			return '<activityHandle>' + activity.getAttr('handle') + '</activityHandle><blobId>' + blobId + '</blobId><isbyteArray>false</isbyteArray>';
		},

		GetFile : function(filename, activity) {
			return '<activityHandle>' + activity.getAttr('handle') + '</activityHandle><fileName>' + filename + '</fileName><isbyteArray>false</isbyteArray>';
		},

		DataRefresh : function(dataId, activity) {
			return '<activityHandle>' + activity.getAttr('handle') + '</activityHandle><DataPublication id="' + dataId + '" refresh="1" />';
		}

	};

	var parseCreateSessionResponse = function(callbacks) {
		return function apply(xml) {
			// window.expanz.logToConsole("start parseCreateSessionResponse");

			if ($(xml).find('CreateSessionXResult').length > 0) {
				expanz.Storage.setSessionHandle($(xml).find('CreateSessionXResult').text());
			}
			else {
				if (callbacks && callbacks.error) {
					callbacks.error("Error: Server did not provide a sessionhandle. We are unable to log you in at this time.");
				}
				return;
			}

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle().length === 0) {

				var errorString = '';
				$(xml).find('errorMessage').each(function() {
					errorString = $(this).text();
				});
				if (errorString.length > 0) {
					if (callbacks && callbacks.error) {
						callbacks.error(errorString);
					}
					return;
				}
			}
			else {
				if (callbacks && callbacks.success) {
					callbacks.success();
				}
			}
			return;
		};
	};

	function parseProcessAreas(xmlElement) {
		// window.expanz.logToConsole("start parseProcessAreas");
		var processAreas = [];
		$(xmlElement).children('processarea').each(function() {
			var processArea = new ProcessArea($(this).attr('id'), $(this).attr('title'));
			var subProcessAreas = parseProcessAreas($(this));
			if (subProcessAreas.length > 0) {
				processArea.pa = subProcessAreas;
			}
			$(this).children('activity').each(function() {
				processArea.activities.push(new ActivityInfo($(this).attr('name'), $(this).attr('title'), '#', $(this).attr('style'), $(this).attr('image')));
			});
			processAreas.push(processArea);
		});
		return processAreas;
	}

	function parseRoles(xmlElement) {

		if (xmlElement == undefined || xmlElement.length == 0)
			return null;
		var roles = {};
		$(xmlElement).children('UserRole').each(function() {
			roles[$(this).attr('id')] = {
				id : $(this).attr('id'),
				name : $(this).text()
			}
		});
		return roles;
	}

	function parseDashboards(xmlElement) {

		if (xmlElement == undefined || xmlElement.length == 0)
			return null;
		var dashboards = {};
		$(xmlElement).children().each(function() {
			dashboards[this.tagName] = {
				'id' : this.tagName
			}
			for ( var j = 0; j < this.attributes.length; j++) {
				var attribute = this.attributes.item(j);
				dashboards[this.tagName][attribute.nodeName] = attribute.nodeValue;

				/* update field if in the view */
				var dashboardField = window.expanz.Dashboards.get(this.tagName + "_" + attribute.nodeName);
				if (dashboardField != null) {
					dashboardField.set({
						value : attribute.nodeValue
					})
				}
			}

		});
		return dashboards;
	}

	function fillActivityData(processAreas, url, name, style, gridviewList) {
		$.each(processAreas, function(i, processArea) {
			$.each(processArea.activities, function(j, activity) {
				if (activity.name == name && activity.style == style) {
					activity.url = url;
					activity.gridviews = gridviewList;
				}
			});

			/* do it for sub process activity */
			fillActivityData(processArea.pa, url, name, style, gridviewList);

		});

	}

	function parseExecAnonymousResponse(callbacks) {
		return function apply(xml) {
			// window.expanz.logToConsole("start parseExecAnonymousResponse");
			var execResults = $(xml).find('ExecAnonymousXResult');
			var success = false;
			if (execResults.length > 0) {
				var esaResult = $(execResults).find('ESA');
				success = boolValue(esaResult.attr('success'));

				/* METHOD CASE */
				$(execResults).find('Method').each(function() {
					var res = boolValue($(this).attr('result'));
					var methodName = $(this).attr('name');
					var event = jQuery.Event(methodName);
					event.methodResult = res;
					$("body").trigger(event);
				});

				var serverMessage = esaResult.attr('serverMessage') || "";
				if (!success && $(xml).find('errors').length > 0) {
					serverMessage += $(xml).find('errors').text();
				}

				// window.expanz.logToConsole("Success:" + success);

				if (serverMessage !== undefined && serverMessage.length > 0) {
					if (success) {
						if (callbacks && callbacks.info) {
							callbacks.info(serverMessage);
						}
					}
					else {
						if (callbacks && callbacks.error) {
							callbacks.error(serverMessage);
						}
					}
				}

				$(execResults).find('Message').each(function() {
					if ($(this).attr('type') == 'Error' || $(this).attr('type') == 'Warning') {
						if (callbacks && callbacks.error) {
							callbacks.error($(this).text());
						}
					}
					else if ($(this).attr('type') == 'Info') {
						if (callbacks && callbacks.info) {
							callbacks.info($(this).text());
						}
					}
				});
			}
		};
	}
	
	function parseGetSessionDataResponse(callbacks) {
		return function apply(xml) {
			// window.expanz.logToConsole("start parseGetSessionDataResponse");

			var processAreas = parseProcessAreas($(xml).find("Menu"));

			var roles = parseRoles($(xml).find("Roles"));
			expanz.Storage.setRolesList(roles);

			var dashboards = parseDashboards($(xml).find("Dashboards"));
			expanz.Storage.setDashboards(dashboards);

			/* store user preference if existing */
			$(xml).find('PublishPreferences').find('Preference').each(function() {
				window.expanz.Storage.setUserPreference($(this).attr('key'), $(this).attr('value'));
			});

			$.get('./formmapping.xml', function(data) {

				$(data).find('activity').each(function() {
					var name = $(this).attr('name');
					var url = getPageUrl($(this).attr('form'));
					var style = $(this).attr('style') || "";
					var gridviewList = [];
					$(this).find('gridview').each(function() {
						var gridview = new GridViewInfo($(this).attr('id'));
						gridviewList.push(gridview);
					});

					fillActivityData(processAreas, url, name, style, gridviewList);

				});

				expanz.Storage.setProcessAreaList(processAreas);

				$(data).find('activity').each(function() {
					if ($(this).attr('default') == 'true') {
						if (callbacks && callbacks.success) {
							callbacks.success($(this).attr('form'));
						}
						return;
					}
				});
			});

		};
	}

	function parseCreateActivityResponse(activity, callbacks) {
		return function apply(xml) {
			// window.expanz.logToConsole("start parseCreateActivityResponse");

			/* Errors case -> server is most likely not running */
			$(xml).find('errors').each(function() {
				if ($(xml).find('errors').text().indexOf(':Your session cannot be contacted') != -1) {
					if (activity.getAttr('allowAnonymous') === false) {
						expanz.Views.redirect(window.expanz.getMaintenancePage());
					}
				}
			});

			var execResults = $(xml).find("ExecXResult");
			if (execResults) {
				$(execResults).find('Message').each(function() {
					if ($(this).attr('type') == 'Error' || $(this).attr('type') == 'Warning') {
						var sessionLost = /Session .* not found/.test($(this).text());
						var activityNotFound = /Activity .* not found/.test($(this).text());
						if (sessionLost || activityNotFound) {
							expanz.Storage.clearSession();
							if (activity.getAttr('allowAnonymous') === false) {
								window.expanz.showLoginPopup(activity, true);
								return;
							}
						}

						if (callbacks && callbacks.error) {
							callbacks.error($(this).text());
						}
					}
					else if ($(this).attr('type') == 'Info') {
						if (callbacks && callbacks.info) {
							callbacks.info($(this).text());
						}
					}
				});

				/* DASHBOARD UPDATE CASE */
				var dashboards = parseDashboards($(execResults).find("Dashboards"));
				if (dashboards != null) {
					expanz.Storage.setDashboards(dashboards);
				}

				$(execResults).find('Activity').each(function() {
					activity.setAttr({
						handle : $(this).attr('activityHandle')
					});
					expanz.Storage.setActivityHandle($(this).attr('activityHandle'), activity.getAttr('name'), activity.getAttr('style'));
				});

				$(execResults).find('Field').each(function() {
					var field = activity.get($(this).attr('id'));
					if (field) {
						field.set({
							text : $(this).attr('text'),
							disabled : boolValue(this.getAttribute('disabled')),
							maxLength : $(this).attr('maxLength'),
							mask : $(this).attr('mask'),
							label : $(this).attr('label'),
							items : $(this).find("Item"),
							value : $(this).attr('value') == '$longData$' ? $(this).text() : $(this).attr('value')

						});

						if ($(this).attr('datatype')) {
							field.set({
								datatype : $(this).attr('datatype')
							}, {
								silent : true
							});
							if ($(this).attr('datatype').toLowerCase() === 'blob' && $(this).attr('url')) {
								field.set({
									value : $(this).attr('url')
								});
							}
						}
					}
				});

				_.each($(execResults).find('Data'), function(data) {

					var dataControlId = $(data).attr('id');
					var dataControlModels = activity.getDataControl(dataControlId);

					if (dataControlModels !== undefined) {

						for ( var i = 0; i < dataControlModels.length; i++) {
							dataControlModel = dataControlModels[i];
							/* grid case */
							if (dataControlModel.getAttr('renderingType') == 'popupGrid') {
								/* don't display it on load, only happening with deltas */
							}
							else if (dataControlModel.getAttr('renderingType') == 'grid' || dataControlModel.getAttr('renderingType') == 'rotatingBar') {
								fillGridModel(dataControlModel, data);

								/* add a method handler for each action button */
								dataControlModel.actionSelected = function(selectedId, name, params) {
									expanz.Net.MethodRequest(name, params, null, activity);
								};

								/* override a method handler for each menuaction button */
								dataControlModel.menuActionSelected = function(selectedId, name, params) {
									expanz.Net.CreateMenuActionRequest(this.getAttr('parent'), selectedId, null, name, "1", true, callbacks);
								};
							}
							/* others cases (tree, combobox) */
							else {
								/* update the xml data in the model, view will get a event if bound */
								dataControlModel.setAttr({
									xml : $(data)
								});
							}
						}
					}

				}); // foreach 'Data'
				//if (callbacks && callbacks.success) {
					//if (activity.name !== undefined) {
					//	callbacks.success('Activity (' + activity.name + ') has been loaded: ' + execResults);
					//} else {
						window.expanz.logToConsole('Activity (' + activity.name + ') has been loaded: ' + execResults);
					//}
				//}

			}
			else {
				if (callbacks && callbacks.error) {
					callbacks.error('Server gave an empty response to a CreateActivity request: ' + xml);
				}
			}

			activity.setAttr({
				loading : false
			});

			return;
		};
	}

	function parseDeltaResponse(activity, initiator, callbacks) {
		return function apply(xml) {
			// window.expanz.logToConsole("start parseDeltaResponse");

			/* Errors case -> server is most likely not running */
			$(xml).find('errors').each(function() {
				if ($(xml).find('errors').text().indexOf(':Your session cannot be contacted') != -1) {
					expanz.Views.redirect(window.expanz.getMaintenancePage());
				}
			});

			var execResults = $(xml).find("ExecXResult");
			if (execResults == null || execResults.length == 0) {
				execResults = $(xml).find("ExecAnonymousXResult");
			}

			if (execResults) {
				/* remove other activities from the xml except for anonymous activity */
				if (!activity.isAnonymous()) {
					$(execResults).find("Activity[activityHandle!='" + activity.getAttr('handle') + "']").remove();
				}

				var errors = [];
				var infos = [];

				/* DASHBOARD UPDATE CASE */
				var dashboards = parseDashboards($(execResults).find("Dashboards"));
				if (dashboards != null) {
					expanz.Storage.setDashboards(dashboards);
				}

				/* MESSAGE CASE */
				$(execResults).find('Message').each(function() {
					if ($(this).attr('type') == 'Error' || $(this).attr('type') == 'Warning') {
						var sessionLost = /Session .* not found/.test($(this).text());
						var activityNotFound = /Activity .* not found/.test($(this).text());
						if (sessionLost || activityNotFound) {
							window.expanz.showLoginPopup(activity, true);
							return;
						}

						var source = $(this).attr('source');
						if (source && source !== undefined) {
							var field = activity.get(source);
							if (field && field !== undefined) {
								field.set({
									errorMessage : (this.textContent || this.innerText),
									error : true
								});
							}
						}

						errors.push($(this).text());

					}
					else if ($(this).attr('type') == 'Info') {
						infos.push($(this).text());
					}
				});

				if (callbacks && callbacks.error) {
					if (errors) {
						callbacks.error(errors);
					}
					else {
						callbacks.error(null);
					}
				}

				if (callbacks && callbacks.info) {
					if (infos) {
						callbacks.info(infos);
					}
					else {
						callbacks.info(null);
					}
				}

				/* Activity Request CASE */
				$(execResults).find('ActivityRequest').each(function() {
					var id = $(this).attr('id');
					var key = $(this).attr('key');
					var style = $(this).attr('style') || "";

					window.expanz.createActivityWindow(activity, id, style, key);

				});

				/* Activity Request CASE */
				$(execResults).find('ContextMenu').each(function() {
					// window.expanz.logToConsole('ContextMenu received');
					var caller = window.expanz.currentContextMenu;
					if (caller !== null) {
						// window.expanz.logToConsole('Caller found');
						caller.set({
							data : null
						});
						caller.set({
							data : $(this)
						});
					}
				});

				/* FIELD CASE */
				$(execResults).find('Field').each(function() {
					var id = $(this).attr('id');
					var field = activity.get(id);
					if (field && field !== undefined) {
						if ((field.get('value') && (field.get('value') != $(this).attr('value'))) || !field.get('value')) {

							if ($(this).attr('disabled')) {
								field.set({
									disabled : boolValue(this.getAttribute('disabled'))
								});
							}

							field.set({
								items : $(this).find("Item"),
								text : $(this).attr('text'),
								value : $(this).attr('value') == '$longData$' ? $(this).text() : $(this).attr('value')
							});
						}

						/* remove error message if field is valid */
						if (boolValue($(this).attr('valid')) && field.get('errorMessage') !== undefined) {
							field.set({
								'errorMessage' : undefined
							});

						}

						if (field.get('url') && (field.get('url') != $(this).attr('url'))) {
							field.set({
								value : $(this).attr('url')
							});
						}
					}
				});

				/* FILE CASE */
				$(execResults).find('File').each(function(data) {

					if ($(this).attr('field') !== undefined && $(this).attr('path') != undefined) {
						// window.expanz.logToConsole("File found: " + $(this).attr('field') + " - " + $(this).attr('path'));
						expanz.Net.GetBlobRequest($(this).attr('field'), activity, initiator);
					}
					else if ($(this).attr('name') !== undefined) {
						// window.expanz.logToConsole("File found: " + $(this).attr('name'));
						expanz.Net.GetFileRequest($(this).attr('name'), activity, initiator);
					}
					else {
						// window.expanz.logToConsole("Not implemented yet");
					}

				});

				/* UIMESSAGE CASE */
				$(execResults).find('UIMessage').each(function() {

					var clientMessage = new expanz.Model.ClientMessage({
						id : 'ExpanzClientMessage',
						title : $(this).attr('title'),
						text : $(this).attr('text'),
						parent : activity
					});

					$(this).find('Action').each(function(action) {

						if (!window.XMLSerializer) {
							window.XMLSerializer = function() {
							};

							window.XMLSerializer.prototype.serializeToString = function(XMLObject) {
								return XMLObject.xml || '';
							};
						}

						var methodAttributes = [];
						if ($('Request > Method', this)[0] && $('Request > Method', this)[0].attributes.length > 0) {
							_.each($('Request > Method', this)[0].attributes, function(attribute) {
								if (attribute.name != 'name') {
									methodAttributes.push({
										name : attribute.name,
										value : attribute.value
									});
								}
							});
						}

						var actionModel = new expanz.Model.Method({
							id : $('Request > Method', this)[0] ? $($('Request > Method', this)[0]).attr('name') : 'close',
							label : $(this).attr('label'),
							response : $('Response', this)[0] ? $($('Response', this)[0]).children() : undefined,
							parent : activity,
							methodAttributes : methodAttributes
						});
						clientMessage.add(actionModel);
					});

					var uiMsg = new window.expanz.Views.UIMessage({
						id : clientMessage.id,
						model : clientMessage
					}, $('body'));
				});

				/* DATA */
				$(execResults).find('Data').each(function() {
					var id = $(this).attr('id');
					var pickfield = $(this).attr('pickField');
					var contextObject = $(this).attr('contextObject');
					if (id == 'picklist') {
						// window.expanz.logToConsole("picklist received");
						var elId = id + pickfield.replace(/ /g, "_");

						var clientMessage = new expanz.Model.ClientMessage({
							id : elId,
							title : pickfield,
							text : '',
							parent : activity
						});

						var gridEl = $("#" + elId);

						var picklistWindow = new window.expanz.Views.PicklistWindowView({
							id : clientMessage.id,
							model : clientMessage
						}, $('body'));

						expanz.Factory.bindDataControls(activity, picklistWindow.el.parent());

						var gridModels = activity.getDataControl(elId);

						if (gridModels !== undefined) {
							for ( var i = 0; i < gridModels.length; i++) {
								gridModel = gridModels[i];
								fillGridModel(gridModel, $(this));
								picklistWindow.center();
								gridModel.updateRowSelected = function(selectedId, type) {
									// window.expanz.logToConsole("From parseDeltaResponse:updateRowSelected id:" + selectedId + ' ,type:' + type);

									var clientFunction = window["picklistUpdateRowSelected" + type];
									if (typeof (clientFunction) == "function") {
										clientFunction(selectedId);
									}
									else {
										var context = {
											id : selectedId,
											contextObject : contextObject,
											type : type
										};

										var methodAttributes = [
											{
												name : "contextObject",
												value : contextObject
											}
										];

										expanz.Net.MethodRequest('SetIdFromContext', methodAttributes, context, activity);

									}
									picklistWindow.close();
								};

							}
						}
						else {
							alert("Unexpected error while trying to display the picklist");
						}

					}
					else {
						var dataControlModels = activity.getDataControl(id);
						if (dataControlModels !== undefined) {
							for ( var i = 0; i < dataControlModels.length; i++) {
								dataControlModel = dataControlModels[i];
								if (dataControlModel.getAttr('renderingType') == 'grid' || dataControlModel.getAttr('renderingType') == 'popupGrid' || dataControlModel.getAttr('renderingType') == 'rotatingBar') {
									fillGridModel(dataControlModel, $(this));

									/* override the method handler for each action button */
									dataControlModel.actionSelected = function(selectedId, name, params) {
										expanz.Net.MethodRequest(name, params, null, activity);
									};

									/* override a method handler for each menuaction button */
									dataControlModel.menuActionSelected = function(selectedId, name, params) {
										expanz.Net.CreateMenuActionRequest(this.getAttr('parent'), selectedId, null, name, "1", true, callbacks);
									};
								}
								else {
									/* update the xml data in the model, view will get a event if bound */
									dataControlModel.setAttr({
										xml : $(this)
									});
								}
							}
						}
					}
				});

				//if (callbacks && callbacks.success) {
					//callbacks.success('Delta handled: ' + execResults);
					window.expanz.logToConsole('Delta handled: ' + execResults);
				//}
			}

			activity.setAttr({
				'deltaLoading' : {
					isLoading : false,
					initiator : initiator
				}
			});

			return;
		};
	}

	function parseDestroyActivityResponse(callbacks) {
		return function apply(xml) {
			// window.expanz.logToConsole("start parseDestroyActivityResponse");
			var execResults = $(xml).find('ExecXResult');
			if (xml && execResults) {
				var esaResult = $(execResults).find('ESA');
				if (esaResult) {
					if ($(esaResult).attr('success') === 1) {
						if (callbacks && callbacks.success) {
							callbacks.success(true);
							return true;
						}
					}
				}
			}
			if (callbacks && callbacks.error) {
				callbacks.error(true);
			}
			return;
		};
	}

	function parseReleaseSessionResponse(callbacks) {
		return function apply(xml) {
			// window.expanz.logToConsole("start parseReleaseSessionResponse");
			var result = $(xml).find("ReleaseSessionResult").text();
			if (result === 'true') {
				if (callbacks && callbacks.success) {
					callbacks.success(result);
					return;
				}

			}
			if (callbacks && callbacks.error) {
				callbacks.error(result);
			}
			return;
		};
	}

	/*
	 * Send Request :manage the sending of XML requests to the server, and dispatching of response handlers
	 */

	var SendRequest = function(request, responseHandler, isPopup) {

		if (config._URLproxy !== undefined && config._URLproxy.length > 0) {
			$.ajax({
				type : 'POST',
				url : config._URLproxy,
				data : {
					url : getURLRestService(request.url),
					data : request.data,
					method : request.method || "POST"
				},
				dataType : 'XML',
				processData : true,
				complete : function(HTTPrequest) {
					if (HTTPrequest.status != 200) {
						eval(responseHandler)('There was a problem with the last request.');
					}
					else {
						if (isPopup !== undefined && isPopup === true) {
							var WinId = window.open('', 'newwin', 'width=400,height=500');
							WinId.document.open();
							WinId.document.write(HTTPrequest.responseText);
							WinId.document.close();
						}
						else {
							if (responseHandler) {
								eval(responseHandler)(HTTPrequest.responseXML);
							}
						}
					}
				}
			});
		}
		else {
			$.ajax({
				type : request.method || "POST",
				url : getURLRestService(request.url),
				data : request.data,
				dataType : 'XML',
				processData : true,
				complete : function(HTTPrequest) {
					if (HTTPrequest.status != 200) {
						eval(responseHandler)('There was a problem with the last request.');
					}
					else {
						if (isPopup !== undefined && isPopup === true) {
							var WinId = window.open('', 'newwin', 'width=400,height=500');
							WinId.document.open();
							WinId.document.write(HTTPrequest.responseText);
							WinId.document.close();
						}
						else {
							if (responseHandler) {
								eval(responseHandler)(HTTPrequest.responseXML);
							}
						}
					}
				}
			});
		}
	};

	/*
	 * Send Request :manage the sending of XML requests to the server, and dispatching of response handlers. Proxy is needed.
	 */

	var SendNormalRequest = function(request) {

		if ($("#formFile")) {
			$("#formFile").remove();
		}

		var form = '';
		form += "<form method='post' id='formFile' target='_blank' action='" + config._URLproxy + "'>";
		form += "<input type='hidden' name='url' value='" + getURLRestService(request.url) + "'>";

		form += "<input type='hidden' name='data' value='" + request.data + "'>";
		form += "</form>";
		$("body").append(form);

		$("#formFile").submit();

	};

	// GetSessionData Stub Objects
	//
	// TODO reduce name length because store in cookies as json string and take bandwiths (limitation on cookie size can be reached as well)
	function ProcessArea(id, title) {
		this.id = id;
		this.title = title;
		this.activities = [];
		this.pa = []; /* sub process area */
	}

	function ActivityInfo(name, title, url, style, image) {
		this.name = name;
		this.title = title;
		this.url = url;
		this.style = style || "";
		/* if the image if not defined we look for the activity name + style .png instead */
		if (image !== undefined) {
			this.img = image;
		}
		else {
			this.img = "assets/images/" + name + style + ".png";
		}
		this.gridviews = [];
	}

	function GridViewInfo(id) {
		this.id = id;
		this.columns = [];

		this.addColumn = function(field, width) {
			this.columns.push(new ColumnInfo(field, width));
		};

		function ColumnInfo(field, width) {
			this.field = field;
			this.width = width;
		}
	}

	function fillGridModel(gridModel, data) {
		gridModel.clear();

		gridModel.setAttr({
			source : $(data).attr('source')
		});

		var columnMap = Object();
		// add columns to the grid Model
		_.each($(data).find('Column'), function(column) {
			var field = $(column).attr('field') ? $(column).attr('field') : $(column).attr('id');
			field = field.replace(/\./g, "_");
			columnMap[$(column).attr('id')] = field;
			gridModel.addColumn($(column).attr('id'), $(column).attr('field'), $(column).attr('label'), $(column).attr('datatype'), $(column).attr('width'));
		});

		// add rows to the grid Model
		_.each($(data).find('Row'), function(row) {

			var rowId = $(row).attr('id');
			gridModel.addRow(rowId, $(row).attr('type') || $(row).attr('Type'));

			// add cells to this row
			_.each($(row).find('Cell'), function(cell) {
				// nextline is quick fix for htmlunit
				cell = XMLDocumentsToXMLString(cell);
				gridModel.addCell(rowId, $(cell).attr('id'), $(cell).text(), columnMap[$(cell).attr('id')], $(cell).attr('sortValue'));
			});
		});
		gridModel.trigger("update:grid");
	}

	function getURLRestService(path) {
		var sep = "";
		if (!config._URLprefix.endsWith("/"))
			sep = "/";
		return config._URLprefix + sep + path;
	}
});

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

	window.expanz.Storage = {

		// functions

		_getBestStorage : function() {
			if (window['localStorage'] !== null && window.localStorage) {
				/*
				 * length is unused but please leave it. I don't know why but sometimes firefox get an empty window.localStorage by mistake Doing this force it to evaluate the window.localStorage object and it seems to work
				 */
				var lth = window.localStorage.length;
				lth = lth;
				return this.localStorage;
			}
			else {
				return this.cookies;
			}
		},

		_getStorageGlobalName : function() {
			return "_expanz_" + config._AppSite + "_";
		},

		getSessionHandle : function() {
			var sessionHandle = this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'session.handle');
			if (sessionHandle == 'undefined')
				return undefined;
			return sessionHandle;
		},

		setSessionHandle : function(sessionHandle) {
			this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'session.handle', sessionHandle);
			return true;
		},

		getActivityHandle : function(activityName, activityStyle) {
			var activityHandle = this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'activity.handle.' + activityName + activityStyle);
			if (activityHandle == 'undefined')
				return undefined;
			if (activityHandle)
				activityHandle = activityHandle.replace('_', '.');
			return activityHandle;
		},

		setActivityHandle : function(activityHandle, activityName, activityStyle) {
			this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'activity.handle.' + activityName + activityStyle, activityHandle.replace('.', '_'));
			return true;
		},

		getProcessAreaList : function() {
			if (typeof this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'processarea.list') == "object") {
				return this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'processarea.list');
			}
			return JSON.parse(this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'processarea.list'));
		},

		setProcessAreaList : function(list) {
			this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'processarea.list', JSON.stringify(list));
			return true;
		},

		setRolesList : function(roles) {
			this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'roles.list', JSON.stringify(roles));
			return true;
		},

		/* is used for display but HAVE TO be enforced on the server as well */
		hasRole : function(id) {
			var roles = JSON.parse(this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'roles.list'));
			if (roles != null) {
				return (roles[id] != undefined)
			}
			return false;
		},

		setDashboards : function(dashboards) {
			this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'dashboards', JSON.stringify(dashboards));
			return true;
		},

		getDashboardFieldValue : function(dashboardName, fieldName) {
			var dashboards = JSON.parse(this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'dashboards'));
			if (dashboards != null && dashboards[dashboardName] != null) {
				return (dashboards[dashboardName][fieldName]);
			}
			return null;
		},

		getLastPingSuccess : function() {
			return this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'lastPingSuccess');
		},

		setPingSuccess : function() {
			this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'lastPingSuccess', (new Date()).getTime());
			return true;
		},

		getLastURL : function() {
			return this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'lastURL');
		},

		setLastURL : function(url) {
			this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'lastURL', url);
			return true;
		},

		clearLastURL : function() {
			this._getBestStorage().remove(expanz.Storage._getStorageGlobalName() + 'lastURL');
			return true;
		},

		setUserPreference : function(key, value) {
			this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'UserPreference' + key, value);
			return true;
		},

		getUserPreference : function(key) {
			return this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'UserPreference' + key);
		},

		clearSession : function() {
			this._getBestStorage().remove(expanz.Storage._getStorageGlobalName() + 'session.handle');
			this._getBestStorage().remove(expanz.Storage._getStorageGlobalName() + 'lastPingSuccess');
			this._getBestStorage().remove(expanz.Storage._getStorageGlobalName() + 'roles.list');
			this._getBestStorage().remove(expanz.Storage._getStorageGlobalName() + 'dashboards');
			this.clearActivityHandles();
			return true;
		},

		clearActivityHandles : function(activityName, activityStyle) {
			var storage = this._getBestStorage();
			var keys = storage.getKeys(expanz.Storage._getStorageGlobalName() + 'activity.handle');
			_.each(keys, function(key) {
				storage.remove(key);
			});
		},

		clearActivityHandle : function(activityName, activityStyle) {
			/* send a request to the servr to remove it as well */
			var ah = this.getActivityHandle(activityName, activityStyle);
			if (ah !== undefined) {
				this._getBestStorage().remove(expanz.Storage._getStorageGlobalName() + 'activity.handle.' + activityName + activityStyle);
				expanz.Net.DestroyActivityRequest(ah);
			}
			return ah;

		},

		/* storage implementations */
		/* cookies */
		cookies : {
			name : 'cookie',
			set : function(key, data) {
				$.cookies.set(key, data);
			},

			get : function(key) {
				return $.cookies.get(key);
			},

			getKeys : function(pattern) {
				var keys = [];
				_.each($.cookies.filter(pattern), function(value, key) {
					keys.push(key);
				});
				return keys;
			},

			remove : function(key) {
				$.cookies.del(key);
			}
		},

		/* localStorage */
		localStorage : {
			name : 'localStorage',
			set : function(key, data) {
				window.localStorage.setItem(key, data);
			},

			get : function(key) {
				return window.localStorage.getItem(key);
			},

			getKeys : function(pattern) {
				var keys = [];
				for (i = 0; i < window.localStorage.length; i++) {
					key = window.localStorage.key(i);
					if (pattern) {
						if (key.indexOf(pattern) >= 0) {
							keys.push(key);
						}

					}
					else {
						keys.push(key);
					}
				}

				return keys;
			},

			remove : function(key) {
				return window.localStorage.removeItem(key);
			}
		},

		// objects

		AppSiteMenu : function() {
			this.processAreas = [];

			this.load = function(el, level, parentSubProcesses) {
				el.html("");
				if (el.attr('type') == 'icon') {
					if (level > 0) {
						el.append('<div id="backOneLevel" class="icon"><img src="assets/images/home.png">Back</div>');
						el.find("#backOneLevel").click(function() {
							var menu = new expanz.Storage.AppSiteMenu();
							menu.processAreas = parentSubProcesses;
							menu.load(el.closest("[bind=menu]"), level - 1);
						});
					}
					var that = this;
					_.each(this.processAreas, function(pA) {
						pA.load(el, 0, true, that.processAreas);
					});
				}
				else {
					// clear the DOM menu

					var url = window.location.pathname;
					var currentPage = url.substring(url.lastIndexOf('/') + 1);
					
					// load process areas into DOM menu
					el.append('<ul id="menuUL" class="menu"></ul>');

					var homeLabel = el.attr('homeLabel') || 'Home';
					var logoutLabel = el.attr('logoutLabel') || 'Logout';
					var backLabel = el.attr('backLabel') || 'Back';

					// add back button if defined
					if (window.config._backButton === true) {
						el.find("#menuUL").before('<a href="javascript:void(0);" onclick="history.go(-1);return true;" class="backbutton">' + backLabel + '</a>');
					}

					// add home page if defined
					if (window.config._homepage) {
						var homeClass = "";
						
						var url = getPageUrl($(this).attr('form'));
						var urlHome = getPageUrl(window.config._homepage);
						if (urlHome == currentPage) {
							homeClass = "selected selectedNew ";
						}
						el.find("#menuUL").append('<li class="' + homeClass + ' processarea menuitem" id="home"><a href="' + urlHome + '" class="home menuTitle">' + homeLabel + '</a></li>');
					}

					_.each(this.processAreas, function(pA) {
						var menuItemClass = "";
						if (pA.title.indexOf("[CR]") != -1) {
							menuItemClass = "small";
						}
						pA.title = pA.title.replace("[CR]", "<br />");
						el.find("#menuUL").append('<li class="processarea menuitem ' + menuItemClass + '" id="' + pA.id + '"><a class="menuTitle" href="#">' + pA.title + '</a></li>');
						pA.load(el.find('#' + pA.id + '.processarea.menuitem'), 0, false);
					});
					// add html and click handler to DOM
					el.append('<ul class="right logoutContainer"><li class="processarea" id="logout"><a class="logout menuTitle">' + logoutLabel + '</a></li></ul>');
					el.append('<div style="clear:both"></div>');

					$(el.find('#logout')[0]).click(function(e) {
						expanz.Logout();
					});
				}

			};
		},

		ProcessAreaMenu : function(id, title) {
			this.id = id;
			this.title = title;
			this.activities = [];
			this.pa = []; /* sub process area */

			this.load = function(el, level, displayAsIcons, parentSubProcesses) {
				var url = window.location.pathname;
				var currentPage = url.substring(url.lastIndexOf('/') + 1);

				if (displayAsIcons === true) {

					_.each(this.activities, function(activity) {
						activity.load(el, true);
					});

					if (this.pa && this.pa.length > 0) {
						var i = 0;
						var j = new Date().getTime();
						_.each(this.pa, function(subprocess) {
							var subId = 'subprocess' + j + "_" + i++;
							el.append('<div id="' + subId + '" class="icon"><img src="' + subprocess.img + '"/><br/> ' + subprocess.title + '</div>');

							el.find("#" + subId).click(function() {
								var menu = new expanz.Storage.AppSiteMenu();
								menu.processAreas = [
									subprocess
								];
								menu.load(el.closest("[bind=menu]"), level + 1, parentSubProcesses);
							});
						});
					}
				}
				else {
					var ulId = this.id + '_' + level;
					if (this.activities.length > 0) {
						/* replace the link of the parent if only one activity in the menu */
						if (this.activities.length == 1) {
							var url = this.activities[0].url;
							el.find("[class='menuTitle']").attr('href', url);
							/* workaround for kendo issue : bind touchend */
							el.find("[class='menuTitle']").bind("touchend", function(e) {
								window.location.href = url;
							});

							/* add selected class if current */
							if (url.endsWith(currentPage)) {
								el.addClass("selected selectedNew");
							}
						}
						else {
							el.append('<ul style="display:none" id="' + ulId + '"></ul>');
							el.click(function() {
								// el.find("#" + ulId).toggle();
							});
							_.each(this.activities, function(activity) {
								activity.load(el.find("#" + ulId), false);
							});
						}
					}

					if (this.pa && this.pa.length > 0) {
						if (el.find("#" + ulId).length === 0) {
							el.append('<ul style="display:none" id="' + ulId + '"></ul>');
						}
						var i = 0;
						_.each(this.pa, function(subprocess) {
							var liID = ulId + '_li_' + i++;
							if (subprocess.id === undefined)
								subprocess.id = liID;
							el.find("#" + ulId).append('<li class="processarea menuitem" id="' + liID + '"><a class="menuTitle" href="#">' + subprocess.title + '</a></li>');
							subprocess.load(el.find('#' + liID + '.processarea.menuitem'), level + 1);
						});
					}
				}
			};
		},

		ActivityMenu : function(name, style, title, url, img) {
			this.name = name;
			this.style = style;
			this.title = title;
			this.url = url;
			this.img = img;

			this.load = function(el, displayAsIcons) {
				this.title = this.title.replace("[CR]", "<br />");
				if (displayAsIcons === true) {
					el.append('<li><div class="icon navContainer"><a class="nav-' + this.name.replace(/\./g, "-") + "-" + this.style.replace(/\./g, "-") + ' navItem" href="' + this.url + '"></a><a class="navText" href="' + this.url + '">' + this.title + '</a></div></li>');
				}
				else {
					el.append('<li class="activity">' + '<a href=\'' + this.url + '\'>' + this.title + '</a>' + '</li>');
				}
			};

		}

	};

});

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

function pop(ary, map) { // , name, key ) {

	for ( var i = 0; i < ary.length; i++) {
		if (_.reduce(map, function(memo, key) {
			return memo && (map.key === ary[i].key);
		}, true)) {
			var found = ary[i];
			ary.remove(i);
			return found;
		}
	}
	return null;
}

function isVisibleOnScreen(elem) {
	var $window = $(window)
	var viewport_top = $window.scrollTop()
	var viewport_height = $window.height()
	var viewport_bottom = viewport_top + viewport_height
	var $elem = $(elem)
	var top = $elem.offset().top
	var height = $elem.height()
	var bottom = top + height

	return (top >= viewport_top && top < viewport_bottom) || (bottom > viewport_top && bottom <= viewport_bottom) || (height > viewport_height && top <= viewport_top && bottom >= viewport_bottom)
}

function supports_history_api() {
	return !!(window.history && history.pushState);
}

function escapeBadCharForURL(data) {
	if (!data)
		return "";
	var escapedStr = data.replace(/\//g, ' ');
	escapedStr = escapedStr.replace(/\+/g, ' ');
	escapedStr = escapedStr.replace(/#/g, ' ');
	escapedStr = escapedStr.replace(/%/g, ' ');
	escapedStr = escapedStr.replace(/ /g, '-'); // replace space y dash
	return escapedStr;
}

function escapeHTML(data) {
	if (!data)
		return "";
	return data.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getObjectSortAscendingFunction(attribute) {
	return function(a, b) {
		var nameA = a[attribute].toLowerCase();
		var nameB = b[attribute].toLowerCase();
		if (nameA < nameB) // sort string ascending
			return -1
		if (nameA > nameB)
			return 1
		return 0 // default return value (no sorting)
	};
}

function addPlaceHolderCapabilities() {
	if (!Modernizr.input.placeholder) {

		$('[placeholder]').focus(function() {
			var i = $(this);
			if (i.val() == i.attr('placeholder')) {
				i.val('').removeClass('placeholder');
				if (i.hasClass('password')) {
					i.removeClass('password');
					if (!$.browser.msie || ($.browser.msie && $.browser.version.substr(0, 1) > 8)) {
						this.type = 'password';
					}
				}
			}
		}).blur(function() {
			var i = $(this);
			if (i.val() === '' || i.val() == i.attr('placeholder')) {
				if (this.type == 'password') {
					i.addClass('password');
					if (!$.browser.msie || ($.browser.msie && $.browser.version.substr(0, 1) > 8)) {
						this.type = 'text';
					}
				}
				i.addClass('placeholder').val(i.attr('placeholder'));
			}
		}).blur().parents('form').submit(function() {
			$(this).find('[placeholder]').each(function() {
				var i = $(this);
				if (i.val() == i.attr('placeholder'))
					i.val('');
			});
		});

	}
}

function eliminateDuplicates(arr) {
	var i, len = arr.length, out = [], obj = {};
	for (i = 0; i < len; i++) {
		obj[arr[i]] = 0;
	}
	for (i in obj) {
		out.push(i);
	}
	return out;
}

String.prototype.splice = function(idx, rem, s) {
	return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
};

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

Array.prototype.clone = function() {
	return JSON.parse(JSON.stringify(this));
};

if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(elt /* , from */) {
		var len = this.length;

		var from = Number(arguments[1]) || 0;
		from = (from < 0) ? Math.ceil(from) : Math.floor(from);
		if (from < 0)
			from += len;

		for (; from < len; from++) {
			if (from in this && this[from] === elt)
				return from;
		}
		return -1;
	};
}

String.prototype.endsWith = function(suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

XMLDocumentsToXMLString = function(xmlDoc) {
	if (window.ActiveXObject) {
		var str = xmlDoc.xml;
		return str;
	}
	// code for Mozilla, Firefox, Opera, etc.
	else {
		var str = (new XMLSerializer()).serializeToString(xmlDoc);
		return str;
	}
};

boolValue = function(val) {
	if (val === null || val === undefined || val.length === 0)
		return false;
	val = val.toUpperCase();
	if (val == "1" || val == "TRUE" || val == "Y" || val == "YES" || val == "ON" || val == "1.00" || val == "ENABLED")
		return true;
	return false;
};

boolString = function(val) {
	if (val)
		return "1";
	else
		return "0";
};

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

isImageValid = function(imagePath) {
	if (!imagePath)
		return false;

	imagePath = imagePath.replace(/\\/, '/');
	var idx = imagePath.lastIndexOf(".");
	if (idx >= 0) {
		imagePath = imagePath.substring(idx);
		if (imagePath.indexOf("/") > 0)
			return false;
		return true;
	}

	return false;
};

function createMailtoLink(emailAddress) {
	if (emailAddress == null)
		return '';
	return "<a href='mailto:" + emailAddress + "'>" + emailAddress + "</a>";
}

addDollar = function(price) {
	if (price == null || price == '')
		return '';
	return "$ " + price;
};

addPercent = function(number) {
	if (number == null || number == '')
		return '';
	return number + "%";
};

Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key))
			size++;
	}
	return size;
};

function getQueryParameterByName(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.search);
	if (results === null)
		return "";
	else
		return decodeURIComponent(results[1].replace(/\+/g, " "));
}

/* Assuming format is #name=value;name2=value2; */
function getQueryHashParameterByName(name) {
	var regex = new RegExp(name + "=([^;]*)");
	if (regex.test(window.location.hash)) {
		return RegExp.$1;
	}
	return null;

}

function loadjscssfile(filename, filetype) {
	if (filetype == "js") { // if filename is a external JavaScript file
		var fileref = document.createElement('script');
		fileref.setAttribute("type", "text/javascript");
		fileref.setAttribute("src", filename);
	}
	else if (filetype == "css") { // if filename is an external CSS file
		var fileref = document.createElement("link");
		fileref.setAttribute("rel", "stylesheet");
		fileref.setAttribute("type", "text/css");
		fileref.setAttribute("href", filename);
	}
	if (typeof fileref != "undefined")
		document.getElementsByTagName("head")[0].appendChild(fileref);
}

/**
 * Center a element with jQuery
 */
jQuery.fn.center = function(params) {

	var options = {

		vertical : true,
		horizontal : true

	};
	op = jQuery.extend(options, params);

	return this.each(function() {

		// initializing variables
		var $self = jQuery(this);
		// get the dimensions using dimensions plugin
		var width = $self.width();
		var height = $self.height();
		// get the paddings
		var paddingTop = parseInt($self.css("padding-top"));
		var paddingBottom = parseInt($self.css("padding-bottom"));
		// get the borders
		var borderTop = parseInt($self.css("border-top-width"));
		var borderBottom = parseInt($self.css("border-bottom-width"));
		// get the media of padding and borders
		var mediaBorder = (borderTop + borderBottom) / 2;
		var mediaPadding = (paddingTop + paddingBottom) / 2;
		// get the type of positioning
		var positionType = $self.parent().css("position");
		// get the half minus of width and height
		var halfWidth = (width / 2) * (-1);
		var halfHeight = ((height / 2) * (-1)) - mediaPadding - mediaBorder;
		// initializing the css properties
		var cssProp = {
			position : 'absolute'
		};

		if (op.vertical) {
			cssProp.height = height;
			cssProp.top = '50%';
			cssProp.marginTop = halfHeight;
		}
		if (op.horizontal) {
			cssProp.width = width;
			cssProp.left = '50%';
			cssProp.marginLeft = halfWidth;
		}
		// check the current position
		if (positionType == 'static') {
			$self.parent().css("position", "relative");
		}
		// aplying the css
		$self.css(cssProp);

	});

};

var keyStr = "ABCDEFGHIJKLMNOP" + "QRSTUVWXYZabcdef" + "ghijklmnopqrstuv" + "wxyz0123456789+/" + "=";

function encode64(input) {
	if (input == undefined)
		return undefined;
	var output = "";
	var chr1, chr2, chr3 = "";
	var enc1, enc2, enc3, enc4 = "";
	var i = 0;

	do {
		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);

		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;

		if (isNaN(chr2)) {
			enc3 = enc4 = 64;
		}
		else if (isNaN(chr3)) {
			enc4 = 64;
		}

		output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
		chr1 = chr2 = chr3 = "";
		enc1 = enc2 = enc3 = enc4 = "";
	} while (i < input.length);

	return output;
}

function decode64(input) {
	if (input == undefined)
		return undefined;
	var output = "";
	var chr1, chr2, chr3 = "";
	var enc1, enc2, enc3, enc4 = "";
	var i = 0;

	// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
	var base64test = /[^A-Za-z0-9\+\/\=]/g;
	if (base64test.exec(input)) {
		alert("There were invalid base64 characters in the input text.\n" + "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" + "Expect errors in decoding.");
	}
	input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

	do {
		enc1 = keyStr.indexOf(input.charAt(i++));
		enc2 = keyStr.indexOf(input.charAt(i++));
		enc3 = keyStr.indexOf(input.charAt(i++));
		enc4 = keyStr.indexOf(input.charAt(i++));

		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;

		output = output + String.fromCharCode(chr1);

		if (enc3 != 64) {
			output = output + String.fromCharCode(chr2);
		}
		if (enc4 != 64) {
			output = output + String.fromCharCode(chr3);
		}

		chr1 = chr2 = chr3 = "";
		enc1 = enc2 = enc3 = enc4 = "";

	} while (i < input.length);

	return unescape(output);
}

function getPageUrl(page) {
	var url = '';
	if (window.config._formmappingFormat && window.config._formmappingFormat.indexOf('[p]') != -1)
		url = window.config._formmappingFormat.replace('[p]', page);
	else
		url = page;
	return url;
}

function getSiteUrl() {
	var url = '';
	if (window.config._homepage)
		url = '/' + getPageUrl(window.config._homepage);
	else
		url = '/';
		
	return url;
}

(function($) {
	$.fn.getAttributes = function() {
		var attributes = {};

		if (!this.length)
			return this;

		$.each(this[0].attributes, function(index, attr) {
			attributes[attr.name] = attr.value;
		});

		return attributes;
	};

	$.fn.vAlign = function(myDefaultHeight) {
		return this.each(function(i) {
			var ah = $(this).height() || myDefaultHeight;
			var ph = $(this).parent().height();
			var mh = Math.ceil((ph - ah) / 2);
			$(this).css('margin-top', mh);
		});
	};
})(jQuery);

/* Adding placeHolder capabilities if not available */
$(function() {

	addPlaceHolderCapabilities();

});

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
	window.expanz.Views = {};

	window.expanz.Views.FieldView = Backbone.View.extend({

		initialize : function() {
			this.model.bind("change:label", this.modelUpdate('label'), this);
			this.model.bind("change:value", this.modelUpdate('value'), this);
			this.model.bind("change:items", this.modelUpdate('value'), this);
			this.model.bind("change:errorMessage", this.displayError(), this);
			this.model.bind("change:loading", this.loading, this);
		},

		modelUpdate : function(attr) {
			var view = this;
			return function() {
				var elem = this.el.find('[attribute=' + attr + ']');
				updateViewElement(view, elem, this.model.attributes, attr);
				this.el.trigger('update:field');
			};
		},

		displayError : function() {
			return function() {
				var errorId = 'error' + this.model.get('id').replace(/\./g, "_");
				if (this.el.attr('showError') !== 'false') {
					if (this.model.get('errorMessage') !== undefined) {
						var errorEl = this.el.find('#' + errorId);
						if (errorEl.length < 1) {
							this.el.append('<p class="errorMessage" onclick="javascript:$(this).hide();" style="display:inline" id="' + errorId + '"></p>');
							errorEl = this.el.find('#' + errorId);
						}
						errorEl.html(this.model.get("errorMessage"));
						errorEl.show();
						errorEl.css('display', 'inline');
						this.el.addClass("errorField");
						// window.expanz.logToConsole("showing error : " + this.model.get("errorMessage"));
					}
					else {
						var errorEl = this.el.find('#' + errorId);
						if (errorEl) {
							errorEl.hide();
						}
						this.el.removeClass("errorField");
						// window.expanz.logToConsole("hiding error message");
					}
				}

			};
		},

		events : {
			"change [attribute=value]" : "viewUpdate"
		},

		getValue : function() {
			var elem = this.el.find('[attribute=value]');

			var value = null;
			// handle checkbox field case
			if ($(elem).is(":checkbox")) {
				var checkedValue = $(elem).attr("checkedValue") !== undefined ? $(elem).attr("checkedValue") : 1;
				var uncheckedValue = $(elem).attr("uncheckedValue") !== undefined ? $(elem).attr("uncheckedValue") : 0;
				value = $(elem).prop("checked") ? checkedValue : uncheckedValue;
			}
			else {
				value = $(elem).val();
			}
			return value;

		},

		viewUpdate : function(event) {
			// handle multi-choices
			if (this.model.get('items') !== undefined && this.model.get('items').length > 0) {
				this.model.update({
					value : (event.target.checked ? 1 : -1) * (event.target.value)
				});
			}
			else {
				this.model.update({
					value : this.getValue()
				});
			}

			this.el.trigger('update:field');
		},

		loading : function() {
			/* nothing special done when a field is loading at the moment */
		}

	});

	window.expanz.Views.DependantFieldView = Backbone.View.extend({

		initialize : function() {
			this.model.bind("change:value", this.toggle, this);
			this.el.hide();
		},

		toggle : function() {
			var elem = this.el.find('[attribute=value]');
			updateViewElement(this, elem, this.model.get('value'));

			if (this.model.get('value').length > 0) {
				this.el.show('slow');
			}
			else {
				this.el.hide('slow');
			}
		}

	});

	window.expanz.Views.MethodView = Backbone.View.extend({
		initialize : function() {
			this.model.bind("change:loading", this.loading, this);
		},

		events : {
			"click [attribute=submit]" : "submit"
		},

		submit : function() {
			this.model.submit();
			this.el.trigger('submit:' + this.model.get('id'));
		},

		loading : function() {
			// window.expanz.logToConsole('method loading ' + this.model.get('id'));
			if (this.model.get('loading') === true) {
				if (this.el.is(":button")) {
					this.el.attr('disabled', 'disabled');
				}
				else {
					this.el.find("button").attr('disabled', 'disabled');
				}
				this.el.addClass('methodLoading');
			}
			else {
				if (this.el.is(":button")) {
					this.el.removeAttr('disabled');
				}
				else {
					this.el.find("button").removeAttr('disabled');
				}
				this.el.removeClass('methodLoading');
			}

		}

	});

	window.expanz.Views.ContextMenuView = window.expanz.Views.MethodView.extend({
		initialize : function() {
			this.model.bind("change:data", this.modelUpdate, this);
		},

		_createMenu : function(xml, parentUL) {
			var that = this;
			var i = 0;
			xml.children("Menu").each(function() {
				var ulId = parentUL.id + "_" + i++;
				parentUL.append("<li>" + $(this).attr('name') + "<ul id='" + ulId + "'><ul></li>");
				that._createMenu($(this), parentUL.find("#" + ulId));
			});

			var j = 0;
			xml.children("MenuItem").each(function() {
				var liId = parentUL.id + "_li_" + j++;
				parentUL.append("<li id='" + liId + "' action='" + $(this).attr('action') + "'>" + $(this).attr('text') + "</li>");
				var liEL = parentUL.find("#" + liId);
				liEL.click(function() {
					that.model.menuItemSelected($(this).attr("action"));
					that.contextMenuEl.hide();
				});
			});
		},
		modelUpdate : function() {
			/* retrieve or create a div to host the context menu */
			// window.expanz.logToConsole("modelUpdated");
			if (this.contextMenuEl === undefined) {
				var contextMenuId = this.model.get('id').replace(/\./g, "_") + "_contextMenu";
				this.el.append("<div class='contextMenu' id='" + contextMenuId + "' />");
				this.contextMenuEl = this.el.find("#" + contextMenuId);
			}
			this.contextMenuEl.hide();
			this.contextMenuEl.html("");

			var data = this.model.get('data');
			if (data === undefined || data == null)
				return;

			/* position menu below button */
			var pos = this.el.find("button").position();

			var top = pos.top + this.el.find("button").outerHeight() + 2;

			this.contextMenuEl.css({
				position : "absolute",
				top : top + "px",
				left : (pos.left + 10) + "px"
			});

			/* append data to the menu */
			this.contextMenuEl.append("<ul id='" + this.contextMenuEl.id + "_ul'></ul>");
			this._createMenu(data, this.contextMenuEl.find("ul"));
			this.createContextMenu();

			/* hide if clicked outside */
			var that = this;

			this.mouseInside = true;
			this.contextMenuEl.hover(function() {
				that.mouseInside = true;
			}, function() {
				that.mouseInside = false;
			});

			$("body").bind('mouseup.' + that.contextMenuEl.id, function() {
				if (!that.mouseInside) {
					that.contextMenuEl.hide();
					$("body").unbind('mouseup.' + that.contextMenuEl.id);
				}
			});
		},
		submit : function() {
			/* register current context menu */
			// window.expanz.logToConsole("Registering current context menu");
			window.expanz.currentContextMenu = this.model;
			this.model.submit();
			this.el.trigger('submit:' + this.model.get('id'));
		},

		/* must be overidden if a custom context menu is wanted */
		createContextMenu : function() {
			this.contextMenuEl.show();
		}

	});

	window.expanz.Views.GridView = Backbone.View.extend({

		initialize : function() {
			this.model.bind("update:grid", this.render, this);
			this.bind("rowClicked", this.rowClicked, this);
			this.bind("rowDoubleClicked", this.rowDoubleClicked, this);
			this.bind("actionClicked", this.actionClicked, this);
			this.bind("menuActionClicked", this.menuActionClicked, this);
		},

		rowClicked : function(row) {
			if (row.attr('id') != this.selectedId) {
				this.selectedId = row.attr('id');
				this.model.updateRowSelected(this.selectedId, row.attr('type'));
			}
		},

		rowDoubleClicked : function(row) {
			this.model.updateRowDoubleClicked(row.attr('id'), row.attr('type'));
		},

		actionClicked : function(id, name, params, actionEl) {
			actionEl.attr('disabled', 'disabled');
			actionEl.addClass('actionLoading');
			this.model.actionSelected(id, name, params);
		},

		menuActionClicked : function(id, name, params) {
			this.model.menuActionSelected(id, name, params);
		},

		renderPagingBar : function(currentPage, itemsPerPage, hostEl, currentSortField, currentSortAsc) {
			var pagingBar = "";

			var nbItems = this.model.getAllRows().length;
			if (nbItems > 0) {
				var nbPages = Math.ceil(nbItems / itemsPerPage);
				if (nbPages > 1) {
					if ($(hostEl).is('table')) {
						hostEl.append("<tr class='paging'><td id='pagingBar' colspan='100%'></td></tr>");
					}
					else {
						hostEl.append("<div id='pagingBar' class='paging'></div>");
					}

					var pagingBar = hostEl.find("#pagingBar");
					for ( var i = 0; i < nbPages; i++) {
						var inputId = this.model.getAttr('id') + "BtnPage" + i;
						var disabled = "";
						if (i == currentPage)
							disabled = " disabled='disabled'";

						pagingBar.append("<input id='" + inputId + "' type='button' value='" + (i + 1) + "' " + disabled + " />");

						var that = this;
						$(pagingBar).find("#" + inputId).click(function() {
							that.renderWithPaging(this.value - 1, itemsPerPage, currentSortField, currentSortAsc);
						});
					}
				}

			}
		},

		renderWithPaging : function(currentPage, itemsPerPage, currentSortField, currentSortAsc) {
			// window.expanz.logToConsole("GridView rendered for page " + currentPage);

			var rows = this.model.getAllRows();
			var firstItem = parseInt(currentPage * itemsPerPage);
			var lastItem = Math.min(firstItem + parseInt(itemsPerPage), rows.length);

			var hasItem = (lastItem > firstItem);

			var hostEl;
			var hostId = this.model.getAttr('id') + "_host";

			var templateName = this.options['templateName'] || this.model.getAttr('id') + "ItemTemplate";
			var wrapperElement = this.options['isHTMLTable'] == "true" ? 'table' : 'div';
			var enableConfiguration = this.options['enableConfiguration'] ? boolValue(this.options['enableConfiguration']) : false;
			var noItemText = this.options['noItemText'] || '';
			var nbItemsPerPageText = this.options['nbItemsPerPageText'] || 'Items per page';

			var headerTemplate = $("#" + templateName + "Header");
			var itemTemplate = $("#" + templateName);
			/* check if an item template has been defined */
			if (itemTemplate && itemTemplate.length > 0) {

				/* create a div to host our grid if not existing yet */
				hostEl = this.el.find(wrapperElement + '#' + hostId);
				if (hostEl.length < 1) {
					this.el.append('<' + wrapperElement + ' id="' + hostId + '"></' + wrapperElement + '>');
					hostEl = this.el.find(wrapperElement + '#' + hostId);
				}
				$(hostEl).html('');
				$(hostEl).parent().find("#" + hostId + "_Configuration").remove();

				if (!hasItem) {
					$(hostEl).addClass("emptyGrid");
					$(hostEl).removeClass("nonEmptyGrid");
					$(hostEl).append('<div id="noItemText" class="emptyListText">' + noItemText + '</div>');
				}
				else {
					$(hostEl).addClass("nonEmptyGrid");
					$(hostEl).removeClass("emptyGrid");

					/* datagrid/list configuration (nb items per page, sorting as combo box) */
					if (enableConfiguration) {
						$(hostEl).parent().prepend('<div id="' + hostId + '_Configuration"></div>');
						$confEl = $(hostEl).parent().find("#" + hostId + "_Configuration");

						var itemsPerPageChoices = [
							10, 20, 50, 100
						];
						$confEl.append('<div class="ItemsPerPage" >' + nbItemsPerPageText + '<select id="' + hostId + '_Configuration_ItemsPerPage" name="ItemsPerPage">');
						var selectEl = $confEl.find("#" + hostId + "_Configuration_ItemsPerPage");
						for ( var i = 0; i < itemsPerPageChoices.length; i++) {
							var defString = itemsPerPage == itemsPerPageChoices[i] ? ' selected="selected" ' : '';
							selectEl.append('<option ' + defString + ' value="' + itemsPerPageChoices[i] + '">' + itemsPerPageChoices[i] + '</option>');
						}
						selectEl.append('</select></div>');

						var that = this;
						selectEl.change(function() {
							that.renderWithPaging(currentPage, $(this).val(), currentSortField, !currentSortAsc)
						});
					}

					/* header template if defined */
					if (headerTemplate && headerTemplate.length > 0) {
						var that = this;
						$(hostEl).append(headerTemplate.html());
						$(hostEl).find("[sortField]").each(function() {
							var fieldName = $(this).attr('sortField');

							var defaultSorted = $(this).attr('defaultSorted');
							if (currentSortField == null && defaultSorted != null) {
								currentSortAsc = defaultSorted.toLowerCase() == 'desc' ? false : true;
								currentSortField = fieldName;
								that.model.sortRows(currentSortField, currentSortAsc);
								rows = that.model.getAllRows();
							}
							;

							$(this).addClass("sortable");
							if (fieldName == currentSortField) {
								if (currentSortAsc) {
									$(this).addClass("sortedAsc");
								}
								else {
									$(this).addClass("sortedDesc");
								}
							}

							$(this).click(function() {

								var sortAsc = true;
								if (fieldName == currentSortField) {
									sortAsc = !currentSortAsc;
								}
								/* sort and display again */
								that.model.sortRows(fieldName, sortAsc);
								that.renderWithPaging(0, itemsPerPage, fieldName, sortAsc);
							});
						});

					}

					/* create a wrapper for rows if not a table */
					var gridItems = $(hostEl);
					if (this.options['isHTMLTable'] != "true") {
						$(hostEl).append("<div class='gridItems'></div>");
						gridItems = $(hostEl).find(".gridItems");
					}

					var compiled = _.template(itemTemplate.html());
					var i;
					for (i = firstItem; i < lastItem; i++) {
						var row = rows[i];
						var result = compiled(row.getCellsMapByField());
						var itemId = this.model.getAttr('id') + "_" + row.getAttr('id');
						result = $(result).attr('id', itemId).attr('rowId', row.getAttr('id'));

						if (i === 0)
							result = $(result).addClass('first');
						if (i == (lastItem - 1))
							result = $(result).addClass('last');
						if (i % 2 === 1) {
							result = $(result).addClass('alternate');
							result = $(result).addClass('even');
						}
						else {
							result = $(result).addClass('odd');
						}

						/* add row id to prefix id for eventual user inputs */
						$(result).find("[id*='userinput_']").each(function() {
							$(this).attr('id', row.getAttr('id') + "_" + $(this).attr('id'));
						});

						gridItems.append(result);

						/* binding method from template */
						var that = this;
						gridItems.find("#" + itemId + " [methodName] ").each(function(index, element) {
							var action = that.model.getAction($(element).attr('methodName'));
							if (action && action.length > 0) {
								$(element).click(function() {
									var rowId = $(this).closest("[rowId]").attr('rowId');
									var actionParams = action[0].get('actionParams').clone();

									that._handleActionClick($(this), rowId, action[0].get('actionName'), actionParams, $(this).closest("[rowId]"));
								});
							}
						});

						/* trigger a method call if a user field include a change attribute */
						gridItems.find("#" + itemId + "  [autoUpdate] ").change(function(elem) {
							var action = that.model.getAction($(this).attr('autoUpdate'));
							if (action && action.length > 0) {
								var rowId = $(this).closest("[rowId]").attr('rowId');
								var actionParams = action[0].get('actionParams').clone();
								that._handleActionClick($(this), rowId, action[0].get('actionName'), actionParams, $(this).closest("[rowId]"));
							}
							else {
								window.expanz.logToConsole("autUpdate action not defined in formapping: " + $(this).attr('autoUpdate'));
							}
						});

						/* binding menuAction from template */
						hostEl.find("#" + itemId + " [menuAction] ").each(function(index, element) {
							var action = that.model.getAction($(element).attr('menuAction'));
							if (action && action.length > 0) {
								$(element).click(function() {
									var rowId = $(this).closest("[rowId]").attr('rowId');
									var actionParams = action[0].get('actionParams').clone();

									that._handleMenuActionClick(rowId, action[0].get('actionName'), actionParams, $(this).closest("[rowId]"));

								});
							}
						});
					}
				}
			}
			/* else normal table display */
			else {

				// set table scaffold
				hostEl = this.el.find('table#' + hostId);
				if (hostEl.length < 1) {
					this.el.append('<table class="grid" id="' + hostId + '"></table>');
					hostEl = this.el.find('table#' + hostId);
				}
				$(hostEl).html('<thead><tr></tr></thead><tbody></tbody>');

				// render column header
				var el = $(hostEl).find('thead tr');
				_.each(this.model.getAllColumns(), function(cell) {
					var html = '<th ';
					// html += cell.get('width') ? ' width="' + cell.get('width') + '"' : '';
					html += '>' + cell.get('label') + '</th>';
					el.append(html);
				});

				if (this.model.getAttr('hasActions')) {
					el.append('<th>actions</th>');
				}

				// render rows
				var model = this.model;
				el = $(hostEl).find('tbody');
				var i;
				for (i = firstItem; i < lastItem; i++) {
					var row = rows[i];
					var alternate = ((i - firstItem) % 2 == 1) ? 'class="gridRowAlternate"' : 'class="gridRow"';
					var html = '<tr id="' + row.getAttr('id') + '" type="' + row.getAttr('type') + '" ' + alternate + '>';

					var values = {};
					_.each(row.getAllCells(), function(cell) {
						html += '<td id="' + cell.get('id') + '" field="' + cell.get('field') + '" class="row' + row.getAttr('id') + ' column' + cell.get('id') + '">';
						if (model.getColumn(cell.get('id')) && model.getColumn(cell.get('id')).get('datatype') === 'BLOB') {
							html += '<img width="' + model.getColumn(cell.get('id')).get('width') + '" src="' + cell.get('value') + '"/>';
						}
						else if (cell.get('value')) {
							html += '<span>' + cell.get('value') + '</span>';
							values[cell.get('id')] = cell.get('value');
						}
						html += '</td>';
					}, row);

					if (this.model.getAttr('hasActions')) {
						html += '<td>';
						_.each(this.model.getActions(), function(cell) {
							var buttonId = model.getAttr('id') + "_" + row.getAttr('id') + "_" + cell.get('actionName');
							var actionParams = cell.get('actionParams');

							var userInputs = "";
							_.each(actionParams, function(actionParams) {
								var name = actionParams.name;
								var value = actionParams.value;
								var label = actionParams.label;

								if (value == '@userInput.textinput' || value == '@userInput.numericinput') {
									var format = (value == '@userInput.numericinput') ? 'numeric' : 'text';
									var bindValueFromCellId = actionParams.bindValueFromCellId;
									var inputValue = '';
									if (bindValueFromCellId) {
										inputValue = " value='" + values[bindValueFromCellId] + "' ";
									}
									userInputs += "<label for='" + row.getAttr('id') + "_userinput_" + name + "'>" + (label || name) + "</label><input class='gridUserInput' type='text' format='" + format + "' " + inputValue + " id='" + row.getAttr('id') + "_userinput_" + name + "'/>";
								}
							});
							html += "<div style='display:inline' name='" + cell.get('actionName') + "' actionParams='" + JSON.stringify(actionParams) + "' bind='" + cell.get('type') + "'> " + userInputs + " <button id='" + buttonId + "' attribute='submit'>" + cell.get('label') + "</button></div>";

						});
						html += '</td>';
					}
					html += '</tr>';
					el.append(html);
				}

				/* handle row click event */
				var onRowClick = function(event) {
					event.data.trigger("rowClicked", $(this));
				};

				/* handle double row click event */
				var onRowDoubleClick = function(event) {
					event.data.trigger("rowDoubleClicked", $(this));
				};

				$('table#' + hostId + ' tr').click(this, onRowClick);
				$('table#' + hostId + ' tr').dblclick(this, onRowDoubleClick);

				var that = this;
				/* handle button/actions click event */
				var onActionClick = function(event) {
					var rowId = $(this).closest("tr").attr('id');
					var parentDiv = $(this).parent();
					var methodName = parentDiv.attr('name');
					var actionParams = JSON.parse(parentDiv.attr('actionParams'));
					that._handleActionClick($(this), rowId, methodName, actionParams, parentDiv);
				};

				$('table#' + hostId + ' tr [bind=method] > button').click(this, onActionClick);

				/* handle menuAction click event */
				var onMenuActionClick = function(event) {
					var rowId = $(this).closest("tr").attr('id');
					var parentDiv = $(this).parent();
					var menuActionName = parentDiv.attr('name');
					var actionParams = JSON.parse(parentDiv.attr('actionParams'));
					that._handleMenuActionClick(rowId, menuActionName, actionParams, parentDiv);
				};

				$('table#' + hostId + ' tr [bind=menuAction] > button').click(this, onMenuActionClick);
			}

			this.renderPagingBar(currentPage, itemsPerPage, hostEl, currentSortField, currentSortAsc);

			$(hostEl).attr('nbItems', rows.length);

			if (this.model.getAttr('renderingType') == 'popupGrid') {
				var clientMessage = new expanz.Model.ClientMessage({
					id : hostId + 'PopUp',
					title : '',
					text : '',
					parent : this.model.getAttr('parent')
				});

				var picklistWindow = new window.expanz.Views.PopupView({
					id : clientMessage.id,
					model : clientMessage
				}, $('body'));

				picklistWindow.el.append(hostEl);
				picklistWindow.center();
			}
			else if (this.model.getAttr('renderingType') == 'rotatingBar') {
				this.renderAsRotationBar(hostEl, 3, 3, 0);
			}

			hostEl.trigger("table:rendered");

			return this;
		},

		renderAsRotationBar : function(el, itemPerPage, rotationStep, firstItem) {
			var totalItems = $(el).find("li.rotatingItem").length;
			var that = this;
			var elId = $(el).attr('id');

			$(el).find("li.rotatingItem").hide();

			var i = 0;

			$(el).find("li.rotatingItem").each(function() {

				if (i >= firstItem) {
					$(this).show();
				}
				i++;
				if ((i - firstItem) >= itemPerPage)
					return false;
			});

			if ($(el).find("#" + elId + "NextBtn").length == 0) {
				$(el).find("li.rotatingItem").last().after("<li class='rotatingButton'><button id='" + elId + "NextBtn'>></button></li>");
				$(el).find("#" + elId + "NextBtn").unbind("click");
			}
			if ($("#" + elId + "PrevBtn").length == 0) {
				$(el).find("li.rotatingItem").first().before("<li class='rotatingButton'><button  id='" + elId + "PrevBtn'><</button></li>");
				$(el).find("#" + elId + "PrevBtn").unbind("click");
			}

			/* show pre button if needed */
			if (firstItem > 0) {
				$(el).find("#" + elId + "PrevBtn").click(function() {
					that.renderAsRotationBar($(el), itemPerPage, rotationStep, Math.max(firstItem - rotationStep, 0));
				});
				$(el).find("#" + elId + "PrevBtn").show();
			}
			else {
				$(el).find("#" + elId + "PrevBtn").hide();
			}

			/* show next button if needed */
			if (i < totalItems) {
				$(el).find("#" + elId + "NextBtn").click(function() {
					that.renderAsRotationBar($(el), itemPerPage, rotationStep, Math.min(firstItem + rotationStep, totalItems - itemPerPage));
				});
				$(el).find("#" + elId + "NextBtn").show();
			}
			else {
				$(el).find("#" + elId + "NextBtn").hide();
			}
		},

		render : function() {

			var itemsPerPage = this.options['itemsPerPage'];
			if (!itemsPerPage || itemsPerPage <= 0) {
				itemsPerPage = 1000;
			}

			this.renderWithPaging(0, itemsPerPage);
			return this;
		},

		_handleActionClick : function(actionEl, rowId, methodName, actionParams, divEl) {
			var inputValid = true;
			/* handle user input */
			_.each(actionParams, function(actionParam) {
				var name = actionParam.name;
				if (actionParam.value == '@userInput.textinput' || actionParam.value == '@userInput.numericinput') {
					var valueInput = divEl.find("#" + rowId + "_userinput_" + name);
					if (valueInput.length > 0 && valueInput.val().length > 0) {
						actionParam.value = valueInput.val();
					}
					else {
						inputValid = false;
					}
				}
				else if (actionParam.value == '@contextId') {
					actionParam.value = rowId;
				}
			});

			if (inputValid)
				this.trigger("actionClicked", rowId, methodName, actionParams, actionEl);
		},

		_handleMenuActionClick : function(rowId, menuAction, actionParams, divEl) {
			/* handle user input */
			_.each(actionParams, function(actionParam) {
				var name = actionParam.name;
				if (actionParam.value == '@contextId') {
					actionParam.value = rowId;
				}
			});

			this.trigger("menuActionClicked", rowId, menuAction, actionParams);
		}

	});

	window.expanz.Views.LoginView = Backbone.View.extend({

		initialize : function() {
		},

		events : {
			"click [type*='submit']" : "attemptLogin"
		},

		attemptLogin : function() {
			var usernameEl = this.el.find("#username input");
			var passwordEl = this.el.find("#password input");

			if (usernameEl.length === 0 || passwordEl.length === 0) {
				expanz.messageController.addErrorMessageByText("username or password field cannot be found on the page");
				return;
			}

			if (usernameEl.val().length === 0 || passwordEl.val().length === 0) {
				expanz.messageController.addErrorMessageByKey("loginOrPasswordEmpty");
				return;
			}
			else {
				this.collection.add({
					id : "username",
					value : usernameEl.val()
				});
				this.collection.add({
					id : "password",
					value : passwordEl.val()
				});
				this.collection.login();
			}

		}

	});

	window.expanz.Views.ActivityView = Backbone.View.extend({

		initialize : function(attrs) {
			Backbone.View.prototype.initialize.call(attrs);
			if (attrs.key) {
				this.key = attrs.key;
			}
			this.collection.bind("error", this.updateError, this);
			this.collection.bind("update:loading", this.loading, this);
			this.collection.bind("update:deltaLoading", this.deltaLoading, this);
		},

		updateError : function(model, error) {
			expanz.messageController.addErrorMessageByText(error);
		},

		events : {
			"update:field" : "update"
		},

		update : function() {
			// perform full activity validation after a field updates ... if
			// necessary
		},

		loading : function() {
			var loadingId = "Loading_" + this.id.replace(/\./g, "_");
			var loadingEL = $(this.el).find("#" + loadingId);
			if (loadingEL.length === 0) {
				$(this.el).append('<div class="loading" id="' + loadingId + '"><span>Loading content, please wait.. <img src="assets/images/loading.gif" alt="loading.." /></span></div>');
				loadingEL = $(this.el).find("#" + loadingId);
			}

			var isLoading = this.collection.getAttr('loading');
			if (isLoading) {
				var off = this.el.offset();
				/* set the loading element as a mask on top of the div to avoid user doing any action */
				$(this.el).addClass('activityLoading');
				loadingEL.css("position", "absolute"); /* parent need to be relative //todo enfore it ? */
				loadingEL.css('width', '100%');
				loadingEL.css('height', '100%');
				loadingEL.css('margin', '0');
				loadingEL.css('padding', '0');
				loadingEL.css('top', '0px');
				loadingEL.css('left', '0px');
				loadingEL.css('z-index', '999');
				loadingEL.css('overflow', 'hidden');
				loadingEL.find("span").center();
				loadingEL.css('background', 'url(data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==) center');

				loadingEL.show();
			}
			else {
				$(this.el).removeClass('activityLoading');
				loadingEL.hide();
			}

		},

		deltaLoading : function() {
			var deltaLoading = this.collection.getAttr('deltaLoading');

			var initiatorID = deltaLoading.initiator.id;
			var initiatorType = deltaLoading.initiator.type;

			var initiator = this.collection.get(initiatorID);
			if (initiator) {
				// window.expanz.logToConsole("delta method loading " + deltaLoading.isLoading + " " + initiatorID);
				initiator.set({
					loading : deltaLoading.isLoading
				});
			}
			else {
				/* most probably coming from a grid/list view */
				/* in that case the button has already been set in a loading state so we just switch it back to normal when loading is finished */
				if (initiatorType == 'method' && !deltaLoading.isLoading) {
					/* can be either a element with methodName or a name */
					var actionSelector = ".actionLoading[methodName='" + initiatorID + "'], [name='" + initiatorID + "'] .actionLoading, .actionLoading[autoUpdate='" + initiatorID + "']";
					var dataControlEl = this.el.find(actionSelector).first().closest("[bind='DataControl']");
					if (dataControlEl && dataControlEl.length > 0) {
						dataControlEl.find(actionSelector).removeAttr('disabled');
						dataControlEl.find(actionSelector).removeClass('actionLoading');
					}
				}
			}
		}

	});

	window.expanz.Views.DataControlView = Backbone.View.extend({

		initialize : function(attrs) {
			Backbone.View.prototype.initialize.call(attrs);
			this.model.bind("update:xml", this.publishData, this);
		},

		itemSelected : function(itemId, callbacks) {
			this.model.updateItemSelected(itemId, callbacks);
		},

		publishData : function() {
			this.el.trigger("publishData", [
				this.model.getAttr('xml'), this
			]);
		}

	});

	window.expanz.Views.CheckboxesView = expanz.Views.DataControlView.extend({
		publishData : function() {
			/* clean elements */
			this.el.html();
			var that = this;
			/* no external component needed just have to draw the checkboxes and handle the clicks */

			_.each(this.model.getAttr('xml').find('Row'), function(row) {
				var rowId = $(row).attr('id');
				var selected = boolValue($(row).attr('selected')) === true ? ' checked="checked" ' : '';
				_.each($(row).find('Cell'), function(cell) {
					var text = $(cell).text();
					var id = that.model.id.replace(/\./g, "_") + "_" + rowId;
					that.el.append("<div><input " + selected + " id='" + id + "' value='" + rowId + "' name='checkbox' type='checkbox'></input><span>" + text + "</span></div>");

					/* handle checkboxes click */
					$(that.el).find("#" + id).click(function() {
						// window.expanz.logToConsole(that.model.id + " filtered with " + $(this).val());
						/* send negative value of id to say it has been unselected */
						var val = $(this).val();
						if (!$(this).is(":checked")) {
							val = -val;
						}
						/* send the delta to the server */
						that.model.updateItemSelected(val);
					});

				});
			});

		}

	});

	window.expanz.Views.RadioButtonsView = expanz.Views.DataControlView.extend({
		publishData : function() {
			/* clean elements */
			this.el.html();
			var that = this;
			/* no external component needed just have to draw the checkboxes and handle the clicks */

			_.each(this.model.getAttr('xml').find('Row'), function(row) {
				var rowId = $(row).attr('id');
				var selected = boolValue($(row).attr('selected')) === true ? ' checked="checked" ' : '';
				_.each($(row).find('Cell'), function(cell) {
					var text = $(cell).text();
					var id = that.model.id.replace(/\./g, "_") + "_" + rowId;
					that.el.append("<div><input " + selected + " id='" + id + "' value='" + rowId + "' name='radio' type='radio'></input><span>" + text + "</span></div>");

					/* handle radio button click */
					$(that.el).find("#" + id).click(function() {
						/* send the delta to the server */
						that.model.updateItemSelected($(this).val());
					});

				});
			});

		}

	});

	window.expanz.Views.PopupView = Backbone.View.extend({

		width : 'auto',

		cssClass : 'popupView',

		divAttributes : '',

		initialize : function(attrs, containerjQ) {
			Backbone.View.prototype.initialize.call(attrs);
			this.create(containerjQ);
			this.renderActions();
			this.delegateEvents(this.events);

			/* find the parent popup -> it is the first parentPopup visible */
			if (window.expanz.currentPopup !== undefined) {
				this.parentPopup = window.expanz.currentPopup;
				while (!$(this.parentPopup.el).is(":visible")) {
					if (this.parentPopup.parentPopup === undefined) {
						this.parentPopup = undefined;
						break;
					}
					this.parentPopup = this.parentPopup.parentPopup;
				}

			}
			window.expanz.currentPopup = this;

		},

		events : {
			"click button" : "buttonClicked"
		},

		renderActions : function() {

		},

		create : function(containerjQ) {
			// window.expanz.logToConsole("render popupWindow");
			var popupWindow = containerjQ.find('#' + this.id);
			if (popupWindow.length > 0) {
				popupWindow.remove();
			}

			var content = '';
			if (this.model.getAttr('text') !== undefined && this.model.getAttr('text').length > 0) {
				content = this.model.getAttr('text');
			}

			containerjQ.append("<div class='" + this.cssClass + "' id='" + this.id + "' " + this.divAttributes + " name='" + this.id + "'>" + content + "</div>");
			this.el = containerjQ.find('#' + this.id);
			this.createWindowObject();

			if (this.model.getAttr('url') !== undefined && this.model.getAttr('url').length > 0) {
				var url = this.model.getAttr('url');
				var that = this;
				this.el.load(url, function() {
					that.center();
					that.trigger('contentLoaded');
				});
			}
			else {
				this.center();
			}

		},

		/* must be redefined depending on the pluggin used */
		createWindowObject : function() {
			this.el.dialog({
				modal : true,
				width : this.width,
				title : this.model.getAttr('title')
			});
		},

		buttonClicked : function() {
			this.closeWindow();
		},

		closeWindow : function() {
			this.trigger('popupClosed');
			this.close();
		},

		/* may be redifined depending on the pluggin used */
		close : function() {
			this.remove();
		},

		/* may be redifined depending on the pluggin used */
		center : function() {
			this.el.dialog("option", "position", 'center');
		}

	});

	window.expanz.Views.PicklistWindowView = window.expanz.Views.PopupView.extend({
		divAttributes : " bind='DataControl' renderingType='grid' ",
		cssClass : 'pickListPopup popupView'
	});

	window.expanz.Views.UIMessage = window.expanz.Views.PopupView.extend({

		width : '500px',

		cssClass : 'uiMessage popupView',

		renderActions : function() {
			this.model.each(function(action) {
				if (this.el.find("[attribute=submit]").length === 0) {
					this.el.append("<br/>");
				}

				var divId = action.id;

				if (action.id == 'close') {
					divId += action.get('label').split(' ').join('');
					this.el.append('<div style="float:left"  bind="method" name="close" id="' + divId + '">' + '<button attribute="submit">' + action.get('label') + '</button>' + '</div>');
				}
				else if (action.id !== this.model.id) {
					this.el.append('<div style="float:left" bind="method" name="' + action.id + '" id="' + divId + '">' + '<button attribute="submit">' + action.get('label') + '</button>' + '</div>');
					var methodView = new expanz.Views.MethodView({
						el : $('div#' + action.id, this.el),
						id : action.id,
						model : action
					});
				}

				/* if response data are present we have to send it during the click event as well */
				if (action.get('response') !== undefined) {
					var button = this.el.find('#' + divId + ' button');
					var that = this;

					button.click(function() {
						that.postCloseActions(that.model.getAttr('title'));

						if (action.get('response').find("closeWindow")) {
							if (that.parentPopup !== undefined) {
								that.parentPopup.close();
							}
							else {
								window.expanz.logToConsole("Cannot find parent popup");
							}
						}

					});
				}

			}, this);

		},
		postCloseActions : function(windowTitle) {
			if (windowTitle == "Order Submitted" || windowTitle == "Order Saved") {
				/* clear activity cookies and reload the page */
				window.expanz.Storage.clearActivityHandles();
				$("body").trigger("CheckoutFinished");
			}
		}
	});

	window.expanz.Views.ManuallyClosedPopup = window.expanz.Views.UIMessage.extend({
		width : 'auto',

		/* do not close on button click */
		buttonClicked : function() {
		}
	});

	// Public Functions
	window.expanz.Views.redirect = function(page) {
		window.location.href = getPageUrl(page);
	};

	window.expanz.Views.requestLogin = function() {
		/* if redirection to login page store the last page to be able to redirect the user once logged in */
		window.expanz.Storage.setLastURL(document.URL);
		window.expanz.Views.redirect(expanz.getLoginPage());
	};

	// Private Functions

	function updateViewElement(view, elem, allAttrs, attr) {
		var datatype = allAttrs['datatype'];
		if (datatype && datatype.toLowerCase() === 'blob' && attr && attr === 'value') {
			var width = allAttrs['width'];
			var imgElem = '<img src="' + window.config._URLblobs + allAttrs['value'] + '"';
			imgElem += width ? ' width="' + width + '"' : 'width="100%"';
			imgElem += '/>';
			$(elem).html(imgElem);
			return;
		}

		var value;
		if ($(elem).attr("showTextValue") == "true") {
			value = allAttrs["text"];
		}
		else {
			value = allAttrs[attr];
		}

		if (view.options['textTransformFunction'] && attr === 'value') {
			try {
				value = eval(view.options['textTransformFunction'])(value);
			} catch (err) {
				window.expanz.logToConsole("Value could not be transformed with function (check function exists) " + view.options['textTransformFunction']);
			}

		}

		/* multi choice field -> display as checkboxes */
		if (allAttrs.items !== undefined && allAttrs.items.length > 0 && attr === 'value') {
			var disabled = boolValue(elem.attr('editable')) ? "" : "disabled='disabled'";
			_.each(allAttrs.items, function(item) {
				var selected = boolValue($(item).attr('selected')) === true ? ' checked="checked" ' : '';
				var text = $(item).attr('text');
				var value = $(item).attr('value');
				$(elem).append("<div><input " + disabled + selected + "' value='" + value + "' name='checkbox' type='checkbox'></input><span>" + text + "</span></div>");
			});
		}
		else {
			if ($(elem).is('input')) {
				// special behaviour for checkbox input
				if ($(elem).is(":checkbox") || $(elem).is(":radio") ) {
					$(elem).addClass('checkbox');
					var checkedValue = $(elem).attr("checkedValue") ? $(elem).attr("checkedValue") : 1;
					if (value == checkedValue) {
						$(elem).prop("checked", true);
					}
					else {
						$(elem).prop("checked", false);
					}
				}
				else {
					$(elem).val(value);
				}
				$(elem).trigger("valueUpdated", value);

				// if the field is disable apply the disabled attribute and style
				if (allAttrs["disabled"] === true) {
					$(elem).attr('disabled', 'disabled');
					$(elem).addClass('readonlyInput');
				}
				else {
					$(elem).removeAttr('disabled');
					$(elem).removeClass('readonlyInput');
				}
			}
			else {
				/* if value is empty put an unbreakable space instead */
				$(elem).html(value || '&nbsp;');
			}
		}
		return elem;
	}

});

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

	//
	// Global Namespace definitions
	//
	window.App = [];
	window.expanz = window.expanz || {};
	window.expanz.helper = window.expanz.helper || {};
	window.expanz.Storage = window.expanz.Storage || {};

	window.expanz.logToConsole = function(message) {
		if (typeof (console) != "undefined" && console.log) {
			console.log(message);
		}
	};

	window.expanz.getLoginPage = function() {
		//var loginUrl = getPageUrl(window.config._loginpage);
		/* if login url is null try to guess it by removing the filename */
		//if (loginUrl === undefined) {
		//	loginUrl = document.location.pathname.substring(0, document.location.pathname.lastIndexOf("/"));
			/* if empty mean we are at the root of the website */
		//	if (loginUrl == "")
		//		loginUrl = "/";
		//}
		// window.expanz.logToConsole("getLoginURL : " + loginUrl);
		return window.config._loginpage ? window.config._loginpage : 'login';
	};

	window.expanz.getMaintenancePage = function() {
		return window.config._maintenance ? window.config._maintenance : 'maintenance';
	};

	window.expanz.isOnMaintenance = function() {
		var maintenance = window.config.onMaintenance;
		if (maintenance === true) {
			return true;
		}
		return false;
	};

	window.expanz.messageController = {

		initialize : function() {

			/* load resource bundle */
			if (window.config._useBundle !== false) {
				jQuery.i18n.properties({
					name : 'Messages',
					path : 'assets/bundle/',
					mode : 'map',
					language : ' ', /* set to en to load Messages-en.properties as well, set to '' to load as well Messages-en-XX.properties - add to config.js if different for some customers */
					cache : true,
					callback : function() {
						// window.expanz.logToConsole("Bundle loaded");
					}
				});
			}
		},

		addErrorMessageByText : function(messageText) {
			this._addMessageByText(messageText, 'error');
		},

		addWarningMessageByText : function(messageText) {
			this._addMessageByText(messageText, 'warning');
		},

		addInfoMessageByText : function(messageText) {
			this._addMessageByText(messageText, 'info');
		},

		addSuccessMessageByText : function(messageText) {
			this._addMessageByText(messageText, 'success');
		},

		_addMessageByText : function(messageText, messageType) {
			if (window.config._useBundle === true) {
				/* find the key with regexp */
				if (typeof window.expanz.messageController.findKey != 'function') {
					window.expanz.logToConsole('You need to define window.expanz.messageController.findKey in your client implementation');
					return;
				}
				var data = window.expanz.messageController.findKey(messageText);
				if (data != null) {
					this._addMessageByKey(data['key'], data['data'], messageType, data['popup']);
				}
				else {
					if (window.config._showAllMessages === true && messageText != "") {
						this.displayMessage('[Displayed for debugging only]' + messageText, messageType);
					}
				}
			}
			else {
				this.displayMessage(messageText, messageType);
			}

		},

		/* server doesn't send key anymore so it will be for futur use */
		addErrorMessageByKey : function(messageKey, messageData) {
			this._addMessageByKey(messageKey, messageData, 'error');
		},

		addInfoMessageByKey : function(messageKey, messageData) {
			this._addMessageByKey(messageKey, messageData, 'info');
		},

		addWarningMessageByKey : function(messageKey, messageData) {
			this._addMessageByKey(messageKey, messageData, 'warning');
		},

		addSuccessMessageByKey : function(messageKey, messageData) {
			this._addMessageByKey(messageKey, messageData, 'success');
		},

		_addMessageByKey : function(messageKey, messageData, messageType, popup) {
			/* look for the key in message.properties file */
			var msg = jQuery.i18n.prop(messageKey, messageData);
			if (msg) {
				if (popup === true) {
					this.displayPopupMessage(msg, messageType);
				}
				else {
					this.displayMessage(msg, messageType);
				}
			}
			else {
				if (window.config._showAllMessages === true) {
					this.displayMessage('[Displayed for debugging only]' + messageKey + messageData, messageType);
				}
			}

		},

		displayMessage : function(message, type) {
			if (type == 'error') {
				this._basicMsgDisplay('[bind=message][type=error]')(message);
			}
			else if (type == 'warning') {
				this._basicMsgDisplay('[bind=message][type=error]')(message);
			}
			else if (type == 'info') {
				this._basicMsgDisplay('[bind=message][type=info]')(message);
			}
			else if (type == 'success') {
				this._basicMsgDisplay('[bind=message][type=success]')(message);
			}
			else {
				window.expanz.logToConsole('type ' + type + ' unknown for message ' + message);
			}
		},

		displayPopupMessage : function(message, type) {
			alert(message);
		},

		_basicMsgDisplay : function(el) {
			return function display(str) {

				var fade = true;
				if ($(el).attr('fade') && boolValue($(el).attr('fade')) === false) {
					fade = false;
				}

				if (str instanceof Array) {
					str = str.join("<br/>");
				}

				var msgDisplayedInPopup = false;

				/* display the message in the popup instead if visible */
				if (window.expanz.currentPopup !== undefined && $(window.expanz.currentPopup.el).is(":visible")) {
					var popupEl = window.expanz.currentPopup.el.find(el);
					if (popupEl) {
						msgDisplayedInPopup = true;
						popupEl.find('[attribute=value]').html(str);
						if (!str || str.length < 1) {
							$(popupEl).hide('slow');
						}
						else {
							$(popupEl).show(1, function() {
								if (fade) {
									$(popupEl).delay(5000).hide(1);
								}
							});
						}
					}
				}

				if (!msgDisplayedInPopup) {
					if ($(el).find('[attribute=value]').length > 0) {
						if (str && str.length > 0) {
							// check if message already displayed
							var existingMsgEl = null;
							if ($(el).find('div:contains("' + str + '")').length > 0) {
								existingMsgEl = $(el).find('div:contains("' + str + '")')[0];
								$(existingMsgEl).remove();
							}
							// make the error div visible
							$(el).show();
							// push the new message a div in the error div (will fade and be removed automatically after 5 sec)
							var newErrorId = 'msg_' + new Date().getTime();
							var divMessage = "<div id='" + newErrorId + "' class='message_item' style='display:none'>" + str + "</div>";
							$(el).find('[attribute=value]').append(divMessage);

							var messageItem = $(el).find("#" + newErrorId);

							//TODO Commented out, not working very well, need to find a better solution
							// check if el is visible in the screen if not fix it to top of the visible page
							/*if (!isVisibleOnScreen($(el))) {
								// var top = document.body.scrollTop;
								$(el).parent().css('top', "0px");
								$(el).parent().css('position', 'fixed');
								$(el).parent().css('z-index', '10000');
							}
							else {
								$(el).parent().css('top', '');
								$(el).parent().css('position', '');
							}*/

							messageItem.show();

							messageItem.slideDown(100, function() {
								if (fade) {
									messageItem.delay(5000).slideUp(800, function() {
										messageItem.remove();
										// if it was the last message in the message notification area, we hide the notification area.
										if ($(el).find("div").length == 0) {
											$(el).hide();
										}
									});
								}
							});
						}
						else {
							if (!fade) {
								$(el).hide();
							}
						}
					}
				}
			};
		}

	};

	//
	// Public Functions & Objects in the Expanz Namespace
	//
	window.expanz.CreateActivity = function(DOMObject, callbacks, initialKey) {

		DOMObject || (DOMObject = $('body'));

		var activities = createActivity(DOMObject, callbacks, initialKey);
		_.each(activities, function(activity) {
			window.App.push(activity);
		});
		return activities;
	};

	window.expanz.CreateLogin = function(DOMObject, callbacks) {

		DOMObject || (DOMObject = $('body'));

		var login = createLogin(DOMObject, callbacks);
		return;
	};

	// window.expanz.DestroyActivity = function(DOMObject) {
	//
	// // find the given activity in list from the DOMObject
	// if ($(DOMObject).attr('bind').toLowerCase() === 'activity') {
	// var activityEl = DOMObject;
	// var activity = pop(window.App, {
	// name : $(activityEl).attr('name'),
	// key : $(activityEl).attr('key')
	// });
	// activity.collection.destroy();
	// activity.remove(); // remove from DOM
	// }
	// else {
	// // top-level DOMObject wasn't an activity, let's go through the entire DOMObject looking for activities
	// _.each($(dom).find('[bind=activity]'), function(activityEl) {
	// var activity = popActivity(window.App, $(activityEl).attr('name'), $(activityEl).attr('key'));
	// activity.model.destroy();
	// activity.remove(); // remove from DOM
	// });
	// }
	// return;
	// };

	window.expanz.Logout = function() {
		function redirect() {
			expanz.Storage.clearSession();
			expanz.Views.redirect(expanz.getLoginPage());
		}
		expanz.Net.ReleaseSessionRequest({
			success : redirect,
			error : redirect
		});
	};

	window.expanz.showManuallyClosedPopup = function(content, title, id, activity) {

		content = unescape(content);

		var clientMessage = new expanz.Model.ClientMessage({
			id : id,
			title : title,
			text : content,
			parent : activity
		});

		var loginPopup = new window.expanz.Views.ManuallyClosedPopup({
			id : clientMessage.id,
			model : clientMessage
		}, $('body'));

		return loginPopup;

	};

	window.expanz.showLoginPopup = function(activity, sessionLost) {
		var content = '';
		if (sessionLost === true) {
			content = '<div class="loginMsg">Sorry, your session timed out, please log in again.</div>';
		}
		else {
			content = '<div class="loginMsg">Please log in.</div>';
		}

		content += '<form bind="login" type="popup" name="login" action="javascript:">';
		content += '<div name="username" id="username">';
		content += '<input class="loginInput"  attribute="value" type="text" placeholder="Username"/>';
		content += '</div>';
		content += '<div name="password" id="password">';
		content += '<input class="loginInput" attribute="value" type="password" placeholder="Password"/>';
		content += '</div>';
		content += '<div name="login" id="login">';
		content += '<button type="submit" attribute="submit">login</button>';
		content += '</div>';
		content += '<div bind="message" type="error" class="error">';
		content += '<span attribute="value"></span>';
		content += '</div>';
		content += '</form>';

		loginPopup = window.expanz.showManuallyClosedPopup(content, 'Login', 'ExpanzLoginPopup', activity);

		/* set focus on username field */
		$("#username input").focus()

		createLogin(loginPopup.el.find('[bind=login]'));

		return;

	};

	window.expanz.createActivityWindow = function(parentActivity, id, style, key, title) {
		var callback = function(activityMetadata) {
			if (activityMetadata.url === null) {
				window.expanz.logToConsole("Url of activity not found");
			}

			/* case 'popup' */
			if (activityMetadata.onRequest == 'popup') {

				/* an activity request shouldn't be reloaded from any state -> clean an eventual cookie if popup was not closed properly */
				window.expanz.Storage.clearActivityHandle(id, style);

				var clientMessage = new expanz.Model.ClientMessage({
					id : 'ActivityRequest',
					url : activityMetadata.url + "&random=" + new Date().getTime(),
					parent : parentActivity,
					title : unescape(title || activityMetadata.title || '')
				});

				var popup = new window.expanz.Views.ManuallyClosedPopup({
					id : clientMessage.id,
					model : clientMessage
				}, $('body'));

				popup.bind('contentLoaded', function() {
					expanz.CreateActivity($(popup.el).find("[bind=activity]"), null, key);
				});

				popup.bind('popupClosed', function() {
					window.expanz.Storage.clearActivityHandle(id, style);
				});
			}
			/* case 'navigate' or default */
			else {
				window.location = activityMetadata.url + "?random=" + new Date().getTime() + "&" + id + style + "initialKey=" + key;
			}

		};

		/* find url of activity */
		window.expanz.helper.findActivityMetadata(id, style, callback);

	};

	window.expanz.defaultCallbacks = {
		success : function(message) {
			expanz.messageController.addSucessMessageByText(message);
		},
		error : function(message) {
			expanz.messageController.addErrorMessageByText(message);
		},
		info : function(message) {
			expanz.messageController.addInfoMessageByText(message);
		}
	};

	//
	// Helper Functions
	//

	window.expanz.helper.findActivity = function(activityId) {
		if (window && window.App) {
			for ( var i = 0; i < window.App.length; i++) {
				if (window.App[i].id == activityId) {
					return window.App[i];
				}
			}
		}
		return null;
	};

	window.expanz.helper.findActivityMetadata = function(activityName, activityStyle, callback) {
		var jqxhr = $.get('./formmapping.xml', function(data) {
			$(data).find('activity').each(function() {
				var name = $(this).attr('name');
				var url = getPageUrl($(this).attr('form'));
				var onRequest = $(this).attr('onRequest');
				var title = $(this).attr('title');
				var style = $(this).attr('style');
				if (name == activityName && style == activityStyle) {
					var activityMetadata = {};
					activityMetadata.url = url;
					activityMetadata.onRequest = onRequest;
					activityMetadata.title = title;
					callback(activityMetadata);
					return;
				}
			});
		});
	};

	//
	// Private Functions
	//
	function createActivity(dom, callbacks, paramInitialKey) {

		var activities = [];

		var domActivities = [];

		if ($(dom).attr('bind') && ($(dom).attr('bind').toLowerCase() === 'activity')) {
			domActivities.push(dom);
		}
		else {
			// search through DOM body, looking for elements with 'bind' attribute
			_.each($(dom).find('[bind=activity]'), function(activityEl) {
				domActivities.push(activityEl);
			});
		}

		_.each(domActivities, function(activityEl) {

			var activityView = expanz.Factory.Activity(dom);

			/* look for initial key in the query parameters */
			var initialKey = paramInitialKey || getQueryParameterByName(activityView.collection.getAttr('name') + (activityView.collection.getAttr('style') || '') + 'initialKey');
			activityView.collection.setAttr({
				'key' : initialKey
			});

			activityView.collection.load(callbacks);
			activities.push(activityView);
		});

		return activities;
	}

	function createLogin(dom, callbacks) {

		var loginView;
		if ($(dom).attr('bind') && ($(dom).attr('bind').toLowerCase() === 'login')) {
			loginView = expanz.Factory.Login(dom);
		}

		return loginView;
	}

	function loadMenu(el, displayEmptyItems) {

		// Load Menu & insert it into #menu
		var menu = new expanz.Storage.AppSiteMenu();
		var processAreas = loadProcessArea(expanz.Storage.getProcessAreaList(), displayEmptyItems);
		if (processAreas.length > 0)
			menu.processAreas = processAreas;
		menu.load(el);
	}

	function loadProcessArea(processAreas, displayEmptyItems, parentProcessAreaMenu) {
		var processAreasMenu = [];
		_.each(processAreas, function(processArea) {
			if (displayEmptyItems || processArea.activities.length > 0 || processArea.pa.length > 0) {
				var menuItem = new expanz.Storage.ProcessAreaMenu(processArea.id, processArea.title);

				if (parentProcessAreaMenu)
					menuItem.parent = parentProcessAreaMenu;

				_.each(processArea.activities, function(activity) {
					if (displayEmptyItems || (activity.url !== '' && activity.url.length > 1)) {
						menuItem.activities.push(new expanz.Storage.ActivityMenu(activity.name, activity.style, activity.title, activity.url, activity.img));
					}
				});

				if (processArea.pa.length > 0) {
					menuItem.pa = loadProcessArea(processArea.pa, displayEmptyItems, menuItem);
				}

				if (displayEmptyItems || menuItem.activities.length > 0) {
					processAreasMenu.push(menuItem);
				}
			}
		});
		return processAreasMenu;
	}

	/* check if website is on maintenance or web server is down except on maintenance page */
	if (document.location.pathname.indexOf(window.expanz.getMaintenancePage()) === -1) {
		if (window.expanz.isOnMaintenance()) {
			expanz.Views.redirect(window.expanz.getMaintenancePage());
		}

		/* check if web server is down and last success was more than 1 minutes ago */
		var currentTime = (new Date()).getTime();
		var lastSuccess = window.expanz.Storage.getLastPingSuccess();
		if (lastSuccess === undefined || (currentTime - lastSuccess) > (1 * 60 * 1000)) {
			expanz.Net.WebServerPing(3);
		}
	}

	/* defined a fake console to avoid bug if any console.log have been forgotten in the code */
	if (!window.console) {
		window.console = {
			log : function(e) {
				// alert(e);
			}
		};
	}

	window.expanz.logToConsole("Loading menu, setting callbacks and creating activities");

	/* prompt the user to install chrome frame for IE6 */
	if ($.browser.msie && $.browser.version == "6.0") {
		loadjscssfile("//ajax.googleapis.com/ajax/libs/chrome-frame/1.0.3/CFInstall.min.js", "js");
		window.attachEvent('onload', function() {
			CFInstall.check({
				mode : 'overlay'
			});
		});
	}

	/* init dashboards object */
	window.expanz.Dashboards = new window.expanz.Model.Dashboards();

	window.expanz.messageController.initialize();

	/* Load the Expanz Process Area menu without empty items */
	_.each($('[bind=menu]'), function(el) {
		loadMenu($(el), false);
	});

	/* create login if exists */
	expanz.CreateLogin($('[bind=login]'));

	/* create all activities where autoLoad attribute is not set to false */
	_.each($('[bind=activity][autoLoad!="false"]'), function(el) {
		expanz.CreateActivity($(el));
	});

	/* apply security roles -> hide stuff */
	_.each($("body").find("[requiresRole]"), function(el) {
		var roles = $(el).attr("requiresRole");
		if (roles != null && roles != "") {
			var roleFound = false;
			roles = roles.split(" ");
			for ( var i = 0; i < roles.length; i++) {
				if (expanz.Storage.hasRole(roles[i])) {
					roleFound = true;
					break;
				}
			}
			if (roleFound !== true) {
				$(el).hide();
			}
		}

	});

	/* load UI plugin */
	var expanzPlugin = $("body").attr("expanzPlugin");
	if (expanzPlugin) {
		switch (expanzPlugin) {
			case "kendo":
				if (typeof useKendo == 'function')
					useKendo();
				else
					window.expanz.logToConsole("useKendo method is undefined");
				break;

			case "kendoMobile":
				if (typeof useKendoMobile == 'function')
					useKendoMobile();
				else
					window.expanz.logToConsole("useKendoMobile method is undefined");
				break;

			default:
				break;
		}
	}

});

