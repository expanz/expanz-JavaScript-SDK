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
$(function() {

	window.expanz = window.expanz || {};
	window.expanz.models = window.expanz.models || {};
	window.expanz.models.Login = {};

	window.expanz.models.Login = expanz.Collection.extend({

	    collection: expanz.models.Bindable,

	    initialize: function (attrs) {
	        expanz.Collection.prototype.initialize.call(this, attrs);
	    },

	    validate: function () {
	        if (!this.get('username').get('error') && !this.get('password').get('error')) {
	            return true;
	        }
	        else {
	            return false;
	        }
	    },

	    login: function () {
	        if (this.validate()) {
	            var that = this;
	            var loginCallback = function (error) {
	                if (error && error.length > 0) {
	                    this.get('error').set({
	                        value: error
	                    });
	                }
	                else {
	                    expanz.Net.GetSessionDataRequest({
	                        success: function (url) {
	                            if (that.getAttr('type') == 'popup') {
	                                // reload the page
	                                window.location.reload();
	                            }
	                            else {

	                                /*
									 * NOT IMPLEMENTED YET...problem with url where sessionHandle and activityHandle are GET parameters var urlBeforeLogin = expanz.Storage.getLastURL(); if(urlBeforeLogin !== null && urlBeforeLogin != ''){ expanz.Storage.clearLastURL(); expanz.views.redirect(urlBeforeLogin);
									 * return; }
									 */
	                                // redirect to default activity
	                                expanz.views.redirect(url);
	                            }

	                        }
	                    });
	                }
	            };
	            expanz.Net.CreateSessionRequest(this.get('username').get('value'), this.get('password').get('value'), {
	                success: loginCallback,
	                error: function (message) {
	                    expanz.messageController.addErrorMessageByText(message);
	                }
	            });
	        }
	    }
	});
});
