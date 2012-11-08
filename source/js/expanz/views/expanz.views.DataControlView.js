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

    window.expanz.views.DataControlView = Backbone.View.extend({

        initialize: function (attrs) {
            Backbone.View.prototype.initialize.call(attrs);
            this.model.bind("update:xml", this.publishData, this);
        },

        itemSelected: function (itemId, callbacks) {
            this.model.updateItemSelected(itemId, callbacks);
        },

        publishData: function () {
            this.el.trigger("publishData", [
				this.model.getAttr('xml'), this
            ]);
        }

    });
});
