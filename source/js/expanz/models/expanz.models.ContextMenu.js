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
    window.expanz.models = window.expanz.models || {};

    window.expanz.models.ContextMenu = expanz.Collection.extend({

        model: expanz.models.MenuAction,

        initialize: function (attrs) {
            this.loading = false;

            this.contextId = attrs["contextId"] || attrs["id"];
            this.activity = attrs["activity"];
            this.type = attrs["type"];
            this.contextObject = attrs["contextObject"];
        },
        
        requestContextMenu: function () {
            expanz.net.CreateContextMenuRequest(this.activity, this.contextId, this.type, this.contextObject);
        },

        loadMenu: function (menuData, activityModel) {
            var $menuData = $(menuData);

            this.reset();

            var contextMenu = this;
            var defaultAction = $menuData.attr('defaultAction');

            $menuData.children().each(function () {
                var $this = $(this);

                if (this.nodeName === "MenuItem") {
                    contextMenu.add({
                        action: $this.attr('action'),
                        text: $this.attr('text'),
                        clientAction: $this.attr('clientAction'),
                        isDefaultAction: defaultAction === $this.attr('action'),
                        parentActivity: activityModel
                    });
                } else if (this.nodeName === "Menu") {
                    // Sub-menus not currently supported
                }
            });

            this.trigger("menuLoaded");
        }
    });
});
