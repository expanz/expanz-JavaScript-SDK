$(function() {

	window.expanz = window.expanz || {};

	window.expanz.Factory = {

		Login : function(loginEl) {

			var loginModel = new window.expanz.Model.Login({
				name : $(loginEl).attr('name'),
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
				optimisation : $(activityEl).attr('optimisation') ? boolValue($(activityEl).attr('optimisation')) : true
			});
			var activityView = new expanz.Views.ActivityView({
				el : $(activityEl),
				id : $(activityEl).attr('name'),
				key : $(activityEl).attr('key'),
				collection : activityModel
			});

			expanz.Factory.bindDataControls(activityModel, activityEl);
			expanz.Factory.bindFields(activityModel, activityEl);
			expanz.Factory.bindMethods(activityModel, activityEl);
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
			});
		},

		Field : function(DOMObjects) {

			var fieldModels = [];
			_.each(DOMObjects, function(fieldEl) {
				// create a model for each field
				var field = new expanz.Model.Field({
					id : $(fieldEl).attr('name')
				});
				var view = new expanz.Views.FieldView({
					el : $(fieldEl),
					id : $(fieldEl).attr('id'),
					className : $(fieldEl).attr('class'),
					model : field
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
					method = new expanz.Model.Method({
						id : $(methodEl).attr('name'),
						contextObject : $(methodEl).attr('contextObject')
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
						populateMethod : $(dataControlEl).attr('populateMethod'),
						autoPopulate : $(dataControlEl).attr('autoPopulate'),
						contextObject : $(dataControlEl).attr('contextObject'),
						renderingType : $(dataControlEl).attr('renderingType')
					});

					var view = new expanz.Views.GridView({
						el : $(dataControlEl),
						id : $(dataControlEl).attr('id'),
						className : $(dataControlEl).attr('class'),
						itemsPerPage : $(dataControlEl).attr('itemsPerPage'),
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
										var methodParams = new Array();
										_.each($(action).find('methodParam'), function(methodParam) {
											methodParams.push({
												name : $(methodParam).attr('name'),
												value : $(methodParam).attr('value'),
												label : $(methodParam).attr('label'),
												bindValueFromCellId : $(methodParam).attr('bindValueFromCellId'),
											});
										});
										dataControlModel.addAction($(action).attr('id'), $(action).attr('label'), $(action).attr('width'), $(action).attr('methodName'), methodParams);
									});
								}
							}
						}
					});

				}
				/* renderingType is not grid: 'tree' or 'combobox' or empty */
				else {
					var dataControlModel = new expanz.Model.Data.DataControl({
						id : $(dataControlEl).attr('name'),
						populateMethod : $(dataControlEl).attr('populateMethod'),
						type : $(dataControlEl).attr('type'),
						contextObject : $(dataControlEl).attr('contextObject'),
						autoPopulate : $(dataControlEl).attr('autoPopulate'),
						renderingType : $(dataControlEl).attr('renderingType')
					});

					var view = new expanz.Views.DataControlView({
						el : $(dataControlEl),
						id : $(dataControlEl).attr('id'),
						className : $(dataControlEl).attr('class'),
						model : dataControlModel
					});
				}

				DataControlModels.push(dataControlModel);
			});
			return DataControlModels;
		}

	};

});
