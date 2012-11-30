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

    window.expanz.views.MessagesView = Backbone.View.extend({
        tagName: "ul",
        
        className: "notificationArea",

        initialize: function () {
            this.collection.bind('add', this.messageAdded, this);
            this.collection.bind('remove', this.messageRemoved, this);
            this.collection.bind('reset', this.collectionReset, this);
        },
        
        messageAdded: function (message) {
            var messageItemView = new window.expanz.views.MessageItemView({
               model: message 
            });

            var $messageControlElement = $(this.el);
            var $messageItemElement = $(messageItemView.el);
            
            $messageControlElement.append(messageItemView.render().el);
            $messageItemElement.show();

            var fade = true;
            //if ($(el).attr('fade') && boolValue($(el).attr('fade')) === false) {
            //    fade = false;
            //}
            
            $messageItemElement.slideDown(100, function () {
                if (fade) {
                    $messageItemElement.delay(5000).slideUp(800, function () {
                        $messageItemElement.remove();
                        // if it was the last message in the message notification area, we hide the notification area.
                        //if ($(el).find("div").length === 0) {
                        //    $(el).hide();
                        //}
                    });
                }
            });

            if ($messageItemElement.length > 0) { // Execute if the slide Up/Down methods fail
                setTimeout(function () {
                    $messageItemElement.remove();
                    
                    //if ($(el).find("div").length === 0) {
                    //    $(el).hide();
                    //}
                }, 5000);
            }
        },
        
        messageRemoved: function (message) {
            
        },
        
        collectionReset: function () {
            $(this.el).html("");
        }
    });
    
    // View for individual messages
    window.expanz.views.MessageItemView = Backbone.View.extend({
        tagName: "li",
        
        render: function () {
            // Set the className for this element based upon the type of the message (i.e. the error level)
            // TODO: Make this more easily user definable?  Class names should also be more meaningful
            switch (this.model.get("type").toLowerCase()) {
                case "error":
                case "warning":
                    this.el.className = "error";
                    break;
                case "info":
                case "success":
                    this.el.className = "info";
                    break;
                default:
                    this.el.className = "info";
                    break;
            }

            $(this.el).html(this.model.get("message"));
            
            return this;
        }
    });
});
