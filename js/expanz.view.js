$(function() {

	window.expanz = window.expanz || {};
	window.expanz.Views = {};

	window.expanz.Views.FieldView = Backbone.View.extend({

		initialize : function() {
			this.model.bind("change:label", this.modelUpdate('label'), this);
			this.model.bind("change:value", this.modelUpdate('value'), this);
			this.model.bind("change:errorMessage", this.displayError(), this);
			this.model.bind("change:loading", this.loading, this);
		},

		modelUpdate : function(attr) {
			var view = this;
			return function() {
				var elem = this.el.find('[attribute=' + attr + ']');
				updateViewElement(view, elem, this.model.attributes, attr);
				this.el.trigger('update:field');
			};
		},

		displayError : function() {
			return function() {
				var errorId = 'error' + this.model.get('id').replace(/\./g, "_");
				if (this.model.get('errorMessage') !== undefined) {
					var errorEl = this.el.find('#' + errorId);
					if (errorEl.length < 1) {
						this.el.append('<p class="errorMessage" onclick="javascript:$(this).hide();" style="display:inline" id="' + errorId + '"></p>');
						errorEl = this.el.find('#' + errorId);
					}
					errorEl.html(this.model.get("errorMessage"));
					errorEl.show();
					errorEl.css('display', 'inline');
					this.el.addClass("errorField");
					//window.expanz.logToConsole("showing error : " + this.model.get("errorMessage"));
				}
				else {
					var errorEl = this.el.find('#' + errorId);
					if (errorEl) {
						errorEl.hide();
					}
					this.el.removeClass("errorField");
					//window.expanz.logToConsole("hiding error message");
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
		},

		loading : function() {
			/* nothing special done when a field is loading at the moment */
		}

	});

	window.expanz.Views.DependantFieldView = Backbone.View.extend({

		initialize : function() {
			this.model.bind("change:value", this.toggle, this);
			this.el.hide();
		},

		toggle : function() {
			var elem = this.el.find('[attribute=value]');
			updateViewElement(this, elem, this.model.get('value'));

			if (this.model.get('value').length > 0) {
				this.el.show('slow');
			}
			else {
				this.el.hide('slow');
			}
		}

	});

	window.expanz.Views.MethodView = Backbone.View.extend({
		initialize : function() {
			this.model.bind("change:loading", this.loading, this);
		},

		events : {
			"click [attribute=submit]" : "submit"
		},

		submit : function() {
			this.model.submit();
			this.el.trigger('submit:' + this.model.get('id'));
		},

		loading : function() {
			//window.expanz.logToConsole('method loading ' + this.model.get('id'));
			if (this.model.get('loading') === true) {
				if(this.el.is(":button")){
					this.el.attr('disabled', 'disabled');
				}
				else{
					this.el.find("button").attr('disabled','disabled');
				}
				this.el.addClass('methodLoading');
			}
			else {
				this.el.removeAttr('disabled');
				this.el.removeClass('methodLoading');
			}

		}

	});

	window.expanz.Views.ContextMenuView = window.expanz.Views.MethodView.extend({
		initialize : function() {
			this.model.bind("change:data", this.modelUpdate, this);
		},

		_createMenu : function(xml, parentUL) {
			var that = this;
			var i = 0;
			xml.children("Menu").each(function() {
				var ulId = parentUL.id + "_" + i++;
				parentUL.append("<li>" + $(this).attr('name') + "<ul id='" + ulId + "'><ul></li>");
				that._createMenu($(this), parentUL.find("#" + ulId));
			});

			var j = 0;
			xml.children("MenuItem").each(function() {
				var liId = parentUL.id + "_li_" + j++;
				parentUL.append("<li id='" + liId + "' action='" + $(this).attr('action') + "'>" + $(this).attr('text') + "</li>");
				var liEL = parentUL.find("#" + liId);
				liEL.click(function() {
					that.model.menuItemSelected($(this).attr("action"));
					that.contextMenuEl.hide();
				});
			});
		},
		modelUpdate : function() {
			/* retrieve or create a div to host the context menu */
			//window.expanz.logToConsole("modelUpdated");

			if (this.contextMenuEl === undefined) {
				var contextMenuId = this.model.get('id').replace(/\./g, "_") + "_contextMenu";
				this.el.append("<div class='contextMenu' id='" + contextMenuId + "' />");
				this.contextMenuEl = this.el.find("#" + contextMenuId);
			}
			this.contextMenuEl.hide();
			this.contextMenuEl.html("");

			var data = this.model.get('data');
			if (data === undefined)
				return;

			/* position menu below button */
			var pos = this.el.find("button").position();

			var top = pos.top + this.el.find("button").outerHeight() + 2;

			this.contextMenuEl.css({
				position : "absolute",
				top : top + "px",
				left : (pos.left + 10) + "px"
			});

			/* append data to the menu */
			this.contextMenuEl.append("<ul id='" + this.contextMenuEl.id + "_ul'></ul>");
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
			//window.expanz.logToConsole("Registering current context menu");
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
			this.bind("rowDoubleClicked", this.rowDoubleClicked, this);
			this.bind("actionClicked", this.actionClicked, this);
			this.bind("menuActionClicked", this.menuActionClicked, this);
		},

		rowClicked : function(row) {
			if (row.attr('id') != this.selectedId) {
				this.selectedId = row.attr('id');
				this.model.updateRowSelected(this.selectedId, row.attr('type'));
			}
		},

		rowDoubleClicked : function(row) {
			this.model.updateRowDoubleClicked(row.attr('id'), row.attr('type'));
		},

		actionClicked : function(id, name, params, actionEl) {
			actionEl.attr('disabled', 'disabled');
			actionEl.addClass('actionLoading');
			this.model.actionSelected(id, name, params);
		},

		menuActionClicked : function(id, name, params) {
			this.model.menuActionSelected(id, name, params);
		},

		renderPagingBar : function(currentPage, itemsPerPage, hostEl) {
			var pagingBar = "";

			var nbItems = this.model.getAllRows().length;
			if (nbItems > 0) {
				var nbPages = Math.ceil(nbItems / itemsPerPage);
				if (nbPages > 1) {
					if ($(hostEl).is('table')) {
						hostEl.append("<tr class='paging'><td id='pagingBar' colspan='100%'></td></tr>");
					}
					else {
						hostEl.append("<div id='pagingBar' class='paging'></div>");
					}

					var pagingBar = hostEl.find("#pagingBar");
					for ( var i = 0; i < nbPages; i++) {
						var inputId = this.model.getAttr('id') + "BtnPage" + i;
						var disabled = "";
						if (i == currentPage)
							disabled = " disabled='disabled'";

						pagingBar.append("<input id='" + inputId + "' type='button' value='" + (i + 1) + "' " + disabled + " />");

						var that = this;
						$(pagingBar).find("#" + inputId).click(function() {
							that.renderWithPaging(this.value - 1, itemsPerPage);
						});
					}
				}

			}
		},

		renderWithPaging : function(currentPage, itemsPerPage) {
			//window.expanz.logToConsole("GridView rendered for page  " + currentPage);

			var rows = this.model.getAllRows();
			var firstItem = parseInt(currentPage * itemsPerPage);
			var lastItem = Math.min(firstItem + parseInt(itemsPerPage), rows.length);

			var hasItem = (lastItem > firstItem);

			var hostEl;
			var hostId = this.model.getAttr('id') + "_host";

			var templateName = this.options['templateName'] || this.model.getAttr('id') + "ItemTemplate";
			var wrapperElement = this.options['isHTMLTable'] == "true" ? 'table' : 'div';
			var noItemText = this.options['noItemText'] || '';

			var headerTemplate = $("#" + templateName + "Header");
			var itemTemplate = $("#" + templateName);
			/* check if an item template has been defined */
			if (itemTemplate && itemTemplate.length > 0) {

				/* create a div to host our grid if not existing yet */
				hostEl = this.el.find(wrapperElement + '#' + hostId);
				if (hostEl.length < 1) {
					this.el.append('<' + wrapperElement + ' id="' + hostId + '"></' + wrapperElement + '>');
					hostEl = this.el.find(wrapperElement + '#' + hostId);
				}
				$(hostEl).html('');

				if (!hasItem) {
					$(hostEl).html('<div class="emptyGrid">' + noItemText + '</div>');
				}
				else {

					/* header template if defined */
					if (headerTemplate && headerTemplate.length > 0) {
						$(hostEl).html(headerTemplate.html());
					}

					var compiled = _.template(itemTemplate.html());
					var i;
					for (i = firstItem; i < lastItem; i++) {
						var row = rows[i];

						var result = compiled(row.getCellsMapByField());
						var itemId = this.model.getAttr('id') + "_" + row.getAttr('id');
						result = $(result).attr('id', itemId).attr('rowId', row.getAttr('id'));

						if (i === 0)
							result = $(result).addClass('first');
						if (i == (lastItem - 1))
							result = $(result).addClass('last');
						if (i % 2 === 1)
							result = $(result).addClass('alternate');

						/* add row id to prefix id for eventual user inputs */
						$(result).find("[id*='userinput_']").each(function() {
							$(this).attr('id', row.getAttr('id') + "_" + $(this).attr('id'));
						});

						hostEl.append(result);

						/* binding method from template */
						var that = this;
						hostEl.find("#" + itemId + " [methodName] ").each(function(index, element) {
							var action = that.model.getAction($(element).attr('methodName'));
							if (action && action.length > 0) {
								$(element).click(function() {
									var rowId = $(this).closest("[rowId]").attr('rowId');
									var actionParams = action[0].get('actionParams').clone();

									that._handleActionClick($(this), rowId, action[0].get('actionName'), actionParams, $(this).closest("[rowId]"));
								});
							}
						});

						/* trigger a method call if a user field include a change attribute */
						hostEl.find("#" + itemId + "  [autoUpdate] ").change(function(elem) {
							var action = that.model.getAction($(this).attr('autoUpdate'));
							if (action && action.length > 0) {
								var rowId = $(this).closest("[rowId]").attr('rowId');
								var actionParams = action[0].get('actionParams').clone();
								that._handleActionClick($(this), rowId, action[0].get('actionName'), actionParams, $(this).closest("[rowId]"));
							}
							else {
								//window.expanz.logToConsole("autUpdate action not defined in formapping: " + $(this).attr('autoUpdate'));
							}
						});
					}
					/* binding menuAction from template */
					hostEl.find("#" + itemId + " [menuAction] ").each(function(index, element) {
						var action = that.model.getAction($(element).attr('menuAction'));
						if (action && action.length > 0) {
							$(element).click(function() {
								var rowId = $(this).closest("[rowId]").attr('rowId');
								var actionParams = action[0].get('actionParams').clone();

								that._handleMenuActionClick(rowId, action[0].get('actionName'), actionParams, $(this).closest("[rowId]"));

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
					this.el.append('<table class="grid" id="' + hostId + '"></table>');
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
					var alternate = ((i - firstItem) % 2 == 1) ? 'class="gridRowAlternate"' : 'class="gridRow"';
					var html = '<tr id="' + row.getAttr('id') + '" type="' + row.getAttr('type') + '" ' + alternate + '>';

					var values = {};
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
							var buttonId = model.getAttr('id') + "_" + row.getAttr('id') + "_" + cell.get('actionName');
							var actionParams = cell.get('actionParams');

							var userInputs = "";
							_.each(actionParams, function(actionParams) {
								var name = actionParams.name;
								var value = actionParams.value;
								var label = actionParams.label;

								if (value == '@userInput.textinput' || value == '@userInput.numericinput') {
									var format = (value == '@userInput.numericinput') ? 'numeric' : 'text';
									var bindValueFromCellId = actionParams.bindValueFromCellId;
									var inputValue = '';
									if (bindValueFromCellId) {
										inputValue = " value='" + values[bindValueFromCellId] + "' ";
									}
									userInputs += "<label for='" + row.getAttr('id') + "_userinput_" + name + "'>" + (label || name) + "</label><input class='gridUserInput' type='text' format='" + format + "' " + inputValue + " id='" + row.getAttr('id') + "_userinput_" + name + "'/>";
								}
							});
							html += "<div style='display:inline' name='" + cell.get('actionName') + "' actionParams='" + JSON.stringify(actionParams) + "' bind='" + cell.get('type') + "'> " + userInputs + " <button id='" + buttonId + "' attribute='submit'>" + cell.get('label') + "</button></div>";

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

				/* handle double row click event */
				var onRowDoubleClick = function(event) {
					event.data.trigger("rowDoubleClicked", $(this));
				};

				$('table#' + hostId + ' tr').click(this, onRowClick);
				$('table#' + hostId + ' tr').dblclick(this, onRowDoubleClick);

				var that = this;
				/* handle button/actions click event */
				var onActionClick = function(event) {
					var rowId = $(this).closest("tr").attr('id');
					var parentDiv = $(this).parent();
					var methodName = parentDiv.attr('name');
					var actionParams = JSON.parse(parentDiv.attr('actionParams'));
					that._handleActionClick($(this), rowId, methodName, actionParams, parentDiv);
				};

				$('table#' + hostId + ' tr [bind=method] > button').click(this, onActionClick);

				/* handle menuAction click event */
				var onMenuActionClick = function(event) {
					var rowId = $(this).closest("tr").attr('id');
					var parentDiv = $(this).parent();
					var menuActionName = parentDiv.attr('name');
					var actionParams = JSON.parse(parentDiv.attr('actionParams'));
					that._handleMenuActionClick(rowId, menuActionName, actionParams, parentDiv);
				};

				$('table#' + hostId + ' tr [bind=menuAction] > button').click(this, onMenuActionClick);
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

		_handleActionClick : function(actionEl, rowId, methodName, actionParams, divEl) {
			var inputValid = true;
			/* handle user input */
			_.each(actionParams, function(actionParam) {
				var name = actionParam.name;
				if (actionParam.value == '@userInput.textinput' || actionParam.value == '@userInput.numericinput') {
					var valueInput = divEl.find("#" + rowId + "_userinput_" + name);
					if (valueInput.length > 0 && valueInput.val().length > 0) {
						actionParam.value = valueInput.val();
					}
					else {
						inputValid = false;
					}
				}
				else if (actionParam.value == '@contextId') {
					actionParam.value = rowId;
				}
			});

			if (inputValid)
				this.trigger("actionClicked", rowId, methodName, actionParams, actionEl);
		},

		_handleMenuActionClick : function(rowId, menuAction, actionParams, divEl) {
			/* handle user input */
			_.each(actionParams, function(actionParam) {
				var name = actionParam.name;
				if (actionParam.value == '@contextId') {
					actionParam.value = rowId;
				}
			});

			this.trigger("menuActionClicked", rowId, menuAction, actionParams);
		}

	});

	window.expanz.Views.LoginView = Backbone.View.extend({

		initialize : function() {
		},

		events : {
			"click [type*='submit']" : "attemptLogin"
		},

		attemptLogin : function() {
			var usernameEl = this.el.find("#username input");
			var passwordEl = this.el.find("#password input");

			if (usernameEl.length === 0 || passwordEl.length === 0) {
				expanz._error("username or password field cannot be found on the page");
				return;
			}

			if (usernameEl.val().length === 0 || passwordEl.val().length === 0) {
				expanz._error("username or password are empty");
				return;
			}
			else {
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

		}

	});

	window.expanz.Views.ActivityView = Backbone.View.extend({

		initialize : function(attrs) {
			Backbone.View.prototype.initialize.call(attrs);
			if (attrs.key) {
				this.key = attrs.key;
			}
			this.collection.bind("error", this.updateError, this);
			this.collection.bind("update:loading", this.loading, this);
			this.collection.bind("update:deltaLoading", this.deltaLoading, this);
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
			var loadingId = "Loading_" + this.id.replace(/\./g, "_");
			var loadingEL = $(this.el).find("#" + loadingId);
			if (loadingEL.length === 0) {
				$(this.el).append('<div class="loading" id="' + loadingId + '"><span>Loading content, please wait.. <img src="assets/images/loading.gif" alt="loading.." /></span></div>');
				loadingEL = $(this.el).find("#" + loadingId);
			}

			var isLoading = this.collection.getAttr('loading');
			if (isLoading) {
				var off = this.el.offset();
				/* set the loading element as a mask on top of the div to avoid user doing any action */
				$(this.el).addClass('activityLoading');
				loadingEL.css("position", "absolute"); /* parent need to be relative //todo enfore it ? */
				loadingEL.css('width', '100%');
				loadingEL.css('height', '100%');
				loadingEL.css('margin', '0');
				loadingEL.css('padding', '0');
				loadingEL.css('top', '0px');
				loadingEL.css('left', '0px');
				loadingEL.css('z-index', '999');
				loadingEL.css('overflow', 'hidden');
				loadingEL.find("span").center();
				loadingEL.css('background', 'url(data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==) center');

				loadingEL.show();
			}
			else {
				$(this.el).removeClass('activityLoading');
				loadingEL.hide();
			}

		},

		deltaLoading : function() {
			var deltaLoading = this.collection.getAttr('deltaLoading');

			var initiatorID = deltaLoading.initiator.id;
			var initiatorType = deltaLoading.initiator.type;

			var initiator = this.collection.get(initiatorID);
			if (initiator) {
				//window.expanz.logToConsole("delta method loading " + deltaLoading.isLoading + " " + initiatorID);
				initiator.set({
					loading : deltaLoading.isLoading
				});
			}
			else {
				/* most probably coming from a grid/list view */
				/* in that case the button has already been set in a loading state so we just switch it back to normal when loading is finished */
				if (initiatorType == 'method' && !deltaLoading.isLoading) {
					/* can be either a element with methodName or a name */
					var actionSelector = ".actionLoading[methodName='" + initiatorID + "'], [name='" + initiatorID + "'] .actionLoading";
					var dataControlEl = this.el.find(actionSelector).first().closest("[bind='DataControl']");
					if (dataControlEl && dataControlEl.length > 0) {
						dataControlEl.find(actionSelector).removeAttr('disabled');
						dataControlEl.find(actionSelector).removeClass('actionLoading');
					}
				}
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

	window.expanz.Views.CheckboxesView = expanz.Views.DataControlView.extend({
		publishData : function() {
			/* clean elements */
			this.el.html();
			var that = this;
			/* no external component needed just have to draw the checkboxes and handle the clicks */

			_.each(this.model.getAttr('xml').find('Row'), function(row) {
				var rowId = $(row).attr('id');
				var selected = boolValue($(row).attr('selected')) === true ? ' checked="checked" ' : '';
				_.each($(row).find('Cell'), function(cell) {
					var text = $(cell).text();
					var id = that.model.id.replace(/\./g, "_") + "_" + rowId;
					that.el.append("<div><input " + selected + " id='" + id + "' value='" + rowId + "' name='checkbox' type='checkbox'></input><span>" + text + "</span></div>");

					/* handle checkboxes click */
					$(that.el).find("#" + id).click(function() {
						/* send the delta to the server */
						//window.expanz.logToConsole(that.model.id + " filtered with " + $(this).val());

						/* send negative value of id to say it has been unselected */
						var val = $(this).val();
						if (!$(this).is(":checked")) {
							val = -val;
						}
						/* send the delta to the server */
						that.model.updateItemSelected(val);
					});

				});
			});

		}

	});

	window.expanz.Views.PopupView = Backbone.View.extend({

		width : 'auto',

		cssClass : 'popupView',

		divAttributes : '',

		initialize : function(attrs, containerjQ) {
			Backbone.View.prototype.initialize.call(attrs);
			this.create(containerjQ);
			this.renderActions();
			this.delegateEvents(this.events);

			/* find the parent popup -> it is the first parentPopup visible */
			if (window.expanz.currentPopup !== undefined) {
				this.parentPopup = window.expanz.currentPopup;
				while (!$(this.parentPopup.el).is(":visible")) {
					if (this.parentPopup.parentPopup === undefined) {
						this.parentPopup = undefined;
						break;
					}
					this.parentPopup = this.parentPopup.parentPopup;
				}

			}
			window.expanz.currentPopup = this;

		},

		events : {
			"click button" : "buttonClicked"
		},

		renderActions : function() {

		},

		create : function(containerjQ) {
			//window.expanz.logToConsole("render popupWindow");
			var popupWindow = containerjQ.find('#' + this.id);
			if (popupWindow.length > 0) {
				popupWindow.remove();
			}

			var content = '';
			if (this.model.getAttr('text') !== undefined && this.model.getAttr('text').length > 0) {
				content = this.model.getAttr('text');
			}

			containerjQ.append("<div class='" + this.cssClass + "' id='" + this.id + "' " + this.divAttributes + " name='" + this.id + "'>" + content + "</div>");
			this.el = containerjQ.find('#' + this.id);
			this.createWindowObject();

			if (this.model.getAttr('url') !== undefined && this.model.getAttr('url').length > 0) {
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

		buttonClicked : function() {
			this.closeWindow();
		},

		closeWindow : function() {
			this.trigger('popupClosed');
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
		divAttributes : " bind='DataControl' renderingType='grid' ",
		cssClass : 'pickListPopup popupView'
	});

	window.expanz.Views.UIMessage = window.expanz.Views.PopupView.extend({

		width : '500px',

		cssClass : 'uiMessage popupView',

		renderActions : function() {
			this.model.each(function(action) {
				if (this.el.find("[attribute=submit]").length === 0) {
					this.el.append("<br/>");
				}

				var divId = action.id;

				if (action.id == 'close') {
					divId += action.get('label').split(' ').join('');
					this.el.append('<div style="float:left"  bind="method" name="close" id="' + divId + '">' + '<button attribute="submit">' + action.get('label') + '</button>' + '</div>');
				}
				else if (action.id !== this.model.id) {
					this.el.append('<div style="float:left" bind="method" name="' + action.id + '" id="' + divId + '">' + '<button attribute="submit">' + action.get('label') + '</button>' + '</div>');
					var methodView = new expanz.Views.MethodView({
						el : $('div#' + action.id, this.el),
						id : action.id,
						model : action
					});
				}

				/* if response data are present we have to send it during the click event as well */
				if (action.get('response') !== undefined) {
					var button = this.el.find('#' + divId + ' button');
					var that = this;

					button.click(function() {
						that.postCloseActions(that.model.getAttr('title'));

						if (action.get('response').find("closeWindow")) {
							if (that.parentPopup !== undefined) {
								that.parentPopup.close();
							}
							else {
								window.expanz.logToConsole("Cannot find parent popup");
							}
						}

					});
				}

			}, this);

		},
		postCloseActions : function(windowTitle) {
			if (windowTitle == "Order Submitted") {
				/* clear activity cookies and reload the page */
				window.expanz.Storage.clearActivityHandles();
				$("body").trigger("CheckoutFinished");
				window.location.reload();
			}
			else if (windowTitle == "Order Saved") {
				/* clear activity cookies and trigger OrderSaved event */
				window.expanz.Storage.clearActivityHandles();
				$("body").trigger("CheckoutFinished");
			}
		}
	});

	window.expanz.Views.ManuallyClosedPopup = window.expanz.Views.UIMessage.extend({
		width : 'auto',

		/* do not close on button click */
		buttonClicked : function() {
		}
	});

	// Public Functions
	window.expanz.Views.redirect = function(destinationURL) {
		window.location.href = destinationURL;
	};

	// Private Functions

	function updateViewElement(view, elem, allAttrs, attr) {
		var datatype = allAttrs['datatype'];
		if (datatype && datatype.toLowerCase() === 'blob' && attr && attr === 'value') {
			var width = allAttrs['width'];
			var imgElem = '<img src="' + window.config._URLblobs + allAttrs['value'] + '"';
			imgElem += width ? ' width="' + width + '"' : 'width="100%"';
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

		if (view.options['textTransformFunction'] && attr === 'value') {
			try {
				value = eval(view.options['textTransformFunction'])(value);
			} catch (err) {
				window.expanz.logToConsole("Value could not be transformed with function (check function exists) " + view.options['textTransformFunction']);
			}

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
			if (allAttrs["disabled"] === true) {
				$(elem).attr('disabled', 'disabled');
				$(elem).addClass('readonlyInput');
			}
			else {
				$(elem).removeAttr('disabled');
				$(elem).removeClass('readonlyInput');
			}
		}
		else {
			/* if value is empty put an unbreakable space instead */
			$(elem).html(value || '&nbsp;');
		}
		return elem;
	}

});
