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

    window.expanz.views.MethodView = Backbone.View.extend({
        initialize: function () {
            this.model.bind("change:loading", this.loading, this);
        },

        events: {
            "click [attribute=submit]": "submit"
        },

        submit: function () {
            this.model.submit();
            this.el.trigger('submit:' + this.model.get('id'));
        },

        loading: function () {
            // window.expanz.logToConsole('method loading ' + this.model.get('id'));
            if (this.model.get('loading') === true) {
                if (this.el.is(":button")) {
                    this.el.attr('disabled', 'disabled');
                }
                else {
                    this.el.find("button").attr('disabled', 'disabled');
                }
                this.el.addClass('methodLoading');
            }
            else {
                if (this.el.is(":button")) {
                    this.el.removeAttr('disabled');
                }
                else {
                    this.el.find("button").removeAttr('disabled');
                }
                this.el.removeClass('methodLoading');
            }

        }

    });
});
