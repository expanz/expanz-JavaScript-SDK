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

        initialize: function (attrs, $container) {
            Backbone.View.prototype.initialize.call(attrs);
            this.create($container);
            this.renderActions();
            this.delegateEvents(this.events);

            /* find the parent popup -> it is the first parentPopup visible */
            if (window.expanz.currentPopup !== undefined) {
                this.parentPopup = window.expanz.currentPopup;
                while (!this.parentPopup.$el.is(":visible")) {
                    if (this.parentPopup.parentPopup === undefined) {
                        this.parentPopup = undefined;
                        break;
                    }
                    this.parentPopup = this.parentPopup.parentPopup;
                }

            }
            
            window.expanz.currentPopup = this; // TODO: This should be removed
            this._activityView = null;
        },

        events: {
            "click button": "buttonClicked"
        },

        renderActions: function () {

        },

        create: function ($container) {
            // window.expanz.logToConsole("render popupWindow");
            var popupWindow = $container.find('#' + this.id);
            if (popupWindow.length > 0) {
                popupWindow.remove();
            }

            var content = '';
            if (this.model.get('text') !== undefined && this.model.get('text').length > 0) {
                content = this.model.get('text');
            } else if (this.contentTemplate) {
                content = this.contentTemplate({ id: this.id });
            }

            $container.append("<div class='" + this.cssClass + "' id='" + this.id + "' " + this.divAttributes + " name='" + this.id + "'>" + content + "</div>");
            this.setElement($container.find('#' + this.id));
            this.createWindowObject();

            if (this.model.get('url') !== undefined && this.model.get('url').length > 0) {
                var url = this.model.get('url');
                var that = this;
                this.$el.load(url, function () {
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
                title: this.model.get('title')
            });
        },
        
        setActivityView: function (activityView) {
            this._activityView = activityView;
            activityView.bind("closingActivity", this.onActivityClosing, this);
        },
        
        onActivityClosing: function () {
            // Called when the activity view's closingActivity event is raised
            this.isActivityClosing = true; // This stops the popup from telling the activity to close, as it will already be closing
            this.close();
        },

        buttonClicked: function () {
            this.close();
        },

        onCloseWindow: function () {
            this.trigger('popupClosed');

            if (this._activityView !== null && !this.isActivityClosing) {
                this._activityView.closeActivity();
            }
            
            if (this.postCloseActions)
                this.postCloseActions(this.model.get('title'));
            
            window.expanz.currentPopup = this.parentPopup; // TODO: This should be removed
        },

        /* may be redifined depending on the plug-in used */
        close: function () {
            this.remove();
            this.onCloseWindow();
        },

        /* may be redifined depending on the plug-in used */
        center: function () {
            this.el.dialog("option", "position", 'center');
        }
    });
});
