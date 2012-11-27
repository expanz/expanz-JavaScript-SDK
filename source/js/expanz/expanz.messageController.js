////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function() {

    window.expanz = window.expanz || {};

    window.expanz.defaultCallbacks = {
        success: function(message) {
            expanz.messageController.addSucessMessageByText(message);
        },
        error: function(message) {
            expanz.messageController.addErrorMessageByText(message);
        },
        info: function(message) {
            expanz.messageController.addInfoMessageByText(message);
        }
    };

    window.expanz.messageController = {
        initialize: function() {

            /* load resource bundle */
            if (window.config._useBundle !== false) {
                jQuery.i18n.properties({
                    name: 'Messages',
                    path: 'assets/bundle/',
                    mode: 'map',
                    language: ' ', /* set to en to load Messages-en.properties as well, set to '' to load as well Messages-en-XX.properties - add to config.js if different for some customers */
                    cache: true,
                    callback: function() {
                        // window.expanz.logToConsole("Bundle loaded");
                    }
                });
            }
        },

        addErrorMessageByText: function(messageText) {
            this._addMessageByText(messageText, 'error');
        },

        addWarningMessageByText: function(messageText) {
            this._addMessageByText(messageText, 'warning');
        },

        addInfoMessageByText: function(messageText) {
            this._addMessageByText(messageText, 'info');
        },

        addSuccessMessageByText: function(messageText) {
            this._addMessageByText(messageText, 'success');
        },

        _addMessageByText: function(messageText, messageType) {
            if (window.config._useBundle === true) {
                /* find the key with regexp */
                if (typeof window.expanz.messageController.findKey != 'function') {
                    window.expanz.logToConsole('You need to define window.expanz.messageController.findKey in your client implementation');
                    return;
                }
                var data = window.expanz.messageController.findKey(messageText);
                if (data !== null) {
                    this._addMessageByKey(data['key'], data['data'], messageType, data['popup']);
                } else {
                    if (messageText !== "") {
                        this.displayMessage(messageText, messageType);
                        if (window.config._showAllMessages === true && messageText !== "") {
                            window.expanz.logToConsole(messageType + ': ' + messageText);
                        }
                    }
                }
            } else {
                this.displayMessage(messageText, messageType);
            }

        },

        /* server doesn't send key anymore so it will be for futur use */
        addErrorMessageByKey: function(messageKey, messageData) {
            this._addMessageByKey(messageKey, messageData, 'error');
        },

        addInfoMessageByKey: function(messageKey, messageData) {
            this._addMessageByKey(messageKey, messageData, 'info');
        },

        addWarningMessageByKey: function(messageKey, messageData) {
            this._addMessageByKey(messageKey, messageData, 'warning');
        },

        addSuccessMessageByKey: function(messageKey, messageData) {
            this._addMessageByKey(messageKey, messageData, 'success');
        },

        _addMessageByKey: function(messageKey, messageData, messageType, popup) {
            /* look for the key in message.properties file */
            var msg = jQuery.i18n.prop(messageKey, messageData);
            if (msg && msg.length > 0) {
                if (popup === true) {
                    this.displayPopupMessage(msg, messageType);
                } else {
                    this.displayMessage(msg, messageType);
                }
            } else {
                //this.displayMessage(messageKey, messageType);
                if (window.config._showAllMessages === true) {
                    //this.displayMessage('[Displayed for debugging only]' + messageKey + messageData, messageType);
                    window.expanz.logToConsole(messageType + ': ' + messageKey + messageData);
                }
            }

        },

        displayMessage: function(message, type) {
            if (type == 'error') {
                this._basicMsgDisplay('[bind=message][type=error]')(message);
            } else if (type == 'warning') {
                this._basicMsgDisplay('[bind=message][type=error]')(message);
            } else if (type == 'info') {
                this._basicMsgDisplay('[bind=message][type=info]')(message);
            } else if (type == 'success') {
                this._basicMsgDisplay('[bind=message][type=success]')(message);
            } else {
                window.expanz.logToConsole('type ' + type + ' unknown for message ' + message);
            }
        },

        displayPopupMessage: function(message, type) {
            alert(message);
        },

        _basicMsgDisplay: function(el) {
            return function display(str) {

                var fade = true;
                if ($(el).attr('fade') && boolValue($(el).attr('fade')) === false) {
                    fade = false;
                }

                if (str instanceof Array) {
                    str = str.join("<br/>");
                }

                var msgDisplayedInPopup = false;

                /* display the message in the popup instead if visible */
                if (window.expanz.currentPopup !== undefined && $(window.expanz.currentPopup.el).is(":visible")) {
                    var popupEl = window.expanz.currentPopup.el.find(el);
                    if (popupEl) {
                        msgDisplayedInPopup = true;
                        popupEl.find('[attribute=value]').html(str);
                        if (!str || str.length < 1) {
                            $(popupEl).hide('slow');
                        } else {
                            $(popupEl).show(1, function() {
                                if (fade) {
                                    $(popupEl).delay(5000).hide(1);
                                }
                            });
                        }
                    }
                }

                if (!msgDisplayedInPopup) {
                    if ($(el).find('[attribute=value]').length > 0) {
                        if (str && str.length > 0) {
                            // check if message already displayed
                            var existingMsgEl = null;
                            if ($(el).find('div:contains("' + str + '")').length > 0) {
                                existingMsgEl = $(el).find('div:contains("' + str + '")')[0];
                                $(existingMsgEl).remove();
                            }
                            // make the error div visible
                            $(el).show();
                            // push the new message a div in the error div (will fade and be removed automatically after 5 sec)
                            var newErrorId = 'msg_' + new Date().getTime();
                            var divMessage = "<div id='" + newErrorId + "' class='message_item' style='display:none'>" + str + "</div>";
                            $(el).find('[attribute=value]').append(divMessage);

                            var messageItem = $(el).find("#" + newErrorId);

                            //TODO Commented out, not working very well, need to find a better solution
                            // check if el is visible in the screen if not fix it to top of the visible page
                            /*if (!isVisibleOnScreen($(el))) {
                                // var top = document.body.scrollTop;
                                $(el).parent().css('top', "0px");
                                $(el).parent().css('position', 'fixed');
                                $(el).parent().css('z-index', '10000');
                            }
                            else {
                                $(el).parent().css('top', '');
                                $(el).parent().css('position', '');
                            }*/

                            messageItem.show();

                            messageItem.slideDown(100, function() {
                                if (fade) {
                                    messageItem.delay(5000).slideUp(800, function() {
                                        messageItem.remove();
                                        // if it was the last message in the message notification area, we hide the notification area.
                                        if ($(el).find("div").length === 0) {
                                            $(el).hide();
                                        }
                                    });
                                }
                            });
                            if (messageItem.length > 0) { // Execute if the slide Up/Down methods fail
                                setTimeout(function() {
                                    messageItem.remove();
                                    if ($(el).find("div").length === 0) {
                                        $(el).hide();
                                    }
                                }, 5000);
                            }
                        } else {
                            if (!fade) {
                                $(el).hide();
                            }
                        }
                    }
                }
            };
        }
    };
});