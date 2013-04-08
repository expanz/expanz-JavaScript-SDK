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

    window.expanz.views.subviews.TableBodyView = Backbone.View.extend({

        tagName: "tbody",

        initialize: function (params) {
            this.dataPublicationView = params.dataPublicationView;
        },

        render: function () {
            var view = this;

            this.model.rows.each(function (row, rowIndex) {
                // Render row
                var rowView = new expanz.views.subviews.TableRowView({ model: row, rowIndex: rowIndex, dataPublicationView: view.dataPublicationView });
                view.$el.append(rowView.render().el);
            });

            return this;
        }
    });
});