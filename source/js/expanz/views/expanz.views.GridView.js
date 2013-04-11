////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

    window.expanz = window.expanz || {};
    window.expanz.views = window.expanz.views || {};

    window.expanz.views.GridView = Backbone.View.extend({

        initialize: function () {
            this.model.bind("update:grid", this.publishData, this);
            this.bind("rowClicked", this.rowClicked, this);
            this.bind("rowDoubleClicked", this.rowDoubleClicked, this);
            this.bind("actionClicked", this.actionClicked, this);
            this.bind("menuActionClicked", this.menuActionClicked, this);
            this.bind("contextMenuClicked", this.contextMenuClicked, this);
            this.bind("drillDown", this.drillDown, this);
        },

        rowClicked: function (row) {
            if (row.attr('id') != this.selectedId) {
                this.selectedId = row.attr('id');
                this.model.updateRowSelected(this.selectedId, row.attr('type'));
            }
        },

        rowDoubleClicked: function (row) {
            this.model.updateRowDoubleClicked(row.attr('id'), row.attr('type'));
        },

        actionClicked: function (id, name, params, actionEl) {
            actionEl.attr('disabled', 'disabled');
            actionEl.addClass('actionLoading');
            this.model.actionSelected(id, name, params);
        },

        menuActionClicked: function (id, name, params) {
            this.model.menuActionSelected(id, name, params);
        },

        contextMenuClicked: function (id, contextMenuType, contextObject, params) {
            this.model.contextMenuSelected(id, contextMenuType, contextObject, params);
        },

        drillDown: function (row) {
            this.model.drillDown(row.attr('id'), row.attr('type'), null);
        },

        publishData: function () {
            this.$el.trigger("publishData", [
				this.model, this
            ]);

            this.render();
        },

        render: function () {
            var itemsPerPage = this.options['itemsPerPage'];

            if (!itemsPerPage || itemsPerPage <= 0) {
                itemsPerPage = 1000;
            }

            this.renderWithPaging(0, itemsPerPage);

            return this;
        },

        renderWithPaging: function (currentPage, itemsPerPage, currentSortField, currentSortAsc) {
            var rows = this.model.getAllRows();
            var firstItemIndex = parseInt(currentPage * itemsPerPage, 10);
            var lastItemIndex = Math.min(firstItemIndex + parseInt(itemsPerPage, 10), rows.length);

            var hostEl;
            var hostId = this.model.id + "_host";
            
            // Check if an item template has been defined, and use it if so
            if (this.itemTemplate() !== null) {
                hostEl = this.renderGridUsingItemTemplate(hostId, rows, currentPage, firstItemIndex, lastItemIndex, currentSortField, currentSortAsc);
            }
            else {
                hostEl = this.renderGridUsingDefaultLayout(hostId, rows, firstItemIndex, lastItemIndex);
            }

            this.renderPagingBar(currentPage, itemsPerPage, hostEl, currentSortField, currentSortAsc);

            $(hostEl).attr('nbItems', rows.length);

            if (this.model.renderingType == 'popupGrid') {
                this.renderAsPopupGrid(hostId, hostEl);
            }
            else if (this.model.renderingType == 'rotatingBar') {
                this.renderAsRotationBar(hostEl, 3, 3, 0);
            }

            hostEl.trigger("table:rendered");

            return this;
        },
        
        renderGridUsingItemTemplate: function (hostId, rows, currentPage, firstItemIndex, lastItemIndex, currentSortField, currentSortAsc) {
            var hasItem = (lastItemIndex > firstItemIndex);
            var wrapperElement = this.options['isHTMLTable'] == "true" ? 'table' : 'div';
            var enableConfiguration = this.options['enableConfiguration'] ? boolValue(this.options['enableConfiguration']) : false;
            var noItemText = this.options['noItemText'] || '';
            var nbItemsPerPageText = this.options['nbItemsPerPageText'] || 'Items per page';

            /* create a div to host our grid if not existing yet */
            var hostEl = this.$el.find(wrapperElement + '#' + hostId);

            if (hostEl.length < 1) {
                this.$el.append('<' + wrapperElement + ' id="' + hostId + '"></' + wrapperElement + '>');
                hostEl = this.$el.find(wrapperElement + '#' + hostId);
            }

            $(hostEl).html('');
            $(hostEl).parent().find("#" + hostId + "_Configuration").remove();

            if (!hasItem) {
                $(hostEl).addClass("emptyGrid");
                $(hostEl).removeClass("nonEmptyGrid");
                $(hostEl).append('<div id="noItemText" class="emptyListText">' + noItemText + '</div>');
            }
            else {
                $(hostEl).addClass("nonEmptyGrid");
                $(hostEl).removeClass("emptyGrid");

                var that;
                /* datagrid/list configuration (nb items per page, sorting as combo box) */
                if (enableConfiguration) {
                    $(hostEl).parent().prepend('<div id="' + hostId + '_Configuration"></div>');
                    var $confEl = $(hostEl).parent().find("#" + hostId + "_Configuration");

                    var itemsPerPageChoices = [
                        10, 20, 50, 100
                    ];
                    
                    $confEl.append('<div class="ItemsPerPage" >' + nbItemsPerPageText + '<select id="' + hostId + '_Configuration_ItemsPerPage" name="ItemsPerPage">');
                    var selectEl = $confEl.find("#" + hostId + "_Configuration_ItemsPerPage");
                    for (var i = 0; i < itemsPerPageChoices.length; i++) {
                        var defString = itemsPerPage == itemsPerPageChoices[i] ? ' selected="selected" ' : '';
                        selectEl.append('<option ' + defString + ' value="' + itemsPerPageChoices[i] + '">' + itemsPerPageChoices[i] + '</option>');
                    }
                    selectEl.append('</select></div>');

                    that = this;
                    selectEl.change(function () {
                        that.renderWithPaging(currentPage, $(this).val(), currentSortField, !currentSortAsc);
                    });
                }

                /* header template if defined */
                if (this.headerTemplate() != null) {
                    that = this;
                    $(hostEl).append(this.headerTemplate().html());
                    
                    $(hostEl).find("[sortField]").each(function () {
                        var fieldName = $(this).attr('sortField');

                        var defaultSorted = $(this).attr('defaultSorted');
                        if (currentSortField === null && defaultSorted !== null) {
                            currentSortAsc = defaultSorted.toLowerCase() == 'desc' ? false : true;
                            currentSortField = fieldName;
                            that.model.sortRows(currentSortField, currentSortAsc);
                            rows = that.model.getAllRows();
                        }

                        $(this).addClass("sortable");
                        if (fieldName == currentSortField) {
                            if (currentSortAsc) {
                                $(this).addClass("sortedAsc");
                            }
                            else {
                                $(this).addClass("sortedDesc");
                            }
                        }

                        $(this).click(function () {

                            var sortAsc = true;
                            if (fieldName == currentSortField) {
                                sortAsc = !currentSortAsc;
                            }
                            /* sort and display again */
                            that.model.sortRows(fieldName, sortAsc);
                            that.renderWithPaging(0, itemsPerPage, fieldName, sortAsc);
                        });
                    });

                }

                /* create a wrapper for rows if not a table */
                var gridItems = $(hostEl);
                if (this.options['isHTMLTable'] != "true") {
                    $(hostEl).append("<div class='gridItems'></div>");
                    gridItems = $(hostEl).find(".gridItems");
                }

                var compiled = _.template(this.itemTemplate().html());
                var i;
                for (i = firstItemIndex; i < lastItemIndex; i++) {
                    var row = rows[i];
                    var result = compiled(row.getCellsMapByField());
                    var itemId = this.model.id + "_" + row.id;
                    result = $(result).attr('id', itemId).attr('rowId', row.id);

                    if (i === 0)
                        result = $(result).addClass('first');
                    if (i == (lastItemIndex - 1))
                        result = $(result).addClass('last');
                    if (i % 2 === 1) {
                        result = $(result).addClass('alternate');
                        result = $(result).addClass('even');
                    }
                    else {
                        result = $(result).addClass('odd');
                    }

                    /* add row id to prefix id for eventual user inputs */
                    $(result).find("[id*='userinput_']").each(function () {
                        $(this).attr('id', row.id + "_" + $(this).attr('id'));
                    });

                    gridItems.append(result);

                    /* binding method from template */
                    var that = this;
                    gridItems.find("#" + itemId + " [methodName] ").each(function (index, element) {
                        var action = that.model.getAction($(element).attr('methodName'));
                        if (action && action.length > 0) {
                            $(element).click(function () {
                                var rowId = $(this).closest("[rowId]").attr('rowId');
                                var actionParams = action[0].get('actionParams').clone();

                                that._handleActionClick($(this), rowId, action[0].get('actionName'), actionParams, $(this).closest("[rowId]"));
                            });
                        }
                    });

                    /* trigger a method call if a user field include a change attribute */
                    gridItems.find("#" + itemId + "  [autoUpdate] ").change(function (elem) {
                        var action = that.model.getAction($(this).attr('autoUpdate'));
                        if (action && action.length > 0) {
                            var rowId = $(this).closest("[rowId]").attr('rowId');
                            var actionParams = action[0].get('actionParams').clone();
                            that._handleActionClick($(this), rowId, action[0].get('actionName'), actionParams, $(this).closest("[rowId]"));
                        }
                        else {
                            window.expanz.logToConsole("autUpdate action not defined in formapping: " + $(this).attr('autoUpdate'));
                        }
                    });

                    /* binding menuAction from template */
                    hostEl.find("#" + itemId + " [menuAction] ").each(function (index, element) {
                        var action = that.model.getAction($(element).attr('menuAction'));
                        if (action && action.length > 0) {
                            $(element).click(function () {
                                var rowId = $(this).closest("[rowId]").attr('rowId');
                                var actionParams = action[0].get('actionParams').clone();

                                that._handleMenuActionClick(rowId, action[0].get('actionName'), actionParams, $(this).closest("[rowId]"));

                            });
                        }
                    });

                    /* binding contextMenu from template */
                    hostEl.find("#" + itemId + " [contextMenu] ").each(function (index, element) {
                        var action = that.model.getAction($(element).attr('contextMenu'));
                        if (action && action.length > 0) {
                            $(element).click(function () {
                                var rowId = $(this).closest("[rowId]").attr('rowId');
                                var actionParams = action[0].get('actionParams').clone();

                                var method;
                                method = new expanz.models.ContextMenu({
                                    id: rowId,
                                    contextObject: action[0].get('actionName'),
                                    parent: that.model.parent
                                });

                                var ctxMenuview = new expanz.views.ContextMenuView({
                                    el: $(this),
                                    id: $(this).attr('id'),
                                    className: $(this).attr('class'),
                                    collection: method
                                });

                                window.expanz.currentContextMenu = ctxMenuview.collection;

                                that._handleContextMenuClick(rowId, action[0].get('actionName'), actionParams, $(this).closest("[rowId]"));

                            });
                        }
                    });
                }
            }

            return hostEl;
        },
        
        renderGridUsingDefaultLayout: function (hostId, rows, firstItemIndex, lastItemIndex) {
            // set table scaffold
            var $hostEl = this.$el.find('table#' + hostId);
            
            if ($hostEl.length < 1) {
                this.$el.append('<table class="grid" id="' + hostId + '"></table>');
                $hostEl = this.$el.find('table#' + hostId);
            }

            this.renderHeaderUsingDefaultTemplate($hostEl);
            this.renderRowsUsingDefaultTemplate($hostEl, rows, firstItemIndex, lastItemIndex);

            /* handle row click event */
            var onRowClick = function (event) {
                event.data.trigger("rowClicked", $(this));
            };

            /* handle double row click event */
            var onRowDoubleClick = function (event) {
                event.data.trigger("rowDoubleClicked", $(this));
            };

            $('table#' + hostId + ' tr').click(this, onRowClick);
            $('table#' + hostId + ' tr').dblclick(this, onRowDoubleClick);

            var that = this;
            /* handle button/actions click event */
            var onActionClick = function (event) {
                var rowId = $(this).closest("tr").attr('id');
                var parentDiv = $(this).parent();
                var methodName = parentDiv.attr('name');
                var actionParams = JSON.parse(parentDiv.attr('actionParams'));
                that._handleActionClick($(this), rowId, methodName, actionParams, parentDiv);
            };

            $('table#' + hostId + ' tr [bind=method] > button').click(this, onActionClick);

            /* handle drilldown hyperlink click event */
            var onDrillDownClick = function (event) {
                var row = $(this).closest("tr");
                event.data.trigger("drillDown", row);
            };
            
            $('table#' + hostId + ' tr a').click(this, onDrillDownClick);

            /* handle menuAction click event */
            var onMenuActionClick = function (event) {
                var rowId = $(this).closest("tr").attr('id');
                var parentDiv = $(this).parent();
                var menuActionName = parentDiv.attr('name');
                var actionParams = JSON.parse(parentDiv.attr('actionParams'));
                that._handleMenuActionClick(rowId, menuActionName, actionParams, parentDiv);
            };

            $('table#' + hostId + ' tr [bind=menuAction] > button').click(this, onMenuActionClick);

            /* handle contextMenu click event */
            var onContextMenuClick = function (event) {
                var rowId = $(this).closest("tr").attr('id');
                var parentDiv = $(this).parent();
                var contextMenuName = parentDiv.attr('name');
                var actionParams = JSON.parse(parentDiv.attr('actionParams'));
                that._handleContextMenuClick(rowId, contextMenuName, actionParams, parentDiv);
            };

            $('table#' + hostId + ' tr [bind=contextMenu] > button').click(this, onContextMenuClick);

            return $hostEl;
        },
        
        renderHeaderUsingDefaultTemplate: function($hostEl) {
            $hostEl.html('<thead><tr class="item"></tr></thead>');

            // render column header
            var el = $hostEl.find('thead tr');
            
            _.each(this.model.getAllColumns(), function (cell) {
                var html = '<th ';
                // html += cell.get('width') ? ' width="' + cell.get('width') + '"' : '';
                html += '>' + cell.get('label') + '</th>';
                el.append(html);
            });

            if (this.model.hasActions) {
                el.append('<th>actions</th>');
            }
        },
        
        renderRowsUsingDefaultTemplate: function ($hostEl, rows, firstItemIndex, lastItemIndex) {
            // render rows
            $hostEl.append('<tbody></tbody>');

            el = $hostEl.find('tbody');
            var i;

            for (i = firstItemIndex; i < lastItemIndex; i++) {
                var row = rows[i];
                var className = ((i - firstItemIndex) % 2 == 1) ? 'gridRowAlternate' : 'gridRow';

                if (row.get("displayStyle"))
                    className += " grid-" + row.get("displayStyle");

                var html = '<tr id="' + row.id + '" type="' + row.get("type") + '" class="' + className + '">';
                html += this.renderRowCellsUsingDefaultTemplate(row);
                html += '</tr>';
                el.append(html);
            }
        },

        renderRowCellsUsingDefaultTemplate: function (row) {
            var html;
            var values = {};
            var model = this.model;
            var isDrillDownRow = this.$el.attr('candrilldown') == "true" && (row.get("type") !== "Totals" && row.get("type") !== "BlankLine"); // Only show drilldown link if configured to do so, and only on non-totals and non-blank rows
            var drillDownLinkCreated = !isDrillDownRow;
            
            _.each(row.getAllCells(), function (cell) {
				var className = 'row' + row.id + ' column' + cell.get('id');
                if (cell.get("displayStyle"))
                    className += " grid-" + cell.get("displayStyle");
                html += '<td id="' + cell.get('id') + '" field="' + cell.get('field') + '" class="' + className + '">"';

                if (model.getColumn(cell.get('id')) && model.getColumn(cell.get('id')).get('datatype') === 'BLOB') {
                    html += '<img width="' + model.getColumn(cell.get('id')).get('width') + '" src="' + cell.get('value') + '"/>';
                }
                else if (cell.get('value')) {
                    if (!drillDownLinkCreated) {
                        html += '<a href="#' + row.get('id') + '">' + cell.get('value') + '</a>';
                        drillDownLinkCreated = true;
                    } else {
                        html += '<span>' + cell.get('value') + '</span>';
                    }
                    
                    values[cell.get('id')] = cell.get('value');
                }

                html += '</td>';
            }, row);
            
            if (this.model.hasActions) {
                html += '<td>';

                _.each(this.model.getActions(), function (cell) {
                    var buttonId = model.id + "_" + row.id + "_" + cell.get('actionName');
                    var actionParams = cell.get('actionParams');

                    var userInputs = "";

                    _.each(actionParams, function (actionParams) {
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
                            userInputs += "<label for='" + row.id + "_userinput_" + name + "'>" + (label || name) + "</label><input class='gridUserInput' type='text' format='" + format + "' " + inputValue + " id='" + row.id + "_userinput_" + name + "'/>";
                        }
                    });

                    html += "<div style='display:inline' name='" + cell.get('actionName') + "' actionParams='" + JSON.stringify(actionParams) + "' bind='" + cell.get('type') + "'> " + userInputs + " <button id='" + buttonId + "' attribute='submit'>" + cell.get('label') + "</button></div>";
                });

                html += '</td>';
            }
            
            return html;
        },

        renderPagingBar: function (currentPage, itemsPerPage, hostEl, currentSortField, currentSortAsc) {
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

                    pagingBar = hostEl.find("#pagingBar");
                    for (var i = 0; i < nbPages; i++) {
                        var inputId = this.model.id + "BtnPage" + i;
                        var disabled = "";
                        if (i == currentPage)
                            disabled = " disabled='disabled'";

                        pagingBar.append("<input id='" + inputId + "' type='button' value='" + (i + 1) + "' " + disabled + " />");

                        var that = this;
                        $(pagingBar).find("#" + inputId).click(function () {
                            that.renderWithPaging(this.value - 1, itemsPerPage, currentSortField, currentSortAsc);
                        });
                    }
                }

            }
        },
        
        renderAsPopupGrid: function (hostId, hostEl) {
            var clientMessage = new expanz.models.ClientMessage({
                id: hostId + 'PopUp',
                title: '',
                text: '',
                parent: this.model.parent
            });

            var picklistWindow = new window.expanz.views.PopupView({
                id: clientMessage.id,
                model: clientMessage
            }, $('body'));

            picklistWindow.$el.append(hostEl);
            picklistWindow.center();
        },

        renderAsRotationBar: function (el, itemPerPage, rotationStep, firstItemIndex) {
            var totalItems = $(el).find("li.rotatingItem").length;
            var that = this;
            var elId = $(el).attr('id');

            $(el).find("li.rotatingItem").hide();

            var i = 0;

            $(el).find("li.rotatingItem").each(function () {

                if (i >= firstItemIndex) {
                    $(this).show();
                }
                i++;
                if ((i - firstItemIndex) >= itemPerPage)
                    return false;
            });

            if ($(el).find("#" + elId + "NextBtn").length === 0) {
                $(el).find("li.rotatingItem").last().after("<li class='rotatingButton'><button id='" + elId + "NextBtn'>></button></li>");
                $(el).find("#" + elId + "NextBtn").unbind("click");
            }
            if ($("#" + elId + "PrevBtn").length === 0) {
                $(el).find("li.rotatingItem").first().before("<li class='rotatingButton'><button  id='" + elId + "PrevBtn'><</button></li>");
                $(el).find("#" + elId + "PrevBtn").unbind("click");
            }

            /* show pre button if needed */
            if (firstItemIndex > 0) {
                $(el).find("#" + elId + "PrevBtn").click(function () {
                    that.renderAsRotationBar($(el), itemPerPage, rotationStep, Math.max(firstItemIndex - rotationStep, 0));
                });
                $(el).find("#" + elId + "PrevBtn").show();
            }
            else {
                $(el).find("#" + elId + "PrevBtn").hide();
            }

            /* show next button if needed */
            if (i < totalItems) {
                $(el).find("#" + elId + "NextBtn").click(function () {
                    that.renderAsRotationBar($(el), itemPerPage, rotationStep, Math.min(firstItemIndex + rotationStep, totalItems - itemPerPage));
                });
                $(el).find("#" + elId + "NextBtn").show();
            }
            else {
                $(el).find("#" + elId + "NextBtn").hide();
            }
        },

        itemTemplateName: function () {
            return this.options['templateName'] || this.model.id + "ItemTemplate";
        },

        itemTemplate: function () {
            var itemTemplate = $("#" + this.itemTemplateName());

            if (itemTemplate.length === 0)
                itemTemplate = null;

            return itemTemplate;
        },

        headerTemplate: function () {
            var headerTemplate = $("#" + this.itemTemplateName() + "Header");

            if (headerTemplate.length === 0)
                headerTemplate = null;

            return headerTemplate;
        },

        _handleActionClick: function (actionEl, rowId, methodName, actionParams, divEl) {
            var inputValid = true;
            /* handle user input */
            _.each(actionParams, function (actionParam) {
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

        _handleMenuActionClick: function (rowId, menuAction, actionParams, divEl) {
            /* handle user input */
            _.each(actionParams, function (actionParam) {
                var name = actionParam.name;
                if (actionParam.value == '@contextId') {
                    actionParam.value = rowId;
                }
            });

            this.trigger("menuActionClicked", rowId, menuAction, actionParams);
        },

        _handleContextMenuClick: function (rowId, contextMenuType, actionParams, divEl) {
            /* handle user input */
            var contextObject = '';
            _.each(actionParams, function (actionParam) {
                var name = actionParam.name;
                if (actionParam.value == '@contextId') {
                    actionParam.value = rowId;
                }
                if (actionParam.name == 'contextObject') {
                    contextObject = actionParam.value;
                }
            });
            contextObject = contextObject || contextMenuType;

            this.trigger("contextMenuClicked", rowId, contextMenuType, contextObject, actionParams);
        }
    });
});
