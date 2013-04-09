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

    window.expanz.views.subviews.DataPublicationBodyView = Backbone.View.extend({

        tagName: "tbody",

        initialize: function (params) {
            this.dataPublicationView = params.dataPublicationView;

            // If the host element is not a table, create items in a div instead of the default tbody.
            if (!this.dataPublicationView.$el.is("table")) {
                this.setElement($('<div></div>'));
            }
        },

        render: function () {
            var view = this;

            // Calculate which items should be displayed, based upon the items per page and current page number
            var firstItemIndex = (this.dataPublicationView.currentPage - 1) * this.dataPublicationView.itemsPerPage;
            var lastItemIndex = Math.min(firstItemIndex + this.dataPublicationView.itemsPerPage, this.model.rows.length);
            
            // Enumerate the rows for the current page, and render them
            for (var rowIndex = firstItemIndex; rowIndex < lastItemIndex; rowIndex++) {
                var row = this.model.rows.at(rowIndex);
                
                // Render row
                var rowView = new expanz.views.subviews.DataPublicationRowView({ model: row, rowIndex: rowIndex, dataPublicationView: view.dataPublicationView });
                view.$el.append(rowView.render().el);
            }

            return this;
        }
    });
});