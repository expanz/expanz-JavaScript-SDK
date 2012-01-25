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
				var errorId = 'error' + this.model.get('id').replace(/\./g, "_");
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
				}
				else {
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
			}
			else {
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
			}
			else {
				this.el.hide('slow');
			}
		}

	});

	window.expanz.Views.MethodView = Backbone.View.extend({

		events : {
			"click [attribute=submit]" : "submit"
		},

		submit  : function() {
			this.model.submit();
			this.el.trigger('submit:' + this.model.get('id'));
		}

	});

	window.expanz.Views.ContextMenuView = window.expanz.Views.MethodView.extend({
		initialize : function() {
			this.model.bind("change:data", this.modelUpdate, this);
		},

		_createMenu : function(xml, parentUL) {
			var that = this;
			var i = 0;
			xml.children("Menu").each(
				function() {
					var ulId = parentUL.id + "_" + i++;
					parentUL
					.append("<li>" + $(this).attr('name') + "<ul id='" + ulId + "'><ul></li>");
					that._createMenu($(this), parentUL.find("#" + ulId));
				});

			var j = 0;
			xml.children("MenuItem").each(
				function() {
					var liId = parentUL.id + "_li_" + j++;
					parentUL
					.append("<li id='"+liId+"' action='" + $(this).attr('action') + "'>" + $(this).attr('text') + "</li>");
					var liEL =parentUL.find("#" + liId);
					liEL.click(function(){
						console.log($(this).attr("action"));
						that.model.menuItemSelected($(this).attr("action"));
						that.contextMenuEl.hide();
					})
				});
		},

		modelUpdate : function() {
			/* retrieve or create a div to host the context menu */
			window.expanz.logToConsole("modelUpdated");

			if (this.contextMenuEl == null) {
				var contextMenuId = this.model.get('id').replace(/\./g, "_") + "_contextMenu";
				this.el
				.append("<div class='contextMenu' id='" + contextMenuId + "' />");
				this.contextMenuEl = this.el.find("#" + contextMenuId);
			}
			this.contextMenuEl.hide();
			this.contextMenuEl.html("");

			var data = this.model.get('data');
			if (data == null) return;

			/* position menu below button */
			var pos = this.el.find("button").position();
			this.contextMenuEl.css(
				{position:"absolute",
					top:(pos.top + this.el.find("button").outerHeight() + 2 )+"px",
					left:(pos.left + 10 )+"px"
				});	

			/* append data to the menu */
			this.contextMenuEl.append("<ul id='" + this.contextMenuEl.id + "_ul'></ul>")
			this._createMenu(data, this.contextMenuEl.find("ul"));
			this.createContextMenu();

			/* hide if clicked outside */
			var that = this;

			this.mouseInside = true;
			this.contextMenuEl.hover(function() {
				that.mouseInside = true;
			}, function() {
				that.mouseInside = false;
			});

			$("body").bind('mouseup.' + that.contextMenuEl.id, function() {
				if (!that.mouseInside) {
					that.contextMenuEl.hide();
					$("body").unbind('mouseup.' + that.contextMenuEl.id);
				}
			});
		},
		
		submit : function() {
			/* register current context menu */
			window.expanz.logToConsole("Registering current context menu");
			window.expanz.currentContextMenu = this.model;
			this.model.submit();
			this.el.trigger('submit:' + this.model.get('id'));
		},

		/* must be overidden if a custom context menu is wanted */
		createContextMenu : function() {
			this.contextMenuEl.show();
		}
	});
	
	window.expanz.Views.GridView = Backbone.View.extend({

		initialize : function() {
			this.model.bind("update:grid", this.render, this);
			this.bind("rowClicked", this.rowClicked, this);
			this.bind("actionClicked", this.actionClicked, this);
		},

		rowClicked : function(row) {
			if (row.attr('id') != this.selectedId) {
				this.selectedId = row.attr('id');
				this.model.updateRowSelected(this.selectedId, row.attr('type'));
			}
		},

		actionClicked : function(id, methodName, methodParams) {
			this.model.actionSelected(id, methodName, methodParams);
		},

		renderPagingBar : function(currentPage, itemsPerPage, hostEl) {
			var pagingBar = "";

			var nbItems = this.model.getAllRows().length;
			if (nbItems > 0) {
				var nbPages = Math.ceil(nbItems / itemsPerPage);
				if (nbPages > 1) {
					hostEl.append("<div style='clear:both'>");
					for ( var i = 0; i < nbPages; i++) {
						var inputId = this.model.getAttr('id') + "BtnPage" + i;
						var disabled = ""
						if (i == currentPage)
							disabled = " disabled='disabled'";

						hostEl.append("<input id='" + inputId + "' type='button' value='" + (i + 1) + "' " + disabled + " />");

						var that = this;
						$(hostEl).find("#" + inputId).click(function() {
							that.renderWithPaging(this.value - 1, itemsPerPage);
						});
					}
					hostEl.append("</div>");
				}

			}
		},

		renderWithPaging : function(currentPage, itemsPerPage) {
			window.expanz.logToConsole("GridView rendered for page  " + currentPage);

			var rows = this.model.getAllRows();

			var firstItem = parseInt(currentPage * itemsPerPage);
			var lastItem = Math.min(firstItem + parseInt(itemsPerPage), rows.length);

			var hostEl;
			var hostId = this.model.getAttr('id') + "_host";

			var itemTemplate = $("#" + this.model.getAttr('id') + "ItemTemplate");
			/* check if an item template has been defined */
			if (itemTemplate && itemTemplate.length > 0) {

				/* create a div to host our grid if not existing yet */
				hostEl = this.el.find('div#' + hostId);
				if (hostEl.length < 1) {
					this.el.append('<div id="' + hostId + '"></div>');
					hostEl = this.el.find('div#' + hostId);
				}
				$(hostEl).html('');

				var compiled = _.template(itemTemplate.html());
				var i;
				for (i = firstItem; i < lastItem; i++) {
					var row = rows[i];

					var result = compiled(row.getCellsMapByField());
					var itemId = this.model.getAttr('id') + "_" + row.getAttr('id');
					result = $(result).attr('id', itemId).attr('rowId', row.getAttr('id'));

					if (i == 0)
						result = $(result).addClass('first');
					if (i == (lastItem - 1))
						result = $(result).addClass('last');

					/* add row id to prefix id for eventual user inputs */
					$(result).find("[id*='userinput_']").each(function() {
						$(this).attr('id', row.getAttr('id') + "_" + $(this).attr('id'));
					})

					hostEl.append(result);

					var that = this;
					hostEl.find("#" + itemId + " [methodName]").each(function(index, element) {
						var action = that.model.getAction($(element).attr('methodName'));
						if (action && action.length > 0) {
							$(element).click(function() {
								var rowId = $(this).closest("[rowId]").attr('rowId');
								var methodParams = action[0].get('methodParams').clone();

								that._handleActionClick(rowId, action[0].get('methodName'), methodParams, $(this).closest("[rowId]"));
							});
						}
					});
				}

			}
			/* else normal table display */
			else {

				// set table scaffold
				hostEl = this.el.find('table#' + hostId);
				if (hostEl.length < 1) {
					this.el.append('<table id="' + hostId + '"></table>');
					hostEl = this.el.find('table#' + hostId);
				}
				$(hostEl).html('<thead><tr></tr></thead><tbody></tbody>');

				// render column header
				var el = $(hostEl).find('thead tr');
				_.each(this.model.getAllColumns(), function(cell) {
					var html = '<th ';
					// html += cell.get('width') ? ' width="' + cell.get('width') + '"' : '';
					html += '>' + cell.get('label') + '</th>';
					el.append(html);
				});

				if (this.model.getAttr('hasActions')) {
					el.append('<th>actions</th>');
				}

				// render rows
				var model = this.model;
				el = $(hostEl).find('tbody');
				var i;
				for (i = firstItem; i < lastItem; i++) {
					var row = rows[i];
					var html = '<tr id="' + row.getAttr('id') + '" type="' + row.getAttr('type') + '">';

					var values = new Object();
					_.each(row.getAllCells(), function(cell) {
						html += '<td id="' + cell.get('id') + '" field="' + cell.get('field') + '" class="row' + row.getAttr('id') + ' column' + cell.get('id') + '">';
						if (model.getColumn(cell.get('id')) && model.getColumn(cell.get('id')).get('datatype') === 'BLOB') {
							html += '<img width="' + model.getColumn(cell.get('id')).get('width') + '" src="' + cell.get('value') + '"/>';
						}
						else if (cell.get('value')) {
							html += '<span>' + cell.get('value') + '</span>';
							values[cell.get('id')] = cell.get('value');
						}
						html += '</td>';
					}, row);

					if (this.model.getAttr('hasActions')) {
						html += '<td>';
						_.each(this.model.getActions(), function(cell) {
							var buttonId = model.getAttr('id') + "_" + row.getAttr('id') + "_" + cell.get('methodName');
							// var methodParamsReplaced = new Array();
							var methodParams = cell.get('methodParams');

							var userInputs = "";
							_.each(methodParams, function(methodParam) {
								var name = methodParam.name;
								var value = methodParam.value;
								var label = methodParam.label;

								if (value == '@userInput.textinput' || value == '@userInput.numericinput') {
									var format = (value == '@userInput.numericinput') ? 'numeric' : 'text';
									var bindValueFromCellId = methodParam.bindValueFromCellId;
									var inputValue = '';
									if (bindValueFromCellId) {
										inputValue = " value='" + values[bindValueFromCellId] + "' ";
									}
									userInputs += "<label for='" + row.getAttr('id') + "_userinput_" + name + "'>" + (label || name) + "</label><input class='gridUserInput' type='text' format='" + format + "' " + inputValue + " id='" + row.getAttr('id') + "_userinput_" + name + "'/>";
								}
							});
							html += "<div style='display:inline' name='" + cell.get('methodName') + "' methodParams='" + JSON.stringify(methodParams) + "' bind='method'> " + userInputs + " <button id='" + buttonId + "' attribute='submit'>" + cell.get('label') + "</button>";

						});
						html += '</td>';
					}
					html += '</tr>';
					el.append(html);
				}

				/* handle row click event */
				var onRowClick = function(event) {
					event.data.trigger("rowClicked", $(this));
				};

				$('table#' + hostId + ' tr').click(this, onRowClick);

				var that = this;
				/* handle button/actions click event */
				var onActionClick = function(event) {
					var rowId = $(this).closest("tr").attr('id');
					var parentDiv = $(this).parent();
					var methodName = parentDiv.attr('name');
					var methodParams = JSON.parse(parentDiv.attr('methodParams'));
					that._handleActionClick(rowId, methodName, methodParams, parentDiv);
				};

				$('table#' + hostId + ' tr [bind=method] > button').click(this, onActionClick);
			}

			this.renderPagingBar(currentPage, itemsPerPage, hostEl);

			$(hostEl).attr('nbItems', rows.length);
			hostEl.trigger("table:rendered");

			return this;
		},

		render : function() {

			var itemsPerPage = this.options['itemsPerPage'];
			if (!itemsPerPage) {
				itemsPerPage = 1000;
			}

			this.renderWithPaging(0, itemsPerPage);
			return this;
		},

		_handleActionClick : function(rowId, methodName, methodParams, divEl) {
			var inputValid = true;
			/* handle user input */
			_.each(methodParams, function(methodParam) {
				var name = methodParam.name;
				if (methodParam.value == '@userInput.textinput' || methodParam.value == '@userInput.numericinput') {
					var valueInput = divEl.find("#" + rowId + "_userinput_" + name);
					if (valueInput.length > 0 && valueInput.val().length > 0) {
						methodParam.value = valueInput.val();
					}
					else {
						inputValid = false;
					}
				}
				else if (methodParam.value == '@contextId') {
					methodParam.value = rowId;
				}
			});

			if (inputValid)
				this.trigger("actionClicked", rowId, methodName, methodParams);
		}

	});

	window.expanz.Views.LoginView = Backbone.View.extend({

		initialize : function() {
		},

		events : {
			"click button" : "attemptLogin",
		},

		attemptLogin : function() {
			var usernameEl = this.el.find("#username input");
			var passwordEl = this.el.find("#password input");
			
			if(usernameEl.length == 0 || passwordEl.length == 0 ){
				expanz._error("username or password field cannot be found on the page");
			}
			else{
				this.collection.add({
					id : "username",
					value : usernameEl.val()
				});
				this.collection.add({
					id : "password", 
					value : passwordEl.val() 
				});
				this.collection.login();
			}
			
		},


	});	
	
	window.expanz.Views.ActivityView = Backbone.View.extend({

		initialize : function(attrs) {
			Backbone.View.prototype.initialize.call(attrs);
			if (attrs.key) {
				this.key = attrs.key;
			}
			this.collection.bind("error", this.updateError, this);
			this.collection.bind("update:loading", this.loading, this);
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
		},

		loading : function() {
			var loadingId = "Loading_" + this.id.replace(/\./g,"_"); 
			var loadingEL = $(this.el).find("#" + loadingId);
			if( loadingEL.length == 0 ){
				$(this.el).append('<div class="loading" id="'+loadingId+'"><span>Loading content, please wait.. <img src="assets/images/loading.gif" alt="loading.." /></span></div>');  
				loadingEL = $(this.el).find("#" + loadingId);
			}
			
			var isLoading = this.collection.getAttr('loading');
			if (isLoading) {
				var off = this.el.offset();
				/* set the loading element as a mask on top of the div to avoid user doing any action */
				$(this.el).addClass('activityLoading');
				loadingEL.css("position","absolute"); /* parent need to be relative //todo enfore it ? */
				loadingEL.css('width','100%');
				loadingEL.css('height','100%');
				loadingEL.css('top', '0px');
				loadingEL.css('left','0px');
				loadingEL.css('z-index', '999');
				loadingEL.find("span").center();
				loadingEL.css('background', 'url(data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==) center');
				
				loadingEL.show();
			}
			else{
				$(this.el).removeClass('activityLoading');
				loadingEL.hide();
			}
				
		}

	});

	window.expanz.Views.DataControlView = Backbone.View.extend({

		initialize : function(attrs) {
			Backbone.View.prototype.initialize.call(attrs);
			this.model.bind("update:xml", this.publishData, this);
		},

		itemSelected : function(itemId, callbacks) {
			this.model.updateItemSelected(itemId, callbacks);
		},

		publishData : function() {
			this.el.trigger("publishData", [
				this.model.getAttr('xml'), this
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
					that.trigger('contentLoaded');
				});
			}
			else {
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
		divAttributes : " bind='DataControl' renderingType='grid' "
	});

	window.expanz.Views.UIMessage = window.expanz.Views.PopupView.extend({

		width : '500px',

		renderActions : function() {
			this.model.each(function(action) {
				if (this.el.find("[attribute=submit]").length == 0) {
					this.el.append("<br/>");
				}

				var divId = action.id;

				if (action.id == 'close') {
					divId += action.get('label').split(' ').join('');
					this.el.append('<div style="display:inline"  bind="method" name="close" id="' + divId + '">' + '<button attribute="submit">' + action.get('label') + '</button>' + '</div>');
				}
				else if (action.id !== this.model.id) {
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
						if (that.model.getAttr('title') == "Order Submitted") {
							/* clear activity cookies and reload the page */
							window.expanz.Storage.clearActivityHandles();
							window.location.reload();
						}

						if (action.get('response').find("closeWindow")) {
							if (that.parentPopup != undefined) {
								that.parentPopup.close();
							}
							else {
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
		}
		else {
			value = allAttrs[attr];
		}

		if ($(elem).is('input')) {
			// special behaviour for checkbox input
			if ($(elem).is(":checkbox")) {
				$(elem).addClass('checkbox');
				if (value == 1) {
					$(elem).prop("checked", true);
				}
				else {
					$(elem).prop("checked", false);
				}
			}
			else {
				$(elem).val(value);
			}
			$(elem).trigger("valueUpdated", value);

			// if the field is disable apply the disabled attribute and style
			if (allAttrs["disabled"] == true) {
				$(elem).attr('disabled', 'disabled');
				$(elem).addClass('readonlyInput');
			}
			else {
				$(elem).removeAttr('disabled');
				$(elem).removeClass('readonlyInput');
			}
		}
		else {
			$(elem).html(value);
		}
		return elem;
	}
	;

});
