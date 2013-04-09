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
        
        initialize: function (params) {
            this.model.bind("datapublication:dataPublished", this.onDataPublished, this);

            this.currentPage = 1;
            this.itemsPerPage = params.itemsPerPage != undefined ? parseInt(params.itemsPerPage) : 9999;
        },

        onDataPublished: function () {
            var handledExternally = this.raiseExtensibilityPointEvent("publishData");
            
            if (!handledExternally)
                this.render();
        },

        render: function () {
            // Notify listeners (such as adapters) that we are about to render
            // the data publication, and give them a chance to take over.
            var hasBeenRenderedExternally = this.raiseExtensibilityPointEvent("rendering");

            if (hasBeenRenderedExternally === true)
                return this; // Rendering already performed by adapter, so return early

            this.$el.html(""); // Clear the contents of the host element
            
            // Render header
            var headerView = new expanz.views.subviews.DataPublicationHeaderView({ model: this.model, dataPublicationView: this });
            this.$el.append(headerView.render().el);

            // Render body
            var bodyView = new expanz.views.subviews.DataPublicationBodyView({ model: this.model, dataPublicationView: this });
            this.$el.append(bodyView.render().el);
            
            // Render paging bar - needs to append paging bar to parent element, or use the
            // existing one if found
            var existingPagingBarElement = this.$el.parent().find("#pagingBar");
            var pagingBarView = new expanz.views.subviews.DataPublicationPagingBarView({ model: this.model, dataPublicationView: this, el: existingPagingBarElement[0] });
            var renderedPagingBarElement = pagingBarView.render().el;
            
            if (existingPagingBarElement.length === 0)
                this.$el.parent().append(renderedPagingBarElement);
            
            this.configureEventHandlers(this.$el);

            // Logic dealing with the number of items in the list. Store the item
            // count as an attribute on the element, and if there are no items then
            // apply a class to the element, and show a message (if supplied).
            this.$el.attr('data-itemcount', this.model.rows.length);
            
            if (this.model.rows.length === 0) {
                this.$el.addClass("empty");

                var noItemsText = this.$el.attr("noItemsText");
                
                if (noItemsText)
                    this.$el.append('<div id="noItemsText" class="emptyListText">' + noItemsText + '</div>');
            } else {
                this.$el.removeClass("empty");
            }

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
            
            this.$el.trigger("datapublication:" + eventName, [
				this.model, this, args
            ]);
            
            return args.handled;
        }
    });
});
