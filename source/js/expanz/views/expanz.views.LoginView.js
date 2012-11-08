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
        },

        events: {
            "click [type*='submit']": "attemptLogin"
        },

        attemptLogin: function () {
            var usernameEl = this.el.find("#username input");
            var passwordEl = this.el.find("#password input");

            if (usernameEl.length === 0 || passwordEl.length === 0) {
                expanz.messageController.addErrorMessageByText("username or password field cannot be found on the page");
                return;
            }

            if (usernameEl.val().length === 0 || passwordEl.val().length === 0) {
                expanz.messageController.addErrorMessageByKey("loginOrPasswordEmpty");
                return;
            }
            else {
                this.collection.add({
                    id: "username",
                    value: usernameEl.val()
                });
                this.collection.add({
                    id: "password",
                    value: passwordEl.val()
                });
                this.collection.login();
            }

        }

    });
});
