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

    window.expanz.views.ContextMenuView = Backbone.View.extend({
        initialize: function () {
            this.collection.bind("menuLoaded", this.render, this);

            this.$el = $(this.el); // Can be removed when upgrading to backbone 0.9+
        },

        render: function () {
            /* retrieve or create a div to host the context menu */
            // window.expanz.logToConsole("modelUpdated");
            if (this.collection.length === 0) {
                return;
            }

            var contextMenuId;

            if (this.contextMenuEl === undefined) {
                contextMenuId = this.collection.id.replace(/\./g, "_") + "_contextMenu";
                this.$el.append("<div class='contextMenu' id='" + contextMenuId + "' />");
                this.contextMenuEl = this.$el.find("#" + contextMenuId);
            }

            if (contextMenuId === undefined) {
                contextMenuId = (this.contextMenuEl.id || this.contextMenuEl[0].id);
            }

            this.contextMenuEl.hide();
            this.contextMenuEl.html("");

            /* position menu below button */
            var pos = 0;
            var top = 0;

            if (this.$el.find("button").length > 0) {
                pos = this.$el.find("button").position();
                top = pos.top + this.$el.find("button").outerHeight() + 2;
            } else {
                pos = this.$el.find("span").position();
                top = pos.top + this.$el.find("span").outerHeight() + 2;
            }

            this.contextMenuEl.css({
                position: "absolute",
                top: top + "px",
                left: (pos.left + 10) + "px",
                zIndex: 9999
            });

            /* append data to the menu */
            this.contextMenuEl.append("<ul id='" + contextMenuId + "_ul'></ul>");
            this.appendMenuItems(this.contextMenuEl.find("ul"));
            this.createContextMenu(); // Extensibility point for third party libraries to render the context menu

            /* hide if clicked outside */
            var that = this;

            this.mouseInside = false;
            this.contextMenuEl.hover(function () {
                that.mouseInside = true;
            },
                function () {
                    that.mouseInside = false;
                });

            $("body").bind('mouseup.' + that.contextMenuEl.selector, function () {
                if (!that.mouseInside) {
                    that.contextMenuEl.remove(); 
                    $("body").unbind('mouseup.' + contextMenuId);
                }
            });
        },

        appendMenuItems: function (parentUL) {
            var that = this;
            var menuItemIndex = 0;
            
            // NOTE: Sub-menus are not currently supported
            this.collection.forEach(function(menuItem) {
                var liId = (parentUL.id || parentUL[0].id) + "_li_" + menuItemIndex++;

                // TODO: Use a template, or make each item a sub-view
                parentUL.append("<li id='" + liId + "' action='" + menuItem.get('action') + "' class=' " + (menuItem.get('isDefaultAction') ? "defaultAction" : "") + " '>" + menuItem.get('text') + "</li>");
                var liEL = parentUL.find("#" + liId);
                liEL.unbind("click");

                liEL.click(function(e) {
                    if (!e)
                        e = window.event; //if (!e) var  = $.event.fix(event || window.event);

                    if (e.stopPropagation)
                        e.stopPropagation();
                    else
                        e.cancelBubble = true;

                    menuItem.menuItemSelected(menuItem.get('action'));
                    that.contextMenuEl.remove();
                });
            });
        },

        /* must be overidden if a custom context menu is wanted */
        createContextMenu: function () {
            this.contextMenuEl.show();
        },
        
        destroyView: function () {

            // COMPLETELY UNBIND THE VIEW
            this.undelegateEvents();

            $(this.contextMenuEl).removeData().unbind();

            // Remove view from DOM
            this.contextMenuEl.remove();
            Backbone.View.prototype.remove.call(this);

        }
    });
});
