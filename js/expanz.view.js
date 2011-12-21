/* Author: Adam Tait

 */
$(function() {

	window.expanz = window.expanz || {};
	window.expanz.Views = {};

	window.expanz.Views.FieldView = Backbone.View.extend({

	initialize : function() {
		this.model.bind("change:label", this.modelUpdate('label'), this);
		this.model.bind("change:value", this.modelUpdate('value'), this);
	},

	modelUpdate : function(attr) {
		return function() {
			var elem = this.el.find('[attribute=' + attr + ']');
			updateViewElement(elem, this.model.attributes, attr);
			this.el.trigger('update:field');
		};
	},

	events : {
		"change [attribute=value]" : "viewUpdate"
	},

	viewUpdate : function() {
		var elem = this.el.find('[attribute=value]');
		//handle checkbox field case
		if ($(elem).is(":checkbox")) {
			this.model.update({
				value : $(elem).prop("checked") ? 1 : 0
			});
		}
		else{
			this.model.update({
				value : $(elem).val()
			});
		}
		
		this.el.trigger('update:field');
	}

	});

	window.expanz.Views.DependantFieldView = Backbone.View.extend({

	initialize : function() {
		this.model.bind("change:value", this.toggle, this);
		this.el.hide();
	},

	toggle : function() {
		var elem = this.el.find('[attribute=value]');
		updateViewElement(elem, this.model.get('value'));

		if (this.model.get('value').length > 0) {
			this.el.show('slow');
		} else {
			this.el.hide('slow');
		}
	}

	});

	window.expanz.Views.MethodView = Backbone.View.extend({

	events : {
		"click [attribute=submit]" : "submit"
	},

	submit : function() {
		this.model.submit();
		this.el.trigger('submit:' + this.model.get('id'));
	}

	});

	window.expanz.Views.GridView = Backbone.View
			.extend({

			initialize : function() {
				this.model.bind("add", this.render, this);
				this.model.bind("change", this.render, this);
				this.bind("rowClicked", this.rowClicked, this);
			},

			rowClicked : function(row) {
				this.model.updateRowSelected(row.attr('id'), row.attr('type'));
			},

			render : function() {
				// set table scaffold
				var tableEl = this.el.find('table#' + this.model.getAttr('id'));
				if (tableEl.length < 1) {
					this.el
							.append('<table id="' + this.model.getAttr('id') + '"></table>');
					tableEl = this.el.find('table#' + this.model.getAttr('id'));
				}
				$(tableEl).html('<thead><tr></tr></thead><tbody></tbody>');

				// render column header
				var el = $(tableEl).find('thead tr');
				_
						.each(this.model.getAllColumns(),
								function(cell) {
									var html = '<td';
									html += cell.get('width') ? ' width="' + cell
											.get('width') + '"' : '';
									html += '>' + cell.get('label') + '</td>';
									el.append(html);
								});

				// render rows
				var model = this.model;
				el = $(tableEl).find('tbody');
				_
						.each(
								this.model.getAllRows(),
								function(row) {
									var html = '<tr id="' + row.getAttr('id') + '" type="' + row
											.getAttr('type') + '">';
									var columnOrder = _.map(this.model.getAllColumns(),
											function(cell) {
												return {
												id : cell.get('id'),
												field : cell.get('field'),
												label : cell.get('label')
												};
											});
									_
											.each(
													row.getAllCells(columnOrder),
													function(cell) {
														html += '<td id="' + cell.get('id') + '" class="row' + row
																.getAttr('id') + ' column' + cell
																.get('id') + '">';
														if (model.getColumn(cell.get('id')) && model
																.getColumn(cell.get('id')).get(
																		'datatype') === 'BLOB') {
															html += '<img width="' + model
																	.getColumn(cell.get('id'))
																	.get('width') + '" src="' + cell
																	.get('value') + '"/>';
														} else
															if (cell.get('value')) {
																html += '<span>' + cell
																		.get('value') + '</span>';
															}
														html += '</td>';
													}, row);
									html += '</tr>';
									el.append(html);

									/* handle click event */
								}, this);

				var onRowClick = function(event) {
					event.data.trigger("rowClicked", $(this));
				};

				$('table#' + this.model.getAttr('id') + ' tr').click(this,
						onRowClick);

				return this;
			}
			});

	window.expanz.Views.ActivityView = Backbone.View.extend({

	initialize : function(attrs) {
		Backbone.View.prototype.initialize.call(attrs);
		if (attrs.key) {
			this.key = attrs.key;
		}
		this.collection.bind("error", this.updateError, this);
	},

	updateError : function(model, error) {
		expanz._error(error);
	},

	events : {
		"update:field" : "update"
	},

	update : function() {
		// perform full activity validation after a field updates ... if
		// necessary
	}

	});

	window.expanz.Views.PicklistWindowView = Backbone.View
			.extend({

			title : 'New window',

			windowId : 'newWindowId',

			initialize : function(attrs) {
				Backbone.View.prototype.initialize.call(attrs);
				if (this.options.title)
					this.title = this.options.title;
				if (this.options.windowId)
					this.windowId = this.options.windowId;
			},

			windowEl : null,

			events : {
			"window:close" : "close",
			"window:display" : "display"
			},

			render : function() {
				console.log("render");
				var pickupWindow = this.el.find('#' + this.windowId);
				if (pickupWindow.length < 1) {
					this.el
							.append("<div id='" + this.windowId + "' bind='grid' name='" + this.windowId + "'></div>");
					this.windowEl = this.el.find('#' + this.windowId);
					this.createWindowObject();
				} else {
					this.windowEl = pickupWindow;
				}

			},

			/* must be overriden depending on the pluggin used */
			createWindowObject : function() {
				this.windowEl.kendoWindow({
				visible : false,
				title : this.title
				});
			},

			/* must be overriden depending on the pluggin used */
			display : function() {
				this.windowEl.data("kendoWindow").center();
				this.windowEl.data("kendoWindow").open();
			},

			/* must be overriden depending on the pluggin used */
			close : function() {
				this.windowEl.data("kendoWindow").close();
			}

			});

	// Public Functions
	window.expanz.Views.redirect = function(destinationURL) {
		window.location.href = destinationURL;
	};

	// Private Functions

	function updateViewElement(elem, allAttrs, attr) {
		var datatype = allAttrs['datatype'];
		if (datatype && datatype.toLowerCase() === 'blob' && attr && attr === 'value') {
			var width = allAttrs['width'];
			var imgElem = '<img src="' + allAttrs['value'] + '"';
			imgElem += width ? ' width="' + width + '"' : '';
			imgElem += '/>';
			$(elem).html(imgElem);
			return;
		}

		var value;
		if ($(elem).attr("showTextValue") == "true") {
			value = allAttrs["text"];
		} else {
			value = allAttrs[attr];
		}

		if ($(elem).is('input')) {
			// special behaviour for checkbox input
			if ($(elem).is(":checkbox")) {
				if (value == 1) {
					$(elem).prop("checked", true);
				} else {
					$(elem).prop("checked", false);
				}
			} else {
				$(elem).val(value);
			}
			$(elem).trigger("valueUpdated", value);

			// if the field is disable apply the disabled attribute and style
			if (allAttrs["disabled"] == 1) {
				$(elem).attr('disabled', 'disabled');
				$(elem).addClass('readonlyInput');
			} else {
				$(elem).removeAttr('disabled');
				$(elem).removeClass('readonlyInput');
			}
		} else {
			$(elem).html(value);
		}
		return elem;
	}
	;

});
