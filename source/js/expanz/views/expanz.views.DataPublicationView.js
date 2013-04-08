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
            var hasBeenRenderedExternally = this.raiseExtensibilityPointEvent("rendering");

            if (hasBeenRenderedExternally === true)
                return this; // Rendering already performed by adapter, so return early

            var hostId = this.id + "_host";

            // Create table scaffold
            this.$el.html(this.template({ hostId: hostId }));
            var $hostEl = this.$el.find('#' + hostId);

            // Render header
            var headerView = new expanz.views.subviews.TableHeaderView({ model: this.model, dataPublicationView: this });
            $hostEl.append(headerView.render().el);

            // Render body
            var bodyView = new expanz.views.subviews.TableBodyView({ model: this.model, dataPublicationView: this });
            $hostEl.append(bodyView.render().el);

            this.configureEventHandlers($hostEl);

            $hostEl.attr('data-itemcount', this.model.rows.length);

            this.raiseExtensibilityPointEvent("rendered");

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
            this.raiseExtensibilityPointEvent("rowClicked");
        },

        onRowDoubleClicked: function ($row) {
            // Does nothing by default. Function can be redefined or the event raised can be handled by external code as required.
            this.raiseExtensibilityPointEvent("rowDoubleClicked");
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
        },
        
        raiseExtensibilityPointEvent: function(eventName, args) {
            // Notify listeners (such as adapters) that we are about to do
            // or have done something, and give them a chance to take over.
            // Acts as an extensibility point for adapters.
            if (!args)
                args = {};

            args.handled = false;

            this.$el.trigger("dataPublication:" + eventName, [
				this.model, this, args
            ]);

            return args.handled;
        }
    });
});
