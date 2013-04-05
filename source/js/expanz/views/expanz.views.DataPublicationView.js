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

    window.expanz.views.DataPublicationView = Backbone.View.extend({
        
        template: _.template('<table class="grid" id="<%= hostId %>"></table>'),

        initialize: function () {
            this.model.bind("datapublication:publishData", this.publishData, this);
        },

        publishData: function () {
            this.$el.trigger("publishData", [
				this.model, this
            ]);

            this.render();
        },

        render: function () {
            // Notify listeners (such as adapters) that we are about to render
            // the data publication, and give them a chance to take over.
            // Acts as an extensibility point for adapters.
            var args = { handled: false };
            
            this.$el.trigger("dataPublication:rendering", [
				this.model, this, args
            ]);

            if (args.handled === true)
                return this; // Rendering already performed by adapter, so return early

            var hostId = this.id + "_host";

            // Create table scaffold
            this.$el.html(this.template({ hostId: hostId }));
            var $hostEl = this.$el.find('#' + hostId);

            // Render header
            var headerView = new expanz.views.TableHeaderView({ model: this.model, dataPublicationView: this });
            $hostEl.append(headerView.render().el);

            // Render body
            var bodyView = new expanz.views.TableBodyView({ model: this.model, dataPublicationView: this });
            $hostEl.append(bodyView.render().el);

            this.configureEventHandlers($hostEl);

            $hostEl.attr('nbItems', this.model.rows.length);

            $hostEl.trigger("datapublication:rendered", [ this ]);

            return this;
        },
        
        configureEventHandlers: function ($hostEl) {
            var view = this;
            
            var onRowClickProxy = function () {
                view.onRowClicked.call(view, $(this));
            };

            var onRowDoubleClickProxy = function () {
                view.onRowDoubleClicked.call(view, $(this));
            };
            
            var onDrillDownClickProxy = function () {
                var $row = $(this).closest("tr");
                view.onDrillDown.call(view, $row);
            };
            
            var onInputClickProxy = function () {
                // Select all the text in the input box when it is clicked
                this.select();
            };
            
            var onInputValueChangedProxy = function () {
                // Input value has changed, so pass new value to the server
                var $input = $(this);
                var $cell = $input.closest("td");
                var $row = $input.closest("tr");
                
                view.onCellValueChanged.call(view, $input, $cell, $row);
            };

            $hostEl.find("tr").click(this, onRowClickProxy);
            $hostEl.find("tr").dblclick(this, onRowDoubleClickProxy);
            $hostEl.find("tr a").click(this, onDrillDownClickProxy);
            
            if (this.model.isEditable) {
                $hostEl.find("input").click(this, onInputClickProxy);
                $hostEl.find("input").change(this, onInputValueChangedProxy);
            }
        },

        onRowClicked: function ($row) {
            // Does nothing by default. Function can be redefined or the event raised can be handled by external code as required.
            this.$el.trigger("dataPublication:rowClicked", [
				this.model, $row, this
            ]);
        },

        onRowDoubleClicked: function ($row) {
            // Does nothing by default. Function can be redefined or the event raised can be handled by external code as required.
            this.$el.trigger("dataPublication:rowDoubleClicked", [
				this.model, $row, this
            ]);
        },

        onDrillDown: function ($row) {
            this.model.drillDown($row.attr('id'), $row.attr('type'), null);
        },

        onCellValueChanged: function ($input, $cell, $row) {
            var columnId = $cell.attr("id");
            var rowId = $row.attr("id");

            var cellModel = this.model.rows.get(rowId).cells.get(columnId);
            var newValue = $input.val();

            if ($input.attr("type") === "checkbox")
                newValue = $input.is(':checked') ? "1" : "0";
            
            this.model.sendCellUpdateToServer(cellModel, newValue);
        },

        itemTemplateName: function () {
            return this.options['templateName'] || this.model.get("dataId") + "ItemTemplate";
        }
    });
    

    window.expanz.views.TableHeaderView = Backbone.View.extend({

        defaultTemplate: _.template('<tr class="tableheader">' +
                                    '<% columns.each(function(col){ %>' +
                                       '<th width="<%= col.get("width") %>"><%= col.get("label") %></th>' +
                                    '<% }); %>' +
                                    '</tr>'),
        
        tagName: "thead",

        render: function () {
            var headerTemplate = this.getHeaderTemplate();
            this.$el.html(headerTemplate({ columns: this.model.columns }));
            return this;
        },

        getHeaderTemplate: function () {
            // Looks in the HTML page for a text template with a given name. If found, it is returned.
            // Otherwise it will return the default template defined as part of this view.
            var headerTemplate = null;
            var userDefinedTemplate = $("#" + this.options.dataPublicationView.itemTemplateName() + "Header");

            if (userDefinedTemplate.length === 0)
                headerTemplate = this.defaultTemplate;
            else
                headerTemplate = _.template(userDefinedTemplate.html());

            return headerTemplate;
        }
    });
    

    window.expanz.views.TableBodyView = Backbone.View.extend({

        tagName: "tbody",

        render: function () {
            var self = this;
            
            this.model.rows.each(function (row, rowIndex) {
                // Render row
                var rowView = new expanz.views.TableRowView({ model: row, rowIndex: rowIndex, dataPublicationView: self.options.dataPublicationView });
                self.$el.append(rowView.render().el);
            });

            return this;
        }
    });
    

    window.expanz.views.TableRowView = Backbone.View.extend({

        defaultRowTemplate: _.template('<tr id="<%= row.id %>" class="<%= className %>" type="<%= row.get("type") %>">' +
                                       '<%= rowView.renderRowCells(row) %>' +
                                       '</tr>'),

        defaultCellTemplate: _.template('<td id="<%= cell.get("id") %>">' +
                                        '<%= rowView.renderCellContents(cell, row, cellIndex, isDrillDownRow) %>' +
                                        '</td>'),

        render: function () {
            // TODO: Notify element, which may override the rendering of the row
            
            var className = (this.options.rowIndex % 2 == 1) ? 'gridRowAlternate' : 'gridRow';

            // If a displayStyle attribute is passed from the server, use it, prefixed with grid- as the class name
            if (this.model.get("displayStyle"))
                className = "grid-" + this.model.get("displayStyle");

            var itemTemplate = this.getItemTemplate();
            this.setElement(itemTemplate({ row: this.model, data: this.model.getCellValues().data, className: className, rowView: this }));
            
            return this;
        },

        getItemTemplate: function () {
            // Looks in the HTML page for a text template with a given name. If found, it is returned.
            // Otherwise it will return the default template defined as part of this view.
            var itemTemplate = null;
            var userDefinedTemplate = $("#" + this.options.dataPublicationView.itemTemplateName());

            if (userDefinedTemplate.length === 0)
                itemTemplate = this.defaultRowTemplate;
            else
                itemTemplate = _.template(userDefinedTemplate.html());

            return itemTemplate;
        },
        
        renderRowCells: function (row) {
            var html = "";
            var view = this;
            var isDrillDownRow = this.options.dataPublicationView.options.canDrillDown && (row.get("type") !== "Totals" && row.get("type") !== "BlankLine"); // Only show drilldown link if configured to do so, and only on non-totals and non-blank rows

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
            
            if (this.model.hasActions) {
                html = '<td>';

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
        }
    });
});
