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

    window.expanz.views.LoginView = Backbone.View.extend({

        initialize: function () {
            this.model.bind("change:isLoggingIn", this.isLoggingInChanged(), this);

            // Look for a message control within the view
            this.messageControl = this.$el.find('[bind=messageControl]');
            
            if (this.messageControl.length === 0) {
                // Message control not found within the view - look in the page
                this.messageControl = $('[bind=messageControl]');
            }

            if (this.messageControl.length !== 0) {
                var $messageControl = $(this.messageControl);
                
                var view = new expanz.views.MessagesView({
                    id: $messageControl.attr('id'),
                    collection: this.model.messageCollection
                });

                $messageControl.html(view.render().el);
            }
        },

        events: {
            "click [type='submit']": "attemptLogin"
        },

        attemptLogin: function () {
            this.model.messageCollection.reset();
            
            var usernameEl = this.$el.find("#username input");
            var passwordEl = this.$el.find("#password input");
            
            if (usernameEl.length === 0 || passwordEl.length === 0) {
                alert("Username or password field cannot be found on the page");
            }
            else if (usernameEl.val().length === 0 || passwordEl.val().length === 0) {
                this.model.messageCollection.addErrorMessageByKey("loginOrPasswordEmpty");
            }
            else {
                this.model.login(usernameEl.val(), passwordEl.val(), this.$el.attr('type') == 'popup');
            }
        },

        isLoggingInChanged: function () {
            var view = this;
            return function () {
                var isLoggingIn = this.model.get("isLoggingIn");

                if (isLoggingIn) {
                    $("#signinButton").attr("disabled", true);
                } else {
                    $("#signinButton").removeAttr("disabled");
                }
            };
        },
    });
});
