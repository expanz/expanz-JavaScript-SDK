/* Author: Adam Tait

 */
$(function() {

	window.expanz = window.expanz || {};
	window.expanz.Views = {};

	window.expanz.Views.FieldView = Backbone.View.extend({

		initialize : function() {
			this.model.bind("change:label", this.modelUpdate('label'), this);
			this.model.bind("change:value", this.modelUpdate('value'), this);
			this.model.bind("change:errorMessage", this.displayError(), this);
		},

		modelUpdate : function(attr) {
			return function() {
				var elem = this.el.find('[attribute=' + attr + ']');
				updateViewElement(elem, this.model.attributes, attr);
				this.el.trigger('update:field');
			};
		},

		displayError : function() {
			return function() {
				var errorId = 'error' + this.model.get('id');
				if (this.model.get('errorMessage') != undefined) {
					var errorEl = this.el.find('#' + errorId);
					if (errorEl.length < 1) {
						this.el.append('<p class="errorMessage" onclick="javascript:$(this).hide();" style="display:inline" id="' + errorId + '"></p>');
						errorEl = this.el.find('#' + errorId);
					}
					errorEl.html(this.model.get("errorMessage"));
					errorEl.show();
					errorEl.css('display', 'inline');
					this.el.addClass("errorField");
					window.expanz.logToConsole("showing error : " + this.model.get("errorMessage"));
				} else {
					var errorEl = this.el.find('#' + errorId);
					if (errorEl) {
						errorEl.hide();
					}
					this.el.removeClass("errorField");
					window.expanz.logToConsole("hiding error message")
				}

			};
		},

		events : {
			"change [attribute=value]" : "viewUpdate"
		},

		viewUpdate : function() {
			var elem = this.el.find('[attribute=value]');
			// handle checkbox field case
			if ($(elem).is(":checkbox")) {
				this.model.update({
					value : $(elem).prop("checked") ? 1 : 0
				});
			} else {
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

	window.expanz.Views.GridView = Backbone.View.extend({

		initialize : function() {
			this.model.bind("update:grid", this.render, this);
			// this.model.bind("change", this.render, this);
			this.bind("rowClicked", this.rowClicked, this);
			this.bind("actionClicked", this.actionClicked, this);
		},

		rowClicked : function(row) {
			this.model.updateRowSelected(row.attr('id'), row.attr('type'));
		},

		actionClicked : function(id, methodName, methodParams) {
			this.model.actionSelected(id, methodName, methodParams);
		},

		render : function() {
			window.expanz.logToConsole("GridView rendered");
			// set table scaffold
			var tableEl = this.el.find('table#' + this.model.getAttr('id'));
			if (tableEl.length < 1) {
				this.el.append('<table id="' + this.model.getAttr('id') + '"></table>');
				tableEl = this.el.find('table#' + this.model.getAttr('id'));
			}
			$(tableEl).html('<thead><tr></tr></thead><tbody></tbody>');

			// render column header
			var el = $(tableEl).find('thead tr');
			_.each(this.model.getAllColumns(), function(cell) {
				var html = '<td';
				html += cell.get('width') ? ' width="' + cell.get('width') + '"' : '';
				html += '>' + cell.get('label') + '</td>';
				el.append(html);
			});

			if (this.model.getAttr('hasActions')) {
				el.append('<td/>');
			}

			// render rows
			var model = this.model;
			el = $(tableEl).find('tbody');
			_.each(this.model.getAllRows(), function(row) {
				var html = '<tr id="' + row.getAttr('id') + '" type="' + row.getAttr('type') + '">';
				var columnOrder = _.map(this.model.getAllColumns(), function(cell) {
					return {
						id : cell.get('id'),
						field : cell.get('field'),
						label : cell.get('label')
					};
				});
				_.each(row.getAllCells(columnOrder), function(cell) {
					html += '<td id="' + cell.get('id') + '" class="row' + row.getAttr('id') + ' column' + cell.get('id') + '">';
					if (model.getColumn(cell.get('id')) && model.getColumn(cell.get('id')).get('datatype') === 'BLOB') {
						html += '<img width="' + model.getColumn(cell.get('id')).get('width') + '" src="' + cell.get('value') + '"/>';
					} else
						if (cell.get('value')) {
							html += '<span>' + cell.get('value') + '</span>';
						}
					html += '</td>';
				}, row);

				if (this.model.getAttr('hasActions')) {
					html += '<td>';
					_.each(this.model.getActions(), function(cell) {
						var buttonId = model.getAttr('id') + "_" + row.getAttr('id') + "_" + cell.get('methodName');
						var methodParamsReplaced = new Array();
						var methodParams = cell.get('methodParams');
						_.each(methodParams, function(methodParam) {
							var name = methodParam.name;
							var value = methodParam.value;
							if (value == '@contextId') {
								value = row.getAttr('id');
							}
							methodParamsReplaced.push({
								name : name,
								value : value
							});
						});
						html += "<div style='display:inline' name='" + cell.get('methodName') + "' methodParams='" + JSON.stringify(methodParamsReplaced) + "' bind='method'> <button id='" + buttonId + "' attribute='submit'>" + cell.get('label') + "</button>";

					});
					html += '</td>';
				}
				html += '</tr>';
				el.append(html);

			}, this);

			/* handle row click event */
			var onRowClick = function(event) {
				event.data.trigger("rowClicked", $(this));
			};

			$('table#' + this.model.getAttr('id') + ' tr').click(this, onRowClick);

			/* handle button/actions click event */
			var onActionClick = function(event) {
				var rowId = $(this).closest("tr").attr('id');
				var methodName = $(this).attr('name');
				var methodParams = $(this).attr('methodParams');

				event.data.trigger("actionClicked", rowId, methodName, JSON.parse(methodParams));

			};

			$('table#' + this.model.getAttr('id') + ' tr [bind=method]').click(this, onActionClick);

			tableEl.trigger("table:rendered");

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

	window.expanz.Views.DataControlView = Backbone.View.extend({

		initialize : function(attrs) {
			Backbone.View.prototype.initialize.call(attrs);
			this.model.bind("change:xml", this.publishData, this);
		},

		itemSelected : function(itemId, type) {
			this.model.updateItemSelected(itemId, type);
		},

		publishData : function() {
			this.el.trigger("publishData", [
				this.model.get('xml'), this
			]);
		}

	});

	window.expanz.Views.PopupView = Backbone.View.extend({

		width : 'auto',

		divAttributes : '',

		initialize : function(attrs, containerjQ) {
			Backbone.View.prototype.initialize.call(attrs);
			this.create(containerjQ);
			this.renderActions();
			this.delegateEvents(this.events);

			/* find the parent popup -> it is the first parentPopup visible */
			if (window.expanz.currentPopup != undefined) {
				this.parentPopup = window.expanz.currentPopup;
				while (!$(this.parentPopup.el).is(":visible")) {
					if (this.parentPopup.parentPopup == undefined) {
						this.parentPopup = undefined;
						break;
					}
					this.parentPopup = this.parentPopup.parentPopup;
				}

			}
			window.expanz.currentPopup = this;

		},

		events : {
			"click button" : "closeClicked"
		},

		renderActions : function() {

		},

		create : function(containerjQ) {
			window.expanz.logToConsole("render popupWindow");
			var popupWindow = containerjQ.find('#' + this.id);
			if (popupWindow.length > 0) {
				popupWindow.remove();
			}

			var content = '';
			if (this.model.getAttr('text') != undefined && this.model.getAttr('text').length > 0) {
				content = this.model.getAttr('text');
			}

			containerjQ.append("<div class='popupView' id='" + this.id + "' " + this.divAttributes + " name='" + this.id + "'>" + content + "</div>");
			this.el = containerjQ.find('#' + this.id);
			this.createWindowObject();

			if (this.model.getAttr('url') != undefined && this.model.getAttr('url').length > 0) {
				var url = this.model.getAttr('url');
				var that = this;
				this.el.load(url, function() {
					that.center();
				});
			} else {
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

		closeClicked : function() {
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
		divAttributes : " bind='grid'"
	});

	window.expanz.Views.UIMessage = window.expanz.Views.PopupView.extend({

		width : '500',

		renderActions : function() {
			this.model.each(function(action) {
				if (this.el.find("[attribute=submit]").length == 0) {
					this.el.append("<br/>");
				}

				var divId = action.id;

				if (action.id == 'close') {
					divId += action.get('label').split(' ').join('');
					this.el.append('<div style="display:inline"  bind="method" name="close" id="' + divId + '">' + '<button attribute="submit">' + action.get('label') + '</button>' + '</div>');
				} else
					if (action.id !== this.model.id) {
						this.el.append('<div style="display:inline" bind="method" name="' + action.id + '" id="' + divId + '">' + '<button attribute="submit">' + action.get('label') + '</button>' + '</div>');
						var methodView = new expanz.Views.MethodView({
							el : $('div#' + action.id, this.el),
							id : action.id,
							model : action
						});
					}

				/* if response data are present we have to send it during the click event as well */
				if (action.get('response') != undefined) {
					var button = this.el.find('#' + divId + ' button');
					var that = this;
					button.click(function() {
						if ( that.model.getAttr('title') == "Order Submitted" ){
							/* reload the page to clear the cart */
							window.location.reload();
						}
						
						if (action.get('response').find("closeWindow")) {
							if (that.parentPopup != undefined) {
								that.parentPopup.close();
							}
							else{
								window.expanz.logToConsole("Cannot find parent popup");
							}
						}

					});
				}

			}, this);

		}
	});

	window.expanz.Views.ManuallyClosedPopup = window.expanz.Views.UIMessage.extend({
		width : 'auto',

		/* do not close on button click */
		closeClicked : function() {
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
				$(elem).addClass('checkbox');
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
