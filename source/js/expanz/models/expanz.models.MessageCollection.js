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

	window.expanz.models.MessageCollection = expanz.Collection.extend({

	    model: expanz.models.Message,

	    initialize: function () {
	        this.loading = false;
	        this.loadMessageResources();
	    },
	    
	    addMessage: function (messageInfo) {
	        this._addMessageByText(messageInfo.message, messageInfo.type);
	    },

        loadMessageResources: function () {
            /* load resource bundle */
            if (window.config._useBundle !== false) {
                jQuery.i18n.properties({
                    name: 'Messages',
                    path: config._messageBundlePath,
                    mode: 'map',
                    language: ' ', /* set to en to load Messages-en.properties as well, set to '' to load as well Messages-en-XX.properties - add to config.js if different for some customers */
                    cache: true,
                    callback: function () {
                        // window.expanz.logToConsole("Bundle loaded");
                    }
                });
            }
        },

	    // TODO: Turn the following 4 methods into 1, with an enumeration parameter?
        addErrorMessageByText: function (messageText) {
            this._addMessageByText(messageText, 'error');
        },

        addWarningMessageByText: function (messageText) {
            this._addMessageByText(messageText, 'warning');
        },

        addInfoMessageByText: function (messageText) {
            this._addMessageByText(messageText, 'info');
        },

        addSuccessMessageByText: function (messageText) {
            this._addMessageByText(messageText, 'success');
        },
	    
        // TODO: Move message transformation into an external js file, so it's not MessageCollection specific (also used by fields themselves)
        transformMessage: function(messageText) {
            if (window.config._useBundle === true) {
                // Pass the message to an implementation specific message converter, that may
                // transform the message from the server to something more suitable for display
                var data = null;

                if (typeof window.expanz.findMessageKey == 'function') {
                    data = window.expanz.findMessageKey(messageText);
                } else {
                    expanz.logToConsole("window.expanz.findMessageKey not found in your implementation");
                }

                if (data !== null) {
                    messageText = jQuery.i18n.prop(data['key'], data['data']);
                }
            }

            return messageText;
        },
	    
        _addMessageByText: function (messageText, messageType) {
            messageText = this.transformMessage(messageText);
            
            if (messageText !== "") {
                this.add({
                    type: messageType,
                    message: messageText
                });
                        
                if (window.config._showAllMessages === true) {
                    window.expanz.logToConsole(messageType + ': ' + messageText);
                }
            }
        },

        // TODO: Turn the following 4 methods into 1, with an enumeration parameter?
        addErrorMessageByKey: function (messageKey, messageData) {
            this._addMessageByKey(messageKey, messageData, 'error');
        },

        addInfoMessageByKey: function (messageKey, messageData) {
            this._addMessageByKey(messageKey, messageData, 'info');
        },

        addWarningMessageByKey: function (messageKey, messageData) {
            this._addMessageByKey(messageKey, messageData, 'warning');
        },

        addSuccessMessageByKey: function (messageKey, messageData) {
            this._addMessageByKey(messageKey, messageData, 'success');
        },

        _addMessageByKey: function (messageKey, messageData, messageType, popup) {
            // Look for the key in message.properties file, and convert it to a message
            var messageText = jQuery.i18n.prop(messageKey, messageData);
            
            if (messageText && messageText.length > 0) {
                var messageModel = {
                    type: messageType,
                    key: messageKey,
                    source: null,
                    messageSource: null,
                    message: messageText,
                    popup: popup
                };

                this.add(messageModel);
            } else {
                if (window.config._showAllMessages === true) {
                    window.expanz.logToConsole(messageType + ': ' + messageKey + messageData);
                }
            }
        }
	});
});
