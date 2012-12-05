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
            this.model.bind("change:label", this.labelChanged(), this);
            this.model.bind("change:loading", this.loading, this);
            this.model.bind("contextMenuLoaded", this.onContextMenuLoaded, this);

            this.$el = $(this.el); // Can be removed when upgrading to backbone 0.9+
        },

        events: {
            "click [attribute=submit]": "submit"
        },

        submit: function () {
            this.model.submit();
            this.$el.trigger('submit:' + this.model.get('id'));
        },

        labelChanged: function () {
            return function () {
                this.getButton().text(this.model.get("label"));
            };
        },

        loading: function () {
            if (this.model.get('loading') === true) {
                this.getButton().attr('disabled', 'disabled');
                this.$el.addClass('methodLoading');
            }
            else {
                this.getButton().removeAttr('disabled');
                this.$el.removeClass('methodLoading');
            }
        },

        getButton: function () {
            var buttonElement = this.$el;
            
            if (this.$el.is(":button")) {
                buttonElement = this.$el;
            }
            else {
                var buttons = this.$el.find("button");
                
                if (buttons.length != 0) {
                    buttonElement = buttons;
                }
                else {
                    var hyperlinks = this.$el.find("a");
                    
                    if (hyperlinks.length != 0)
                        buttonElement = hyperlinks;
                }
            }

            return buttonElement;
        },

        onContextMenuLoaded: function () {
            if (this.model.contextMenuModel.length !== 0) {
                var contextMenuView = new expanz.views.ContextMenuView({
                    el: this.el,
                    id: this.model.id,
                    //className: $(this).attr('class'),
                    collection: this.model.contextMenuModel
                });

                contextMenuView.render();
            }
        }
    });
});
