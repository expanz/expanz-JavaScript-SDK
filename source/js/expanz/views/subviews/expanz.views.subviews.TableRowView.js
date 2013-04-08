﻿////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Chris Anderson
//  Copyright 2008-2013 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

    window.expanz = window.expanz || {};
    window.expanz.views = window.expanz.views || {};
    window.expanz.views.subviews = window.expanz.views.subviews || {};

    window.expanz.views.subviews.TableRowView = Backbone.View.extend({

        defaultRowTemplate: _.template('<tr class="<%= className %>">' +
                                       '<%= rowView.renderRowCells(row) %>' +
                                       '</tr>'),

        defaultCellTemplate: _.template('<td id="<%= cell.get("id") %>">' +
                                        '<%= rowView.renderCellContents(cell, row, cellIndex, isDrillDownRow) %>' +
                                        '</td>'),

        initialize: function (params) {
            this.dataPublicationView = params.dataPublicationView;
        },

        render: function () {
            var hasBeenRenderedExternally = this.dataPublicationView.raiseExtensibilityPointEvent("renderingRow");

            if (!hasBeenRenderedExternally) {
                var className = (this.options.rowIndex % 2 == 1) ? 'gridRowAlternate' : 'gridRow';

                // If a displayStyle attribute is passed from the server, use it, prefixed with grid- as the class name
                if (this.model.get("displayStyle"))
                    className = "grid-" + this.model.get("displayStyle");

                var cellValues = this.model.getCellValues();

                var itemTemplate = this.getItemTemplate();
                this.setElement(itemTemplate({ row: this.model, data: cellValues.data, sortValues: cellValues.sortValues, className: className, rowView: this }));

                // Set attributes on the element that will be used to identify it
                this.$el.attr("id", this.model.id);
                this.$el.attr("type", this.model.get("type"));

                this.onRowRendered();
                this.dataPublicationView.raiseExtensibilityPointEvent("rowRendered");
            }

            return this;
        },

        getItemTemplate: function () {
            // Looks in the HTML page for a text template with a given name. If found, it is returned.
            // Otherwise it will return the default template defined as part of this view.
            var itemTemplate = null;
            var userDefinedTemplate = $("#" + this.dataPublicationView.itemTemplateName());

            if (userDefinedTemplate.length === 0)
                itemTemplate = this.defaultRowTemplate;
            else
                itemTemplate = _.template(userDefinedTemplate.html());

            return itemTemplate;
        },

        renderRowCells: function (row) {
            var html = "";
            var view = this;
            var isDrillDownRow = this.dataPublicationView.options.canDrillDown && (row.get("type") !== "Totals" && row.get("type") !== "BlankLine"); // Only show drilldown link if configured to do so, and only on non-totals and non-blank rows

            row.cells.each(function (cell, cellIndex) {
                html += view.defaultCellTemplate({ cell: cell, row: row, rowView: view, cellIndex: cellIndex, isDrillDownRow: isDrillDownRow });
            });

            html += this.renderActions();

            return html;
        },

        renderCellContents: function (cell, row, cellIndex, isDrillDownRow) {
            var html = "";

            if (cell.column && cell.column.get('datatype') === 'BLOB') {
                html += '<img width="' + cell.column.get('width') + '" src="' + cell.get('value') + '"/>';
            } else if (cell.column.get("isEditable")) {
                html += this.renderCellInputControl(cell);
            } else if (cell.get('value')) {
                if (cellIndex === 0 && isDrillDownRow) {
                    html += '<a href="#' + row.get('id') + '">' + cell.get('value') + '</a>'; // Create a drilldown link
                } else {
                    html += '<span>' + cell.get('value') + '</span>';
                }
            }

            return html;
        },

        renderCellInputControl: function (cell) {
            // Render the correct type of input control, depending on the cell column's data type
            var html = "";
            var dataType = cell.column.get("datatype");

            if (dataType === "string" || dataType === "number") {
                html = "<input type='text' value='" + cell.get('value') + "' class='dpinput-" + dataType + "' style='width: 100%;'>";
            } else if (dataType === "boolean") {
                html = "<input type='checkbox' class='dpinput-boolean'";

                if (cell.get('value') === "1")
                    html += " checked";

                html += ">";
            }

            // TODO: Support dropdown lists

            return html;
        },

        renderActions: function () {
            var html = "";

            //if (this.model.hasActions) {
            //    html = '<td>';

            //    _.each(this.model.getActions(), function (cell) {
            //        var buttonId = model.id + "_" + row.id + "_" + cell.get('actionName');
            //        var actionParams = cell.get('actionParams');

            //        var userInputs = "";

            //        _.each(actionParams, function (actionParams) {
            //            var name = actionParams.name;
            //            var value = actionParams.value;
            //            var label = actionParams.label;

            //            if (value == '@userInput.textinput' || value == '@userInput.numericinput') {
            //                var format = (value == '@userInput.numericinput') ? 'numeric' : 'text';
            //                var bindValueFromCellId = actionParams.bindValueFromCellId;
            //                var inputValue = '';
            //                if (bindValueFromCellId) {
            //                    inputValue = " value='" + values[bindValueFromCellId] + "' ";
            //                }
            //                userInputs += "<label for='" + row.id + "_userinput_" + name + "'>" + (label || name) + "</label><input class='gridUserInput' type='text' format='" + format + "' " + inputValue + " id='" + row.id + "_userinput_" + name + "'/>";
            //            }
            //        });

            //        html += "<div style='display:inline' name='" + cell.get('actionName') + "' actionParams='" + JSON.stringify(actionParams) + "' bind='" + cell.get('type') + "'> " + userInputs + " <button id='" + buttonId + "' attribute='submit'>" + cell.get('label') + "</button></div>";
            //    });

            //    html += '</td>';
            //}

            return html;
        },

        onRowRendered: function () {
            var rowView = this;
            var dataPublicationView = rowView.dataPublicationView;

            /* Search for elements with a methodName attribute, and bind them to an action */
            rowView.$el.find("[methodName]").each(function (index, element) {
                var action = dataPublicationView.model.actions[$(element).attr('methodName')];

                if (action) {
                    $(element).click(function () {
                        rowView._handleActionClick.call(rowView, $(this), action);
                    });
                }
            });

            /* trigger a method call if a user field include a change attribute */
            //rowView.$el.find("#" + itemId + "  [autoUpdate] ").change(function (elem) {
            //    var action = that.model.getAction($(this).attr('autoUpdate'));
            //    if (action && action.length > 0) {
            //        var rowId = $(this).closest("[rowId]").attr('rowId');
            //        var actionParams = action[0].get('actionParams').clone();
            //        that._handleActionClick($(this), rowId, action[0].get('actionName'), actionParams, $(this).closest("[rowId]"));
            //    }
            //    else {
            //        window.expanz.logToConsole("autUpdate action not defined in formapping: " + $(this).attr('autoUpdate'));
            //    }
            //});

            ///* binding menuAction from template */
            //rowView.$el.find("#" + itemId + " [menuAction] ").each(function (index, element) {
            //    var action = that.model.getAction($(element).attr('menuAction'));
            //    if (action && action.length > 0) {
            //        $(element).click(function () {
            //            var rowId = $(this).closest("[rowId]").attr('rowId');
            //            var actionParams = action[0].get('actionParams').clone();

            //            that._handleMenuActionClick(rowId, action[0].get('actionName'), actionParams, $(this).closest("[rowId]"));

            //        });
            //    }
            //});

            /* Search for elements with a contextMenu attribute, and bind them to an action */
            //rowView.$el.find("[contextMenu] ").each(function (index, element) {
            //    var action = dataPublicationView.model.actions[$(element).attr('contextMenu')];
                
            //    if (action) {
            //        $(element).click(function () {
            //            var $element = $(this);
            //            var rowId = $element.closest("tr").attr('id');
            //            rowView._handleActionClick.call(rowView, $element, rowId, action, $element.closest("tr"));
                        
            //            var rowId = $(this).closest("[rowId]").attr('rowId');
            //            var actionParams = action[0].get('actionParams').clone();

            //            var method = new expanz.models.ContextMenu({
            //                id: rowId,
            //                contextObject: action[0].get('actionName'),
            //                parent: dataPublicationView.model.parent
            //            });

            //            var ctxMenuview = new expanz.views.ContextMenuView({
            //                el: $(this),
            //                id: $(this).attr('id'),
            //                className: $(this).attr('class'),
            //                collection: method
            //            });

            //            window.expanz.currentContextMenu = ctxMenuview.collection;

            //            rowView._handleContextMenuClick.call(rowView, action[0].get('actionName'), actionParams, $(this).closest("tr"));
            //        });
            //    }
            //});
        },

        _handleActionClick: function (actionEl, action) {
            var rowView = this;
            var inputValid = true;

            var newActionParams = action.actionParams.clone();

            // Replace variables (starting with @) with actual values
            _.each(newActionParams, function (actionParam) {
                var name = actionParam.name;

                if (actionParam.value == '@userInput.textinput' || actionParam.value == '@userInput.numericinput') {
                    var valueInput = rowView.$el.find("#" + rowView.model.id + "_userinput_" + name);

                    if (valueInput.length > 0 && valueInput.val().length > 0) {
                        actionParam.value = valueInput.val();
                    }
                    else {
                        inputValid = false;
                    }
                }
                else if (actionParam.value == '@contextId') {
                    actionParam.value = rowView.model.id;
                }
            });

            if (inputValid) {
                var handledExternally = this.dataPublicationView.raiseExtensibilityPointEvent("actionClicked", action.actionName, newActionParams, actionEl);

                if (!handledExternally) {
                    actionEl.attr('disabled', 'disabled');
                    actionEl.addClass('actionLoading');

                    // TODO: Move into Row model
                    expanz.net.MethodRequest(action.actionName, newActionParams, null, this.dataPublicationView.model.get("parent"));
                }
            }
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