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

    window.expanz.views.subviews.DataPublicationPagingBarView = Backbone.View.extend({

        id: "pagingBar",
        tagName: "div",
        className: "paging",

        initialize: function (params) {
            this.dataPublicationView = params.dataPublicationView;
        },

        render: function () {
            var hasBeenRenderedExternally = this.dataPublicationView.raiseExtensibilityPointEvent("renderingPagingBar");

            if (!hasBeenRenderedExternally) {
                var itemCount = this.dataPublicationView.model.rows.length;
                var pageCount = Math.ceil(itemCount / this.dataPublicationView.itemsPerPage);
                
                this.$el.html(""); // Clear the contents of the paging bar (if any)
                
                if (pageCount > 1)
                    this.renderPageNumberButtons(pageCount);
            }

            return this;
        },
        
        renderPageNumberButtons: function (pageCount) {
            var view = this;
            
            for (var pageIndex = 0; pageIndex < pageCount; pageIndex++) {
                var inputId = this.dataPublicationView.model.id + "BtnPage" + pageIndex;
                var disabled = "";

                if (pageIndex + 1 == this.dataPublicationView.currentPage)
                    disabled = " disabled='disabled'";

                this.$el.append("<input id='" + inputId + "' type='button' value='" + (pageIndex + 1) + "' " + disabled + " />");

                this.$el.find("#" + inputId).click(function () {
                    view.dataPublicationView.currentPage = this.value;
                    view.dataPublicationView.render();
                });
            }
        }
    });
});