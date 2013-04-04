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
                return; // Rendering already performed by adapter, so return early

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
                var row = $(this).closest("tr");
                view.onDrillDown.call(view, row);
            };

            $hostEl.find("tr").click(this, onRowClickProxy);
            $hostEl.find("tr").dblclick(this, onRowDoubleClickProxy);
            $hostEl.find("tr a").click(this, onDrillDownClickProxy);
        },

        onRowClicked: function (row) {
            // Does nothing by default. Function can be redefined by external code as required.
        },

        onRowDoubleClicked: function (row) {
            // Does nothing by default. Function can be redefined by external code as required.
        },

        onDrillDown: function (row) {
            this.model.drillDown(row.attr('id'), row.attr('type'), null);
        },

        itemTemplateName: function () {
            return this.options['templateName'] || this.model.id + "ItemTemplate";
        },

        getHeaderTemplate: function () {
            var headerTemplate = $("#" + this.itemTemplateName() + "Header");

            if (headerTemplate.length === 0)
                headerTemplate = null;

            return headerTemplate;
        },

        getItemTemplate: function () {
            var itemTemplate = $("#" + this.itemTemplateName());

            if (itemTemplate.length === 0)
                itemTemplate = null;

            return itemTemplate;
        }
    });
    

    window.expanz.views.TableHeaderView = Backbone.View.extend({

        template: _.template('<tr class="tableheader">' +
                             '<% columns.each(function(col){ %>' +
                                '<th width="<%= col.get("width") %>"><%= col.get("label") %></th>' +
                             '<% }); %>' +
                             '</tr>'),
        
        tagName: "thead",

        render: function () {
            this.$el.html(this.template({ columns: this.model.columns }));
            return this;
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

        rowTemplate: _.template('<tr id="<%= row.id %>" class="<%= className %>" type="<%= row.get("type") %>">' +
                                '<%= rowView.renderRowCells(row) %>' +
                                '</tr>'),

        cellTemplate: _.template('<td id="<%= cell.get("id") %>">' +
                                 '<%= rowView.renderCellContents(cell, row, cellIndex, isDrillDownRow) %>' +
                                 '</td>'),

        render: function () {
            // TODO: Notify element, which may override the rendering of the row
            
            var className = (this.options.rowIndex % 2 == 1) ? 'gridRowAlternate' : 'gridRow';

            // If a displayStyle attribute is passed from the server, use it, prefixed with grid- as the class name
            if (this.model.get("displayStyle"))
                className = "grid-" + this.model.get("displayStyle");
            
            this.setElement(this.rowTemplate({ row: this.model, className: className, rowView: this }));
            
            return this;
        },
        
        renderRowCells: function (row) {
            var html = "";
            var self = this;
            var isDrillDownRow = this.options.dataPublicationView.options.canDrillDown && (row.get("type") !== "Totals" && row.get("type") !== "BlankLine"); // Only show drilldown link if configured to do so, and only on non-totals and non-blank rows

            row.cells.each(function (cell, cellIndex) {
                html += self.cellTemplate({ cell: cell, row: row, rowView: self, cellIndex: cellIndex, isDrillDownRow: isDrillDownRow });
            });

            html += this.renderActions();

            return html;
        },
        
        renderCellContents: function (cell, row, cellIndex, isDrillDownRow) {
            var html = "";
            var column = row.dataPublication.columns.get(cell.get('id'));

            if (column && column.get('datatype') === 'BLOB') {
                html += '<img width="' + column.get('width') + '" src="' + cell.get('value') + '"/>';
            } else if (column.get("isEditable")) {
                html += "<input type='text' value='Blah' onClick='this.select();' style='width: 100%;'>";
            } else if (cell.get('value')) {
                if (cellIndex === 0 && isDrillDownRow) {
                    html += '<a href="#' + row.get('id') + '">' + cell.get('value') + '</a>'; // Create a drilldown link
                } else {
                    html += '<span>' + cell.get('value') + '</span>';
                }
            }

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
