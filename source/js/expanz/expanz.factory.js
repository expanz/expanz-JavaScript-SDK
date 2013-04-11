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
			expanz.Factory.bindCustomContentControls(activityView);
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

		bindCustomContentControls: function (activityView) {
		    var activityModel = activityView.model;

		    var customContentViewCollection = expanz.Factory.createCustomContentViews(activityView.$el.find('[bind=customcontent]'));

		    _.each(customContentViewCollection, function (customContentView) {
		        var customContentModel = customContentView.model;

		        customContentModel.set({
		            parent: activityModel
		        }, {
		            silent: true
		        });

		        activityModel.customContentCollection.add(customContentModel);
		        activityView.addCustomContentView(customContentView);
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
		},

		createCustomContentViews: function (domObjects) {
		    var customContentViews = [];

		    _.each(domObjects, function (customContentEl) {
		        var $customContentEl = $(customContentEl);

		        var model = new expanz.models.CustomContent({
		            id: $customContentEl.attr("id"),
		            method: $customContentEl.attr("method"),
		            type: $customContentEl.attr("type")
		        });

		        var view = new expanz.views.CustomContentView({
		            el: customContentEl,
		            id: model.get("id"),
		            model: model
		        });

		        customContentViews.push(view);
		    });

		    return customContentViews;
		},
	};
});