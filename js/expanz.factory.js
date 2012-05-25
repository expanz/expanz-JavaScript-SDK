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
					if($(methodEl).attr('methodAttributes')){
						_.each($(methodEl).attr('methodAttributes').split(';'),function(val){
							var split = val.split(':');
							if(split.length == 2){
								methodAttributes.push({name: split[0], value:split[1]});
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
				if ($(dataControlEl).attr('renderingType') == 'grid') {
					var dataControlModel = new expanz.Model.Data.Grid({
						id : $(dataControlEl).attr('name'),
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
