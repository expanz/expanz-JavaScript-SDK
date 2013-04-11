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

    window.expanz.views.CustomContentView = Backbone.View.extend({
        
        initialize: function() {
            this.model.bind("customcontent:contentPublished", this.onContentPublished, this);
        },

        onContentPublished: function () {
            var args = { handled: false };
            
            this.$el.trigger("customcontent:contentPublished", [
				this.model, this, args
            ]);
        }
    });
});
