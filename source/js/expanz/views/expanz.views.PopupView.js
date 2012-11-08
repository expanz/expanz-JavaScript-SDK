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

    window.expanz.views.PopupView = Backbone.View.extend({

        width: 'auto',

        cssClass: 'popupView',

        divAttributes: '',

        initialize: function (attrs, containerjQ) {
            Backbone.View.prototype.initialize.call(attrs);
            this.create(containerjQ);
            this.renderActions();
            this.delegateEvents(this.events);

            /* find the parent popup -> it is the first parentPopup visible */
            if (window.expanz.currentPopup !== undefined) {
                this.parentPopup = window.expanz.currentPopup;
                while (!$(this.parentPopup.el).is(":visible")) {
                    if (this.parentPopup.parentPopup === undefined) {
                        this.parentPopup = undefined;
                        break;
                    }
                    this.parentPopup = this.parentPopup.parentPopup;
                }

            }
            window.expanz.currentPopup = this;

        },

        events: {
            "click button": "buttonClicked"
        },

        renderActions: function () {

        },

        create: function (containerjQ) {
            // window.expanz.logToConsole("render popupWindow");
            var popupWindow = containerjQ.find('#' + this.id);
            if (popupWindow.length > 0) {
                popupWindow.remove();
            }

            var content = '';
            if (this.model.getAttr('text') !== undefined && this.model.getAttr('text').length > 0) {
                content = this.model.getAttr('text');
            }

            containerjQ.append("<div class='" + this.cssClass + "' id='" + this.id + "' " + this.divAttributes + " name='" + this.id + "'>" + content + "</div>");
            this.el = containerjQ.find('#' + this.id);
            this.createWindowObject();

            if (this.model.getAttr('url') !== undefined && this.model.getAttr('url').length > 0) {
                var url = this.model.getAttr('url');
                var that = this;
                this.el.load(url, function () {
                    that.center();
                    that.trigger('contentLoaded');
                });
            }
            else {
                this.center();
            }

        },

        /* must be redefined depending on the plug-in used */
        createWindowObject: function () {
            this.el.dialog({
                modal: true,
                width: this.width,
                title: this.model.getAttr('title')
            });
        },

        buttonClicked: function () {
            this.closeWindow();
        },

        closeWindow: function () {
            this.trigger('popupClosed');
            this.close();
        },

        /* may be redifined depending on the pluggin used */
        close: function () {
            this.remove();
        },

        /* may be redifined depending on the pluggin used */
        center: function () {
            this.el.dialog("option", "position", 'center');
        }

    });
});
