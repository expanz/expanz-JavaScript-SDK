////////////////////////////////////////////////////////////////////////////////
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

    window.expanz.views.subviews.DataPublicationRowView = Backbone.View.extend({

        defaultRowTemplate: _.template('<tr class="<%= ((rowIndex % 2 == 1) ? "gridRowAlternate" : "gridRow") + (rowModel.get("displayStyle") ? " grid-" + rowModel.get("displayStyle") : "") %>">' +
                                       '<%= rowView.renderRowCells(rowModel) %>' +
                                       '</tr>'),

        defaultCellTemplate: _.template('<td data-columnid="<%= cellModel.get("id") %>" class="<%= cellModel.get("displayStyle") || cellModel.column.get("displayStyle") || "" %>">' +
                                        '<%= rowView.renderCellContents(cellModel, rowModel, cellIndex, isDrillDownRow) %>' +
                                        '</td>'),

        initialize: function (params) {
            this.dataPublicationView = params.dataPublicationView;
        },

        render: function () {
            var hasBeenRenderedExternally = this.dataPublicationView.raiseExtensibilityPointEvent("renderingRow");

            if (!hasBeenRenderedExternally) {
                var cellValues = this.model.getCellValues();

                var itemTemplate = this.getItemTemplate();
                this.setElement(itemTemplate({ rowModel: this.model, data: cellValues.data, sortValues: cellValues.sortValues, rowView: this, rowIndex: this.options.rowIndex }));

                // Set attributes on the element that will be used to identify it
                this.$el.attr("data-rowid", this.model.id);
                this.$el.attr("data-rowtype", this.model.get("type"));

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

        renderRowCells: function (rowModel) {
            var html = "";
            var view = this;
            var isDrillDownRow = this.dataPublicationView.options.canDrillDown && (rowModel.get("type") !== "Totals" && rowModel.get("type") !== "BlankLine") && rowModel.get("canDrillDown") !== "false"; // Only show drilldown link if configured to do so, and only on non-totals and non-blank rows

            rowModel.cells.each(function (cellModel, cellIndex) {
                html += view.defaultCellTemplate({ cellModel: cellModel, rowModel: rowModel, rowView: view, cellIndex: cellIndex, isDrillDownRow: isDrillDownRow });
            });

            return html;
        },

        renderCellContents: function (cellModel, rowModel, cellIndex, isDrillDownRow) {
            var html = "";

            if (cellModel.column && cellModel.column.get('datatype') === 'BLOB') {
                html += '<img width="' + cellModel.column.get('width') + '" src="' + cellModel.get('value') + '"/>';
            } else if (cellModel.column.get("isEditable")) {
                html += this.renderCellInputControl(cellModel);
            } else if (cellModel.get('value')) {
                if (cellIndex === 0 && isDrillDownRow && cellModel.get('canDrillDown') !== 'false') {
                    html += '<a href="#' + rowModel.get('id') + '">' + cellModel.get('value') + '</a>'; // Create a drilldown link
                } else {
                    html += '<span>' + cellModel.get('value') + '</span>';
                }
            }

            return html;
        },

        renderCellInputControl: function (cellModel) {
            // Render the correct type of input control, depending on the cell column's data type
            var html = "";
            var dataType = cellModel.column.get("datatype");

            if (dataType === "string" || dataType === "number") {
                html = "<input type='text' value='" + cellModel.get('value') + "' class='dpinput-" + dataType + "' style='width: 100%;'>";
            } else if (dataType === "boolean") {
                html = "<input type='checkbox' class='dpinput-boolean'";

                if (cellModel.get('value') === "1")
                    html += " checked";

                html += ">";
            }

            // TODO: Support dropdown lists

            return html;
        },

        // TODO: Re-instate, and call from default row template?
        //renderActions: function () {
        //    var html = "";

            //if (this.model.hasActions) {
            //    html = '<td>';

            //    _.each(this.model.getActions(), function (cell) {
            //        var buttonId = model.id + "_" + row.id + "_" + cell.get('name');
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

            //        html += "<div style='display:inline' name='" + cell.get('name') + "' actionParams='" + JSON.stringify(actionParams) + "' bind='" + cell.get('type') + "'> " + userInputs + " <button id='" + buttonId + "' attribute='submit'>" + cell.get('label') + "</button></div>";
            //    });

            //    html += '</td>';
            //}

        //    return html;
        //},

        onRowRendered: function () {
            this.bindActions();
            this.configureEventHandlers();
        },
        
        bindActions: function() {
            var rowView = this;
            var dataPublicationView = rowView.dataPublicationView;

            /* Search for elements with a methodName attribute, and bind them to an action */
            rowView.$el.find("[methodName]").click(function () {
                var action = dataPublicationView.model.actions[$(this).attr('methodName')];

                if (action)
                    rowView._executeAction.call(rowView, $(this), action);
            });

            /* Call a method on the server if a user changes the value of an input with the autoUpdate attribute */
            rowView.$el.find("[autoUpdate]").change(function () {
                var action = dataPublicationView.model.actions[$(this).attr('autoUpdate')];
                
                if (action)
                    rowView._executeAction.call(rowView, $(this), action);
            });

            /* Search for elements with a contextMenu attribute, and bind them to an action */
            rowView.$el.find("[contextMenu]").click(function () {
                var action = dataPublicationView.model.actions[$(this).attr('contextMenu')];

                if (action) 
                    rowView._requestContextMenu.call(rowView, $(this), action);
            });
        },

        configureEventHandlers: function () {
            var view = this;

            this.$el.click(this, function () {
                view.dataPublicationView.onRowClicked.call(view.dataPublicationView, view);
            });

            this.$el.dblclick(this, function () {
                view.dataPublicationView.onRowDoubleClicked.call(view.dataPublicationView, view);
            });
            
            this.$el.find("a").click(this, function () {
                view.dataPublicationView.onDrillDown.call(view.dataPublicationView, view);
            });

            if (this.dataPublicationView.model.isEditable) {
                this.$el.find("input").click(this, function () {
                    // Select all the text in the input box when it is clicked
                    this.select();
                });
                
                this.$el.find("input").change(this, function () {
                    // Input value has changed, so pass new value to the server
                    var $input = $(this);
                    var $cell = $input.closest("td");

                    view.dataPublicationView.onCellValueChanged.call(view.dataPublicationView, $input, view, $cell);
                });
                
                this.$el.find("input").keypress(function (event) {
                    // Raise event when enter is pressed in an input
                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    
                    if (keycode == '13') {
                        view.trigger("input:enterPressed", view, this);
                    }
                });
            }
        },
        
        focusCellInput: function(columnId) {
            var input = this.$el.find("[data-columnid='" + columnId + "']").find("input");

            if (input.length > 0)
                input.focus();
        },

        _executeAction: function ($actionEl, action) {
            var replaceVariablesResult = this._replaceActionParamsVariables(action.params, this);

            if (replaceVariablesResult.inputValid) {
                var handledExternally = this.dataPublicationView.raiseExtensibilityPointEvent("executingAction", this, action.name, replaceVariablesResult.actionParams, $actionEl);

                if (!handledExternally) {
                    $actionEl.attr('disabled', 'disabled');
                    $actionEl.addClass('actionLoading');

                    // TODO: Move into model
                    expanz.net.MethodRequest(action.name, replaceVariablesResult.actionParams, null, this.dataPublicationView.model.get("parent"));
                }
            }
        },

        _requestContextMenu: function ($actionEl, action) {
            var replaceVariablesResult = this._replaceActionParamsVariables(action.params, this);
            
            var handledExternally = this.dataPublicationView.raiseExtensibilityPointEvent("requestingContextMenu", this, action.name, replaceVariablesResult.actionParams, $actionEl);

            if (!handledExternally) {
                // Create a context menu, and assign it to the clicked element
                var contextMenuModel = new expanz.models.ContextMenu({
                    contextId: this.model.id,
                    type: action.name,
                    contextObject: replaceVariablesResult.actionParams.contextObject ? replaceVariablesResult.actionParams.contextObject.value : null,
                    activity: this.dataPublicationView.model.get("parent")
                });

                var contextMenuView = new expanz.views.ContextMenuView({
                    el: $actionEl,
                    id: $actionEl.attr("id"), // TODO: Fix
                    className: $actionEl.attr("class"),
                    collection: contextMenuModel
                });

                window.expanz.currentContextMenu = contextMenuView.collection;
                
                contextMenuModel.requestContextMenu();
            }
        },
        
        _replaceActionParamsVariables: function (actionParams, rowView) {
            // Replaces variables (starting with @) with actual values in an action params array
            var inputValid = true;
            var newActionParams = jQuery.extend(true, {}, actionParams); // Clone the params object so that we don't alter the original

            _.each(newActionParams, function (actionParam) {
                var name = actionParam.name;

                if (actionParam.value == '@userInput.textinput' || actionParam.value == '@userInput.numericinput') {
                    var valueInput = rowView.$el.find("#" + rowView.model.id + "_userinput_" + name);

                    if (valueInput.length > 0 && valueInput.val().length > 0) {
                        actionParam.value = valueInput.val();
                    } else {
                        inputValid = false;
                    }
                }
                else if (actionParam.value == '@contextId') {
                    actionParam.value = rowView.model.id;
                }
            });

            return {
                inputValid: inputValid,
                actionParams: newActionParams
            };
        }
    });
});