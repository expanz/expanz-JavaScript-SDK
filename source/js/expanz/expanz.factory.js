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
				collection: activityModel
			});

			expanz.Factory.bindMessageControl(activityView);
			expanz.Factory.bindMethods(activityView);
			expanz.Factory.bindDataControls(activityView);
			expanz.Factory.bindFields(activityView);
		    
			return activityView;
		},

		bindMessageControl: function (activityView) {
		    var activityModel = activityView.collection;
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
		    var activityModel = activityView.collection;
		    
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

		        activityModel.add(fieldModel);

		        // Add anonymous fields bound to method
		        if (fieldModel.get('anonymousBoundMethod') !== null && fieldModel.get('anonymousBoundMethod') !== '') {
		            var boundMethod = activityModel.get(fieldModel.get('anonymousBoundMethod'));

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
		        activityModel.addDataControl(dataFieldView.dataModel);
		    });
		},

		bindMethods: function (activityView) {
		    var activityModel = activityView.collection;

		    var methodViewCollection = expanz.Factory.createMethodViews(activityView.$el.find('[bind=method]'));
		    
		    _.each(methodViewCollection, function (methodView) {
		        var methodModel = methodView.model;
		        
		        methodModel.set({
		                parent: activityModel
		            }, {
		                silent: true
		            });
		        
		        activityModel.add(methodModel);
		        activityView.addMethodView(methodView);
		    });
		},

		bindDataControls: function (activityView, parentEl) {
		    var activityModel = activityView.collection;

		    if (parentEl === undefined) // Picklists will pass in a parent, but activities won't
		        parentEl = activityView.el;

		    var dataControlViewCollection = expanz.Factory.createDataControlViews(activityModel.getAttr('name'), activityModel.getAttr('style'), $(parentEl).find('[bind=DataControl]'));

		    _.each(dataControlViewCollection, function (dataControlView) {
		        var dataControlModel = dataControlView.model;
		        
				dataControlModel.setAttr({
					parent : activityModel,
					activityId : activityModel.getAttr('name')
				});
			    
				activityModel.addDataControl(dataControlModel);

				/* add anonymous datacontrol field bound to method */
				if (dataControlModel.getAttr('anonymousBoundMethod') !== null && dataControlModel.get('anonymousBoundMethod') !== '') {
				    var boundMethod = activityModel.get(dataControlModel.getAttr('anonymousBoundMethod'));
				    
					if (boundMethod) {
						boundMethod.addAnonymousElement(dataControlModel);
					}
				}
			});
		},

		createFieldViews : function(DOMObjects) {

		    var fieldViews = [];
		    
		    _.each(DOMObjects, function (fieldEl) {
		        var $fieldEl = $(fieldEl);
		        
				// Create a model and a view for each field, and associate the two together
		        var model = new expanz.models.Field({
		            id: $fieldEl.attr('fieldId') || $fieldEl.attr('name') || $fieldEl.attr('id'),
		            fieldId: $fieldEl.attr('fieldId') || $fieldEl.attr('name') || $fieldEl.attr('id'),
					anonymousBoundMethod : $fieldEl.attr('anonymousBoundMethod')
				});
			    
				var view = new expanz.views.FieldView({
					el : fieldEl,
					id: model.get("id"),
					className : $fieldEl.attr('class'),
					model: model,
					textTransformFunction : $fieldEl.attr('textTransformFunction')
				});

				fieldViews.push(view);
			});
		    
			return fieldViews;
		},

		createDataFieldViews : function(DOMObjects) {

		    var fieldViews = [];
		    
		    _.each(DOMObjects, function (fieldEl) {
		        var $fieldEl = $(fieldEl);

		        // Create a model and a view for each field, and associate the two together
		        var fieldModel = new expanz.models.Field({
		            id: $fieldEl.attr('fieldId') || $fieldEl.attr('name') || $fieldEl.attr('id'),
		            fieldId: $fieldEl.attr('fieldId') || $fieldEl.attr('name') || $fieldEl.attr('id'),
		            anonymousBoundMethod: $fieldEl.attr('anonymousBoundMethod')
		        });
		        
		        var dataModel = new expanz.models.data.DataControl({
		            id: $fieldEl.attr('fieldId') || $fieldEl.attr('name') || $fieldEl.attr('id'),
					dataId: $fieldEl.attr('dataId') || $fieldEl.attr('id') || $fieldEl.attr('fieldId') || $fieldEl.attr('name') || $fieldEl.attr('query') || $fieldEl.attr('populateMethod'),
		            populateMethod : $fieldEl.attr('populateMethod'),
		            type : $fieldEl.attr('type'),
		            contextObject : $fieldEl.attr('contextObject'),
		            autoPopulate : $fieldEl.attr('autoPopulate'),
		            renderingType : $fieldEl.attr('renderingType'),
		            selectionChangeAnonymousMethod : $fieldEl.attr('selectionChangeAnonymousMethod'),
		            selectionChangeAnonymousContextObject : $fieldEl.attr('selectionChangeAnonymousContextObject'),
					anonymousBoundMethod : $fieldEl.attr('anonymousBoundMethod')
		        });
		        
				var view = new expanz.views.DataFieldView({
					el : fieldEl,
					id: fieldModel.get("id"),
					className : $fieldEl.attr('class'),
					model: fieldModel,
					dataModel: dataModel,
					textTransformFunction : $fieldEl.attr('textTransformFunction')
				});

				fieldViews.push(view);
			});
		    
			return fieldViews;
		},
		
		createVariantFieldViews : function(DOMObjects) {

		    var fieldViews = [];
		    
		    _.each(DOMObjects, function (fieldEl) {
		        var $fieldEl = $(fieldEl);

		        // Create a model and a view for each variant field, and associate the two together
		        var model = new expanz.models.Field({
		            id: $fieldEl.attr('fieldId') || $fieldEl.attr('id') || $fieldEl.attr('name')
			    });
		
		        var view = new expanz.views.VariantFieldView({
		            el: fieldEl,
		            id: model.get("id"),
		            className: $fieldEl.attr('class'),
		            model: model,
		            textTransformFunction: $fieldEl.attr('textTransformFunction')
		        });

		        fieldViews.push(view);
		    });
		    
		    return fieldViews;
		},

		createDashboardFieldViews : function(DOMObjects) {

		    var fieldViews = [];
		    
		    _.each(DOMObjects, function (fieldEl) {
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
					model : model,
					textTransformFunction : $fieldEl.attr('textTransformFunction')
				});

				fieldViews.push(view);
			});
		    
			return fieldViews;
		},

		createDependantFieldViews : function(DOMObjects) {

		    var fieldViews = [];
		    
		    _.each(DOMObjects, function (fieldEl) {
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

		createDataControlViews : function(activityName, activityStyle, DOMObjects) {

		    var dataControlViewCollection = [];
		    
			_.each(DOMObjects, function(dataControlEl) {
			    var $dataControlEl = $(dataControlEl);
		        
			    var dataControlModel;
			    var dataControlView;
			    
				/* case rendering as a grid */
				if ($dataControlEl.attr('renderingType') == 'grid' || $dataControlEl.attr('renderingType') == 'popupGrid' || $dataControlEl.attr('renderingType') == 'rotatingBar') {
					dataControlModel = new expanz.models.data.Grid({
						id : $dataControlEl.attr('id'),
						dataId: $dataControlEl.attr('dataId') || $dataControlEl.attr('id') || $dataControlEl.attr('name') || $dataControlEl.attr('query') || $dataControlEl.attr('populateMethod'),
						query: $dataControlEl.attr('query'),
						fieldName: $dataControlEl.attr('fieldName') || $dataControlEl.attr('dataId'),
						populateMethod : $dataControlEl.attr('populateMethod'),
						autoPopulate : $dataControlEl.attr('autoPopulate'),
						contextObject : $dataControlEl.attr('contextObject'),
						renderingType : $dataControlEl.attr('renderingType'),
						selectionChangeAnonymousMethod : $dataControlEl.attr('selectionChangeAnonymousMethod'),
						selectionChangeAnonymousContextObject : $dataControlEl.attr('selectionChangeAnonymousContextObject'),
						anonymousBoundMethod : $dataControlEl.attr('anonymousBoundMethod')
					});

					dataControlView = new expanz.views.GridView({
					    el: dataControlEl,
					    id: dataControlModel.get("id"),
						className : $dataControlEl.attr('class'),
						itemsPerPage : $dataControlEl.attr('itemsPerPage'),
						templateName : $dataControlEl.attr('templateName'),
						isHTMLTable : $dataControlEl.attr('isHTMLTable'),
						enableConfiguration : $dataControlEl.attr('enableConfiguration'),
						noItemText : $dataControlEl.attr('noItemText'),
						model : dataControlModel
					});

				    // load pre-defined gridview information from formmapping.xml
					var formMapping = expanz.Storage.getFormMapping();
				    
					var activityInfo = _.find($(formMapping).find('activity'), function (activityXML) {
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
									    
								var actionName = $(action).attr('methodName') || $(action).attr('menuAction') || $(action).attr('contextMenu');
								var type = $(action).attr('methodName') ? 'method' : $(action).attr('menuAction') ? 'menuAction' : 'contextMenu';

								dataControlModel.addAction(type, $(action).attr('id'), $(action).attr('label'), $(action).attr('width'), actionName, params);
							});
						}
					}
				}
				/* renderingType is not grid: 'tree' or 'combobox' or checkboxes or empty */
				/* the attribute fieldName might be defined in case, the datacontrol updates a field value if not specified taking the name */
				else {
					dataControlModel = new expanz.models.data.DataControl({
						id: $dataControlEl.attr('id'),
						dataId: $dataControlEl.attr('id') || $dataControlEl.attr('name') || $dataControlEl.attr('query') || $dataControlEl.attr('populateMethod'),
						fieldName: $dataControlEl.attr('fieldName') || $dataControlEl.attr('dataId'),
						populateMethod : $dataControlEl.attr('populateMethod'),
						type : $dataControlEl.attr('type'),
						contextObject : $dataControlEl.attr('contextObject'),
						autoPopulate : $dataControlEl.attr('autoPopulate'),
						renderingType : $dataControlEl.attr('renderingType'),
						selectionChangeAnonymousMethod : $dataControlEl.attr('selectionChangeAnonymousMethod'),
						selectionChangeAnonymousContextObject : $dataControlEl.attr('selectionChangeAnonymousContextObject'),
						anonymousBoundMethod : $dataControlEl.attr('anonymousBoundMethod')
					});

					if ($dataControlEl.attr('renderingType') == 'checkboxes') {
					    dataControlView = new expanz.views.CheckboxesView({
					        el: dataControlEl,
					        id: dataControlModel.get("id"),
							className : $dataControlEl.attr('class'),
							model : dataControlModel
						});
					}
					else if ($dataControlEl.attr('renderingType') == 'radiobuttons') {
					    dataControlView = new expanz.views.RadioButtonsView({
					        el: dataControlEl,
					        id: dataControlModel.get("id"),
							className : $dataControlEl.attr('class'),
							model : dataControlModel
						});
					}
					else {
						dataControlView = new expanz.views.DataControlView({
						    el: dataControlEl,
						    id: dataControlModel.get("id"),
							className : $dataControlEl.attr('class'),
							model : dataControlModel
						});
					}
				}

				dataControlViewCollection.push(dataControlView);
			});
		    
			return dataControlViewCollection;
		}
	};
});