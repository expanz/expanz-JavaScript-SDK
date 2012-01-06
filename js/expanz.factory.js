$(function() {

	window.expanz = window.expanz || {};

	window.expanz.Factory = {

		Activity : function(viewNamespace, modelNamespace, activityEl) {
			// create a collection for each activity
			var activityModel = new modelNamespace.Activity({ // expanz.Model.Login.Activity
				name : $(activityEl).attr('name'),
				title : $(activityEl).attr('title'),
				url : $(activityEl).attr('url'),
				key : $(activityEl).attr('key'),
				style : $(activityEl).attr('activityStyle')
			});
			var activityView = new viewNamespace.ActivityView({
				el : $(activityEl),
				id : $(activityEl).attr('name'),
				key : $(activityEl).attr('key'),
				collection : activityModel
			});

			expanz.Factory.bindDataControls(activityModel, viewNamespace, modelNamespace, activityEl);
			expanz.Factory.bindFields(activityModel, viewNamespace, modelNamespace, activityEl);
			expanz.Factory.bindMethods(activityModel, viewNamespace, modelNamespace, activityEl);
			expanz.Factory.bindGrids(activityModel, viewNamespace, modelNamespace, activityEl);

			// activities[ $(activityEl).attr('name') ] = activityView;
			return activityView;
		},

		bindFields : function(activityModel, viewNamespace, modelNamespace, el) {
			_.each(expanz.Factory.Field(viewNamespace, modelNamespace, $(el).find('[bind=field]')), function(fieldModel) {
				fieldModel.set({
					parent : activityModel
				}, {
					silent : true
				});
				activityModel.add(fieldModel);
			});

			_.each(expanz.Factory.DependantField(viewNamespace, modelNamespace, $(el).find('[bind=dependant]')), function(dependantFieldModel) {
				dependantFieldModel.set({
					parent : activityModel
				}, {
					silent : true
				});
				activityModel.add(dependantFieldModel);
			});
		},

		bindMethods : function(activityModel, viewNamespace, modelNamespace, el) {
			_.each(expanz.Factory.Method(viewNamespace, modelNamespace, $(el).find('[bind=method]')), function(methodModel) {
				methodModel.set({
					parent : activityModel
				}, {
					silent : true
				});
				activityModel.add(methodModel);
			});
		},

		bindDataControls : function(activityModel, viewNamespace, modelNamespace, el) {
			_.each(expanz.Factory.DataControl(viewNamespace, modelNamespace, $(el).find('[bind=DataControl]')), function(DataControlModel) {
				DataControlModel.set({
					parent : activityModel,
					activityId : activityModel.getAttr('name')
				});
				activityModel.addDataControl(DataControlModel);
			});
		},

		bindGrids : function(activityModel, viewNamespace, modelNamespace, el) {
			_.each(expanz.Factory.Grid(viewNamespace, modelNamespace, activityModel.getAttr('name'), $(el).find('[bind=grid]')), function(gridModel) {
				gridModel.setAttr({
					parent : activityModel,
					activityId : activityModel.getAttr('name')
				});
				activityModel.addGrid(gridModel);
			});

		},

		Field : function(viewNamespace, modelNamespace, DOMObjects) {

			var fieldModels = [];
			_.each(DOMObjects, function(fieldEl) {
				// create a model for each field
				var field = new modelNamespace.Field({
					id : $(fieldEl).attr('name')
				});
				var view = new viewNamespace.FieldView({
					el : $(fieldEl),
					id : $(fieldEl).attr('id'),
					className : $(fieldEl).attr('class'),
					model : field
				});

				fieldModels.push(field);
			});
			return fieldModels;
		},

		DependantField : function(viewNamespace, modelNamespace, DOMObjects) {

			var fieldModels = [];
			_.each(DOMObjects, function(fieldEl) {
				// create a model for each field
				var field = new modelNamespace.Bindable({
					id : $(fieldEl).attr('name')
				});
				var view = new viewNamespace.DependantFieldView({
					el : $(fieldEl),
					id : $(fieldEl).attr('id'),
					className : $(fieldEl).attr('class'),
					model : field
				});

				fieldModels.push(field);
			});
			return fieldModels;
		},

		Method : function(viewNamespace, modelNamespace, DOMObjects) {

			var methodModels = [];
			_.each(DOMObjects, function(methodEl) {
				// create a model for each method
				var method = new modelNamespace.Method({
					id : $(methodEl).attr('name'),
					contextObject : $(methodEl).attr('contextObject')
				});
				var view = new viewNamespace.MethodView({
					el : $(methodEl),
					id : $(methodEl).attr('id'),
					className : $(methodEl).attr('class'),
					model : method
				});

				methodModels.push(method);
			});
			return methodModels;
		},

		Grid : function(viewNamespace, modelNamespace, activityName, DOMObjects) {

			var gridModels = [];

			_.each(DOMObjects, function(gridEl) {
				// create a model for each GridView
				var gridModel = new modelNamespace.Data.Grid({
					id : $(gridEl).attr('name'),
					populateMethod : $(gridEl).attr('populateMethod'),
					contextObject : $(gridEl).attr('contextObject')
				});
				var view = new viewNamespace.GridView({
					el : $(gridEl),
					id : $(gridEl).attr('id'),
					className : $(gridEl).attr('class'),
					model : gridModel
				});

				// load pre-defined gridview information from formmapping.xml
				$.get('./formmapping.xml', function(defaultsXML) {
					var activityInfo = _.find($(defaultsXML).find('activity'), function(activityXML) {
						return $(activityXML).attr('name') === activityName;
					});
					if (activityInfo) {
						var gridviewInfo = _.find($(activityInfo).find('gridview'), function(gridviewXML) {
							return $(gridviewXML).attr('id') === gridModel.getAttr('id');
						});
						if (gridviewInfo) {
							// add actions
							_.each($(gridviewInfo).find('action'), function(action) {
								var methodParams = new Array();
								_.each($(action).find('methodParam'), function(methodParam) {
									methodParams.push({
										name : $(methodParam).attr('name'),
										value : $(methodParam).attr('value')
									});
								});
								gridModel.addAction($(action).attr('id'), $(action).attr('label'), $(action).attr('width'), $(action).attr('methodName'), methodParams);
							});
						}
					}
				});

				gridModels.push(gridModel);
			});
			return gridModels;
		},

		DataControl : function(viewNamespace, modelNamespace, DOMObjects) {

			var DataControlModels = [];

			_.each(DOMObjects, function(dataControlEl) {
				// create a model for each DataControl
				var dataControlModel = new modelNamespace.Data.DataControl({
					id : $(dataControlEl).attr('name'),
					populateMethod : $(dataControlEl).attr('populateMethod'),
					type : $(dataControlEl).attr('type')
				});

				var view = new viewNamespace.DataControlView({
					el : $(dataControlEl),
					id : $(dataControlEl).attr('id'),
					className : $(dataControlEl).attr('class'),
					model : dataControlModel
				});

				DataControlModels.push(dataControlModel);
			});
			return DataControlModels;
		}

	};

});
