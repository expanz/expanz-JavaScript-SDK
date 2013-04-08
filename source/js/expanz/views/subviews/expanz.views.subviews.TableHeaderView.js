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

    window.expanz.views.subviews.TableHeaderView = Backbone.View.extend({

        defaultTemplate: _.template('<tr class="tableheader">' +
                                    '<% columns.each(function(col){ %>' +
                                       '<th width="<%= col.get("width") %>"><%= col.get("label") %></th>' +
                                    '<% }); %>' +
                                    '</tr>'),

        tagName: "thead",

        initialize: function (params) {
            this.dataPublicationView = params.dataPublicationView;
        },

        render: function () {
            var hasBeenRenderedExternally = this.dataPublicationView.raiseExtensibilityPointEvent("renderingHeader");

            if (!hasBeenRenderedExternally) {
                var headerTemplate = this.getHeaderTemplate();
                this.$el.html(headerTemplate({ columns: this.model.columns }));

                this.onHeaderRendered();
                this.dataPublicationView.raiseExtensibilityPointEvent("headerRendered");
            }

            return this;
        },

        getHeaderTemplate: function () {
            // Looks in the HTML page for a text template with a given name. If found, it is returned.
            // Otherwise it will return the default template defined as part of this view.
            var headerTemplate = null;
            var userDefinedTemplate = $("#" + this.dataPublicationView.itemTemplateName() + "Header");

            if (userDefinedTemplate.length === 0)
                headerTemplate = this.defaultTemplate;
            else
                headerTemplate = _.template(userDefinedTemplate.html());

            return headerTemplate;
        },

        onHeaderRendered: function () {
            var headerView = this;
            var dataPublicationView = headerView.dataPublicationView;

            // Search the header for all the fields marked as being sortable,
            // and transform them to be as such.
            this.$el.find("[sortField]").each(function () {
                var $headerCell = $(this);
                var fieldName = $headerCell.attr('sortField');

                // Set classes on the field for styling purposes
                $headerCell.addClass("sortable");

                if (fieldName == dataPublicationView.sortField) {
                    if (dataPublicationView.sortDirection == "asc") {
                        $headerCell.removeClass("sortedDesc");
                        $headerCell.addClass("sortedAsc");
                    } else {
                        $headerCell.removeClass("sortedAsc");
                        $headerCell.addClass("sortedDesc");
                    }
                }

                // Handle the user clicking on the colun header to sort the data publication
                $(this).click(function () {
                    // The user has clicked on a column header. Sort the data
                    // publication by the corresponding field and re-render the list
                    var sortDirection = $headerCell.attr('defaultSortDirection') || "asc";

                    if (fieldName == dataPublicationView.sortField) {
                        // Reverse the sort direction of this column
                        sortDirection = dataPublicationView.sortDirection === "desc" ? "asc" : "desc";
                    }

                    dataPublicationView.sortField = fieldName;
                    dataPublicationView.sortDirection = sortDirection.toLowerCase();

                    dataPublicationView.model.sortRowsByFieldName(fieldName, (dataPublicationView.sortDirection === "asc"));
                    dataPublicationView.render();
                });
            });
        }
    });
});