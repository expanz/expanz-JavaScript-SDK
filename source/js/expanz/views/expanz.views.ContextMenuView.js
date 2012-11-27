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

    window.expanz.views.ContextMenuView = window.expanz.views.MethodView.extend({
        initialize: function () {
            this.model.bind("change:data", this.modelUpdate, this);
        },

        _createMenu: function (xml, parentUL) {
            var that = this;
            var i = 0;
            xml.children("Menu").each(function () {
                var ulId = parentUL.id + "_" + i++;
                parentUL.append("<li>" + $(this).attr('name') + "<ul id='" + ulId + "'><ul></li>");
                that._createMenu($(this), parentUL.find("#" + ulId));
            });

            var defaultAction = xml.attr('defaultAction');
            var j = 0;
            xml.children("MenuItem").each(function () {
                var liId = (parentUL.id || parentUL[0].id) + "_li_" + j++;
                var defaultActionClass = "";
                if (defaultAction !== undefined && defaultAction == $(this).attr('action'))
                    defaultActionClass = "deafaultAction";
                parentUL.append("<li id='" + liId + "' action='" + $(this).attr('action') + "' class=' " + defaultActionClass + " '>" + $(this).attr('text') + "</li>");
                var liEL = parentUL.find("#" + liId);
                liEL.unbind("click");
                liEL.click(function (e) {
                    if (!e) var e = window.event; //if (!e) var  = $.event.fix(event || window.event);
                    if (e.stopPropagation)
                        e.stopPropagation();
                    else
                        e.cancelBubble = true;
                    that.model.menuItemSelected($(this).attr("action"));
                    that.contextMenuEl.hide();
                });
            });
        },
        
        modelUpdate: function () {
            /* retrieve or create a div to host the context menu */
            // window.expanz.logToConsole("modelUpdated");
            var contextMenuId;
            if (this.contextMenuEl === undefined) {
                contextMenuId = this.model.get('id').replace(/\./g, "_") + "_contextMenu";
                this.el.append("<div class='contextMenu' id='" + contextMenuId + "' />");
                this.contextMenuEl = this.el.find("#" + contextMenuId);
            }
            if (contextMenuId === undefined) {
                contextMenuId = (this.contextMenuEl.id || this.contextMenuEl[0].id);
            }
            this.contextMenuEl.hide();
            this.contextMenuEl.html("");

            var data = this.model.get('data');
            if (data === undefined || data === null)
                return;

            /* position menu below button */
            var pos = 0;
	
	    if (this.el.find("button").length > 0) {
		pos = this.el.find("button").position();
		var top = pos.top + this.el.find("button").outerHeight() + 2;
	    } else {
		pos = this.el.find("span").position();
		var top = pos.top + this.el.find("span").outerHeight() + 2;
	    }

            this.contextMenuEl.css({
                position: "absolute",
                top: top + "px",
                left: (pos.left + 10) + "px",	
		zIndex: 9999
            });

            /* append data to the menu */
            this.contextMenuEl.append("<ul id='" + contextMenuId + "_ul'></ul>");
            this._createMenu(data, this.contextMenuEl.find("ul"));
            this.createContextMenu();

            /* hide if clicked outside */
            var that = this;

            this.mouseInside = true;
            this.contextMenuEl.hover(function () {
                that.mouseInside = true;
            }, function () {
                that.mouseInside = false;
            });

            $("body").bind('mouseup.' + that.contextMenuEl.selector, function () {
                if (!that.mouseInside) {
                    that.contextMenuEl.hide();
                    $("body").unbind('mouseup.' + contextMenuId);
                }
            });
        },
        
        submit: function () {
            /* register current context menu */
            // window.expanz.logToConsole("Registering current context menu");
            window.expanz.currentContextMenu = this.model;
            this.model.submit();
            this.el.trigger('submit:' + this.model.get('id'));
        },

        /* must be overidden if a custom context menu is wanted */
        createContextMenu: function () {
            this.contextMenuEl.show();
        }

    });
});
