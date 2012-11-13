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

		createLoginView : function(loginEl) {

			var loginModel = new window.expanz.models.Login({
				name : $(loginEl).attr('name'),
				type : $(loginEl).attr('type')
			});
		    
			var loginView = new window.expanz.views.LoginView({
				el : $(loginEl),
				id : $(loginEl).attr('name'),
				collection : loginModel
			});

			return loginView;
		},

		createActivityView : function(activityEl) {
			// create a collection for each activity
			var activityModel = new expanz.models.Activity({ // expanz.models.Login.Activity
				name : $(activityEl).attr('name'),
				title : $(activityEl).attr('title'),
				url : $(activityEl).attr('url'),
				key : $(activityEl).attr('key'),
				style : $(activityEl).attr('activityStyle'),
				optimisation : $(activityEl).attr('optimisation') ? boolValue($(activityEl).attr('optimisation')) : true,
				allowAnonymous : $(activityEl).attr('allowAnonymous') ? boolValue($(activityEl).attr('allowAnonymous')) : false
			});
		    
			var activityView = new expanz.views.ActivityView({
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
		    _.each(expanz.Factory.createFieldView($(el).find('[bind=field]')), function (fieldModel) {
				fieldModel.set({
					parent : activityModel
				}, {
					silent : true
				});
		        
				activityModel.add(fieldModel);

				/* add anonymous fields bound to method */
				if (fieldModel.get('anonymousBoundMethod') !== null && fieldModel.get('anonymousBoundMethod') !== '') {
				    var boundMethod = activityModel.get(fieldModel.get('anonymousBoundMethod'));
				    
					if (boundMethod) {
						boundMethod.addAnonymousElement(fieldModel);
					}
				}

			});

			_.each(expanz.Factory.createVariantFieldView($(el).find('[bind=variantfield]')), function(variantFieldModel) {
				variantFieldModel.set({
					parent : activityModel
				}, {
					silent : true
				});
			    
				activityModel.add(variantFieldModel);

				// add anonymous fields bound to method 
				if (variantFieldModel.get('anonymousBoundMethod') !== null && variantFieldModel.get('anonymousBoundMethod') !== '') {
				    var boundMethod = activityModel.get(variantFieldModel.get('anonymousBoundMethod'));
				    
					if (boundMethod) {
					    boundMethod.addAnonymousElement(variantFieldModel);
					}
				}
			});
			
			_.each(expanz.Factory.createDashboardFieldView($(el).find('[bind=dashboardfield]')), function(dashboardFieldModel) {
			    var fieldSessionValue = expanz.Storage.getDashboardFieldValue(dashboardFieldModel.get('dashboardName'), dashboardFieldModel.get('name'));
			    
				dashboardFieldModel.set({
					value : fieldSessionValue || ''
				});

				expanz.Dashboards.add(dashboardFieldModel);
			});

			_.each(expanz.Factory.createDependantFieldView($(el).find('[bind=dependant]')), function(dependantFieldModel) {
				dependantFieldModel.set({
					parent : activityModel
				}, {
					silent : true
				});
			    
				activityModel.add(dependantFieldModel);
			});
		},

		bindMethods : function(activityModel, el) {
		    _.each(expanz.Factory.createMethodView($(el).find('[bind=method]')), function (methodModel) {
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
		    _.each(expanz.Factory.createDataControlView(activityModel.getAttr('name'), activityModel.getAttr('style'), $(el).find('[bind=DataControl]')), function (dataControlModel) {
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

		createFieldView : function(DOMObjects) {

		    var fieldModels = [];
		    
			_.each(DOMObjects, function(fieldEl) {
				// create a model for each field
				var field = new expanz.models.Field({
					id : $(fieldEl).attr('name'),
					anonymousBoundMethod : $(fieldEl).attr('anonymousBoundMethod')
				});
			    
				var view = new expanz.views.FieldView({
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
		
		createVariantFieldView : function(DOMObjects) {

		    var fieldModels = [];
		    
		    _.each(DOMObjects, function (fieldEl) {
		        // Create a model and a view for each variant field
		        var field = new expanz.models.Field({
		            id: $(fieldEl).attr('name'),
		            anonymousBoundMethod: $(fieldEl).attr('anonymousBoundMethod')
			});
		
		        var view = new expanz.views.VariantFieldView({
		            el: $(fieldEl),
		            id: $(fieldEl).attr('id'),
		            className: $(fieldEl).attr('class'),
		            model: field,
		            textTransformFunction: $(fieldEl).attr('textTransformFunction')
		        });

		        fieldModels.push(field);
		    });
		    
			return fieldModels;
		},

		createDashboardFieldView : function(DOMObjects) {

		    var fieldModels = [];
		    
			_.each(DOMObjects, function(fieldEl) {
				// create a model for each field
				var field = new expanz.models.DashboardField({
					id : $(fieldEl).attr('dashboardName') + "_" + $(fieldEl).attr('name'),
					name : $(fieldEl).attr('name'),
					dashboardName : $(fieldEl).attr('dashboardName')
				});
			    
				var view = new expanz.views.FieldView({
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

		createDependantFieldView : function(DOMObjects) {

		    var fieldModels = [];
		    
			_.each(DOMObjects, function(fieldEl) {
				// create a model for each field
				var field = new expanz.models.Bindable({
					id : $(fieldEl).attr('name')
				});
			    
				var view = new expanz.views.DependantFieldView({
					el : $(fieldEl),
					id : $(fieldEl).attr('id'),
					className : $(fieldEl).attr('class'),
					model : field
				});

				fieldModels.push(field);
			});
		    
			return fieldModels;
		},

		createMethodView : function(DOMObjects) {

		    var methodModels = [];
		    
			_.each(DOMObjects, function(methodEl) {
				// create a model for each method
			    var method;
			    
				if ($(methodEl).attr('type') == 'ContextMenu') {
					method = new expanz.models.MenuAction({
						id : $(methodEl).attr('name'),
						contextObject : $(methodEl).attr('contextObject')
					});

					var ctxMenuView = new expanz.views.ContextMenuView({
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

					method = new expanz.models.Method({
						id : $(methodEl).attr('name'),
						contextObject : $(methodEl).attr('contextObject'),
						methodAttributes : methodAttributes
					});

					var view = new expanz.views.MethodView({
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

		createDataControlView : function(activityName, activityStyle, DOMObjects) {

			var dataControlModelCollection = [];

			_.each(DOMObjects, function(dataControlEl) {
				var dataControlModel;
				/* case rendering as a grid */
				if ($(dataControlEl).attr('renderingType') == 'grid' || $(dataControlEl).attr('renderingType') == 'popupGrid' || $(dataControlEl).attr('renderingType') == 'rotatingBar') {
					dataControlModel = new expanz.models.data.Grid({
						id : $(dataControlEl).attr('id'),
						dataId: $(dataControlEl).attr('dataId') || $(dataControlEl).attr('id') || $(dataControlEl).attr('name') || $(dataControlEl).attr('query') || $(dataControlEl).attr('populateMethod'),
						query: $(dataControlEl).attr('query'),
						fieldName: $(dataControlEl).attr('fieldName') || $(dataControlEl).attr('dataId'),
						populateMethod : $(dataControlEl).attr('populateMethod'),
						autoPopulate : $(dataControlEl).attr('autoPopulate'),
						contextObject : $(dataControlEl).attr('contextObject'),
						renderingType : $(dataControlEl).attr('renderingType'),
						selectionChangeAnonymousMethod : $(dataControlEl).attr('selectionChangeAnonymousMethod'),
						selectionChangeAnonymousContextObject : $(dataControlEl).attr('selectionChangeAnonymousContextObject'),
						anonymousBoundMethod : $(dataControlEl).attr('anonymousBoundMethod')
					});

					var view = new expanz.views.GridView({
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
									    
										var actionName = $(action).attr('methodName') || $(action).attr('menuAction') || $(action).attr('contextMenu');
										var type = $(action).attr('methodName') ? 'method' : $(action).attr('menuAction') ? 'menuAction' : 'contextMenu';

										dataControlModel.addAction(type, $(action).attr('id'), $(action).attr('label'), $(action).attr('width'), actionName, params);
										
										/*var method;
										method = new expanz.models.MenuAction({
											id : $(action).attr('id'),
											contextObject : actionName
										});*/

										/*var ctxMenuview = new expanz.views.ContextMenuView({
											el : $(this),
											id : $(this).attr('id'),
											className : $(this).attr('class'),
											model : dataControlModel
										});
										window.expanz.currentContextMenu = ctxMenuview.model;*/
									});
								}
							}
						}
					});

				}
				/* renderingType is not grid: 'tree' or 'combobox' or checkboxes or empty */
				/* the attribute fieldName might be defined in case, the datacontrol updates a field value if not specified taking the name */
				else {
					dataControlModel = new expanz.models.data.DataControl({
						id: $(dataControlEl).attr('id'),
						dataId: $(dataControlEl).attr('id') || $(dataControlEl).attr('name') || $(dataControlEl).attr('query') || $(dataControlEl).attr('populateMethod'),
						fieldName: $(dataControlEl).attr('fieldName') || $(dataControlEl).attr('dataId'),
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
						var checkboxesView = new expanz.views.CheckboxesView({
							el : $(dataControlEl),
							id : $(dataControlEl).attr('id'),
							className : $(dataControlEl).attr('class'),
							model : dataControlModel
						});
					}
					else if ($(dataControlEl).attr('renderingType') == 'radiobuttons') {
						var radioButtonsView = new expanz.views.RadioButtonsView({
							el : $(dataControlEl),
							id : $(dataControlEl).attr('id'),
							className : $(dataControlEl).attr('class'),
							model : dataControlModel
						});
					}
					else {
						var dataControlView = new expanz.views.DataControlView({
							el : $(dataControlEl),
							id : $(dataControlEl).attr('id'),
							className : $(dataControlEl).attr('class'),
							model : dataControlModel
						});
					}
				}

				dataControlModelCollection.push(dataControlModel);
			});
		    
			return dataControlModelCollection;
		}
	};
});