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

        initialize: function () {
            this.collection.bind('add', this.messageAdded, this);
            this.collection.bind('remove', this.messageRemoved, this);
            this.collection.bind('reset', this.collectionReset, this);
        },
        
        messageAdded: function (message) {
            var messageView = new window.expanz.views.MessageView({
               model: message 
            });

            $(this.el).append(messageView.render().el);
        },
        
        messageRemoved: function (message) {
            
        },
        
        collectionReset: function () {
            $(this.el).html("");
        }
    });
    
    // View for individual messages
    window.expanz.views.MessageView = Backbone.View.extend({
        tagName: "li",

        className: "error",
        
        render: function () {
            $(this.el).html(this.model.get("message"));
            return this;
        }
    });
});
