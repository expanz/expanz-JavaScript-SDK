///#source 1 1 /source/js/expanz/expanz.collection.js
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

		getChildrenByAttribute: function (attributeName, attributeValue) {
		    // Returns all children which have an attribute with a given value
		    return this.filter(function (child) {
		        return (child !== undefined && child.get(attributeName) === attributeValue);
		    });
		},

		getFirstChildByAttribute: function (attributeName, attributeValue) {
		    var matches = this.getChildrenByAttribute(attributeName, attributeValue);

		    if (matches.length !== 0)
		        return matches[0];
		    else
		        return null;
		},

		//forEachChildWithAttributeValue: function (attributeName, attributeValue, callback) {
		//    // Provides an easy way to loop through all models with a given attribute name/value 
		//    // combination, and call a function passing the model as a parameter
		//    this.getChildrenByAttribute(attributeName, attributeValue).forEach(function (child) {
		//        callback(child);
		//    });
		//},

		destroy : function() {
			this.each(function(m) {
				m.destroy();
			});
		    
			return;
		}
	});
});

///#source 1 1 /source/js/expanz/expanz.component.js
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
							if (moduleEl.attr('loaded') === undefined) {
								var moduleContent = that['render' + module + 'Module']($(this));
								if (this.canHaveChildren === undefined || this.canHaveChildren)
									$(this).append(moduleContent);
								else {
									var moduleContentDOMNode = document.createElement("div");
									moduleContentDOMNode.innerHTML = moduleContent;
									this.parentElement.appendChild(moduleContentDOMNode);
								}
								moduleEl.attr('loaded', '1');
							}
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

///#source 1 1 /source/js/expanz/expanz.factory.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson
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

	    createLoginView: function (loginEl) {
	        var $loginEl = $(loginEl);
			var loginModel = new window.expanz.models.Login();
		    
			var loginView = new window.expanz.views.LoginView({
			    el: loginEl,
			    id: $loginEl.attr('name'),
			    type: $loginEl.attr('type'),
				model : loginModel
			});

			return loginView;
		},

		createActivityView: function (activityEl) {
		    var $activityEl = $(activityEl);
		    
			// create a collection for each activity
			var activityModel = new expanz.models.Activity({ // expanz.models.Login.Activity
				name : $activityEl.attr('name'),
				title : $activityEl.attr('title'),
				url : $activityEl.attr('url'),
				key : $activityEl.attr('key'),
				style : $activityEl.attr('activityStyle'),
				optimisation : $activityEl.attr('optimisation') ? boolValue($activityEl.attr('optimisation')) : true,
				allowAnonymous : $activityEl.attr('allowAnonymous') ? boolValue($activityEl.attr('allowAnonymous')) : false
			});
		    
			var activityView = new expanz.views.ActivityView({
			    el: activityEl,
				id : $activityEl.attr('name'),
				key : $activityEl.attr('key'),
				model: activityModel
			});

			expanz.Factory.bindMessageControl(activityView);
			expanz.Factory.bindMethods(activityView);
			expanz.Factory.bindDataControls(activityView);
			expanz.Factory.bindFields(activityView);
		    
			return activityView;
		},

		bindMessageControl: function (activityView) {
		    var activityModel = activityView.model;
		    var messageControl = activityView.$el.find('[bind=messageControl]');
		    var $messageControl = null;
		    
		    if (messageControl.length === 0) {
		        // Activity level message control not found - use the application level message control if available
		        if (window.messageControlView === null) {
		            // An application level message control is not currently intialised - look for it
		            messageControl = $('[bind=messageControl]');

		            if (messageControl.length !== 0) {
		                // An application level message ccontrol has been found, so initialise it
		                $messageControl = $(messageControl);

		                window.messageControlView = new expanz.views.MessagesView({
		                    id: $messageControl.attr('id'),
		                    //className: $messageControl.attr('class'),
		                    collection: new expanz.models.MessageCollection()
		                });

		                $messageControl.html(window.messageControlView.render().el);
		            }
		        }

		        if (window.messageControlView !== null) {
		            // Now rewire the activityModel's messageCollection property to the application-level messages view's messageCollection
		            activityModel.messageCollection = window.messageControlView.collection;
		        }
		    } else {
		        // Create a view for the messages control
		        $messageControl = $(messageControl);
		        
		        var view = new expanz.views.MessagesView({
		            //el: messageControl,
		            id: $messageControl.attr('id'),
		            //className: $messageControl.attr('class'),
		            collection: activityModel.messageCollection
		        });

		        $messageControl.html(view.render().el);
		    }

		    activityView.messageControl = messageControl;
		},

		bindFields: function (activityView) {
		    var activityModel = activityView.model;
		    var fieldIdSuffixIndex = 0;
		    
		    var fieldViewCollection = expanz.Factory.createFieldViews(activityView.$el.find('[bind=field]'));
		    var dataFieldViewCollection = expanz.Factory.createDataFieldViews(activityView.$el.find('[bind=datafield]'));
		    var variantFieldViewCollection = expanz.Factory.createVariantFieldViews(activityView.$el.find('[bind=variantfield]'));
		    var dashboardFieldViewCollection = expanz.Factory.createDashboardFieldViews(activityView.$el.find('[bind=dashboardfield]'));
		    var dependantFieldViewCollection = expanz.Factory.createDependantFieldViews(activityView.$el.find('[bind=dependant]'));

		    var bindFieldToActivity = function(fieldView) {
		        var fieldModel = fieldView.model;

		        fieldModel.set({
		                parent: activityModel
		            }, {
		                silent: true
		            });

		        activityModel.fields.add(fieldModel);

		        // Add anonymous fields bound to method
		        if (fieldModel.get('anonymousBoundMethod') !== null && fieldModel.get('anonymousBoundMethod') !== '') {
		            var boundMethod = activityModel.methods.get(fieldModel.get('anonymousBoundMethod'));

		            if (boundMethod) {
		                boundMethod.addAnonymousElement(fieldModel);
		            }
		        }
		    };
		    
		    _.each(fieldViewCollection, bindFieldToActivity);
		    _.each(dataFieldViewCollection, bindFieldToActivity);
		    _.each(variantFieldViewCollection, bindFieldToActivity);
		    _.each(dependantFieldViewCollection, bindFieldToActivity);
			
		    _.each(dashboardFieldViewCollection, function (dashboardFieldView) {
		        var dashboardFieldModel = dashboardFieldView.model;
			    var fieldSessionValue = expanz.Storage.getDashboardFieldValue(dashboardFieldModel.get('dashboardName'), dashboardFieldModel.get('name'));
			    
				dashboardFieldModel.set({
					value : fieldSessionValue || ''
				});

				expanz.Dashboards.add(dashboardFieldModel);
		    });

		    // Data fields (such as dropdown lists) need to register themselves as data publications
		    _.each(dataFieldViewCollection, function(dataFieldView) {
		        activityModel.dataPublications.add(dataFieldView.dataModel);
		    });
		},

		bindMethods: function (activityView) {
		    var activityModel = activityView.model;

		    var methodViewCollection = expanz.Factory.createMethodViews(activityView.$el.find('[bind=method]'));
		    
		    _.each(methodViewCollection, function (methodView) {
		        var methodModel = methodView.model;
		        
		        methodModel.set({
		                parent: activityModel
		            }, {
		                silent: true
		            });
		        
		        activityModel.methods.add(methodModel);
		        activityView.addMethodView(methodView);
		    });
		},

		bindDataControls: function (activityView, parentEl) {
		    var activityModel = activityView.model;

		    if (parentEl === undefined) // Picklists will pass in a parent, but activities won't
		        parentEl = activityView.el;

		    var dataPublicationViewCollection = expanz.Factory.createDataPublicationViews($(parentEl).find('[bind=DataControl]'));

		    _.each(dataPublicationViewCollection, function (dataPublicationView) {
		        var dataControlModel = dataPublicationView.model;
		        
				dataControlModel.set({
					parent : activityModel,
					activityId : activityModel.get('name')
				});
			    
		        // Look for any data publication already registered with the same ID, and
		        // remove it if so (backbone ignores the add if ID already exists). This is 
		        // primarily required by picklists, which will repeatedly use the same ID.
				var existingDataModel = activityModel.dataPublications.get(dataControlModel.id);
		        
				if (existingDataModel !== undefined) {
				    activityModel.dataPublications.remove(existingDataModel);
				}

                // Now add new one
				activityModel.dataPublications.add(dataControlModel);

				/* add anonymous datacontrol field bound to method */
				if (dataControlModel.get('anonymousBoundMethod') !== null && dataControlModel.get('anonymousBoundMethod') !== '') {
				    var boundMethod = activityModel.methods.get(dataControlModel.get('anonymousBoundMethod'));
				    
					if (boundMethod) {
						boundMethod.addAnonymousElement(dataControlModel);
					}
				}
			});
		},

		createFieldViews : function(DOMObjects) {

		    var fieldViews = [];
		    
		    _.each(DOMObjects, function (fieldEl, index) {
		        var $fieldEl = $(fieldEl);

		        // There are a number of ways that the user can specify a field ID. The preferred means is using
		        // the fieldId attribute, but if this doesn't exist then it looks for a name attribute, and
		        // finally an id attribute. This will map to a field on the server.
		        var fieldId = $fieldEl.attr('fieldId') || $fieldEl.attr('name') || $fieldEl.attr('id');
		        
		        // We also need to generate a unique ID for the model. We'll use the field ID, but if a field
		        // already exists using that ID (such as when a field is used twice on the page) then append
		        // a number to the name to make it unique.
		        var modelId = fieldId + "_" + index;

				// Create a model and a view for each field, and associate the two together
		        var model = new expanz.models.Field({
		            id: modelId,
		            fieldId: fieldId,
					anonymousBoundMethod : $fieldEl.attr('anonymousBoundMethod')
				});
			    
				var view = new expanz.views.FieldView({
					el : fieldEl,
					id: modelId,
					className : $fieldEl.attr('class'),
					model: model
				});

				fieldViews.push(view);
			});
		    
			return fieldViews;
		},

		createDataFieldViews : function(DOMObjects) {

		    var fieldViews = [];
		    
		    _.each(DOMObjects, function (fieldEl, index) {
		        var $fieldEl = $(fieldEl);

		        // There are a number of ways that the user can specify a field ID. The preferred means is using
		        // the fieldId attribute, but if this doesn't exist then it looks for a name attribute, and
		        // finally an id attribute. This will map to a field on the server.
		        var fieldId = $fieldEl.attr('fieldId') || $fieldEl.attr('name') || $fieldEl.attr('id');

		        // We also need to generate a unique ID for the model. We'll use the field ID, but if a field
		        // already exists using that ID (such as when a field is used twice on the page) then append
		        // a number to the name to make it unique.
		        var modelId = fieldId + "_" + index;

		        // Create a model and a view for each field, and associate the two together
		        var fieldModel = new expanz.models.Field({
		            id: modelId,
		            fieldId: fieldId,
		            anonymousBoundMethod: $fieldEl.attr('anonymousBoundMethod')
		        });
		        
		        var dataModel = new expanz.models.DataPublication({
		            id: modelId,
		            dataId: $fieldEl.attr('dataId') || $fieldEl.attr('id') || $fieldEl.attr('fieldId') || $fieldEl.attr('name') || $fieldEl.attr('query') || $fieldEl.attr('populateMethod'),
		            query: $fieldEl.attr('query'),
		            populateMethod: $fieldEl.attr('populateMethod'),
		            contextObject: $fieldEl.attr('contextObject'),
		            autoPopulate: $fieldEl.attr('autoPopulate'),
		            selectionChangeAnonymousMethod: $fieldEl.attr('selectionChangeAnonymousMethod'),
		            selectionChangeAnonymousContextObject: $fieldEl.attr('selectionChangeAnonymousContextObject'),
		            anonymousBoundMethod: $fieldEl.attr('anonymousBoundMethod')
		        });
		        
				var view = new expanz.views.DataFieldView({
					el : fieldEl,
					id: modelId,
					className : $fieldEl.attr('class'),
					renderingType : $fieldEl.attr('renderingType'),
					model: fieldModel,
					dataModel: dataModel
				});

				fieldViews.push(view);
			});
		    
			return fieldViews;
		},
		
		createVariantFieldViews : function(DOMObjects) {

		    var fieldViews = [];
		    
		    _.each(DOMObjects, function (fieldEl, index) {
		        var $fieldEl = $(fieldEl);

		        // There are a number of ways that the user can specify a field ID. The preferred means is using
		        // the fieldId attribute, but if this doesn't exist then it looks for a name attribute, and
		        // finally an id attribute. This will map to a field on the server.
		        var fieldId = $fieldEl.attr('fieldId') || $fieldEl.attr('name') || $fieldEl.attr('id');

		        // We also need to generate a unique ID for the model. We'll use the field ID, but if a field
		        // already exists using that ID (such as when a field is used twice on the page) then append
		        // a number to the name to make it unique.
		        var modelId = fieldId + "_" + index;

		        // Create a model and a view for each variant field, and associate the two together
		        var model = new expanz.models.Field({
		            id: modelId,
		            fieldId: fieldId,
			    });
		
		        var view = new expanz.views.VariantFieldView({
		            el: fieldEl,
		            id: modelId,
		            className: $fieldEl.attr('class'),
		            model: model
		        });

		        fieldViews.push(view);
		    });
		    
		    return fieldViews;
		},

		createDashboardFieldViews : function(DOMObjects) {

		    var fieldViews = [];
		    
		    _.each(DOMObjects, function (fieldEl, index) {
		        var $fieldEl = $(fieldEl);

		        // Create a model and a view for each dashboard field, and associate the two together
				var model = new expanz.models.DashboardField({
					id : $fieldEl.attr('dashboardName') + "_" + $fieldEl.attr('name'),
					name : $fieldEl.attr('name'),
					dashboardName : $fieldEl.attr('dashboardName')
				});
			    
				var view = new expanz.views.FieldView({
				    el: fieldEl,
				    id: model.get("id"),
					className : $fieldEl.attr('class'),
					model : model
				});

				fieldViews.push(view);
			});
		    
			return fieldViews;
		},

		createDependantFieldViews : function(DOMObjects) {

		    var fieldViews = [];
		    
		    _.each(DOMObjects, function (fieldEl, index) {
		        var $fieldEl = $(fieldEl);

		        // Create a model and a view for each dependant field, and associate the two together
				var model = new expanz.models.Bindable({
					id : $fieldEl.attr('name')
				});
			    
				var view = new expanz.views.DependantFieldView({
				    el: fieldEl,
				    id: model.get("id"),
					className : $fieldEl.attr('class'),
					model : model
				});

				fieldViews.push(view);
			});
		    
			return fieldViews;
		},

		createMethodViews : function(DOMObjects) {

		    var methodViews = [];
		    
		    _.each(DOMObjects, function (methodEl) {
		        var $methodEl = $(methodEl);

		        // Create a model and a view for each method, and associate the two together
				/* look for potential methodAttributes - format is name:value;name2:value2; */
				var methodAttributes = [];
				    
				if ($methodEl.attr('methodAttributes')) {
					_.each($methodEl.attr('methodAttributes').split(';'), function(val) {
						var split = val.split(':');
						if (split.length == 2) {
							methodAttributes.push({
								name : split[0],
								value : split[1]
							});
						}
					});
				}

				var model = new expanz.models.Method({
					id : $methodEl.attr('name'),
					contextObject : $methodEl.attr('contextObject'),
					methodAttributes : methodAttributes
				});

				var view = new expanz.views.MethodView({
				    el: methodEl,
				    id: model.get("id"),
					className : $methodEl.attr('class'),
					model: model
				});

				methodViews.push(view);
			});
		    
			return methodViews;
		},
	    
		createDataPublicationViews: function(domObjects) {
		    var dataPublicationViews = [];

		    _.each(domObjects, function (dataPubicationEl, index) {
		        var $dataPubicationEl = $(dataPubicationEl);

		        // There are a number of ways that the user can specify a data ID. The preferred means is using
		        // the dataId attribute, but if this doesn't exist then it looks for various other attributes.
		        var dataId = $dataPubicationEl.attr('dataId') || $dataPubicationEl.attr('id') || $dataPubicationEl.attr('name') || $dataPubicationEl.attr('query') || $dataPubicationEl.attr('populateMethod');

		        // We also need to generate a unique ID for the model. We'll use the data ID, but if a model
		        // already exists using that ID (such as when a data publication is used twice on the page)
		        // then append a number to the name to make it unique.
		        var modelId = dataId + "_" + index;

		        var dataModel = new expanz.models.DataPublication({
		            id: modelId,
		            dataId: dataId,
		            query: $dataPubicationEl.attr('query'),
		            populateMethod: $dataPubicationEl.attr('populateMethod'),
		            contextObject: $dataPubicationEl.attr('contextObject'),
		            autoPopulate: $dataPubicationEl.attr('autoPopulate'),
		            selectionChangeAnonymousMethod: $dataPubicationEl.attr('selectionChangeAnonymousMethod'),
		            selectionChangeAnonymousContextObject: $dataPubicationEl.attr('selectionChangeAnonymousContextObject'),
		            anonymousBoundMethod: $dataPubicationEl.attr('anonymousBoundMethod')
		        });
		        
		        var view = new expanz.views.DataPublicationView({
		            el: dataPubicationEl,
		            id: modelId,
		            className: $dataPubicationEl.attr('class'),
		            canDrillDown: $dataPubicationEl.attr('candrilldown') == "true",
		            templateName: $dataPubicationEl.attr('templateName'),
		            model: dataModel,
		            itemsPerPage: $dataPubicationEl.attr('itemsPerPage'),
		            //enableConfiguration: $dataPubicationEl.attr('enableConfiguration'),
		            noItemsText: $dataPubicationEl.attr('noItemsText')
		        });

		        dataPublicationViews.push(view);
		    });

		    return dataPublicationViews;
		}
	};
});
///#source 1 1 /source/js/expanz/expanz.html.js
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
	window.expanz.html.busyIndicator = function () {
	};
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
		if (label !== '') {
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

	/*window.expanz.html.renderVariantPanel = function(xml) {
		var html = '';
		var _subType;
		textBox : null,
		checkBox : null,
		radioButtons : null,
		if (xml.attr('visualType'))
			_subType = xml.attr('visualType'); // 'rb', 'txt', 'cb'
		else
			return '';
		
		
		return _subType;
	}*/
	
	window.expanz.html.renderMethod = function(methodName, methodLabel, cssClass, contextObject, hidden) {
		var thisCssClass = cssClass ? cssClass : 'methodButton';
		var ctx = contextObject ? ' contextObject = "' + contextObject + '" ' : '';
		var visible = hidden ? ' style="display:none" ' : '';
		var html = '';
		html += '<div bind="method" id="' + methodName + '" name="' + methodName + '" ' + ctx + visible + ' class="'+cssClass+'">';
		switch (cssClass)
		{
			case 'button':
				html += '<button attribute="submit" type="button">' + methodLabel + '</button>';
				break;
			default:
				html += '<a attribute="submit"><span>' + methodLabel + '</span></button>';
		}
		html += '</div>';
		return html;
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
		if (siteUrl !== '')
			html += '<a href="' + siteUrl + '"><div id="logo"></div></a>';
		html += '</div>';
		html += '</div>';
		return html;
	};
	
	/*window.expanz.html.renderMainMenu = function() {
		var html = '';
		
		html += '<div id="menuMainContainer">';
		html += '<div id="menuContainer" bind="menu" homeLabel=" " logoutLabel="Log Out" backLabel=" " ></div>';
		html += '</div>';
		return html;
	};
	
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
	};*/
	
	window.expanz.html.renderFooter = function(copyrightText, footerLinks) {
		var html = '';
		html += '<div class="footer">';
		html += '<div class="footerContainer">';
		html += '<div class="left footerCopyright">';
		if (!copyrightText)
			copyrightText = '';
		if (copyrightText !== '')
			html += '<div>' + copyrightText + '</div>';
		html += '<div class="footerLinks">';
		if (!footerLinks)
			footerLinks = '';
		if (footerLinks !== '')
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
		return value === "";
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
	};
});

///#source 1 1 /source/js/expanz/expanz.util.js
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
	var $window = $(window);
	var viewport_top = $window.scrollTop();
	var viewport_height = $window.height();
	var viewport_bottom = viewport_top + viewport_height;
	var $elem = $(elem);
	var top = $elem.offset().top;
	var height = $elem.height();
	var bottom = top + height;

	return (top >= viewport_top && top < viewport_bottom) || (bottom > viewport_top && bottom <= viewport_bottom) || (height > viewport_height && top <= viewport_top && bottom >= viewport_bottom);
}

function setVisibility(element, isVisible) {
    if (element !== undefined && isVisible != undefined) {
        if (isVisible)
            element.show();
        else 
            element.hide();
    }
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
			return -1;
		if (nameA > nameB)
			return 1;
		return 0; // default return value (no sorting)
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
		
// Serialize an XML Document or Element and return it as a string.
serializeXML = function (xmlElement) {
    if (xmlElement.xml)
        return xmlElement.xml;
    else if (typeof XMLSerializer != "undefined")
        return (new XMLSerializer()).serializeToString(xmlElement);
    else
        throw "Browser cannot serialize objects to XML";
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
	if (emailAddress === null)
		return '';
	return "<a href='mailto:" + emailAddress + "'>" + emailAddress + "</a>";
}

addDollar = function(price) {
	if (price === null || price === '')
		return '';
	return "$ " + price;
};

addPercent = function(number) {
	if (number === null || number === '')
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
	var fileref;
	if (filetype == "js") { // if filename is a external JavaScript file
		fileref = document.createElement('script');
		fileref.setAttribute("type", "text/javascript");
		fileref.setAttribute("src", filename);
	}
	else if (filetype == "css") { // if filename is an external CSS file
		fileref = document.createElement("link");
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
		var paddingTop = parseInt($self.css("padding-top"), 10);
		var paddingBottom = parseInt($self.css("padding-bottom"), 10);
		// get the borders
		var borderTop = parseInt($self.css("border-top-width"), 10);
		var borderBottom = parseInt($self.css("border-bottom-width"), 10);
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
	if (input === undefined)
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
	if (input === undefined)
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
	if (page === undefined)
		url = getSiteUrl();
	else if (window.config.formmappingFormat && window.config.formmappingFormat.indexOf('[p]') != -1)
		url = window.config.formmappingFormat.replace('[p]', page);
	else
		url = page;
	return url;
}

function getSiteUrl() {
	var url = '';
	if (window.config.homePage)
		url = '/' + getPageUrl(window.config.homePage);
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

///#source 1 1 /source/js/expanz/models/expanz.models.Bindable.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
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

	window.expanz.models.Bindable = Backbone.Model.extend({

	    destroy: function () {
	        // DO NOTHING
	        // this will be used if server changes API to use proper REST model. In a REST model, Backbone can link Models to specific URLs and interact using HTTP GET/PUT/UPDATE/DELETE. When that happens this override should be removed.
	    }

	});
});

///#source 1 1 /source/js/expanz/models/expanz.models.Field.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
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

	window.expanz.models.Field = expanz.models.Bindable.extend({

	    _type: 'Field',

	    defaults: function () {
	        return {
	            error: false
	        };
	    },

	    update: function (attrs) {
	        if (this.get('parent').isAnonymous()) {
	            this.set({
	                lastValue: attrs.value
	            });
	        }
	        else {
	            expanz.net.DeltaRequest(this.get('fieldId'), attrs.value, this.get('parent'));
	        }
	        return;
	    },

	    publish: function (xml) {
	        if (xml.attr !== undefined) {
	            // Assign all the attributes on the XML element to the model, except for
	            // those that need special processing later.
	            var ignoreAttributeList = ['id', 'value', 'visualType']; // Attributes in this list will be handled manually later, as they need special processing
	            var boolAttributeList = ['disabled', 'hidden', 'null', 'valid']; // Attributes in this list will be converted to a boolean value
	            var model = this;
	            
	            _.each(xml[0].attributes, function (item) {
	                var processAttribute = _.indexOf(ignoreAttributeList, item.name) === -1;
	                
	                if (processAttribute) {
	                    var attributeValue = item.value;
	                    var convertValueToBool = _.indexOf(boolAttributeList, item.name) !== -1;
	                    
	                    if (convertValueToBool) {
	                        attributeValue = boolValue(attributeValue);
	                    }
	                    
	                    model.set(item.name, attributeValue);
	                }
	            });
	            
	            // Now do special attribute processing. Reasons for processing these attributes separately include
	            // needing to be processed in a specific order, or needing their values transformed (e.g. converted 
	            // to bool, long data handling, etc)
	            if (xml.is("[value]")) {
	                this.set({
	                    // NOTE: The model doesn't currently populate the items property anymore, as it leads to an
	                    // endless loop in underscore.js in Chrome. As not required for now, commenting out.
	                    //items: xml.find("Item"),
	                    value: xml.attr('value') == '$longData$' ? xml.text() : xml.attr('value')
	                });
	            }

	            if (xml.is('[visualType]')) {
	                this.set({
	                    visualType: xml.attr('visualType')
	                });
	            }

	            /* remove error message if field is valid */
	            if (boolValue(xml.attr('valid')) && this.get('errorMessage') !== undefined) {
	                this.set({
	                    'errorMessage': undefined
	                });
	            }
	            
                // TODO: Unsure why this is handled as such - to investigate
	            if (this.get('datatype') && this.get('datatype').toLowerCase() === 'blob' && xml.attr('url')) {
	                this.set({
	                    value: xml.attr('url')
	                });
	            }
	        } else {
	            window.expanz.logToConsole("window.expanz.models.Field: xml.attr is undefined");
	        }
	    },

	    publishData: function (xml) {
	        // Variant panels will use this method. They consume data publications,
	        // but they behave more like fields than data publications (ie. they don't register as 
	        // data publications with the activity).
	        if (xml.attr !== undefined) {
	            // Unset required, as the set function in FireFox and IE doesn't seem to recognise
	            // that the data has changed, and thus doesn't actually change the value or raise
	            // the change event
	            this.unset("data", {
	                silent: true
	            });

	            this.set({
	                data: xml
	            });
	        }
	    },

	    setFocus: function () {
	        this.trigger("setFocus");
	    }
	});
});

///#source 1 1 /source/js/expanz/models/expanz.models.DashboardField.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
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

	window.expanz.models.DashboardField = window.expanz.models.Field.extend({

	    update: function (attrs) {
	        /* only read only field -> no delta send */
	        return;
	    }

	});
});

///#source 1 1 /source/js/expanz/models/expanz.models.Method.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
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

	window.expanz.models.Method = expanz.models.Bindable.extend({

	    _type: 'Method',

	    submit: function () {
	        window.expanz.currentContextMenu = this; // Used for context menu buttons, as need a way to know which button was pressed when handling response. TODO: Find a better way.

	        var anonymousFields = [];
	        if (this.get('anonymousFields')) {
	            $.each(this.get('anonymousFields'), function (index, value) {
	                if (value instanceof expanz.models.data.DataControl) {
	                    anonymousFields.push({
	                        id: value.get('dataId'),
	                        value: value.get('lastValues') || ""
	                    });
	                }
	                else {
	                    anonymousFields.push({
	                        id: value.get('id'),
	                        value: value.get('lastValue') || ""
	                    });
	                }
	            });
	        }

	        var methodAttributes = [
				{
				    name: "contextObject",
				    value: this.get('contextObject')
				}
	        ];

	        if (this.get('methodAttributes')) {
	            methodAttributes = methodAttributes.concat(this.get('methodAttributes'));
	        }

	        /* bind eventual dynamic values -> requiring user input for example, format is %input_id% */
	        /* input id must be unique in the page */
	        methodAttributes = methodAttributes.clone();
	        for (var i = 0; i < methodAttributes.length; i++) {
	            var value = methodAttributes[i].value;
	            var inputField = /^%(.*)%$/.exec(value);
	            if (inputField) {
	                methodAttributes[i].value = $("#" + inputField[1]).val();
	            }
	        }

	        expanz.net.MethodRequest(this.get('id'), methodAttributes, null, this.get('parent'), anonymousFields);
	        return;

	    },

	    publish: function (xml) {
	        if (xml.attr !== undefined) {
	            if (xml.attr('label')) {
	                this.set({
	                    label: xml.attr('label')
	                });
	            }
	        } else {
	            window.expanz.logToConsole("window.expanz.models.Method: xml.attr is undefined");
	        }
	    },

	    /* add an anonymous field or datacontrol to the method, will be added to the xml message when the method is called */
	    addAnonymousElement: function (element) {
	        var anonymousFields = this.get('anonymousFields');
	        if (anonymousFields === undefined || anonymousFields === null) {
	            anonymousFields = [];
	        }
	        anonymousFields.push(element);
	        this.set({
	            anonymousFields: anonymousFields
	        });
	    },
        
	    setContextMenu: function(contextMenuModel) {
	        this.contextMenuModel = contextMenuModel;
	        this.trigger("contextMenuLoaded"); // The view will respond to this and create and render the context menu view
	    }
	});
});

///#source 1 1 /source/js/expanz/models/expanz.models.MenuAction.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
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

	window.expanz.models.MenuAction = window.expanz.models.Bindable.extend({

	    _type: 'MenuAction',

	    initialize: function () {

	    },

	    menuItemSelected: function (action) {

	        expanz.net.CreateMenuActionRequest(this.get('parentActivity'), null, null, null, action);
	        return;

	    }

	});
});

///#source 1 1 /source/js/expanz/models/expanz.models.ContextMenu.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

    window.expanz = window.expanz || {};
    window.expanz.models = window.expanz.models || {};

    window.expanz.models.ContextMenu = expanz.Collection.extend({

        model: expanz.models.MenuAction,

        initialize: function (attrs) {
            this.loading = false;

            this.contextId = attrs["contextId"];
            this.activity = attrs["activity"];
            this.type = attrs["type"];
            this.contextObject = attrs["contextObject"];
        },
        
        requestContextMenu: function () {
            expanz.net.CreateContextMenuRequest(this.activity, this.contextId, this.type, this.contextObject);
        },

        loadMenu: function (menuData, activityModel) {
            var $menuData = $(menuData);

            this.reset();

            var contextMenu = this;
            var defaultAction = $menuData.attr('defaultAction');

            $menuData.children().each(function () {
                var $this = $(this);

                if (this.nodeName === "MenuItem") {
                    contextMenu.add({
                        action: $this.attr('action'),
                        text: $this.attr('text'),
                        clientAction: $this.attr('clientAction'),
                        isDefaultAction: defaultAction === $this.attr('action'),
                        parentActivity: activityModel
                    });
                } else if (this.nodeName === "Menu") {
                    // Sub-menus not currently supported
                }
            });

            this.trigger("menuLoaded");
        }
    });
});

///#source 1 1 /source/js/expanz/models/expanz.models.Login.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
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
	window.expanz.models.Login = {};

	window.expanz.models.Login = expanz.models.Bindable.extend({

	    defaults: function () {
	        return {
	            error: false,
	            isLoggingIn: false
	        };
	    },

	    initialize: function () {
	        this.messageCollection = new expanz.models.MessageCollection();
	    },

	    login: function (userName, password, isPopup) {
	        var that = this;

	        this.set({
	             isLoggingIn: true
	        });
	            
	        var loginCallback = function (error) {
	            if (error && error.length > 0) {
	                this.get('error').set({
	                    value: error
	                });
	            }
	            else {
	                expanz.net.GetSessionDataRequest({
	                    success: function (url) {
	                        if (isPopup) {
	                            // reload the page
	                            window.location.reload();
	                        }
	                        else {

	                            /*
									* NOT IMPLEMENTED YET...problem with url where sessionHandle and activityHandle are GET parameters var urlBeforeLogin = expanz.Storage.getLastURL(); if(urlBeforeLogin !== null && urlBeforeLogin != ''){ expanz.Storage.clearLastURL(); expanz.views.redirect(urlBeforeLogin);
									* return; }
									*/
	                            // redirect to default activity
	                            expanz.views.redirect(url);
	                        }
	                    },
	                        
	                    error: function (message) {
	                        that.set({
	                            isLoggingIn: false
	                        });
	                    }
	                });
	            }
	        };
	            
	        expanz.net.CreateSessionRequest(userName, password, {
	            success: loginCallback,
	            error: function (message) {
	                that.messageCollection.addErrorMessageByText(message);
	                
	                that.set({
	                    isLoggingIn: false
	                });
	            }
	        });
	    }
	});
});

///#source 1 1 /source/js/expanz/models/expanz.models.Dashboards.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
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

	window.expanz.models.Dashboards = expanz.Collection.extend({
	    model: expanz.models.DashboardField
	});
});

///#source 1 1 /source/js/expanz/models/expanz.models.Message.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
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

	window.expanz.models.Message = expanz.models.Bindable.extend({

	    _type: 'Message',
	    
        initialize: function () {
            
        },

	    publish: function (xml) {
	        if (xml.attr !== undefined) {
	            // Assign all the attributes on the XML element to the model
	            //if (xml.attr('visualType')) {
	            //    this.set({
	            //        visualType: xml.attr('visualType')
	            //    });
	            //}
	        } else {
	            window.expanz.logToConsole("window.expanz.models.Message: xml.attr is undefined");
	        }
	    }
	});
});

///#source 1 1 /source/js/expanz/models/expanz.models.MessageCollection.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
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

	window.expanz.models.MessageCollection = expanz.Collection.extend({

	    model: expanz.models.Message,

	    initialize: function () {
	        this.loading = false;
	        this.loadMessageResources();
	    },
	    
	    addMessage: function (messageInfo) {
	        this._addMessageByText(messageInfo.message, messageInfo.type);
	    },

        loadMessageResources: function () {
            /* load resource bundle */
            if (window.config.useBundle !== false) {
                jQuery.i18n.properties({
                    name: 'Messages',
                    path: config.messageBundlePath,
                    mode: 'map',
                    language: ' ', /* set to en to load Messages-en.properties as well, set to '' to load as well Messages-en-XX.properties - add to config.js if different for some customers */
                    cache: true,
                    callback: function () {
                        // window.expanz.logToConsole("Bundle loaded");
                    }
                });
            }
        },

	    // TODO: Turn the following 4 methods into 1, with an enumeration parameter?
        addErrorMessageByText: function (messageText) {
            this._addMessageByText(messageText, 'error');
        },

        addWarningMessageByText: function (messageText) {
            this._addMessageByText(messageText, 'warning');
        },

        addInfoMessageByText: function (messageText) {
            this._addMessageByText(messageText, 'info');
        },

        addSuccessMessageByText: function (messageText) {
            this._addMessageByText(messageText, 'success');
        },
	    
        // TODO: Move message transformation into an external js file, so it's not MessageCollection specific (also used by fields themselves)
        transformMessage: function(messageText) {
            if (window.config.useBundle === true) {
                // Pass the message to an implementation specific message converter, that may
                // transform the message from the server to something more suitable for display
                var data = null;

                if (typeof window.expanz.findMessageKey == 'function') {
                    data = window.expanz.findMessageKey(messageText);
                } else {
                    expanz.logToConsole("window.expanz.findMessageKey not found in your implementation");
                }

                if (data !== null) {
                    messageText = jQuery.i18n.prop(data['key'], data['data']);
                }
            }

            return messageText;
        },
	    
        _addMessageByText: function (messageText, messageType) {
            messageText = this.transformMessage(messageText);
            
            if (messageText !== "") {
                this.add({
                    type: messageType,
                    message: messageText
                });
                        
                if (window.config.showAllMessages === true) {
                    window.expanz.logToConsole(messageType + ': ' + messageText);
                }
            }
        },

        // TODO: Turn the following 4 methods into 1, with an enumeration parameter?
        addErrorMessageByKey: function (messageKey, messageData) {
            this._addMessageByKey(messageKey, messageData, 'error');
        },

        addInfoMessageByKey: function (messageKey, messageData) {
            this._addMessageByKey(messageKey, messageData, 'info');
        },

        addWarningMessageByKey: function (messageKey, messageData) {
            this._addMessageByKey(messageKey, messageData, 'warning');
        },

        addSuccessMessageByKey: function (messageKey, messageData) {
            this._addMessageByKey(messageKey, messageData, 'success');
        },

        _addMessageByKey: function (messageKey, messageData, messageType, popup) {
            // Look for the key in message.properties file, and convert it to a message
            var messageText = jQuery.i18n.prop(messageKey, messageData);
            
            if (messageText && messageText.length > 0) {
                var messageModel = {
                    type: messageType,
                    key: messageKey,
                    source: null,
                    messageSource: null,
                    message: messageText,
                    popup: popup
                };

                this.add(messageModel);
            } else {
                if (window.config.showAllMessages === true) {
                    window.expanz.logToConsole(messageType + ': ' + messageKey + messageData);
                }
            }
        }
	});
});

///#source 1 1 /source/js/expanz/models/expanz.models.Activity.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
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

	window.expanz.models.Activity = Backbone.Model.extend({

	    isAnonymous: function () {
	        return !this.get('handle');
	    },
	    
        defaults: {
        },

	    initialize: function () {
	        this.fields = new expanz.Collection();
	        this.methods = new expanz.Collection();
	        this.dataPublications = new expanz.Collection();
	        this.messageCollection = new expanz.models.MessageCollection();
	        this.loading = false;
	    },

	    load: function () {
	        expanz.net.CreateActivityRequest(this, this.callbacks);
	    },
	    
	    closeActivity: function () {
	        this.trigger("closingActivity");
	        
	        // Remove the cached activity handle
	        window.expanz.Storage.clearActivityHandle(this.get("name"), this.get("style"));

	        // Remove the activity from the list of open activities
	        window.expanz.OnActivityClosed(this.get('handle'));

	        // Close the activity on the server
	        expanz.net.CloseActivityRequest(this.get('handle'));
	        
	        this.destroy();
	    },
	    
	    setFieldFocus: function (focusFieldId) {
	        // Find the field
	        var focusField = this.fields.where({ fieldId: focusFieldId });
	        
	        // Now set focus to it
	        if (focusField.length !== 0)
	            focusField[0].setFocus();
	    },

	    destroy: function () {
	        // TODO: Destory field, method, and data publication models
	    }
	});
});

///#source 1 1 /source/js/expanz/models/expanz.models.ClientMessage.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
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

	window.expanz.models.ClientMessage = expanz.models.Bindable.extend({

	    initialize: function () {
	        this.actions = new expanz.Collection();
	    }
	});
});

///#source 1 1 /source/js/expanz/models/expanz.models.DataPublication.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Chris Anderson
//  Copyright 2008-2013 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////

$(function () {

    window.expanz = window.expanz || {};
    window.expanz.models = window.expanz.models || {};

    window.expanz.models.DataPublication = Backbone.Model.extend({

        initialize: function () {
            this.rows = new expanz.models.data.RowCollection();
            this.columns = new expanz.Collection();
            this.actions = {};
            
            this.rows.dataPublication = this;
            this.columns.dataPublication = this;

            this.bind("change:parent", this.onParentChanged, this);
            
            this.hasActions = false;
            this.isEditable = false;
        },
        
        dataPublished: function($rawXml) {
            // Data has been published to this model, so notify the associated view by raising an event.
            // Note that not all data publications follow the "standard" column/row/cell format, so the
            // raw XML is being passed through and stored, which adapters can parse differently if required.
            this.$rawXml = $rawXml;
            this.trigger("datapublication:dataPublished");
        },

        addColumn: function (id, field, label, datatype, width, isEditable, matrixKey) {
            // Create a "safe" field name, replacing periods with underscores
            var safeFieldName = field || id;
            safeFieldName = safeFieldName.replace(/\./g, "_");
            
            this.columns.add({
                id: id,
                field: field,
                safeFieldName: safeFieldName,
                label: label,
                datatype: datatype,
                width: width,
                isEditable: isEditable,
                matrixKey: matrixKey
            });

            return this.columns.get(id);
        },

        addRow: function (id, type, displayStyle) {
            this.rows.add({
                id: id,
                type: type,
                displayStyle: displayStyle,
                gridId: this.id
            });

            var row = this.rows.get(id);
            row.dataPublication = this;

            return row;
        },

        sortRowsByFieldName: function (fieldName, inAscendingOrder) {
            this.rows.comparator = function (compareRow) {
                return compareRow.getCellValues().sortValues[fieldName] || "";
            };

            this.rows.sort();

            if (!inAscendingOrder)
                this.rows.models.reverse();
        },
        
        sendContextToServer: function (selectedId, type) {
            var contextInfo = this._getContextInfoObject(selectedId, type);

            var methodAttributes = [];

            if (this.contextObject) {
                methodAttributes.push(
                    {
                        name: "contextObject",
                        value: this.contextObject
                    });
            }

            expanz.net.MethodRequest('SetIdFromContext', methodAttributes, contextInfo, this.get("parent"));
        },
        
        sendCellUpdateToServer: function (cellModel, newValue) {
            var contextInfo = this._getContextInfoObject(cellModel.row.id, cellModel.row.get("type"));
            
            var deltaInfo = {
                id: cellModel.column.get("field"),
                value: newValue,
                matrixKey: cellModel.column.get("matrixKey")
            };

            expanz.net.SetContextAndDeltaRequest(contextInfo, deltaInfo, this.get("parent"));
        },
        
        _getContextInfoObject: function (selectedId, type) {
            var context = {
                id: selectedId,
                contextObject: this.contextObject,
                type: type
            };

            return context;
        },

        drillDown: function (selectedId, type, contextObject) {
            expanz.net.CreateMenuActionRequest(this.get("parent"), selectedId, type, contextObject, null, "1", false);
        },

        refresh: function () {
            expanz.net.DataRefreshRequest(this.id, this.get("parent"));
        },
        
        onParentChanged: function () {
           this.parseActions();
        },
        
        parseActions: function() {
            // Various actions associated with this data publication can be defined in the form mapping file.
            // Actions are TODO
            // Search the form mapping file for these actions, and gather their details.
            this.actions = {};

            var model = this;
            var formMapping = expanz.Storage.getFormMapping();
            var activityModel = this.get("parent");

            var activityInfo = $(formMapping).find("activity[name='" + activityModel.get("name") + "'][style='" + activityModel.get("style") + "']");

            if (activityInfo.length !== 0) {
                var gridviewInfo = activityInfo.find("gridview[id='" + this.get("dataId") + "']");

                if (gridviewInfo.length !== 0) {
                    // add actions
                    _.each($(gridviewInfo).find('action'), function (action) {
                        var $action = $(action);
                        var params = {};
                        
                        _.each($action.find('param'), function (param) {
                            var $param = $(param);
                            var paramName = $param.attr('name');
                            
                            params[paramName] = {
                                name: paramName,
                                value: $param.attr('value'),
                                label: $param.attr('label'),
                                bindValueFromCellId: $param.attr('bindValueFromCellId')
                            };
                        });

                        var actionName = $action.attr('methodName') || $action.attr('menuAction') || $action.attr('contextMenu');
                        
                        model.actions[actionName] = {
                            id: $action.attr('id'),
                            type: $action.attr('methodName') ? 'method' : $action.attr('menuAction') ? 'menuAction' : 'contextMenu',
                            label: $action.attr('label'),
                            width: $action.attr('width'),
                            name: actionName,
                            params: params
                        };
                    });
                }
            }
        }
    });
});

///#source 1 1 /source/js/expanz/models/data/expanz.models.data.Cell.js
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
    
	window.expanz.models.data.Cell = expanz.models.Bindable.extend({
        defaults: function() {
            return {
                selected: false
            };
        },

        initialize: function(params) {
            this.row = params.row;
            this.column = params.column;
        }
	});

	window.expanz.models.data.CellCollection = expanz.Collection.extend({
	    model: expanz.models.data.Cell
	});
});

///#source 1 1 /source/js/expanz/models/data/expanz.models.data.Row.js
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

		addCell: function (cellId, value, column, sortValue) {
		    this.cells.add({
		        id: cellId,
		        value: value,
		        row: this,
		        column: column,
		        sortValue: sortValue
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

///#source 1 1 /source/js/expanz/expanz.net.js
/*!
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Usage: http://expanz.com/docs/client-technologies/javascript-sdk/
//  Author: Kim Damevin, Chris Anderson
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

	window.expanz.net = {
		lastRequest:"", lastResponse:"",
		// Request Objects -> to be passed to SendRequest
		CreateSessionRequest : function(username, password, callbacks) {
			expanz.Storage.clearSession(); /* clear previous existing sessions */
			var appsite = config.appSite;
			var authenticationMode = config.authenticationMode;
			SendRequest(requestBuilder.CreateSession(username, password, appsite, authenticationMode), parseCreateSessionResponse(callbacks));
		},

		WebServerPing : function(nbAttempts) {
			if (nbAttempts === undefined)
			    nbAttempts = 3;
		    
			if (window.expanz.pingError === undefined)
				window.expanz.pingError = 0;

			SendRequest(requestBuilder.WebServerPing(), function(data) {
			    var res = ($(data).find("WebServerPingResult"));
			    
				if (res.length > 0 && res.text() == "true") {
					window.expanz.pingError = 0;
					window.expanz.Storage.setPingSuccess();
					window.expanz.logToConsole("WEB SERVER PING OK");
				}
				else {
					//window.expanz.logToConsole("WEB SERVER PING FAILED" + getUrlRestService(requestBuilder.WebServerPing().url) + " DATA " + data);
				    window.expanz.pingError++;
				    
					if (window.expanz.pingError === nbAttempts) {
						expanz.views.redirect(window.expanz.getMaintenancePage());
					}
					else {
						// ping again
						window.expanz.net.WebServerPing(nbAttempts);
					}
				}
			});

		},

		GetSessionDataRequest : function(callbacks) {

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.views.requestLogin();
				return;
			}

			SendRequest(requestBuilder.GetSessionData(expanz.Storage.getSessionHandle()), parseGetSessionDataResponse(callbacks));
		},

		CreateActivityRequest : function(activity, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

			if (activity.get('allowAnonymous') === false) {
				if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
					expanz.views.requestLogin();
					return;
				}
			}

			/* if allow anonymous and session doesn't exist we don't create anything on the server */
			if (expanz.Storage.getSessionHandle() && expanz.Storage.getSessionHandle() !== "") {
			    var initiator = null;
			    
				/* check if an activity has already been created, if so specify it instead of creating a new one */
				var activityHandle = expanz.Storage.getActivityHandle(activity.get('name'), activity.get('style'));

				if (activityHandle !== undefined && activityHandle !== null) {
				    activity.set({
				        'handle': activityHandle
				    });
				} else {
				    // When parsing the create activity response, the parser won't have an activity handle
				    // that it can use to find the activity in the list of open activities, so ween need to
				    // pass the instance as an initiator.
				    initiator = {
				        type : "CreateActivity",
				        activityModel: activity
			        };
				}

				activity.set({
					loading : true
				});

				SendRequest(requestBuilder.CreateActivity(activity, expanz.Storage.getSessionHandle()), parseResponse(activity, initiator, callbacks));
			}
			else {
				/* anonymous case because no session handle is set */
			}
		},

		GetSavePreferencesRequest : function(activity, key, value, updateClientStorage, callbacks) {

			if (activity.get('allowAnonymous') === false) {
				if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
					expanz.views.requestLogin();
					return;
				}
			}

			if (updateClientStorage === true) {
				window.expanz.Storage.setUserPreference(key, value);
			}

			if (!activity.isAnonymous()) {
				// TODO check if we need a callback
				SendRequest(requestBuilder.GetSavePreferences(key, value, expanz.Storage.getSessionHandle()));
			}
		},

		DeltaRequest : function(id, value, activity, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

			if (activity.get('allowAnonymous') === false) {
				if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
					expanz.views.requestLogin();
					return;
				}
			}

			var initiator = {
				type : "field",
				id : id
			};

			activity.set({
				'deltaLoading' : {
					isLoading : true,
					initiator : initiator
				}
			});

			SendRequest(requestBuilder.Delta(id, value, activity, expanz.Storage.getSessionHandle()), parseResponse(activity, initiator, callbacks),null,true);
		},

		MethodRequest : function(name, methodAttributes, context, activity, anonymousFields, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

			if (activity.get('allowAnonymous') === false) {
				if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
					expanz.views.requestLogin();
					return;
				}
			}

			var initiator = {
				type : "method",
				id : name
			};

			activity.set({
				'deltaLoading' : {
					isLoading : true,
					initiator : initiator
				}
			});

			// activity allows anonymous and user not logged in
			if (activity.isAnonymous()) {
			    SendRequest(requestBuilder.AnonymousMethod(name, methodAttributes, context, activity, anonymousFields), parseResponse(activity, initiator, callbacks), null, true);
			}
			else {
			    SendRequest(requestBuilder.Method(name, methodAttributes, context, activity, expanz.Storage.getSessionHandle()), parseResponse(activity, initiator, callbacks), null, true);
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

			activity.set({
				'deltaLoading' : {
					isLoading : true,
					initiator : initiator
				}
			});

			SendRequest(requestBuilder.AnonymousMethods(methods, activity), parseResponse(activity, initiator, callbacks), null, true);

		},
		
		SetContextAndDeltaRequest: function (contextInfo, deltaInfo, activity, callbacks) {
		    if (callbacks === undefined)
		        callbacks = activity.callbacks;

		    var initiator = {};
		    
		    SendRequest(requestBuilder.SetContextAndDelta(contextInfo, deltaInfo, activity, expanz.Storage.getSessionHandle()), parseResponse(activity, initiator, callbacks), null, true);
	    },

		CloseActivityRequest : function(activityHandle, callbacks) {

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.views.requestLogin();
				return;
			}

			SendRequest(requestBuilder.CloseActivity(activityHandle, expanz.Storage.getSessionHandle()), parseCloseActivityResponse(callbacks));
		},

		DataRefreshRequest : function(dataId, activity, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.views.requestLogin();
				return;
			}

			var initiator = {
				type : "resfresh",
				id : dataId
			};

			activity.set({
				'deltaLoading' : {
					isLoading : true,
					initiator : initiator
				}
			});

			SendRequest(requestBuilder.DataRefresh(dataId, activity, expanz.Storage.getSessionHandle()), parseResponse(activity, initiator, callbacks), null, true);
		},

		ReleaseSessionRequest : function(callbacks) {
			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.views.requestLogin();
				return;
			}
			SendRequest(requestBuilder.ReleaseSession(expanz.Storage.getSessionHandle()), parseReleaseSessionResponse(callbacks));
		},

		GetBlobRequest : function(blobId, activity, initiator) {

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.views.requestLogin();
				return;
			}

			/* even if the file is not opened yet, we consider the delta loading is finished */
			activity.set({
				'deltaLoading' : {
					isLoading : false,
					initiator : initiator
				}
			});

			SendNormalRequest(requestBuilder.GetBlob(blobId, activity, expanz.Storage.getSessionHandle()));
		},

		GetFileRequest : function(filename, activity, initiator) {

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.views.requestLogin();
				return;
			}

			/* even if the file is not opened yet, we consider the delta loading is finished */
			activity.set({
				'deltaLoading' : {
					isLoading : false,
					initiator : initiator
				}
			});

			SendNormalRequest(requestBuilder.GetFile(filename, activity, expanz.Storage.getSessionHandle()));
		},

		/* call when selecting something from the tree view (file) or menu action */
		CreateMenuActionRequest: function (activity, contextId, contextType, contextObject, menuAction, defaultAction, setIdFromContext, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.views.requestLogin();
				return;
			}

			var initiator = {
				type : "menuaction",
				id : contextId
			};

			activity.set({
				'deltaLoading' : {
					isLoading : true,
					initiator : initiator
				}
			});

			SendRequest(requestBuilder.CreateMenuAction(activity, contextId, contextType, contextObject, menuAction, defaultAction, setIdFromContext, expanz.Storage.getSessionHandle()), parseResponse(activity, initiator, callbacks), null, true);
		},

		/* call when selecting something from the tree view (file) or menu action */
		CreateContextMenuRequest : function(activity, contextId, contextMenuType, contextObject, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.views.requestLogin();
				return;
			}

			var initiator = {
				type : "contextmenu",
				id : contextId
			};

			activity.set({
				'deltaLoading' : {
					isLoading : true,
					initiator : initiator
				}
			});

			SendRequest(requestBuilder.CreateContextMenuAction(activity, contextId, contextMenuType, contextObject, expanz.Storage.getSessionHandle()), parseResponse(activity, initiator, callbacks), null, true);
		},

		/* create an anonymous request */
		CreateAnonymousRequest : function(xmlData, callbacks) {
			if (callbacks === undefined)
			    callbacks = window.expanz.defaultCallbacks;
		    
			SendRequest(requestBuilder.CreateAnonymousRequest(xmlData), parseExecAnonymousResponse(callbacks));
		}

	};


	/*
	 * Send Request :manage the sending of XML requests to the server, and dispatching of response handlers
	 */
	var requestBusy;
	var requestQueue = [];
	var SendRequest = function (request, responseHandler, isPopup, callAsync) {
		if (false && requestBusy) {
			requestQueue.push([request, responseHandler, isPopup]);
		}

		window.expanz.logToConsole("REQUEST:");
		window.expanz.logToConsole(request.data);

		requestBusy = true;
		window.expanz.net.lastRequest = request.data;
	    
		var isAsync = true;
		//if (callAsync !== undefined && callAsync) {
		//	isAsync = true;
		//}
	    
		$(window.expanz.html.busyIndicator()).trigger("isBusy");
	    
		$.ajaxSetup({
		    headers: { "cache-control": "no-cache" } // http://stackoverflow.com/questions/12506897/is-safari-on-ios-6-caching-ajax-results
		});
	    
		if (config.urlProxy !== undefined && config.urlProxy.length > 0) {
			$.ajax({
				type : 'POST',

				url: config.urlProxy,

				data: {
					url : getUrlRestService(request.url),
					data : request.data,
					method : request.method || "POST"
				},

				dataType: 'XML',

				processData: true,
				
				async: isAsync,

				complete: function (HTTPrequest) {
					requestBusy = false;
					window.expanz.net.lastResponse = HTTPrequest.responseText;
					$(window.expanz.html.busyIndicator()).trigger("notBusy");

					window.expanz.logToConsole("RESPONSE:");
					window.expanz.logToConsole(HTTPrequest.responseText);
				    
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
			    type: request.method || "POST",
			    
			    url: getUrlRestService(request.url),
			    
			    data: request.data,
			    
			    dataType: 'XML',
			    
			    processData: true,
			    
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
		form += "<form method='post' id='formFile' target='_blank' action='" + config.urlProxy + "'>";
		form += "<input type='hidden' name='url' value='" + getUrlRestService(request.url) + "'>";

		form += "<input type='hidden' name='data' value='" + request.data + "'>";
		form += "</form>";
		$("body").append(form);

		$("#formFile").submit();

	};

	function getUrlRestService(path) {
	    var sep = "";
	    
		if (!config.urlPrefix.endsWith("/"))
		    sep = "/";
	    
		return config.urlPrefix + sep + path;
	}
});

///#source 1 1 /source/js/expanz/client/requestBuilder.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////

//
// Request Objects (used when passed to SendRequest( ... )
//
var XMLNamespace = window.config.xmlNamespace || XMLNamespace; // TODO: throw an error here, saying that window.config.xmlNamespace is required

var requestBuilder = {

    CreateSession: function (username, password, appsite, authenticationMode) {
        return {
            data: this.buildRequest('CreateSessionX', XMLNamespace)(requestBody.createSession(username, password, appsite, authenticationMode)),
            url: 'CreateSessionX'
        };
    },

    Ping: function () {
        return {
            data: this.buildRequest('Ping', XMLNamespace)(""),
            url: 'Ping'
        };
    },

    WebServerPing: function () {
        return {
            data: "",
            url: 'WebServerPing',
            method: "GET"
        };
    },

    GetSessionData: function (sessionHandle) {
        return {
            data: this.buildRequest('ExecX', XMLNamespace, sessionHandle)(requestBody.getSessionData()),
            url: 'ExecX'
        };
    },

    GetSavePreferences: function (key, value, sessionHandle) {
        return {
            data: this.buildRequest('ExecX', XMLNamespace, sessionHandle)(requestBody.createSavePreferences(key, value)),
            url: 'ExecX'
        };
    },

    CreateActivity: function (activity, sessionHandle) {
        return {
            data: this.buildRequest('ExecX', XMLNamespace, sessionHandle)(requestBody.createActivity(activity)),
            url: 'ExecX'
        };
    },

    Delta: function (id, value, activity, sessionHandle) {
        return {
            data: this.buildRequest('ExecX', XMLNamespace, sessionHandle)(requestBody.delta(id, value, activity)),
            url: 'ExecX'
        };
    },

    Method: function (name, methodAttributes, context, activity, sessionHandle) {
        return {
            data: this.buildRequest('ExecX', XMLNamespace, sessionHandle)(requestBody.createMethod(name, methodAttributes, context, activity)),
            url: 'ExecX'
        };
    },

    AnonymousMethod: function (name, methodAttributes, context, activity, anonymousFields) {
        return {
            data: this.buildRequest('ExecAnonymousX', XMLNamespace, null, true)(requestBody.createMethod(name, methodAttributes, context, activity, anonymousFields)),
            url: 'ExecAnonymousX'
        };
    },

    AnonymousMethods: function (methods, activity) {
        return {
            data: this.buildRequest('ExecAnonymousX', XMLNamespace, null, true)(requestBody.createAnonymousMethods(methods, activity)),
            url: 'ExecAnonymousX'
        };
    },

    SetContextAndDelta: function (contextInfo, deltaInfo, activity, sessionHandle) {
        var setContextRequestBody = requestBody.createSetContextElement(contextInfo.id, contextInfo.contextObject, contextInfo.type);
        var deltaRequestBody = requestBody.createDeltaElement(deltaInfo.id, deltaInfo.value, deltaInfo.matrixKey);
        var fullRequestBody = requestBody.wrapPayloadInActivityRequest(setContextRequestBody + deltaRequestBody, activity);
        
        return {
            data: this.buildRequest('ExecX', XMLNamespace, sessionHandle)(fullRequestBody),
            url: 'ExecX'
        };
    },

    CloseActivity: function (activityHandle, sessionHandle) {
        return {
            data: this.buildRequest('ExecX', XMLNamespace, sessionHandle)(requestBody.closeActivity(activityHandle)),
            url: 'ExecX'
        };
    },

    ReleaseSession: function (sessionHandle) {
        return {
            data: this.buildRequest('ReleaseSession', XMLNamespace, sessionHandle)(requestBody.createReleaseSession()),
            url: 'ReleaseSession'
        };
    },

    GetBlob: function (blobId, activity, sessionHandle) {
        return {
            data: this.buildRequestWithoutESA('GetBlob', XMLNamespace, sessionHandle)(requestBody.getBlob(blobId, activity)),
            url: 'GetBlob'
        };
    },

    GetFile: function (filename, activity, sessionHandle) {
        return {
            data: this.buildRequestWithoutESA('GetFile', XMLNamespace, sessionHandle)(requestBody.getFile(filename, activity)),
            url: 'GetFile'
        };
    },

    DataRefresh: function (dataId, activity, sessionHandle) {
        return {
            data: this.buildRequest('ExecX', XMLNamespace, sessionHandle)(requestBody.dataRefresh(dataId, activity)),
            url: 'ExecX'
        };
    },

    CreateMenuAction: function (activity, contextId, contextType, contextObject, menuAction, defaultAction, setIdFromContext, sessionHandle) {
        return {
            data: this.buildRequest('ExecX', XMLNamespace, sessionHandle)(requestBody.createMenuAction(activity, contextId, contextType, contextObject, menuAction, defaultAction, setIdFromContext)),
            url: 'ExecX'
        };
    },

    CreateContextMenuAction: function (activity, contextId, contextMenuType, contextObject, sessionHandle) {
        return {
            data: this.buildRequest('ExecX', XMLNamespace, sessionHandle)(requestBody.createContextMenuAction(activity, contextId, contextMenuType, contextObject)),
            url: 'ExecX'
        };
    },

    CreateAnonymousRequest: function (xmlData) {
        return {
            data: this.buildRequest('ExecAnonymousX', XMLNamespace, null, true)(xmlData),
            url: 'ExecAnonymousX'
        };
    },

    buildRequest: function(requestType, xmlns, sessionHandle, includeSite) {
        return function insertBody(body) {
            var site = includeSite ? '<site>' + config.appSite + '</site>' : '';
            var namespace = xmlns ? ' xmlns="' + xmlns + '" ' : '';
            var head = '<' + requestType + namespace + '>' + site + '<xml><ESA>';
            var tail = '</ESA>' + '</xml>';
            tail += sessionHandle ? '<sessionHandle>' + sessionHandle + '</sessionHandle>' : '';
            tail += '</' + requestType + '>';

            return head + body + tail;
        };
    },
    
    buildRequestWithoutESA: function(requestType, xmlns, sessionHandle) {
        return function insertBody(body) {

            var head = '<' + requestType + ' xmlns="' + xmlns + '">';
            head += sessionHandle ? '<sessionHandle>' + sessionHandle + '</sessionHandle>' : '';
            var tail = '';
            tail += '</' + requestType + '>';

            return head + body + tail;
        };
    }
};
///#source 1 1 /source/js/expanz/client/requestBody.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////

var requestBody = {

    createSession: function (username, password, appsite, authenticationMode) {
        if (authenticationMode === undefined)
            authenticationMode = "Primary";
        return '<CreateSession source="MixiLink" user="' + username + '" password="' + password + '" appSite="' + appsite + '" authenticationMode="' + authenticationMode + '" clientType="HTML" clientVersion="' + window.expanz.clientVersion + '" schemaVersion="2.0"/>';
    },

    getSessionData: function () {
        return '<GetSessionData/>';
    },

    createSavePreferences: function (key, value) {
        return '<SavePreferences><UserPreference key="' + key + '" value="' + value + '" /></SavePreferences>';
    },

    createActivity: function (activity) {
        var handle = activity.get('handle');
        var center = '';

        var unmaskedFields = '';
        
        /* if optimisation is true, ask for fields we want to avoid getting everything */
        if (activity.get('optimisation') === true) {
            activity.fields.forEach(function (field) {
                unmaskedFields += '<Field id="' + field.get('fieldId') + '" masked="0" />';
            });
        }

        center = '';
        
        if (handle) {
            if (activity.get('optimisation') === true) {
                center += this.wrapPayloadInActivityRequest(unmaskedFields, activity);
            }
            
            center += '<PublishSchema activityHandle="' + handle + '"> ';
        }
        else {
            center += '<CreateActivity ';
            center += 'name="' + activity.get('name') + '"';
            center += activity.get('style') ? ' style="' + activity.get('style') + '"' : '';
            center += activity.get('optimisation') ? ' suppressFields="1"' : '';
            center += activity.get('key') ? ' initialKey="' + activity.get('key') + '">' : '>';

            if (activity.get('optimisation') === true) {
                center += unmaskedFields;
            }
        }

        center += this.getActivityDataPublicationRequests(activity);
        
        if (handle) {
            center += '</PublishSchema>';
        }
        else {
            center += '</CreateActivity>';
        }
        
        return center;
    },

    delta: function (id, value, activity) {
        return this.wrapPayloadInActivityRequest(this.createDeltaElement(id, value), activity);
    },

    createDeltaElement: function (id, value, matrixKey) {
        var delta = '<Delta id="' + id + '" value="' + value + '"';

        if (matrixKey)
            delta += ' matrixKey="' + matrixKey + '"';

        delta += ' />';

        return delta;
    },

    createSetContextElement: function (id, contextObject, type) {
        var body = "";

        if (id) {
            body += '<Context';

            if (contextObject)
                body += ' contextObject="' + contextObject + '"';

            body += ' id="' + id + '" type="' + type + '" />';
        }

        return body;
    },

    createMethod: function (name, methodAttributes, context, activity, anonymousFields) {
        var body = '';
        
        if (activity.isAnonymous()) {
            body += this.getActivityDataPublicationRequests(activity);
        }

        if (context)
            body += this.createSetContextElement(context.id, context.contextObject, context.type);

        body += '<Method name="' + name + '"';
        
        if (methodAttributes !== undefined) {
            _.each(methodAttributes, function (attribute) {
                if (attribute.value !== undefined) {
                    body += " " + attribute.name + "='" + attribute.value + "' ";
                }
            });
        }

        /* add company code if anonymous */
        if (activity.isAnonymous()) {
            body += " company='" + config.anonymousCompanyCode + "' ";
        }

        body += '>';

        /* add all bound fields in anonymous activity case */
        if (activity.isAnonymous() && anonymousFields && anonymousFields.length > 0) {
            _.each(anonymousFields, function (field) {
                body += '<' + field.id + '>' + field.value + '</' + field.id + '>';
            });
        }

        body += '</Method>';
        
        return this.wrapPayloadInActivityRequest(body, activity);
    },

    createAnonymousMethods: function (methods, activity) {
        /* add all DataPublication as well since no activity exists, we just need id and populate method */
        var body = this.getActivityDataPublicationRequests(activity);

        $.each(methods, function (index, value) {
            body += '<Method name="' + value.name + '"';
            body += " contextObject='" + value.contextObject + "' ";
            body += " company='" + config.anonymousCompanyCode + "' ";
            body += '>';
            
            if (value.additionalElement) {
                body += value.additionalElement;
            }
            
            body += '</Method>';
        });
        
        return this.wrapPayloadInActivityRequest(body, activity);
    },

    createMenuAction: function (activity, contextId, contextType, contextObject, menuAction, defaultAction, setIdFromContext) {
        var mnuActionStr = '';
        var contextObjectStr = contextObject ? ' contextObject="' + contextObject + '"' : '';
        var contextTypeStr = contextType ? contextType : "";

        if (contextId) {
            mnuActionStr += '<Context id="' + contextId + '"' + contextObjectStr;
            mnuActionStr += contextTypeStr ? " Type='" + contextTypeStr + "' " : "";
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

        mnuActionStr += contextObjectStr + '/>';
        
        return this.wrapPayloadInActivityRequest(mnuActionStr, activity);
    },

    createContextMenuAction: function (activity, contextId, contextMenuType, contextObject) {
        var ctxtMenuStr = '';
        var contextObjectStr = contextObject ? ' contextObject="' + contextObject + '"' : '';
        var contextTypeStr = contextMenuType ? contextMenuType : contextObject;

        if (contextId) {
            ctxtMenuStr += '<Context id="' + contextId + '"' + contextObjectStr;
            ctxtMenuStr += contextTypeStr ? " Type='" + contextTypeStr + "' " : "";
            ctxtMenuStr += '/>';
        }
        
        ctxtMenuStr += '<ContextMenu ';
        ctxtMenuStr += contextObjectStr + '/>';
        
        return this.wrapPayloadInActivityRequest(ctxtMenuStr, activity);
    },

    closeActivity: function (activityHandle) {
        return '<Close activityHandle="' + activityHandle + '"/>';
    },

    createReleaseSession: function () {
        return '<ReleaseSession/>';
    },

    getBlob: function (blobId, activity) { // TODO: Activity handle element? Investigate...
        return '<activityHandle>' + activity.get('handle') + '</activityHandle><blobId>' + blobId + '</blobId><isbyteArray>false</isbyteArray>';
    },

    getFile: function (filename, activity) { // TODO: Activity handle element? Investigate...
        return '<activityHandle>' + activity.get('handle') + '</activityHandle><fileName>' + filename + '</fileName><isbyteArray>false</isbyteArray>';
    },

    dataRefresh: function (dataId, activity) { // TODO: Activity handle element? Investigate...
        return '<activityHandle>' + activity.get('handle') + '</activityHandle><DataPublication id="' + dataId + '" refresh="1" />';
    },
    
    wrapPayloadInActivityRequest: function (payload, activity) {
        if (activity.isAnonymous())
            return '<Activity id="' + activity.get('name') + '">' + payload + '</Activity>';
        else
            return '<Activity activityHandle="' + activity.get('handle') + '">' + payload + '</Activity>';
    },
    
    getActivityDataPublicationRequests: function (activity) {
        var dataPublicationRequests = '';
        
        /* add datapublication for data controls */
        activity.dataPublications.each(function (dataControl) {
            var populateMethod = dataControl.get('populateMethod') ? ' populateMethod="' + dataControl.get('populateMethod') + '"' : '';
            var query = dataControl.get('query') ? ' query="' + dataControl.get('query') + '"' : '';
            var autoPopulate = dataControl.get('autoPopulate') ? ' autoPopulate="' + dataControl.get('autoPopulate') + '"' : '';
            var type = dataControl.get('type') ? ' type="' + dataControl.get('type') + '"' : '';

            dataPublicationRequests += '<DataPublication id="' + dataControl.get('dataId') + '"' + query + populateMethod + autoPopulate + type;
            dataPublicationRequests += dataControl.get('contextObject') ? ' contextObject="' + dataControl.get('contextObject') + '"' : '';
            dataPublicationRequests += '/>';
        });

        return dataPublicationRequests;
    }
};
///#source 1 1 /source/js/expanz/client/responseParser.js
var parseCreateSessionResponse = function (callbacks) {
    return function apply(xml) {
        if ($(xml).find('CreateSessionXResult').length > 0) {
            expanz.Storage.setSessionHandle($(xml).find('CreateSessionXResult').text());
        }
        else {
            if (callbacks && callbacks.error) {
                callbacks.error("Server session error. We are unable to log you in at this time.");
            }
            window.expanz.logToConsole("Error: Server did not provide a sessionhandle. Unable to login. " + xml);
            return;
        }

        if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle().length === 0) {

            var errorString = '';

            $(xml).find('errorMessage').each(function () {
                errorString = $(this).text();
            });

            if (errorString.length > 0) {
                if (callbacks && callbacks.error) {
                    callbacks.error(errorString);
                }

                window.expanz.logToConsole(errorString);
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

function parseUserDetails(xml) {
    var userDetails = {};
    var xmlElement = $(xml).find("ESA");
    var userName = xmlElement.attr('userName');

    xmlElement = $(xml).find("MyManager");

    userDetails = {
        userName: userName,
        managerName: xmlElement.children('FirstName').text() + ' ' + xmlElement.children('LastName').text(),
        managerPhone: xmlElement.children('Phone').text(),
        managerMobilePhone: xmlElement.children('MobilePhone').text(),
        managerLevel: xmlElement.children('Level').text()
    };

    return userDetails;
}

function parseProcessAreas(xmlElement) {
    var processAreas = [];
    $(xmlElement).children('processarea').each(function () {
        var processArea = new ProcessArea($(this).attr('id'), $(this).attr('title'));
        var subProcessAreas = parseProcessAreas($(this));
        if (subProcessAreas.length > 0) {
            processArea.pa = subProcessAreas;
        }
        $(this).children('activity').each(function () {
            processArea.activities.push(new ActivityInfo($(this).attr('name'), $(this).attr('title'), '#', $(this).attr('style'), $(this).attr('image')));
        });
        processAreas.push(processArea);
    });
    return processAreas;
}

function parseRoles(xmlElement) {

    if (xmlElement === undefined || xmlElement.length === 0)
        return null;
    var roles = {};
    $(xmlElement).children('UserRole').each(function () {
        roles[$(this).attr('id')] = {
            id: $(this).attr('id'),
            name: $(this).text()
        };
    });
    return roles;
}

function parseDashboards(xmlElement) {
    // TODO: test and validate working
    if (xmlElement === undefined || xmlElement.length === 0)
        return null;
    var dashboards = {};
    $(xmlElement).children().each(function () {
        dashboards[this.tagName] = {
            'id': this.tagName
        };
        for (var j = 0; j < this.attributes.length; j++) {
            var attribute = this.attributes.item(j);
            dashboards[this.tagName][attribute.nodeName] = attribute.nodeValue;

            /* update field if in the view */
            var dashboardField = window.expanz.Dashboards.get(this.tagName + "_" + attribute.nodeName);
            if (dashboardField !== null) {
                dashboardField.set({
                    value: attribute.nodeValue
                });
            }
        }

    });
    return dashboards;
}

function parseExecAnonymousResponse(callbacks) {
    return function apply(xml) {
        var execResults = $(xml).find('ExecAnonymousXResult');
        var success = false;
        
        if (execResults.length > 0) {
            var esaResult = $(execResults).find('ESA');
            success = boolValue(esaResult.attr('success'));

            /* METHOD CASE */
            $(execResults).find('Method').each(function () {
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

            $(execResults).find('Message').each(function () {
                if ($(this).attr('type') == 'Error' || $(this).attr('type') == 'Warning') {
                    if (callbacks && callbacks.error) {
                        callbacks.error($(this).text());
                    }
                }
                else if ($(this).attr('type') == 'Info' && $(this).attr('messageSource') != 'System') {
                    if (callbacks && callbacks.info) {
                        callbacks.info($(this).text());
                    }
                }
                else if ($(this).attr('type') == 'Info' && $(this).attr('messageSource') == 'System') {
                    window.expanz.logToConsole("System-Info: " + $(this).text());
                }
            });
        }
    };
}

function parseGetSessionDataResponse(callbacks) {
    return function apply(xml) {
        var userDetails = parseUserDetails(xml);
        expanz.Storage.setUserDetails(userDetails);

        var processAreas = parseProcessAreas($(xml).find("Menu"));

        var roles = parseRoles($(xml).find("Roles"));
        expanz.Storage.setRolesList(roles);

        var dashboards = parseDashboards($(xml).find("Dashboards"));
        expanz.Storage.setDashboards(dashboards);

        /* store user preference if existing */
        $(xml).find('PublishPreferences').find('Preference').each(function () {
            window.expanz.Storage.setUserPreference($(this).attr('key'), $(this).attr('value'));
        });

        $.get('./formmapping.xml', function (data) {
            expanz.Storage.setFormMapping(data);

            $(data).find('activity').each(function () {
                var name = $(this).attr('name');
                var url = getPageUrl($(this).attr('form'));
                var style = $(this).attr('style') || "";
                var gridviewList = [];
                $(this).find('gridview').each(function () {
                    var gridview = new GridViewInfo($(this).attr('id'));
                    gridviewList.push(gridview);
                });

                fillActivityData(processAreas, url, name, style, gridviewList);

            });

            expanz.Storage.setProcessAreaList(processAreas);

            $(data).find('activity').each(function () {
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

function parseResponse(activity, initiator, callbacks) {
    return function apply(xml) {
        /* Errors case -> server is most likely not running */
        $(xml).find('errors').each(function () {
            if ($(xml).find('errors').text().indexOf(':Your session cannot be contacted') != -1) {
                expanz.views.redirect(window.expanz.getMaintenancePage());
            }
        });

        var execResults = $(xml).find("ExecXResult");

        if (execResults === null || execResults.length === 0) {
            execResults = $(xml).find("ExecAnonymousXResult");
        }

        if (execResults) {
            // REMOVED as I don't know why it would do this
            /* remove other activities from the xml except for anonymous activity */
            //if (!activity.isAnonymous()) {
            //    $(execResults).find("Activity[activityHandle!='" + activity.get('handle') + "']").remove();
            //}

            var esaNode = execResults.children("ESA");

            if (esaNode.length !== 0) {
                esaNode.children().each(function () {
                    var currentElement = this;

                    switch (currentElement.nodeName) {
                        case "Activity":
                            parseActivityResponse(currentElement, initiator);
                            break;
                        case "ActivityRequest":
                            parseActivityRequestResponse(currentElement);
                            break;
                        case "Messages":
                            parseApplicationMessagesResponse(currentElement);
                            break;
                        case "Dashboards":
                            parseDashboardsResponse(currentElement);
                            break;
                        case "Files":
                            parseFilesResponse(currentElement, activity, initiator);
                            break;
                        default:
                            expanz.logToConsole("Unexpected element '" + currentElement.nodeName + "' found in response. Ignored.");
                            break;
                    }
                });
            }
        }

        // TODO: Check if this should really be here, and what it actually does
        activity.set({
            'deltaLoading': {
                isLoading: false,
                initiator: initiator
            }
        });
    };
}

function parseActivityResponse(activityElement, initiator) {
    // Find the corresponding activity in the list of open activities
    var $activityElement = $(activityElement);
    var activityHandle = $activityElement.attr('activityHandle');
    var activityView = null;

    if (initiator && initiator !== null && initiator.type === "CreateActivity") {
        // This activity is the result of a create activity request, where the model doesn't have a handle yet
        activityView = window.expanz.findOpenActivityViewByModel(initiator.activityModel);
        
        initiator.activityModel.set({
            handle: $activityElement.attr('activityHandle')
        });
        
        expanz.Storage.setActivityHandle(initiator.activityModel.get('handle'), initiator.activityModel.get('name'), initiator.activityModel.get('style'));
    } else {
        activityView = window.expanz.findOpenActivityViewByHandle(activityHandle);
    }

    if (activityView != null) {
        // Activity found, so parse the XML in the response for it, and apply it to the model
        var activityModel = activityView.model;

        // Clear any current errors being displayed
        activityModel.messageCollection.reset();

        $activityElement.children().each(function () {
            var currentElement = this;

            switch (currentElement.nodeName) {
                case "Field":
                    parseFieldResponse(currentElement, activityModel);
                    break;
                case "Method":
                    parseMethodResponse(currentElement, activityModel);
                    break;
                case "Data":
                    parseDataResponse(currentElement, activityModel, activityView);
                    break;
                case "Messages":
                    parseActivityLevelMessagesResponse(currentElement, activityModel);
                    break;
                case "UIMessage":
                    parseUIMessageResponse(currentElement, activityModel);
                    break;
                case "ModelObject":
                    parseModelObjectResponse(currentElement, activityModel);
                    break;
                case "Graph":
                    // Not currently supported - placeholder for the future
                    expanz.logToConsole("Graph data is not currently supported by this SDK. Ignored.");
                    break;
                case "ContextMenu":
                    parseContextMenuResponse(currentElement, activityModel);
                    break;
                case "CustomContent":
                    // Not currently supported - placeholder for the future
                    expanz.logToConsole("CustomContent data is not currently supported by this SDK. Ignored.");
                    break;
                case "Types":
                    // Ignore
                    break;
                default:
                    expanz.logToConsole("Unexpected element '" + currentElement.nodeName + "' found in response. Ignored.");
                    break;
            }
        });

        // Check if the activity is to be closed
        if ($activityElement.attr("closeWindow") !== undefined && boolValue($activityElement.attr("closeWindow"))) {
            activityModel.closeActivity();
        }

        // Check if the focus is to be set to a specific field
        var focusFieldId = $activityElement.attr("focusField");

        if (focusFieldId !== undefined) {
            activityModel.setFieldFocus(focusFieldId);
        }

        activityModel.set({
            loading: false
        });
    } else {
        // Houston, we have a problem. For now at least, just ignore.
        expanz.logToConsole("An activity with handle '" + activityHandle + "' is not found!");
    }
}

function parseFieldResponse(fieldElement, activityModel) {
    var $fieldElement = $(fieldElement);
    var id = $fieldElement.attr('id');

    _.each(activityModel.fields.where({ fieldId: id }), function (field) {
        field.publish($fieldElement);
    });
}

function parseMethodResponse(methodElement, activityModel) {
    var $methodElement = $(methodElement);
    var id = $methodElement.attr('id');
    var method = activityModel.methods.get(id);

    if (method && method !== undefined) {
        method.publish($methodElement);
    }
}

function parseDataResponse(dataElement, activityModel, activityView) {
    var $dataElement = $(dataElement);
    var id = $dataElement.attr('id');
    var pickfield = $dataElement.attr('pickField');

    if (id == 'picklist') {
        // Server has sent back a picklist, so pop up a window to display it
        var elId = id + pickfield.replace(/ /g, "_");

        var clientMessage = new expanz.models.ClientMessage({
            id: elId,
            title: pickfield,
            text: '',
            parent: activityModel
        });

        var picklistWindow = new window.expanz.views.PicklistWindowView({
            id: clientMessage.id,
            model: clientMessage
        }, $('body'));

        expanz.Factory.bindDataControls(activityView, picklistWindow.$el.parent());

        var dataPublicationModel = activityModel.dataPublications.get(elId + "_host_0");
        populateDataPublicationModel(dataPublicationModel, $dataElement);
    }
    else {
        var dataControlModels = activityModel.dataPublications.getChildrenByAttribute("dataId", id);

        _.each(dataControlModels, function(dataControlModel) {
            populateDataPublicationModel(dataControlModel, $dataElement);
        });

        // Variant fields also can consume data publications, but are handled separately 
        // as they behave more like fields than data publications (ie. they don't register 
        // as data publications with the activity).
        _.each(activityModel.fields.where({ fieldId: id }), function (field) {
            field.publishData($dataElement);
        });
    }
}

function parseActivityLevelMessagesResponse(messagesElement, activityModel) {
    var $messagesElement = $(messagesElement);

    $messagesElement.children('Message').each(function () {
        var $messageElement = $(this);

        var messageModel = {
            type: $messageElement.attr('type'),
            key: $messageElement.attr('key'),
            source: $messageElement.attr('source'),
            messageSource: $messageElement.attr('messageSource'),
            message: $messageElement.text()
        };

        activityModel.messageCollection.addMessage(messageModel);

        // Now look for any fields with the same id as the source specified by the message, and
        // pass them the message if there are.
        var source = messageModel.source;

        if (source && source !== undefined) {
            _.each(activityModel.fields.where({ fieldId: source }), function (field) {
                field.set({
                    errorMessage: activityModel.messageCollection.transformMessage(messageModel.message),
                    error: true
                });
            });
        }
    });
}

function parseUIMessageResponse(uiMessageElement, activityModel) {
    var $uiMessageElement = $(uiMessageElement);

    var clientMessage = new expanz.models.ClientMessage({
        id: 'ExpanzClientMessage',
        title: $uiMessageElement.attr('title'),
        text: $uiMessageElement.attr('text'),
        parent: activityModel
    });

    $uiMessageElement.find('Action').each(function () {
        var $actionElement = $(this);

        var methodAttributes = [];

        if ($('Request > Method', $actionElement)[0] && $('Request > Method', $actionElement)[0].attributes.length > 0) {
            _.each($('Request > Method', $actionElement)[0].attributes, function (attribute) {
                if (attribute.name != 'name') {
                    methodAttributes.push({
                        name: attribute.name,
                        value: attribute.value
                    });
                }
            });
        }

        var actionModel = new expanz.models.Method({
            id: $('Request > Method', $actionElement)[0] ? $($('Request > Method', $actionElement)[0]).attr('name') : 'close',
            label: $actionElement.attr('label'),
            response: $('Response', $actionElement)[0] ? $($('Response', $actionElement)[0]).children() : undefined,
            parent: activityModel,
            methodAttributes: methodAttributes
        });

        clientMessage.actions.add(actionModel);
    });

    var uiMsg = new window.expanz.views.UIMessage({
        id: clientMessage.id,
        model: clientMessage
    }, $('body'));
}

function parseModelObjectResponse(modelObjectElement, activityModel) {
    // TODO: Not currently handled
    // NOTE: Only passes the dirty status of the model objects included in the activity
}

function parseContextMenuResponse(contextMenuElement, activityModel) {
    var caller = window.expanz.currentContextMenu;

    if (caller !== undefined && caller !== null) {
        if (caller.loadMenu !== undefined) {
            // If the caller was a context menu model, then this method will exist
            caller.loadMenu(contextMenuElement, activityModel);
        } else {
            // If the caller was a method model, then we'll need to create a
            // context menu view and model
            var contextMenuModel = new expanz.models.ContextMenu({
                id: caller.id + "_contextmenu",
                parentActivity: activityModel
            });

            contextMenuModel.loadMenu(contextMenuElement, activityModel);
            caller.setContextMenu(contextMenuModel);
        }
    }
}

function parseActivityRequestResponse(activityRequestElement) {
    var $activityRequestElement = $(activityRequestElement);

    var id = $activityRequestElement.attr('id');
    var key = $activityRequestElement.attr('key');
    var style = $activityRequestElement.attr('style') || "";

    window.expanz.openActivity(id, style, key);
}

function parseApplicationMessagesResponse(messagesElement) {
    var $messagesElement = $(messagesElement);

    var message = "";

    $messagesElement.children('Message').each(function () {
        var $messageElement = $(this);

        // First check if the message relates to the session being lost.
        // If so, ask the user to log in again.
        var sessionLost = /Session .* not found/.test($messageElement.text());
        var activityNotFound = /Activity .* not found/.test($messageElement.text());

        if (sessionLost || activityNotFound) {
            window.expanz.security.showLoginPopup();
        } else {
            // Add any other messages to a list to be displayed to the user in a message box
            if (window.config.useBundle === true) {
                // Pass the message to an implementation specific message converter, that may
                // transform the message from the server to something more suitable for display
                var data = null;

                if (typeof window.expanz.findMessageKey == 'function') {
                    data = window.expanz.findMessageKey($messageElement.text());
                } else {
                    expanz.logToConsole("window.expanz.findMessageKey not found in your implementation");
                }

                if (data !== null) {
                    var tempMessage = jQuery.i18n.prop(data['key'], data['data']);
                    
                    if (tempMessage.length !== 0) {
                        message += "\n\n" + tempMessage;
                    }
                }
            } else {
                message += "\n\n";
                message += $messageElement.text();
            }
        }
    });

    if (message.length !== 0) {
        alert("The following message(s) have been returned from the server:" + message);
    }
}

function parseDashboardsResponse(dashboardsElement) {
    var $dashboardsElement = $(dashboardsElement);

    // TODO: test and validate working
    var dashboards = parseDashboards($dashboardsElement.find("Dashboards"));

    if (dashboards !== null) {
        expanz.Storage.setDashboards(dashboards);
    }
}

function parseFilesResponse(filesElement, activity, initiator) {
    var $filesElement = $(filesElement);

    $filesElement.children('File').each(function (data) {
        var $fileElement = $(this);

        if ($fileElement.attr('field') !== undefined && $fileElement.attr('path') !== undefined) {
            window.expanz.logToConsole("Blob found by field: " + $fileElement.attr('field') + " - " + $fileElement.attr('path'));
            expanz.net.GetBlobRequest($fileElement.attr('field'), activity, initiator);
        }
        else if ($fileElement.attr('name') !== undefined) {
            window.expanz.logToConsole("File found by name: " + $fileElement.attr('name'));
            expanz.net.GetFileRequest($fileElement.attr('name'), activity, initiator);
        }
        else {
            window.expanz.logToConsole("Not yet implemented");
        }
    });
}

// TODO: Merge into core response handler
function parseCloseActivityResponse(callbacks) {
    return function apply(xml) {
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
    };
}

function parseReleaseSessionResponse(callbacks) {
    return function apply(xml) {
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

function fillActivityData(processAreas, url, name, style, gridviewList) {
    $.each(processAreas, function (i, processArea) {
        $.each(processArea.activities, function (j, activity) {
            if (activity.name == name && activity.style == style) {
                activity.url = url;
                activity.gridviews = gridviewList;
            }
        });

        /* do it for sub process activity */
        fillActivityData(processArea.pa, url, name, style, gridviewList);

    });
}

function populateDataPublicationModel(dataPublicationModel, data) {
    var $data = $(data);
    
    dataPublicationModel.rows.reset();

    dataPublicationModel.contextObject = $data.attr('contextObject');
    dataPublicationModel.isEditable = $(data).attr('hasEditableColumns') === "1";
    
    if ($data.attr('clearColumnDefinitions') !== "0") {
        dataPublicationModel.columns.reset();
    }

    // Add columns to the grid Model
    _.each($data.find('Column'), function (column) {
        var $column = $(column);
        dataPublicationModel.addColumn($column.attr('id'), $column.attr('field'), $column.attr('label'), $column.attr('datatype'), $column.attr('width'), $column.attr('editable') === "1", $column.attr('matrixKey'));
    });

    // Add rows to the grid Model
    _.each($data.find('Row'), function (row) {
        var $row = $(row);
        var rowId = $(row).attr('id');
        
        var rowModel = dataPublicationModel.addRow(rowId, $row.attr('type') || $row.attr('Type'), $row.attr('displayStyle'));

        // Add cells to this row
        _.each($row.find('Cell'), function (cell) {
            cell = serializeXML(cell); // quick fix for htmlunit
            var $cell = $(cell);
            
            rowModel.addCell($cell.attr('id'), $cell.text(), dataPublicationModel.columns.get($cell.attr('id')), $cell.attr('sortValue'));
        });
    });

    dataPublicationModel.dataPublished($data);
}
///#source 1 1 /source/js/expanz/client/ActivityInfo.js
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
///#source 1 1 /source/js/expanz/client/ProcessArea.js
// TODO reduce name length because store in cookies as json string and take bandwiths (limitation on cookie size can be reached as well)
function ProcessArea(id, title) {
    this.id = id;
    this.title = title;
    this.activities = [];
    this.pa = []; /* sub process area */
}
///#source 1 1 /source/js/expanz/client/GridViewInfo.js
function GridViewInfo(id) {
    this.id = id;
    this.columns = [];

    this.addColumn = function (field, width) {
        this.columns.push(new ColumnInfo(field, width));
    };

    function ColumnInfo(field, width) {
        this.field = field;
        this.width = width;
    }
}
///#source 1 1 /source/js/expanz/expanz.storage.js
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
				 * length is unused but please leave it. I don't know why but sometimes firefox get an empty window.localStorage by mistake 
                   Doing this force it to evaluate the window.localStorage object and it seems to work
				 * SMN Possibly try Modernizr (http://diveintohtml5.info/storage.html)
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
			return "_expanz_" + config.appSite + config.implementationId + "_";
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

			if (activityHandle === undefined || activityHandle === null)
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

		getUserDetailsList : function() {
			var userDetails = JSON.parse(this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'userDetails.list'));
			return userDetails;
		},
		
		setUserDetails : function(userDetails) {
			this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'userDetails.list', JSON.stringify(userDetails));
			return true;
		},
		
		setRolesList : function(roles) {
			this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'roles.list', JSON.stringify(roles));
			return true;
		},

		/* is used for display but HAVE TO be enforced on the server as well */
		hasRole : function(id) {
			var roles = JSON.parse(this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'roles.list'));
			if (roles !== null) {
				return (roles[id] !== undefined);
			}
			return false;
		},

		setDashboards : function(dashboards) {
			this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'dashboards', JSON.stringify(dashboards));
			return true;
		},

		getDashboardFieldValue : function(dashboardName, fieldName) {
			var dashboards = JSON.parse(this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'dashboards'));
			if (dashboards !== null && dashboards[dashboardName] !== null) {
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

		setFormMapping: function (value) {
		    this._formMappingData = value;
		    this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'FormMapping', serializeXML(value));
			return true;
		},

		getFormMapping: function () {
		    if (this._formMappingData === undefined) {
		        var formMappingXml = this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'FormMapping');
		        
		        if (formMappingXml != null)
		            this._formMappingData = $.parseXML(formMappingXml);
		    }
		    
		    return this._formMappingData;
		},

		clearSession : function() {
			var storage = this._getBestStorage();
			var storageGlobalName = expanz.Storage._getStorageGlobalName();
			storage.remove(storageGlobalName + 'session.handle');
			storage.remove(storageGlobalName + 'lastPingSuccess');
			storage.remove(storageGlobalName + 'roles.list');
			storage.remove(storageGlobalName + 'dashboards');
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
			if (ah !== undefined && ah !== null) {
				this._getBestStorage().remove(expanz.Storage._getStorageGlobalName() + 'activity.handle.' + activityName + activityStyle);
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
		
		sessionStorage: {
		    name: 'sessionStorage',
		    set: function (key, data) {
		        window.sessionStorage.setItem(key, data);
		    },

		    get: function (key) {
		        return window.sessionStorage.getItem(key);
		    },

		    getKeys: function (pattern) {
		        var keys = [];
		        for (i = 0; i < window.sessionStorage.length; i++) {
		            key = window.sessionStorage.key(i);
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

		    remove: function (key) {
		        return window.sessionStorage.removeItem(key);
		    }
		}
	};
});

///#source 1 1 /source/js/expanz/menu/AppSiteMenu.js
$(function() {

    window.expanz = window.expanz || {};
    window.expanz.menu = window.expanz.menu || {};

    window.expanz.menu.AppSiteMenu = function() {
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
            } else {
                // clear the DOM menu

                var url = window.location.href;
                var currentPage = url.substring(url.lastIndexOf('/') + 1);
                if (window.config.homePage && currentPage.length == 0) {
                    currentPage = getPageUrl(window.config.homePage);
                }

                // load process areas into DOM menu
                el.append('<ul id="menuUL" class="menu"></ul>');

                var homeLabel = el.attr('homeLabel') || 'Home';
                var logoutLabel = el.attr('logoutLabel') || 'Logout';
                var backLabel = el.attr('backLabel') || 'Back';

                // add back button if defined
                if (window.config.backButton === true) {
                    el.find("#menuUL").before('<a href="javascript:void(0);" onclick="history.go(-1);return true;" class="backbutton">' + backLabel + '</a>');
                }

                // add home page if defined
                if (window.config.homePage) {
                    var homeClass = "";

                    url = getPageUrl($(this).attr('form'));
                    var urlHome = getPageUrl(window.config.homePage);
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
                    expanz.security.logout();
                });
            }
        };
    };
});

///#source 1 1 /source/js/expanz/menu/ProcessAreaMenu.js
$(function() {

    window.expanz = window.expanz || {};
    window.expanz.menu = window.expanz.menu || {};

    window.expanz.menu.ProcessAreaMenu = function(id, title) {
        this.id = id;
        this.title = title;
        this.activities = [];
        this.pa = []; /* sub process area */

        this.load = function(el, level, displayAsIcons, parentSubProcesses) {
            var url = window.location.href;
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
            } else {
                var ulId = this.id + '_' + level;
                if (this.activities.length > 0) {
                    /* replace the link of the parent if only one activity in the menu */
                    if (this.activities.length == 1) {
                        url = this.activities[0].url;
                        el.find("[class='menuTitle']").attr('href', url);
                        /* workaround for kendo issue : bind touchend */
                        el.find("[class='menuTitle']").bind("touchend", function(e) {
                            window.location.href = url;
                        });

                        /* add selected class if current */
                        if (url == currentPage) {
                            el.addClass("selected selectedNew");
                        }
                    } else {
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
    };
});

///#source 1 1 /source/js/expanz/menu/ActivityMenu.js
$(function() {

    window.expanz = window.expanz || {};
    window.expanz.menu = window.expanz.menu || {};

    window.expanz.menu.ActivityMenu = function(name, style, title, url, img) {
        this.name = name;
        this.style = style;
        this.title = title;
        this.url = url;
        this.img = img;

        this.load = function(el, displayAsIcons) {
            this.title = this.title.replace("[CR]", "<br />");
            if (displayAsIcons === true) {
                el.append('<li><div class="icon navContainer"><a class="nav-' + this.name.replace(/\./g, "-") + "-" + this.style.replace(/\./g, "-") + ' navItem" href="' + this.url + '"></a><a class="navText" href="' + this.url + '">' + this.title + '</a></div></li>');
            } else {
                el.append('<li class="activity">' + '<a href=\'' + this.url + '\'>' + this.title + '</a>' + '</li>');
            }
        };
    };
});

///#source 1 1 /source/js/expanz/views/expanz.views.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

	window.expanz = window.expanz || {};
	window.expanz.views = window.expanz.views || {};
    
	// Common Functions
    window.expanz.views.redirect = function (page) {
		window.location.href = getPageUrl(page);
	};

    window.expanz.views.requestLogin = function () {
		/* if redirection to login page store the last page to be able to redirect the user once logged in */
		window.expanz.Storage.setLastURL(document.URL);
		window.expanz.views.redirect(expanz.security.getLoginPage());
	};

    window.expanz.views.updateViewElement = function (view, elem, allAttrs, attr, model) {
        var $elem = $(elem);
        var datatype = allAttrs['datatype'];

        if (datatype && datatype.toLowerCase() === 'blob' && attr && attr === 'value') {
            var width = allAttrs['width'];
            var imgElem = '<img src="' + window.config.urlBlobs + allAttrs['value'] + '"';
            imgElem += width ? ' width="' + width + '"' : 'width="100%"';
            imgElem += '/>';
            $elem.html(imgElem);
            return;
        }

        var value = allAttrs[attr];

        var valueTransformFunction = $elem.attr("valueTransformFunction");
        
        if (valueTransformFunction !== undefined) {
            try {
                value = eval(valueTransformFunction)(value);
            } catch(err) {
                window.expanz.logToConsole("Value could not be transformed with function (check function exists): " + valueTransformFunction);
            }
        }
        
        if (allAttrs["null"] === true) {
            value = null;
        }

        if (value !== undefined) {
            var event = jQuery.Event("valueUpdated");
            
            if (attr === "value")
                $elem.trigger(event, [value, model]); // Extensibility point for adapters

            if (event.result === undefined) { // Only if no adapter has handled setting the value itself, then we continue and set using default behaviour
                /* multi choice field -> display as checkboxes */
                // NOTE: The model doesn't currently populate the items property anymore, as it leads to an
                // endless loop in underscore.js in Chrome. As not required for now, commenting out.
                //if (allAttrs.items !== undefined && allAttrs.items.length > 0 && attr === 'value') {
                //    var disabled = boolValue($elem.attr('editable')) ? "" : "disabled='disabled'";
                //    _.each(allAttrs.items, function(item) {
                //        var selected = boolValue($(item).attr('selected')) === true ? ' checked="checked" ' : '';
                //        var text = $(item).attr('text');
                //        var value = $(item).attr('value');
                //        $elem.append("<div><input " + disabled + selected + "' value='" + value + "' name='checkbox' type='checkbox'></input><span>" + text + "</span></div>");
                //    });
                //} else
                if ($elem.is('input')) {
                    // special behaviour for checkbox input
                    if ($elem.is(":checkbox") || $elem.is(":radio")) {
                        $elem.addClass('checkbox');
                        var checkedValue = $elem.attr("checkedValue") ? $elem.attr("checkedValue") : 1;

                        if (value == checkedValue) {
                            $elem.prop("checked", true);
                        } else {
                            $elem.prop("checked", false);
                        }
                    } else {
                        $elem.val(value);
                    }

                    // if the field is disabled apply the disabled attribute and style
                    if (allAttrs["disabled"] === true) {
                        $elem.attr('disabled', true);
                        $elem.addClass('readonlyInput');
                    } else {
                        $elem.removeAttr('disabled');
                        $elem.removeClass('readonlyInput');
                    }
                } else if ($elem.is('textarea')) {
                    $elem.val(value);
                } else {
                    /* if value is empty put an unbreakable space instead */
                    $elem.html(value || '&nbsp;');
                }
            }
        }

        return elem;
    };
});

///#source 1 1 /source/js/expanz/views/expanz.views.FieldView.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

    window.expanz = window.expanz || {};
    window.expanz.views = window.expanz.views || {};

    window.expanz.views.FieldView = Backbone.View.extend({

        initialize: function () {
            this.model.bind("change:label", this.modelUpdate('label'), this);
            this.model.bind("change:value", this.modelUpdate('value'), this);
            this.model.bind("change:text", this.modelUpdate('text'), this);
            this.model.bind("change:items", this.modelUpdate('value'), this);
            this.model.bind("change:date", this.modelUpdate('date'), this);
            this.model.bind("change:time", this.modelUpdate('time'), this);
            this.model.bind("change:DayOfWeek", this.modelUpdate('DayOfWeek'), this);
            this.model.bind("change:time24", this.modelUpdate('time24'), this);
            this.model.bind("change:timeAMPM", this.modelUpdate('timeAMPM'), this);
            this.model.bind("change:data", this.publishData, this);
            this.model.bind("change:disabled", this.onDisabledChanged, this);
            this.model.bind("change:hidden", this.onHiddenChanged, this);
            this.model.bind("change:errorMessage", this.displayError(), this);
            this.model.bind("change:loading", this.loading, this);
            this.model.bind("setFocus", this.setFocus, this);
        },

        modelUpdate: function (attr) {
            var view = this;
            
            return function () {
                var elem = null;

                if (this.$el.attr("attribute") === "value")
                    elem = this.$el;
                else
                    elem = this.$el.find('[attribute=' + attr + ']');
                
                expanz.views.updateViewElement(view, elem, this.model.attributes, attr, this.model);
                view.render();
                
                this.$el.trigger('update:field');
            };
        },

        publishData: function () {
            this.$el.trigger("publishData", [
				this.model.get("data"), this
            ]);
        },
        
        onDisabledChanged: function () {
            // If the field is disabled, apply the disabled attribute and style
            if (this.model.get("disabled") === true) {
                this.$el.attr('disabled', true);
                this.$el.addClass('readonlyInput');
            } else {
                this.$el.removeAttr('disabled');
                this.$el.removeClass('readonlyInput');
            }
            
            var inputElement = this.getInputElement();

            if (inputElement === undefined || inputElement === null)
                inputElement = this.$el;
            
            inputElement.trigger("disabledChanged", this.model.get("disabled"));
        },
        
        onHiddenChanged: function () {
            // If the field is hidden, hide the element
            var isVisible = !this.model.get("hidden");

            setVisibility(this.$el, isVisible);
            
            this.$el.trigger("visibilityChanged", isVisible);
        },

        displayError: function () {
            return function () {
                var errorId = 'error' + this.model.get('id').replace(/\./g, "_");
                
                // TODO: Also change the label font colour to red?
                if (this.$el.attr('showError') !== 'false') {
                    var errorEl;
                    
                    if (this.model.get('errorMessage') !== undefined) {
                        errorEl = this.$el.find('#' + errorId);
                        
                        if (errorEl.length < 1) {
                            this.$el.append('<p class="errorMessage" id="' + errorId + '"></p>');
                            errorEl = this.$el.find('#' + errorId);
                        }
                        
                        errorEl.html(this.model.get("errorMessage"));
                        
                        this.$el.addClass("errorField");
                    }
                    else {
                        errorEl = this.$el.find('#' + errorId);
                        
                        if (errorEl) {
                            errorEl.remove();
                        }
                        
                        this.$el.removeClass("errorField");
                    }
                }

                this.getInputElement().trigger("errorChanged", this.model.get("errorMessage"));
            };
        },

        events: {
            "change [attribute=value]": "viewUpdate"
        },
        
        getInputElement: function () {
            if (this.$el.attr("attribute") === "value")
                return this.$el;
            else
                return this.$el.find('[attribute=value]');
        },

        getValue: function () {
            var elem = this.getInputElement();

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

        viewUpdate: function (event) {
            // handle multi-choices
            if (this.model.get('items') !== undefined && this.model.get('items').length > 0) {
                this.model.update({
                    value: (event.target.checked ? 1 : -1) * (event.target.value)
                });
            }
            else {
                this.model.update({
                    value: this.getValue()
                });
            }

            this.$el.trigger('update:field');
        },

        loading: function () {
            /* nothing special done when a field is loading at the moment */
        },

        setFocus: function () {
            var inputElement = this.getInputElement();
            
            if (inputElement != undefined && inputElement != null)
                inputElement.focus();
        }
    });
});

///#source 1 1 /source/js/expanz/views/expanz.views.DataFieldView.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

    window.expanz = window.expanz || {};
    window.expanz.views = window.expanz.views || {};

    window.expanz.views.DataFieldView = window.expanz.views.FieldView.extend({

        initialize: function (params) {
            this.dataModel = params["dataModel"];
            
            this.model.bind("change:label", this.modelUpdate('label'), this);
            this.model.bind("change:value", this.valueChanged, this);
            this.model.bind("change:text", this.modelUpdate('text'), this);
            this.model.bind("change:items", this.modelUpdate('value'), this);
            //this.model.bind("change:data", this.dataChanged, this);
            this.model.bind("change:disabled", this.onDisabledChanged, this);
            this.model.bind("change:hidden", this.onHiddenChanged, this);
            this.model.bind("change:errorMessage", this.displayError(), this);
            this.model.bind("change:loading", this.loading, this);
            this.model.bind("setFocus", this.setFocus, this);
            
            this.dataModel.bind("datapublication:dataPublished", this.dataChanged, this);
        },

        valueChanged: function () {
            var elem = this.getInputElement();
            var value = this.model.get("value");
            
            elem.val(value);
            elem.trigger("valueUpdated", [value, this.model]); // Extensibility point for adapters
        },

        dataChanged: function () {
            this.getInputElement().trigger("publishData", [
				this.dataModel, this
            ]);
            
            // A value might have been added to the field (such as a dropdown list) that can now be selected 
            // since it will now be in the list (setting it earlier will have failed).
            this.valueChanged();
        }
    });
});
///#source 1 1 /source/js/expanz/views/expanz.views.DataPublicationView.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

    window.expanz = window.expanz || {};
    window.expanz.views = window.expanz.views || {};

    window.expanz.views.DataPublicationView = Backbone.View.extend({
        
        initialize: function (params) {
            this.model.bind("datapublication:dataPublished", this.onDataPublished, this);

            this.currentPage = 1;
            this.itemsPerPage = params.itemsPerPage != undefined ? parseInt(params.itemsPerPage) : 9999;
        },

        onDataPublished: function () {
            var handledExternally = this.raiseExtensibilityPointEvent("publishData");
            
            if (!handledExternally)
                this.render();
        },

        render: function () {
            // Notify listeners (such as adapters) that we are about to render
            // the data publication, and give them a chance to take over.
            var hasBeenRenderedExternally = this.raiseExtensibilityPointEvent("rendering");

            if (hasBeenRenderedExternally === true)
                return this; // Rendering already performed by adapter, so return early

            this.$el.html(""); // Clear the contents of the host element
            
            // Render header
            var headerView = new expanz.views.subviews.DataPublicationHeaderView({ model: this.model, dataPublicationView: this });
            this.$el.append(headerView.render().el);

            // Render body
            var bodyView = new expanz.views.subviews.DataPublicationBodyView({ model: this.model, dataPublicationView: this });
            this.$el.append(bodyView.render().el);
            
            // Render paging bar - needs to append paging bar to parent element, or use the
            // existing one if found
            var existingPagingBarElement = this.$el.parent().find("#pagingBar");
            var pagingBarView = new expanz.views.subviews.DataPublicationPagingBarView({ model: this.model, dataPublicationView: this, el: existingPagingBarElement[0] });
            var renderedPagingBarElement = pagingBarView.render().el;
            
            if (existingPagingBarElement.length === 0)
                this.$el.parent().append(renderedPagingBarElement);

            // Logic dealing with the number of items in the list. Store the item
            // count as an attribute on the element, and if there are no items then
            // apply a class to the element, and show a message (if supplied).
            this.$el.attr('data-itemcount', this.model.rows.length);
            
            if (this.model.rows.length === 0) {
                this.$el.addClass("empty");

                var noItemsText = this.$el.attr("noItemsText");
                
                if (noItemsText)
                    this.$el.append('<div id="noItemsText" class="emptyListText">' + noItemsText + '</div>');
            } else {
                this.$el.removeClass("empty");
            }

            this.raiseExtensibilityPointEvent("rendered");

            return this;
        },

        onRowClicked: function (rowView) {
            // Does nothing by default. Function can be redefined or the event raised can be handled by external code as required.
            this.raiseExtensibilityPointEvent("rowClicked");
        },

        onRowDoubleClicked: function (rowView) {
            // Does nothing by default. Function can be redefined or the event raised can be handled by external code as required.
            this.raiseExtensibilityPointEvent("rowDoubleClicked");
        },

        onDrillDown: function (rowView) {
            // Function can be redefined or the event raised can be handled by external code as required. Default is to set context on server.
            var handledExternally = this.raiseExtensibilityPointEvent("rowDrillDown");
            
            if (!handledExternally)
                this.model.drillDown(rowView.model.id, rowView.model.get("type"), null);
        },

        onCellValueChanged: function ($input, rowView, $cell) {
            var columnId = $cell.attr("data-columnid");

            var cellModel = rowView.model.cells.get(columnId);
            var newValue = $input.val();

            if ($input.attr("type") === "checkbox")
                newValue = $input.is(':checked') ? "1" : "0";
            
            this.model.sendCellUpdateToServer(cellModel, newValue);
        },

        itemTemplateName: function () {
            return this.options['templateName'] || this.model.get("dataId") + "ItemTemplate";
        },
        
        raiseExtensibilityPointEvent: function(eventName, args) {
            // Notify listeners (such as adapters) that we are about to do
            // or have done something, and give them a chance to take over.
            // Acts as an extensibility point for adapters.
            if (!args)
                args = {};

            args.handled = false;
            
            this.$el.trigger("datapublication:" + eventName, [
				this.model, this, args
            ]);
            
            return args.handled;
        }
    });
});

///#source 1 1 /source/js/expanz/views/expanz.views.VariantFieldView.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

    window.expanz = window.expanz || {};
    window.expanz.views = window.expanz.views || {};

    window.expanz.views.VariantFieldView = window.expanz.views.FieldView.extend({

        template: _.template("<input id='textinput' attribute='value' type='text' style='display: none' /> " +
	                         "<label id='booleaninput' style='display: none'><input attribute='value' type='checkbox' /> Yes / I Agree</label>" +
	                         "<div id='options' style='display: none' />"),

        initialize: function () {
            this.model.bind("change:label", this.modelUpdate('label'), this);
            this.model.bind("change:value", this.valueChanged(), this);
            this.model.bind("change:data", this.dataChanged(), this);
            this.model.bind("change:visualType", this.visualTypeChanged(), this);
            this.model.bind("change:disabled", this.onDisabledChanged, this);
            this.model.bind("change:hidden", this.onHiddenChanged, this);
            this.model.bind("change:errorMessage", this.displayError(), this);
            this.model.bind("change:loading", this.loading, this);

            this.$el.html(this.template({ 'name': this.$el.attr('name') }));

            this.textInput = this.$el.find('[id=textinput]');
            this.booleanControl = this.$el.find('[id=booleaninput]');
            this.booleanInput = this.booleanControl.find('[attribute=value]');
            this.optionInput = this.$el.find('[id=options]');
        },

        visualTypeChanged: function () {
            var view = this;
            return function () {
                view.render();
                this.$el.trigger('update:field');
            };
        },

        valueChanged: function () {
            var view = this;
            return function () {
                this.updateActiveInputValue(this.model.get("value"));
            };
        },

        dataChanged: function () {
            var view = this;
            return function () {
                this.optionInput.html("");

                var radioButtonItemTemplate = _.template("<div><label><input id='<%= id %>' name='<%= group %>' value='<%= rowId %>' attribute='value' type='radio' /> <%= label %></label></div>");

                var xml = this.model.get("data");

                _.each(xml.find('Row'), function (row) {
                    var fieldName = view.$el.attr('name');
                    var rowId = $(row).attr('id');

                    var cell = $(row).find('Cell');

                    var label = $(cell).text();
                    var id = view.model.id.replace(/\./g, "_") + "_" + rowId;

                    view.optionInput.append(radioButtonItemTemplate({
                        'id': id,
                        'rowId': rowId,
                        'label': label,
                        'group': fieldName
                    }));
                });

                this.updateActiveInputValue(this.model.get("value"));

                this.$el.trigger('update:field');
            };
        },

        render: function () {
            this.textInput.hide();
            this.booleanControl.hide();
            this.optionInput.hide();

            var inputField = this.activeInputField();

            if (inputField != null) {
                this.updateActiveInputValue(this.model.get("value"));

                this.activeInputControl().show();
            }

            return this;
        },

        getValue: function () {
            var value = null;

            var visualType = this.model.get("visualType");

            if (visualType == "cb") {
                value = boolString(this.booleanInput.prop("checked"));
            } else if (visualType == 'rb') {
                var selectedCheckBox = this.optionInput.find(":checked"); // Gets the selected radio button
                value = selectedCheckBox.val();
            } else if (visualType == 'txt') {
                value = this.textInput.val();
            }

            return value;

        },

        activeInputControl: function () {
            var visualType = this.model.get("visualType");
            var control = null;

            if (visualType == 'cb') {
                control = this.booleanControl;
            } else if (visualType == 'rb') {
                control = this.optionInput;
            } else if (visualType == 'txt') {
                control = this.textInput;
            }

            return control;
        },

        activeInputField: function () {
            // Returns the active input field. NOTE: Unlike activeInputControl, this returns the checkbox instance, not its surrounding label element
            var visualType = this.model.get("visualType");
            var control = null;

            if (visualType == 'cb') {
                control = this.booleanInput;
            } else {
                control = this.activeInputControl();
            }

            return control;
        },

        updateActiveInputValue: function (value) {
            var visualType = this.model.get("visualType");

            if (visualType == 'cb') {
                this.booleanInput.prop("checked", value == 1);
            } else if (visualType == 'rb') {
                var selectedCheckBox = this.optionInput.find("[value=" + value + "]"); // Gets the radio button to be selected
                selectedCheckBox.prop("checked", true);
            } else if (visualType == 'txt') {
                this.textInput.val(value);
            }
        }
    });
});
///#source 1 1 /source/js/expanz/views/expanz.views.DependantFieldView.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

    window.expanz = window.expanz || {};
    window.expanz.views = window.expanz.views || {};

    window.expanz.views.DependantFieldView = Backbone.View.extend({

        initialize: function () {
            this.model.bind("change:value", this.toggle, this);
            this.$el.hide();
        },

        toggle: function () {
            var elem = this.$el.find('[attribute=value]');
            expanz.views.updateViewElement(this, elem, this.model.get('value'));

            if (this.model.get('value').length > 0) {
                this.$el.show('slow');
            }
            else {
                this.$el.hide('slow');
            }
        }

    });
});

///#source 1 1 /source/js/expanz/views/expanz.views.MethodView.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

    window.expanz = window.expanz || {};
    window.expanz.views = window.expanz.views || {};

    window.expanz.views.MethodView = Backbone.View.extend({
        initialize: function () {
            this.model.bind("change:label", this.labelChanged(), this);
            this.model.bind("change:loading", this.loading, this);
            this.model.bind("contextMenuLoaded", this.onContextMenuLoaded, this);
        },

        events: {
            "click [attribute=submit]": "submit"
        },

        submit: function () {
            this.model.submit();
            this.$el.trigger('submit:' + this.model.get('id'));
        },

        labelChanged: function () {
            return function () {
                this.getButton().text(this.model.get("label"));
            };
        },

        loading: function () {
            if (this.model.get('loading') === true) {
                this.getButton().attr('disabled', 'disabled');
                this.$el.addClass('methodLoading');
            }
            else {
                this.getButton().removeAttr('disabled');
                this.$el.removeClass('methodLoading');
            }
        },

        getButton: function () {
            var buttonElement = this.$el;
            
            if (this.$el.is(":button")) {
                buttonElement = this.$el;
            }
            else {
                var buttons = this.$el.find("button");
                
                if (buttons.length != 0) {
                    buttonElement = buttons;
                }
                else {
                    var hyperlinks = this.$el.find("a");
                    
                    if (hyperlinks.length != 0) {
			var spans = this.$el.find("span");
			if (spans.length != 0) {
				buttonElement = spans;
			} else {
				buttonElement = hyperlinks;
			}
		    }
                }
            }

            return buttonElement;
        },

        onContextMenuLoaded: function () {
            if (this.model.contextMenuModel.length !== 0) {
                var contextMenuView = new expanz.views.ContextMenuView({
                    el: this.el,
                    id: this.model.id,
                    //className: $(this).attr('class'),
                    collection: this.model.contextMenuModel
                });

                contextMenuView.render();
            }
        }
    });
});

///#source 1 1 /source/js/expanz/views/expanz.views.MessagesView.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

    window.expanz = window.expanz || {};
    window.expanz.views = window.expanz.views || {};

    window.expanz.views.MessagesView = Backbone.View.extend({
        tagName: "ul",
        
        className: "notificationArea",

        initialize: function () {
            this.collection.bind('add', this.messageAdded, this);
            this.collection.bind('remove', this.messageRemoved, this);
            this.collection.bind('reset', this.collectionReset, this);
        },
        
        messageAdded: function (message) {
            var messageItemView = new window.expanz.views.MessageItemView({
               model: message 
            });

            var $messageControlElement = this.$el;
            var $messageItemElement = messageItemView.$el;
            
            $messageControlElement.append(messageItemView.render().el);
            $messageItemElement.show();

            var fade = true;
            //if ($(el).attr('fade') && boolValue($(el).attr('fade')) === false) {
            //    fade = false;
            //}
            
            $messageItemElement.slideDown(100, function () {
                if (fade) {
                    $messageItemElement.delay(5000).slideUp(800, function () {
                        $messageItemElement.remove();
                        // if it was the last message in the message notification area, we hide the notification area.
                        //if ($(el).find("div").length === 0) {
                        //    $(el).hide();
                        //}
                    });
                }
            });

            if ($messageItemElement.length > 0) { // Execute if the slide Up/Down methods fail
                setTimeout(function () {
                    $messageItemElement.remove();
                    
                    //if ($(el).find("div").length === 0) {
                    //    $(el).hide();
                    //}
                }, 5000);
            }
        },
        
        messageRemoved: function (message) {
            
        },
        
        collectionReset: function () {
            this.$el.html("");
        }
    });
    
    // View for individual messages
    window.expanz.views.MessageItemView = Backbone.View.extend({
        tagName: "li",
        
        render: function () {
            // Set the className for this element based upon the type of the message (i.e. the error level)
            // TODO: Make this more easily user definable?  Class names should also be more meaningful
            switch (this.model.get("type").toLowerCase()) {
                case "fatal":
                case "error":
                case "warning":
                    this.el.className = "error";
                    break;
                case "info":
                case "success":
                    this.el.className = "info";
                    break;
                default:
                    this.el.className = "info";
                    break;
            }

            this.$el.html(this.model.get("message"));
            
            return this;
        }
    });
});

///#source 1 1 /source/js/expanz/views/expanz.views.ContextMenuView.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

    window.expanz = window.expanz || {};
    window.expanz.views = window.expanz.views || {};

    window.expanz.views.ContextMenuView = Backbone.View.extend({
        initialize: function () {
            this.collection.bind("menuLoaded", this.render, this);
        },

        render: function () {
            /* retrieve or create a div to host the context menu */
            // window.expanz.logToConsole("modelUpdated");
            if (this.collection.length === 0) {
                return;
            }

            var contextMenuId;

            if (this.contextMenuEl === undefined) {
                contextMenuId = this.collection.contextId.replace(/\./g, "_") + "_contextMenu";
                this.$el.append("<div class='contextMenu' id='" + contextMenuId + "' />");
                this.contextMenuEl = this.$el.find("#" + contextMenuId);
            }

            if (contextMenuId === undefined) {
                contextMenuId = (this.contextMenuEl.id || this.contextMenuEl[0].id);
            }

            this.contextMenuEl.hide();
            this.contextMenuEl.html("");

            /* position menu below button */
            var pos = 0;
            var top = 0;

            if (this.$el.find("button").length > 0) {
                pos = this.$el.find("button").position();
                top = pos.top + this.$el.find("button").outerHeight() + 2;
            } else {
                pos = this.$el.find("span").position();
                top = pos.top + this.$el.find("span").outerHeight() + 2;
            }

            this.contextMenuEl.css({
                position: "absolute",
                top: top + "px",
                left: (pos.left + 10) + "px",
                zIndex: 9999
            });

            /* append data to the menu */
            this.contextMenuEl.append("<ul id='" + contextMenuId + "_ul'></ul>");
            this.appendMenuItems(this.contextMenuEl.find("ul"));
            this.createContextMenu(); // Extensibility point for third party libraries to render the context menu

            /* hide if clicked outside */
            var that = this;

            this.mouseInside = false;
            this.contextMenuEl.hover(function () {
                that.mouseInside = true;
            },
                function () {
                    that.mouseInside = false;
                });

            $("body").bind('mouseup.' + that.contextMenuEl.selector, function () {
                if (!that.mouseInside) {
                    that.contextMenuEl.remove(); 
                    $("body").unbind('mouseup.' + contextMenuId);
                }
            });
        },

        appendMenuItems: function (parentUL) {
            var that = this;
            var menuItemIndex = 0;
            
            // NOTE: Sub-menus are not currently supported
            this.collection.forEach(function(menuItem) {
                var liId = (parentUL.id || parentUL[0].id) + "_li_" + menuItemIndex++;

                // TODO: Use a template, or make each item a sub-view
                parentUL.append("<li id='" + liId + "' action='" + menuItem.get('action') + "' class=' " + (menuItem.get('isDefaultAction') ? "defaultAction" : "") + " '>" + menuItem.get('text') + "</li>");
                var liEL = parentUL.find("#" + liId);
                liEL.unbind("click");

                liEL.click(function(e) {
                    if (!e)
                        e = window.event; //if (!e) var  = $.event.fix(event || window.event);

                    if (e.stopPropagation)
                        e.stopPropagation();
                    else
                        e.cancelBubble = true;

                    menuItem.menuItemSelected(menuItem.get('action'));
                    that.contextMenuEl.remove();
                });
            });
        },

        /* must be overidden if a custom context menu is wanted */
        createContextMenu: function () {
            this.contextMenuEl.show();
        },
        
        destroyView: function () {

            // COMPLETELY UNBIND THE VIEW
            this.undelegateEvents();

            $(this.contextMenuEl).removeData().unbind();

            // Remove view from DOM
            this.contextMenuEl.remove();
            Backbone.View.prototype.remove.call(this);

        }
    });
});

///#source 1 1 /source/js/expanz/views/expanz.views.LoginView.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

    window.expanz = window.expanz || {};
    window.expanz.views = window.expanz.views || {};

    window.expanz.views.LoginView = Backbone.View.extend({

        initialize: function () {
            this.model.bind("change:isLoggingIn", this.isLoggingInChanged(), this);

            // Look for a message control within the view
            this.messageControl = this.$el.find('[bind=messageControl]');
            
            if (this.messageControl.length === 0) {
                // Message control not found within the view - look in the page
                this.messageControl = $('[bind=messageControl]');
            }

            if (this.messageControl.length !== 0) {
                var $messageControl = $(this.messageControl);
                
                var view = new expanz.views.MessagesView({
                    id: $messageControl.attr('id'),
                    collection: this.model.messageCollection
                });

                $messageControl.html(view.render().el);
            }
        },

        events: {
            "click [type='submit']": "attemptLogin"
        },

        attemptLogin: function () {
            this.model.messageCollection.reset();
            
            var usernameEl = this.$el.find("#username input");
            var passwordEl = this.$el.find("#password input");
            
            if (usernameEl.length === 0 || passwordEl.length === 0) {
                alert("Username or password field cannot be found on the page");
            }
            else if (usernameEl.val().length === 0 || passwordEl.val().length === 0) {
                this.model.messageCollection.addErrorMessageByKey("loginOrPasswordEmpty");
            }
            else {
                this.model.login(usernameEl.val(), passwordEl.val(), this.$el.attr('type') == 'popup');
            }
        },

        isLoggingInChanged: function () {
            var view = this;
            return function () {
                var isLoggingIn = this.model.get("isLoggingIn");

                if (isLoggingIn) {
                    $("#signinButton").attr("disabled", true);
                } else {
                    $("#signinButton").removeAttr("disabled");
                }
            };
        },
    });
});

///#source 1 1 /source/js/expanz/views/expanz.views.ActivityView.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

    window.expanz = window.expanz || {};
    window.expanz.views = window.expanz.views || {};

    window.expanz.views.ActivityView = Backbone.View.extend({

        initialize: function (attrs) {
            Backbone.View.prototype.initialize.call(attrs);
            if (attrs.key) {
                this.key = attrs.key;
            }

            this.messageControl = null;
            
            this.fieldViewCollection = {};
            this.methodViewCollection = {};
            this.dataControlViewCollection = {};
            
            this.model.bind("error", this.updateError, this);
            this.model.bind("change:loading", this.loading, this);
            this.model.bind("change:deltaLoading", this.deltaLoading, this);
            this.model.bind("closingActivity", this.closeActivity, this);
        },

        updateError: function (model, error) {
            this.model.messageCollection.addErrorMessageByText(error);
        },

        events: {
            "update:field": "update"
        },

        update: function () {
            // perform full activity validation after a field updates ... if
            // necessary
        },

        loading: function () {
            var loadingId = "Loading_" + this.id.replace(/\./g, "_");
            var loadingEL = this.$el.find("#" + loadingId);
            if (loadingEL.length === 0) {
                this.$el.append('<div class="loading" id="' + loadingId + '"><span>Loading content, please wait.. <img src="assets/images/loading.gif" alt="loading.." /></span></div>');
                loadingEL = this.$el.find("#" + loadingId);
            }

            var isLoading = this.model.get('loading');
            if (isLoading) {
                var off = this.$el.offset();
                /* set the loading element as a mask on top of the div to avoid user doing any action */
                this.$el.addClass('activityLoading');
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
                this.$el.removeClass('activityLoading');
                loadingEL.hide();
            }

        },

        deltaLoading: function () {
            var deltaLoading = this.model.get('deltaLoading');

            if (deltaLoading.initiator !== undefined && deltaLoading.initiator !== null) {
                var initiatorID = deltaLoading.initiator.id;
                var initiatorType = deltaLoading.initiator.type;

                var initiator = this.model.get(initiatorID);
                if (initiator) {
                    // window.expanz.logToConsole("delta method loading " + deltaLoading.isLoading + " " + initiatorID);
                    initiator.set({
                        loading: deltaLoading.isLoading
                    });
                } else {
                    /* most probably coming from a grid/list view */
                    /* in that case the button has already been set in a loading state so we just switch it back to normal when loading is finished */
                    if (initiatorType == 'method' && !deltaLoading.isLoading) {
                        /* can be either a element with methodName or a name */
                        var actionSelector = ".actionLoading[methodName='" + initiatorID + "'], [name='" + initiatorID + "'] .actionLoading, .actionLoading[autoUpdate='" + initiatorID + "']";
                        var dataControlEl = this.$el.find(actionSelector).first().closest("[bind='DataControl']");
                        if (dataControlEl && dataControlEl.length > 0) {
                            dataControlEl.find(actionSelector).removeAttr('disabled');
                            dataControlEl.find(actionSelector).removeClass('actionLoading');
                        }
                    }
                }
            }
        },

        closeActivity: function () {
            this.trigger("closingActivity"); // The container (such as a popup window) can respond to this event, and close accordingly
        },

        addFieldView: function (fieldView) {
            if (this.fieldViewCollection[fieldView.id] === undefined)
                this.fieldViewCollection[fieldView.id] = [];

            this.fieldViewCollection[fieldView.id].push(fieldView);

            return;
        },

        addMethodView: function (methodView) {
            if (this.methodViewCollection[methodView.id] === undefined)
                this.methodViewCollection[methodView.id] = [];

            this.methodViewCollection[methodView.id].push(methodView);

            return;
        },

        addDataControlView: function (dataControlView) {
            if (this.dataControlViewCollection[dataControlView.id] === undefined)
                this.dataControlViewCollection[dataControlView.id] = [];

            this.dataControlViewCollection[dataControlView.id].push(dataControlView);

            return;
        }
    });
});

///#source 1 1 /source/js/expanz/views/expanz.views.CheckboxesView.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
//$(function () {

//    window.expanz = window.expanz || {};
//    window.expanz.views = window.expanz.views || {};

//    window.expanz.views.CheckboxesView = expanz.views.DataControlView.extend({
//        publishData: function () {
//            /* clean elements */
//            this.$el.html();
//            var that = this;
//            /* no external component needed just have to draw the checkboxes and handle the clicks */

//            _.each(this.model.get('xml').find('Row'), function (row) {
//                var rowId = $(row).attr('id');
//                var selected = boolValue($(row).attr('selected')) === true ? ' checked="checked" ' : '';
//                _.each($(row).find('Cell'), function (cell) {
//                    var text = $(cell).text();
//                    var id = that.model.id.replace(/\./g, "_") + "_" + rowId;
//                    that.$el.append("<div><input " + selected + " id='" + id + "' value='" + rowId + "' name='checkbox' type='checkbox'></input><span>" + text + "</span></div>");

//                    /* handle checkboxes click */
//                    that.$el.find("#" + id).click(function () {
//                        // window.expanz.logToConsole(that.model.id + " filtered with " + $(this).val());
//                        /* send negative value of id to say it has been unselected */
//                        var val = $(this).val();
//                        if (!$(this).is(":checked")) {
//                            val = -val;
//                        }
//                        /* send the delta to the server */
//                        that.model.updateItemSelected(val);
//                    });

//                });
//            });

//        }

//    });
//});

///#source 1 1 /source/js/expanz/views/expanz.views.RadioButtonsView.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
//$(function () {

//    window.expanz = window.expanz || {};
//    window.expanz.views = window.expanz.views || {};

//    window.expanz.views.RadioButtonsView = expanz.views.DataControlView.extend({
//        publishData: function () {
//            /* clean elements */
//            this.$el.html();
//            var that = this;
//            /* no external component needed just have to draw the checkboxes and handle the clicks */

//            _.each(this.model.get('xml').find('Row'), function (row) {
//                var rowId = $(row).attr('id');
//                var selected = boolValue($(row).attr('selected')) === true ? ' checked="checked" ' : '';
//                _.each($(row).find('Cell'), function (cell) {
//                    var text = $(cell).text();
//                    var id = that.model.id.replace(/\./g, "_") + "_" + rowId;
//                    that.$el.append("<div><input " + selected + " id='" + id + "' value='" + rowId + "' name='radio' type='radio'></input><span>" + text + "</span></div>");

//                    /* handle radio button click */
//                    that.$el.find("#" + id).click(function () {
//                        /* send the delta to the server */
//                        that.model.updateItemSelected($(this).val());
//                    });

//                });
//            });

//        }

//    });
//});

///#source 1 1 /source/js/expanz/views/expanz.views.PopupView.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

    window.expanz = window.expanz || {};
    window.expanz.views = window.expanz.views || {};

    window.expanz.views.PopupView = Backbone.View.extend({

        width: 'auto',

        cssClass: 'popupView',

        divAttributes: '',

        initialize: function (attrs, $container) {
            Backbone.View.prototype.initialize.call(attrs);
            this.create($container);
            this.renderActions();
            this.delegateEvents(this.events);

            /* find the parent popup -> it is the first parentPopup visible */
            if (window.expanz.currentPopup !== undefined) {
                this.parentPopup = window.expanz.currentPopup;
                while (!this.parentPopup.$el.is(":visible")) {
                    if (this.parentPopup.parentPopup === undefined) {
                        this.parentPopup = undefined;
                        break;
                    }
                    this.parentPopup = this.parentPopup.parentPopup;
                }

            }
            
            window.expanz.currentPopup = this; // TODO: This should be removed
            this._activityView = null;
        },

        events: {
            "click button": "buttonClicked"
        },

        renderActions: function () {

        },

        create: function ($container) {
            // window.expanz.logToConsole("render popupWindow");
            var popupWindow = $container.find('#' + this.id);
            if (popupWindow.length > 0) {
                popupWindow.remove();
            }

            var content = '';
            if (this.model.get('text') !== undefined && this.model.get('text').length > 0) {
                content = this.model.get('text');
            } else if (this.contentTemplate) {
                content = this.contentTemplate({ id: this.id });
            }

            $container.append("<div class='" + this.cssClass + "' id='" + this.id + "' " + this.divAttributes + " name='" + this.id + "'>" + content + "</div>");
            this.setElement($container.find('#' + this.id));
            this.createWindowObject();

            if (this.model.get('url') !== undefined && this.model.get('url').length > 0) {
                var url = this.model.get('url');
                var that = this;
                this.$el.load(url, function () {
                    that.center();
                    that.trigger('contentLoaded');
                });
            }
            else {
                this.center();
            }
        },

        /* must be redefined depending on the plug-in used */
        createWindowObject: function () {
            this.el.dialog({
                modal: true,
                width: this.width,
                title: this.model.get('title')
            });
        },
        
        setActivityView: function (activityView) {
            this._activityView = activityView;
            activityView.bind("closingActivity", this.onActivityClosing, this);
        },
        
        onActivityClosing: function () {
            // Called when the activity view's closingActivity event is raised
            this.isActivityClosing = true; // This stops the popup from telling the activity to close, as it will already be closing
            this.close();
        },

        buttonClicked: function () {
            this.close();
        },

        onCloseWindow: function () {
            this.trigger('popupClosed');

            if (this._activityView !== null && !this.isActivityClosing) {
                this._activityView.closeActivity();
            }
            
            if (this.postCloseActions)
                this.postCloseActions(this.model.get('title'));
        },

        /* may be redifined depending on the plug-in used */
        close: function () {
            this.remove();
            this.onCloseWindow();
        },

        /* may be redifined depending on the plug-in used */
        center: function () {
            this.el.dialog("option", "position", 'center');
        }
    });
});

///#source 1 1 /source/js/expanz/views/expanz.views.PicklistWindowView.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

    window.expanz = window.expanz || {};
    window.expanz.views = window.expanz.views || {};

    window.expanz.views.PicklistWindowView = window.expanz.views.PopupView.extend({
        contentTemplate: _.template("<table id='<%= id %>_host' bind='DataControl' class='grid'></table>"),
        
        cssClass: 'pickListPopup popupView',
        
        initialize: function(attrs, $container) {
            window.expanz.views.PopupView.prototype.initialize.call(this, attrs, $container);
            
            // Centre the window once the pick list has rendered, and its size has been determined
            this.$el.on("datapublication:rendered", $.proxy(function(event, dataPublicationModel, dataPublicationView) {
                this.center();

                var picklistWindowView = this;
                
                // Redefine the data publication view's onRowClicked event handler function
                dataPublicationView.onRowClicked = function (rowView) {
                    picklistWindowView.onItemSelected(dataPublicationModel, rowView.model.id, rowView.model.get("type"));
                    picklistWindowView.close();
                };
            }, this));
        },
        
        onItemSelected: function (dataPublicationModel, selectedId, type) {
            // An item from the pick list has been selected, so send the context to the server
            var clientFunction = window["picklistUpdateRowSelected" + type];

            if (typeof(clientFunction) == "function") {
                clientFunction(selectedId);
            } else {
                dataPublicationModel.sendContextToServer(selectedId, type);
            }
        }
    });
});

///#source 1 1 /source/js/expanz/views/expanz.views.UIMessage.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

    window.expanz = window.expanz || {};
    window.expanz.views = window.expanz.views || {};

    window.expanz.views.UIMessage = window.expanz.views.PopupView.extend({

        width: '500px',

        cssClass: 'uiMessage popupView',

        renderActions: function () {
            this.model.actions.forEach(function (action) {
                if (this.$el.find("[attribute=submit]").length === 0) {
                    this.$el.append("<br/>");
                }

                var divId = action.id;

                if (action.id == 'close') {
                    divId += action.get('label').split(' ').join('');
                    this.$el.append('<div style="float:left"  bind="method" name="close" id="' + divId + '">' + '<button attribute="submit">' + action.get('label') + '</button>' + '</div>');
                }
                else if (action.id !== this.model.id) {
                    this.$el.append('<div style="float:left" bind="method" name="' + action.id + '" id="' + divId + '">' + '<button attribute="submit">' + action.get('label') + '</button>' + '</div>');
                    var methodView = new expanz.views.MethodView({
                        el: $('div#' + action.id, this.el),
                        id: action.id,
                        model: action
                    });
                }

                /* if response data are present we have to send it during the click event as well */
                if (action.get('response') !== undefined) {
                    var button = this.$el.find('#' + divId + ' button');
                    var that = this;

                    button.click(function () {
                        that.postCloseActions(that.model.get('title'));

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
        
        postCloseActions: function (windowTitle) {
            if (windowTitle == "Order Submitted" || windowTitle == "Order Saved") {
                /* clear activity cookies and reload the page */
                //window.expanz.Storage.clearActivityHandles();
                $("body").trigger("CheckoutFinished");
            }
        }
    });
});

///#source 1 1 /source/js/expanz/views/expanz.views.ManuallyClosedPopup.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

    window.expanz = window.expanz || {};
    window.expanz.views = window.expanz.views || {};

    window.expanz.views.ManuallyClosedPopup = window.expanz.views.PopupView.extend({
        width: 'auto',

        /* do not close on button click */
        buttonClicked: function () {
        }
    });
});

///#source 1 1 /source/js/expanz/views/subviews/expanz.views.subviews.DataPublicationHeaderView.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Chris Anderson
//  Copyright 2008-2013 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

    window.expanz = window.expanz || {};
    window.expanz.views = window.expanz.views || {};
    window.expanz.views.subviews = window.expanz.views.subviews || {};

    window.expanz.views.subviews.DataPublicationHeaderView = Backbone.View.extend({

        defaultTemplate: _.template('<thead>' +
                                        '<tr class="tableheader">' +
                                        '<% columns.each(function(col){ %>' +
                                           '<th width="<%= col.get("width") %>"><%= col.get("label") %></th>' +
                                        '<% }); %>' +
                                        '</tr>' +
                                    '</thead>'),

        initialize: function (params) {
            this.dataPublicationView = params.dataPublicationView;
        },

        render: function () {
            var hasBeenRenderedExternally = this.dataPublicationView.raiseExtensibilityPointEvent("renderingHeader");

            if (!hasBeenRenderedExternally) {
                var headerTemplate = this.getHeaderTemplate();
                this.setElement(headerTemplate({ columns: this.model.columns }));

                this.onHeaderRendered();
                this.dataPublicationView.raiseExtensibilityPointEvent("headerRendered");
            }

            return this;
        },

        getHeaderTemplate: function () {
            // Looks in the HTML page for a text template with a given name. If found, it is returned.
            // Otherwise it will return the default template defined as part of this view.
            var headerTemplate = null;
            var userDefinedTemplate = $("#" + this.dataPublicationView.itemTemplateName() + "Header");

            if (userDefinedTemplate.length === 0)
                headerTemplate = this.defaultTemplate;
            else
                headerTemplate = _.template(userDefinedTemplate.html());

            return headerTemplate;
        },

        onHeaderRendered: function () {
            var headerView = this;
            var dataPublicationView = headerView.dataPublicationView;

            // Search the header for all the fields marked as being sortable,
            // and transform them to be as such.
            this.$el.find("[sortField]").each(function () {
                var $headerCell = $(this);
                var fieldName = $headerCell.attr('sortField');

                // Set classes on the field for styling purposes
                $headerCell.addClass("sortable");

                if (fieldName == dataPublicationView.sortField) {
                    if (dataPublicationView.sortDirection == "asc") {
                        $headerCell.removeClass("sortedDesc");
                        $headerCell.addClass("sortedAsc");
                    } else {
                        $headerCell.removeClass("sortedAsc");
                        $headerCell.addClass("sortedDesc");
                    }
                }

                // Handle the user clicking on the colun header to sort the data publication
                $(this).click(function () {
                    // The user has clicked on a column header. Sort the data
                    // publication by the corresponding field and re-render the list
                    var sortDirection = $headerCell.attr('defaultSortDirection') || "asc";

                    if (fieldName == dataPublicationView.sortField) {
                        // Reverse the sort direction of this column
                        sortDirection = dataPublicationView.sortDirection === "desc" ? "asc" : "desc";
                    }

                    dataPublicationView.sortField = fieldName;
                    dataPublicationView.sortDirection = sortDirection.toLowerCase();

                    dataPublicationView.model.sortRowsByFieldName(fieldName, (dataPublicationView.sortDirection === "asc"));
                    dataPublicationView.render();
                });
            });
        }
    });
});
///#source 1 1 /source/js/expanz/views/subviews/expanz.views.subviews.DataPublicationBodyView.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Chris Anderson
//  Copyright 2008-2013 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

    window.expanz = window.expanz || {};
    window.expanz.views = window.expanz.views || {};
    window.expanz.views.subviews = window.expanz.views.subviews || {};

    window.expanz.views.subviews.DataPublicationBodyView = Backbone.View.extend({

        tagName: "tbody",

        initialize: function (params) {
            this.dataPublicationView = params.dataPublicationView;

            // If the host element is not a table, create items in a div instead of the default tbody.
            if (!this.dataPublicationView.$el.is("table")) {
                this.setElement($('<div></div>'));
            }
        },

        render: function () {
            var view = this;

            this.rowViewCollection = [];
            
            // Calculate which items should be displayed, based upon the items per page and current page number
            var firstItemIndex = (this.dataPublicationView.currentPage - 1) * this.dataPublicationView.itemsPerPage;
            var lastItemIndex = Math.min(firstItemIndex + this.dataPublicationView.itemsPerPage, this.model.rows.length);
            
            // Enumerate the rows for the current page, and render them
            for (var rowIndex = firstItemIndex; rowIndex < lastItemIndex; rowIndex++) {
                var row = this.model.rows.at(rowIndex);
                
                // Render row
                var rowView = new expanz.views.subviews.DataPublicationRowView({ model: row, rowIndex: rowIndex, dataPublicationView: view.dataPublicationView });
                view.$el.append(rowView.render().el);
                
                rowView.bind("input:enterPressed", this.onInputEnterPressed, this);
                this.rowViewCollection.push(rowView);
            }

            return this;
        },
        
        onInputEnterPressed: function(rowView, input) {
            // Enter pressed on an input in a row. Move the focus to the same cell in the next row.
            var $cell = $(input).closest("td");
            var columnId = $cell.attr("data-columnid");

            var rowViewIndex = this.rowViewCollection.indexOf(rowView);

            if (rowViewIndex < this.rowViewCollection.length - 1) {
                var newFocusedRowView = this.rowViewCollection[rowViewIndex + 1];
                newFocusedRowView.focusCellInput(columnId);
            }
        }
    });
});
///#source 1 1 /source/js/expanz/views/subviews/expanz.views.subviews.DataPublicationRowView.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Chris Anderson
//  Copyright 2008-2013 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

    window.expanz = window.expanz || {};
    window.expanz.views = window.expanz.views || {};
    window.expanz.views.subviews = window.expanz.views.subviews || {};

    window.expanz.views.subviews.DataPublicationRowView = Backbone.View.extend({

        defaultRowTemplate: _.template('<tr class="<%= className %>">' +
                                       '<%= rowView.renderRowCells(rowModel) %>' +
                                       '</tr>'),

        defaultCellTemplate: _.template('<td data-columnid="<%= cellModel.get("id") %>">' +
                                        '<%= rowView.renderCellContents(cellModel, rowModel, cellIndex, isDrillDownRow) %>' +
                                        '</td>'),

        initialize: function (params) {
            this.dataPublicationView = params.dataPublicationView;
        },

        render: function () {
            var hasBeenRenderedExternally = this.dataPublicationView.raiseExtensibilityPointEvent("renderingRow");

            if (!hasBeenRenderedExternally) {
                var className = (this.options.rowIndex % 2 == 1) ? 'gridRowAlternate' : 'gridRow';

                // If a displayStyle attribute is passed from the server, use it, prefixed with grid- as the class name
                if (this.model.get("displayStyle"))
                    className = "grid-" + this.model.get("displayStyle");

                var cellValues = this.model.getCellValues();

                var itemTemplate = this.getItemTemplate();
                this.setElement(itemTemplate({ rowModel: this.model, data: cellValues.data, sortValues: cellValues.sortValues, className: className, rowView: this }));

                // Set attributes on the element that will be used to identify it
                this.$el.attr("data-rowid", this.model.id);
                this.$el.attr("data-rowtype", this.model.get("type"));

                this.onRowRendered();
                this.dataPublicationView.raiseExtensibilityPointEvent("rowRendered");
            }

            return this;
        },

        getItemTemplate: function () {
            // Looks in the HTML page for a text template with a given name. If found, it is returned.
            // Otherwise it will return the default template defined as part of this view.
            var itemTemplate = null;
            var userDefinedTemplate = $("#" + this.dataPublicationView.itemTemplateName());

            if (userDefinedTemplate.length === 0)
                itemTemplate = this.defaultRowTemplate;
            else
                itemTemplate = _.template(userDefinedTemplate.html());

            return itemTemplate;
        },

        renderRowCells: function (rowModel) {
            var html = "";
            var view = this;
            var isDrillDownRow = this.dataPublicationView.options.canDrillDown && (rowModel.get("type") !== "Totals" && rowModel.get("type") !== "BlankLine"); // Only show drilldown link if configured to do so, and only on non-totals and non-blank rows

            rowModel.cells.each(function (cellModel, cellIndex) {
                html += view.defaultCellTemplate({ cellModel: cellModel, rowModel: rowModel, rowView: view, cellIndex: cellIndex, isDrillDownRow: isDrillDownRow });
            });

            return html;
        },

        renderCellContents: function (cellModel, rowModel, cellIndex, isDrillDownRow) {
            var html = "";

            if (cellModel.column && cellModel.column.get('datatype') === 'BLOB') {
                html += '<img width="' + cellModel.column.get('width') + '" src="' + cellModel.get('value') + '"/>';
            } else if (cellModel.column.get("isEditable")) {
                html += this.renderCellInputControl(cellModel);
            } else if (cellModel.get('value')) {
                if (cellIndex === 0 && isDrillDownRow) {
                    html += '<a href="#' + rowModel.get('id') + '">' + cellModel.get('value') + '</a>'; // Create a drilldown link
                } else {
                    html += '<span>' + cellModel.get('value') + '</span>';
                }
            }

            return html;
        },

        renderCellInputControl: function (cellModel) {
            // Render the correct type of input control, depending on the cell column's data type
            var html = "";
            var dataType = cellModel.column.get("datatype");

            if (dataType === "string" || dataType === "number") {
                html = "<input type='text' value='" + cellModel.get('value') + "' class='dpinput-" + dataType + "' style='width: 100%;'>";
            } else if (dataType === "boolean") {
                html = "<input type='checkbox' class='dpinput-boolean'";

                if (cellModel.get('value') === "1")
                    html += " checked";

                html += ">";
            }

            // TODO: Support dropdown lists

            return html;
        },

        // TODO: Re-instate, and call from default row template?
        //renderActions: function () {
        //    var html = "";

            //if (this.model.hasActions) {
            //    html = '<td>';

            //    _.each(this.model.getActions(), function (cell) {
            //        var buttonId = model.id + "_" + row.id + "_" + cell.get('name');
            //        var actionParams = cell.get('actionParams');

            //        var userInputs = "";

            //        _.each(actionParams, function (actionParams) {
            //            var name = actionParams.name;
            //            var value = actionParams.value;
            //            var label = actionParams.label;

            //            if (value == '@userInput.textinput' || value == '@userInput.numericinput') {
            //                var format = (value == '@userInput.numericinput') ? 'numeric' : 'text';
            //                var bindValueFromCellId = actionParams.bindValueFromCellId;
            //                var inputValue = '';
            //                if (bindValueFromCellId) {
            //                    inputValue = " value='" + values[bindValueFromCellId] + "' ";
            //                }
            //                userInputs += "<label for='" + row.id + "_userinput_" + name + "'>" + (label || name) + "</label><input class='gridUserInput' type='text' format='" + format + "' " + inputValue + " id='" + row.id + "_userinput_" + name + "'/>";
            //            }
            //        });

            //        html += "<div style='display:inline' name='" + cell.get('name') + "' actionParams='" + JSON.stringify(actionParams) + "' bind='" + cell.get('type') + "'> " + userInputs + " <button id='" + buttonId + "' attribute='submit'>" + cell.get('label') + "</button></div>";
            //    });

            //    html += '</td>';
            //}

        //    return html;
        //},

        onRowRendered: function () {
            this.bindActions();
            this.configureEventHandlers();
        },
        
        bindActions: function() {
            var rowView = this;
            var dataPublicationView = rowView.dataPublicationView;

            /* Search for elements with a methodName attribute, and bind them to an action */
            rowView.$el.find("[methodName]").each(function (index, element) {
                var action = dataPublicationView.model.actions[$(element).attr('methodName')];

                if (action) {
                    $(element).click(function () {
                        rowView._handleActionClick.call(rowView, $(this), action);
                    });
                }
            });

            /* Search for elements with a contextMenu attribute, and bind them to an action */
            rowView.$el.find("[contextMenu] ").each(function (index, element) {
                var action = dataPublicationView.model.actions[$(element).attr('contextMenu')];

                if (action) {
                    $(element).click(function () {
                        rowView._handleContextMenuClick.call(rowView, $(this), action);
                    });
                }
            });
        },

        configureEventHandlers: function () {
            var view = this;

            this.$el.click(this, function () {
                view.dataPublicationView.onRowClicked.call(view.dataPublicationView, view);
            });

            this.$el.dblclick(this, function () {
                view.dataPublicationView.onRowDoubleClicked.call(view.dataPublicationView, view);
            });
            
            this.$el.find("a").click(this, function () {
                view.dataPublicationView.onDrillDown.call(view.dataPublicationView, view);
            });

            if (this.dataPublicationView.model.isEditable) {
                this.$el.find("input").click(this, function () {
                    // Select all the text in the input box when it is clicked
                    this.select();
                });
                
                this.$el.find("input").change(this, function () {
                    // Input value has changed, so pass new value to the server
                    var $input = $(this);
                    var $cell = $input.closest("td");

                    view.dataPublicationView.onCellValueChanged.call(view.dataPublicationView, $input, view, $cell);
                });
                
                this.$el.find("input").keypress(function (event) {
                    // Raise event when enter is pressed in an input
                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    
                    if (keycode == '13') {
                        view.trigger("input:enterPressed", view, this);
                    }
                });
            }
        },
        
        focusCellInput: function(columnId) {
            var input = this.$el.find("[data-columnid='" + columnId + "']").find("input");

            if (input.length > 0)
                input.focus();
        },

        _handleActionClick: function (actionEl, action) {
            var replaceVariablesResult = this._replaceActionParamsVariables(action.params, this);

            if (replaceVariablesResult.inputValid) {
                var handledExternally = this.dataPublicationView.raiseExtensibilityPointEvent("actionClicked", this, action.name, replaceVariablesResult.actionParams, actionEl);

                if (!handledExternally) {
                    actionEl.attr('disabled', 'disabled');
                    actionEl.addClass('actionLoading');

                    // TODO: Move into model
                    expanz.net.MethodRequest(action.name, replaceVariablesResult.actionParams, null, this.dataPublicationView.model.get("parent"));
                }
            }
        },

        _handleContextMenuClick: function ($actionEl, action) {
            var replaceVariablesResult = this._replaceActionParamsVariables(action.params, this);
            
            var handledExternally = this.dataPublicationView.raiseExtensibilityPointEvent("contextMenuClicked", this, action.name, replaceVariablesResult.actionParams, $actionEl);

            if (!handledExternally) {
                // Create a context menu, and assign it to the clicked element
                var contextMenuModel = new expanz.models.ContextMenu({
                    contextId: this.model.id,
                    type: action.name,
                    contextObject: replaceVariablesResult.actionParams.contextObject ? replaceVariablesResult.actionParams.contextObject.value : null,
                    activity: this.dataPublicationView.model.get("parent")
                });

                var contextMenuView = new expanz.views.ContextMenuView({
                    el: $actionEl,
                    id: $actionEl.attr("id"), // TODO: Fix
                    className: $actionEl.attr("class"),
                    collection: contextMenuModel
                });

                window.expanz.currentContextMenu = contextMenuView.collection;
                
                contextMenuModel.requestContextMenu();
            }
        },
        
        _replaceActionParamsVariables: function (actionParams, rowView) {
            // Replaces variables (starting with @) with actual values in an action params array
            var inputValid = true;
            var newActionParams = jQuery.extend(true, {}, actionParams); // Clone the params object so that we don't alter the original

            _.each(newActionParams, function (actionParam) {
                var name = actionParam.name;

                if (actionParam.value == '@userInput.textinput' || actionParam.value == '@userInput.numericinput') {
                    var valueInput = rowView.$el.find("#" + rowView.model.id + "_userinput_" + name);

                    if (valueInput.length > 0 && valueInput.val().length > 0) {
                        actionParam.value = valueInput.val();
                    } else {
                        inputValid = false;
                    }
                }
                else if (actionParam.value == '@contextId') {
                    actionParam.value = rowView.model.id;
                }
            });

            return {
                inputValid: inputValid,
                actionParams: newActionParams
            };
        }
    });
});
///#source 1 1 /source/js/expanz/views/subviews/expanz.views.subviews.DataPublicationPagingBarView.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Chris Anderson
//  Copyright 2008-2013 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

    window.expanz = window.expanz || {};
    window.expanz.views = window.expanz.views || {};
    window.expanz.views.subviews = window.expanz.views.subviews || {};

    window.expanz.views.subviews.DataPublicationPagingBarView = Backbone.View.extend({

        id: "pagingBar",
        tagName: "div",
        className: "paging",

        initialize: function (params) {
            this.dataPublicationView = params.dataPublicationView;
        },

        render: function () {
            var hasBeenRenderedExternally = this.dataPublicationView.raiseExtensibilityPointEvent("renderingPagingBar");

            if (!hasBeenRenderedExternally) {
                var itemCount = this.dataPublicationView.model.rows.length;
                var pageCount = Math.ceil(itemCount / this.dataPublicationView.itemsPerPage);
                
                this.$el.html(""); // Clear the contents of the paging bar (if any)
                
                if (pageCount > 1)
                    this.renderPageNumberButtons(pageCount);
            }

            return this;
        },
        
        renderPageNumberButtons: function (pageCount) {
            var view = this;
            
            for (var pageIndex = 0; pageIndex < pageCount; pageIndex++) {
                var inputId = this.dataPublicationView.model.id + "BtnPage" + pageIndex;
                var disabled = "";

                if (pageIndex + 1 == this.dataPublicationView.currentPage)
                    disabled = " disabled='disabled'";

                this.$el.append("<input id='" + inputId + "' type='button' value='" + (pageIndex + 1) + "' " + disabled + " />");

                this.$el.find("#" + inputId).click(function () {
                    view.dataPublicationView.currentPage = this.value;
                    view.dataPublicationView.render();
                });
            }
        }
    });
});
///#source 1 1 /source/js/expanz/expanz.security.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function() {

    window.expanz = window.expanz || {};
    window.expanz.security = window.expanz.security || {};

    window.expanz.security.getLoginPage = function () {
        //var loginUrl = getPageUrl(window.config.loginPage);
        /* if login url is null try to guess it by removing the filename */
        //if (loginUrl === undefined) {
        //	loginUrl = document.location.href.substring(0, document.location.href.lastIndexOf("/"));
        /* if empty mean we are at the root of the website */
        //	if (loginUrl === "")
        //		loginUrl = "/";
        //}
        // window.expanz.logToConsole("getLoginURL : " + loginUrl);
        return window.config.loginPage ? window.config.loginPage : 'login';
    };

    window.expanz.security.createLogin = function (DOMObject, callbacks) {

        DOMObject || (DOMObject = $('body'));

        var login = createLogin(DOMObject, callbacks);
        return;
    };

    window.expanz.security.logout = function () {
        function redirect() {
            expanz.Storage.clearSession();
            expanz.views.redirect(expanz.security.getLoginPage());
        }
        expanz.net.ReleaseSessionRequest({
            success: redirect,
            error: redirect
        });
    };

    window.expanz.security.showLoginPopup = function () {
        var content = '';
        
        content = '<div class="loginMsg">Sorry, your session timed out, please log in again.</div>';

        content += '<form bind="login" type="popup" name="login" action="javascript:">';
        content += '  <div name="username" id="username">';
        content += '    <input class="loginInput"  attribute="value" type="text" placeholder="Username"/>';
        content += '  </div>';
        content += '  <div name="password" id="password">';
        content += '    <input class="loginInput" attribute="value" type="password" placeholder="Password"/>';
        content += '  </div>';
        content += '  <div name="login" id="login">';
        content += '    <button id="signinButton" type="submit" attribute="submit">Login</button>';
        content += '  </div>';
        content += '  <div bind="messageControl" class="error">';
        content += '  </div>';
        content += '</form>';

        var loginPopup = window.expanz.showManuallyClosedPopup(content, 'Login', 'ExpanzLoginPopup');

        /* set focus on username field */
        $("#username input").focus();

        createLogin(loginPopup.$el.find('[bind=login]'));

        return;
    };

    function createLogin(dom, callbacks) {

        var loginView = null;
        
        if ($(dom).attr('bind') && ($(dom).attr('bind').toLowerCase() === 'login')) {
            loginView = expanz.Factory.createLoginView(dom);
        }

        return loginView;
    }
});
///#source 1 1 /source/js/expanz/expanz.js
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson
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
	window.expanz = window.expanz || {};
	window.expanz.helper = window.expanz.helper || {};
	window.expanz.Storage = window.expanz.Storage || {};

	window.openActivityViews = [];
    window.messageControlView = null; // Application-wide default message control view will be assigned to this

	window.expanz.logToConsole = function(message) {
		if (typeof (console) != "undefined" && console.log) {
			console.log(message);
		}
	};

	window.expanz.getMaintenancePage = function() {
		return window.config.maintenancePage ? window.config.maintenancePage : 'maintenance';
	};

	window.expanz.isOnMaintenance = function() {
		var maintenance = window.config.onMaintenance;
		if (maintenance === true) {
			return true;
		}
		return false;
	};

	//
	// Public Functions & Objects in the Expanz Namespace
	//
	window.expanz.CreateActivity = function(DOMObject, callbacks, initialKey, container) {

		DOMObject || (DOMObject = $('body'));

		var activities = createActivity(DOMObject, callbacks, initialKey);
	    
		_.each(activities, function(activityView) {
		    window.openActivityViews.push(activityView); // Push the view to the collection of open activity views
		    
            if (container !== undefined) {
                container.setActivityView(activityView);
            }
		});
	    
		return activities;
	};
	
	// window.expanz.CloseActivity = function(DOMObject) {
	//
	// // find the given activity in list from the DOMObject
	// if ($(DOMObject).attr('bind').toLowerCase() === 'activity') {
	// var activityEl = DOMObject;
	// var activity = pop(window.App, {
	// name : $(activityEl).attr('name'),
	// key : $(activityEl).attr('key')
	// });
    // activity.model.destroy();
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

	window.expanz.showManuallyClosedPopup = function(content, title, id) {

		content = unescape(content);

		var clientMessage = new expanz.models.ClientMessage({
			id : id,
			title : title,
			text : content //,
			//parent : activity
		});

		var loginPopup = new window.expanz.views.ManuallyClosedPopup({
			id : clientMessage.id,
			model : clientMessage
		}, $('body'));

		return loginPopup;

	};

	window.expanz.openActivity = function(id, style, key, title) {
		var callback = function(activityMetadata) {
			if (activityMetadata.url === null) {
				window.expanz.logToConsole("Url of activity not found");
			}
		    
			var urlSeparator = activityMetadata.url.indexOf('?') !== -1 ? "&" : "?";

			/* case 'popup' */
			if (activityMetadata.onRequest == 'popup') {

			    /* an activity request shouldn't be reloaded from any state -> clean an eventual cookie if popup was not closed properly */
			    var existingHandle = window.expanz.Storage.getActivityHandle(id, style);

			    if (existingHandle !== undefined) {
			        window.expanz.Storage.clearActivityHandle(id, style);
			        expanz.net.CloseActivityRequest(existingHandle); // Tell the server to close the existig activity
			    }
			    
			    var clientMessage = new expanz.models.ClientMessage({
					id : 'ActivityRequest',
					url: activityMetadata.url + urlSeparator + "random=" + new Date().getTime(),
					//parent : parentActivity,
					title : unescape(title || activityMetadata.title || '')
				});

				var popup = new window.expanz.views.ManuallyClosedPopup({
					id : clientMessage.id,
					model : clientMessage
				}, $('body'));

				popup.bind('contentLoaded', function() {
				    expanz.CreateActivity(popup.$el.find("[bind=activity]"), null, key, popup);
				});
			}
			/* case 'navigate' or default */
			else {
			    window.location = activityMetadata.url + urlSeparator + "random=" + new Date().getTime() + "&" + id + style + "initialKey=" + key;
			}
		};

		/* find url of activity */
		window.expanz.helper.findActivityMetadata(id, style, callback);

	};

	//
	// Helper Functions
	//

	window.expanz.findOpenActivityViewByHandle = function(activityHandle) {
	    if (window && window.openActivityViews) {
	        for (var i = 0; i < window.openActivityViews.length; i++) {
	            if (window.openActivityViews[i] !== undefined && window.openActivityViews[i].model.get("handle") == activityHandle) {
	                return window.openActivityViews[i];
				}
			}
		}
	    
		return null;
	};

	window.expanz.findOpenActivityViewByModel = function(activityModel) {
	    if (window && window.openActivityViews) {
	        for (var i = 0; i < window.openActivityViews.length; i++) {
	            if (window.openActivityViews[i] !== undefined && window.openActivityViews[i].model === activityModel) {
	                return window.openActivityViews[i];
				}
			}
		}
	    
		return null;
	};

	window.expanz.OnActivityClosed = function (activityId) {
	    // Remove the activity with the matching ID from the list of open activities
	    if (window && window.openActivityViews) {
	        for (var i = 0; i < window.openActivityViews.length; i++) {
	            if (window.openActivityViews[i] !== undefined && window.openActivityViews[i].model.get("handle") == activityId) {
	                delete window.openActivityViews[i];
	                return;
				}
			}
		}
	};

	window.expanz.helper.findActivityMetadata = function (activityName, activityStyle, callback) {
	    var data = expanz.Storage.getFormMapping();

	    $(data).find('activity').each(function () {
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

		    var activityView = expanz.Factory.createActivityView(dom);

			/* look for initial key in the query parameters */
		    var initialKey = paramInitialKey || getQueryParameterByName(activityView.model.get('name') + (activityView.model.get('style') || '') + 'initialKey');
			activityView.model.set({
				'key' : initialKey
			});

			activityView.model.load(callbacks);
			activities.push(activityView);
		});

		return activities;
	}

	function loadMenu(el, displayEmptyItems) {

		// Load Menu & insert it into #menu
		var menu = new expanz.menu.AppSiteMenu();
		var processAreas = loadProcessMap(expanz.Storage.getProcessAreaList(), displayEmptyItems);
		if (processAreas.length > 0)
			menu.processAreas = processAreas;
		menu.load(el);
	}

	function loadProcessMap(processAreas, displayEmptyItems, parentProcessAreaMenu) {
		var processAreasMenu = [];
		_.each(processAreas, function(processArea) {
			if (displayEmptyItems || processArea.activities.length > 0 || processArea.pa.length > 0) {
				var menuItem = new expanz.menu.ProcessAreaMenu(processArea.id, processArea.title);

				if (parentProcessAreaMenu)
					menuItem.parent = parentProcessAreaMenu;

				_.each(processArea.activities, function(activity) {
					if (displayEmptyItems || (activity.url !== '' && activity.url.length > 1)) {
						menuItem.activities.push(new expanz.menu.ActivityMenu(activity.name, activity.style, activity.title, activity.url, activity.img));
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
	if (document.location.href.indexOf(window.expanz.getMaintenancePage()) === -1) {
		if (window.expanz.isOnMaintenance()) {
			expanz.views.redirect(window.expanz.getMaintenancePage());
		}

		/* check if web server is down and last success was more than 1 minutes ago */
		var currentTime = (new Date()).getTime();
		var lastSuccess = window.expanz.Storage.getLastPingSuccess();
		if (lastSuccess === undefined || (currentTime - lastSuccess) > (1 * 60 * 1000)) {
			expanz.net.WebServerPing(3);
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
	window.expanz.Dashboards = new window.expanz.models.Dashboards();

	/* Load the Expanz Process Area menu without empty items */
	_.each($('[bind=menu]'), function(el) {
		loadMenu($(el), false);
	});

	/* create login if exists */
	expanz.security.createLogin($('[bind=login]'));

	/* create all activities where autoLoad attribute is not set to false */
	_.each($('[bind=activity][autoLoad!="false"]'), function(el) {
		expanz.CreateActivity($(el));
	});

	/* apply security roles -> hide stuff */
	_.each($("body").find("[requiresRole]"), function(el) {
		var roles = $(el).attr("requiresRole");
		if (roles !== null && roles !== "") {
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

///#source 1 1 /source/js/adapters/TimeInputAdapter.js
$(function() {
    $("body").find("[renderingType=timeinput]").each(function() {
        var timeInputAdapter = new TimeInputAdapter(this);
    });

    function TimeInputAdapter(inputElement) {
        var $inputElement = $(inputElement);

        var onValueUpdatedFromServer = function(event, newValue, model) {
            // Time fields should render their value using the corresponding 12hr/24hr value provided by the model, the
            // choice of which is specified as a configuration property
            var value = null;

            if (newValue !== null) {
                var timeFormat = $inputElement.attr('timeFormat') !== undefined ? $inputElement.attr('timeFormat') : window.config.timeFormat;

                if (timeFormat === undefined)
                    timeFormat = 12;

                value = (timeFormat == 12 ? model.attributes["timeAMPM"] : model.attributes["time24"]);
            }

            if ($inputElement.is('input')) {
                $inputElement.val(value);
            } else {
                $inputElement.text(value || ""); // Support for non-input elements, like labels
            }

            return value;
        };

        // Register event handlers
        $inputElement.bind("valueUpdated", onValueUpdatedFromServer);
    };
});
///#source 1 1 /source/js/adapters/BreadcrumbAdapter.js
$(function () {
    $("body").find("[renderingType=breadcrumb]").each(function () {
        var breadcrumbAdapter = new BreadcrumbAdapter(this);
    });

    function BreadcrumbAdapter(inputElement) {
        var $inputElement = $(inputElement);

        var onRender = function (event, dataPublicationModel, view, args) {
            view.$el.html("");
            
            dataPublicationModel.rows.each(function (row, index) {
                if (index > 0)
                    view.$el.append("&nbsp;&gt;&nbsp;");

                view.$el.append("<a href='#" + row.get("id") + "' id='" + row.get("id") + "' type='" + row.get("type") + "'>" + row.cells.first().get("value") + "</a>");
            });
            
            /* handle drilldown hyperlink click event */
            var onDrillDownClick = function (event) {
                var $anchor = $(this);
                view.model.drillDown($anchor.attr('id'), $anchor.attr('type'), null);
            };

            view.$el.find("a").click(this, onDrillDownClick);

            args.handled = true; // Indicates that the rendering of the data publication has been handled
        };

        // Register event handlers
        $inputElement.bind("datapublication:rendering", onRender);
    };
});
