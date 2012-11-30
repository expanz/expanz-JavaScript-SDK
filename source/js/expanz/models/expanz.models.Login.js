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

	window.expanz.models.Login = expanz.models.Bindable.extend({

	    defaults: function () {
	        return {
	            error: false,
	            isLoggingIn: false
	        };
	    },

	    initialize: function () {
	        this.messageCollection = new expanz.models.MessageCollection();
	    },

	    login: function (userName, password, isPopup) {
	        var that = this;

	        this.set({
	             isLoggingIn: true
	        });
	            
	        var loginCallback = function (error) {
	            if (error && error.length > 0) {
	                this.get('error').set({
	                    value: error
	                });
	            }
	            else {
	                expanz.net.GetSessionDataRequest({
	                    success: function (url) {
	                        if (isPopup) {
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
	                    },
	                        
	                    error: function (message) {
	                        that.set({
	                            isLoggingIn: false
	                        });
	                    }
	                });
	            }
	        };
	            
	        expanz.net.CreateSessionRequest(userName, password, {
	            success: loginCallback,
	            error: function (message) {
	                that.messageCollection.addErrorMessageByText(message);
	                
	                that.set({
	                    isLoggingIn: false
	                });
	            }
	        });
	    }
	});
});
