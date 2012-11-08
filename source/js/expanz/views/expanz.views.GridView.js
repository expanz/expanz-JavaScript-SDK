﻿////////////////////////////////////////////////////////////////////////////////
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
            this.model.bind("update:grid", this.render, this);
            this.bind("rowClicked", this.rowClicked, this);
            this.bind("rowDoubleClicked", this.rowDoubleClicked, this);
            this.bind("actionClicked", this.actionClicked, this);
            this.bind("menuActionClicked", this.menuActionClicked, this);
            this.bind("contextMenuClicked", this.contextMenuClicked, this);
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
                        var inputId = this.model.getAttr('id') + "BtnPage" + i;
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

        renderWithPaging: function (currentPage, itemsPerPage, currentSortField, currentSortAsc) {
            // window.expanz.logToConsole("GridView rendered for page " + currentPage);

            var rows = this.model.getAllRows();
            var firstItem = parseInt(currentPage * itemsPerPage, 10);
            var lastItem = Math.min(firstItem + parseInt(itemsPerPage, 10), rows.length);

            var hasItem = (lastItem > firstItem);

            var hostEl;
            var hostId = this.model.getAttr('id') + "_host";

            var templateName = this.options['templateName'] || this.model.getAttr('id') + "ItemTemplate";
            var wrapperElement = this.options['isHTMLTable'] == "true" ? 'table' : 'div';
            var enableConfiguration = this.options['enableConfiguration'] ? boolValue(this.options['enableConfiguration']) : false;
            var noItemText = this.options['noItemText'] || '';
            var nbItemsPerPageText = this.options['nbItemsPerPageText'] || 'Items per page';

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
                        $confEl = $(hostEl).parent().find("#" + hostId + "_Configuration");

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
                    if (headerTemplate && headerTemplate.length > 0) {
                        that = this;
                        $(hostEl).append(headerTemplate.html());
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
                        if (i % 2 === 1) {
                            result = $(result).addClass('alternate');
                            result = $(result).addClass('even');
                        }
                        else {
                            result = $(result).addClass('odd');
                        }

                        /* add row id to prefix id for eventual user inputs */
                        $(result).find("[id*='userinput_']").each(function () {
                            $(this).attr('id', row.getAttr('id') + "_" + $(this).attr('id'));
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
                                        parent: that.model.getAttr('parent')
                                    });

                                    var ctxMenuview = new expanz.views.ContextMenuView({
                                        el: $(this),
                                        id: $(this).attr('id'),
                                        className: $(this).attr('class'),
                                        model: method
                                    });
                                    window.expanz.currentContextMenu = ctxMenuview.model;

                                    that._handleContextMenuClick(rowId, action[0].get('actionName'), actionParams, $(this).closest("[rowId]"));

                                });
                            }
                        });
                    }
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
                $(hostEl).html('<thead><tr class="item"></tr></thead><tbody></tbody>');

                // render column header
                var el = $(hostEl).find('thead tr');
                _.each(this.model.getAllColumns(), function (cell) {
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
                    _.each(row.getAllCells(), function (cell) {
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
                        _.each(this.model.getActions(), function (cell) {
                            var buttonId = model.getAttr('id') + "_" + row.getAttr('id') + "_" + cell.get('actionName');
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
            }

            this.renderPagingBar(currentPage, itemsPerPage, hostEl, currentSortField, currentSortAsc);

            $(hostEl).attr('nbItems', rows.length);

            if (this.model.getAttr('renderingType') == 'popupGrid') {
                var clientMessage = new expanz.models.ClientMessage({
                    id: hostId + 'PopUp',
                    title: '',
                    text: '',
                    parent: this.model.getAttr('parent')
                });

                var picklistWindow = new window.expanz.views.PopupView({
                    id: clientMessage.id,
                    model: clientMessage
                }, $('body'));

                picklistWindow.el.append(hostEl);
                picklistWindow.center();
            }
            else if (this.model.getAttr('renderingType') == 'rotatingBar') {
                this.renderAsRotationBar(hostEl, 3, 3, 0);
            }

            hostEl.trigger("table:rendered");

            return this;
        },

        renderAsRotationBar: function (el, itemPerPage, rotationStep, firstItem) {
            var totalItems = $(el).find("li.rotatingItem").length;
            var that = this;
            var elId = $(el).attr('id');

            $(el).find("li.rotatingItem").hide();

            var i = 0;

            $(el).find("li.rotatingItem").each(function () {

                if (i >= firstItem) {
                    $(this).show();
                }
                i++;
                if ((i - firstItem) >= itemPerPage)
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
            if (firstItem > 0) {
                $(el).find("#" + elId + "PrevBtn").click(function () {
                    that.renderAsRotationBar($(el), itemPerPage, rotationStep, Math.max(firstItem - rotationStep, 0));
                });
                $(el).find("#" + elId + "PrevBtn").show();
            }
            else {
                $(el).find("#" + elId + "PrevBtn").hide();
            }

            /* show next button if needed */
            if (i < totalItems) {
                $(el).find("#" + elId + "NextBtn").click(function () {
                    that.renderAsRotationBar($(el), itemPerPage, rotationStep, Math.min(firstItem + rotationStep, totalItems - itemPerPage));
                });
                $(el).find("#" + elId + "NextBtn").show();
            }
            else {
                $(el).find("#" + elId + "NextBtn").hide();
            }
        },

        render: function () {

            var itemsPerPage = this.options['itemsPerPage'];
            if (!itemsPerPage || itemsPerPage <= 0) {
                itemsPerPage = 1000;
            }

            this.renderWithPaging(0, itemsPerPage);
            return this;
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