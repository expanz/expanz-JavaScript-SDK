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
				if (this.model.get('errorMessage') != undefined) {
					var errorEl = this.el.find('#error' + this.model.get('id'));
					if (errorEl.length < 1) {
						this.el.append('<p class="errorMessage" onclick="javascript:$(this).hide();" style="display:inline" id="error' + this.model.get('id') + '"></p>');
						errorEl = this.el.find('#error' + this.model.get('id'));
					}
					errorEl.html(this.model.get("errorMessage"));
					errorEl.show();
					errorEl.css('display', 'inline');
					this.el.addClass("errorField");
					console.log("showing error : " + this.model.get("errorMessage"));
				} else {
					var errorEl = this.el.find('#error' + this.model.get('id'));
					if (errorEl) {
						errorEl.hide();
					}
					this.el.removeClass("errorField");
					console.log("hiding error message")
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

		actionClicked : function(id, methodName, attributeId) {
			this.model.actionSelected(id, methodName, attributeId);
		},

		render : function() {
			console.log("GridView rendered");
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
						html += "<div style='display:inline' name='" + cell.get('methodName') + "' bind='method' attributeId='"+cell.get('attributeId')+"'> <button id='" + buttonId + "' attribute='submit'>" + cell.get('label') + "</button>";

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
				var attributeId = $(this).attr('attributeId');

				event.data.trigger("actionClicked", rowId, methodName, attributeId);

			};

			$('table#' + this.model.getAttr('id') + ' tr [bind=method]').click(this, onActionClick);

			return this;
		}
	});
	
	 window.expanz.Views.ClientMessage = Backbone.View.extend({

	      initialize: function( attrs, containerjQ){
	         Backbone.View.prototype.initialize.call(attrs);
	         this.create( containerjQ);
	         this.delegateEvents( this.events);
	      },

	      events: {
	         "click button":   "close"
	      },

	      create: function( containerjQ){
	         containerjQ.append( '<div id="ExpanzClientMessage"></div>' );
	         this.el = $('div#ExpanzClientMessage', containerjQ);
	         
	         this.el.append('<div id="title">'+ this.model.getAttr('title') +'</div>');
	         this.el.append( '<div id="text">'+ this.model.getAttr('text') +'</div>' );

	         this.model.each( function( action){
	               if( action.id == 'close'){
	                  this.el.append( '<div bind="method" name="close" id="close">' +
	                                       '<button attribute="submit">' + action.get('label') + '</button>' +
	                                    '</div>' );
	               } else if ( action.id !== this.model.id) {
	                  this.el.append( '<div bind="method" name="'+ action.id +'" id="'+ action.id +'">' +
	                                       '<button attribute="submit">' + action.get('label') + '</button>' +
	                                    '</div>' );
	                  var methodView = new expanz.Views.MethodView({
	                                    el: $('div#'+action.id, this.el),
	                                    id: action.id,
	                                    model: action
	                                    });
	               }
	         }, this);
	      },

	      close: function(){
	         this.remove();
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

	window.expanz.Views.PopupView = Backbone.View.extend({

		title : 'New window',

		content : '',

		windowId : 'newWindowId',

		divAttributes : '',

		initialize : function(attrs) {
			Backbone.View.prototype.initialize.call(attrs);
			if (this.options.title)
				this.title = this.options.title;
			if (this.options.windowId)
				this.windowId = this.options.windowId;
			if (this.options.content)
				this.content = this.options.content;
		},

		windowEl : null,

		events : {
			"window:close" : "close",
			"window:display" : "display"
		},

		render : function() {
			console.log("render popupWindow");
			var popupWindow = this.el.find('#' + this.windowId);
			if (popupWindow.length < 1) {
				this.el.append("<div class='popupView' id='" + this.windowId + "' " + this.divAttributes + " name='" + this.windowId + "'>" + this.content + "</div>");
				this.windowEl = this.el.find('#' + this.windowId);
				this.createWindowObject();
			} else {
				popupWindow.html(this.content);
				this.windowEl = popupWindow;
			}

		},

		/* must be overriden depending on the pluggin used */
		createWindowObject : function() {
			this.windowEl.kendoWindow({
				visible : false,
				title : this.title,
				modal : true,

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

	window.expanz.Views.PicklistWindowView = window.expanz.Views.PopupView.extend({
		divAttributes : " bind='grid' "
	});

	window.expanz.Views.UIMessage = window.expanz.Views.PopupView.extend({
		addAction : function(methodName, label) {
			if (this.windowEl.find("[attribute=submit]").length == 0) {
				this.windowEl.append("<br/>");
			}

			var bind = '';
			if (methodName && methodName != '') {
				bind = "bind='method'";
			}
			this.windowEl.append("<div style='display:inline' name='" + methodName + "' " + bind + "> <button style='margin-top:10px' attribute='submit'>" + label + "</button>");

			/* add a close listenner on the button */
			var that = this;
			this.windowEl.find("button").last().bind("click", function() {
				that.close();
			});
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
