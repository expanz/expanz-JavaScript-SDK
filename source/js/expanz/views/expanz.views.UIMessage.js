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

    window.expanz.views.UIMessage = window.expanz.views.PopupView.extend({

        width: '500px',

        cssClass: 'uiMessage popupView',

        renderActions: function () {
            this.model.actions.forEach(function (action) {
                if (this.$el.find("[attribute=submit]").length === 0) {
                    this.$el.append("<br/>");
                }

                var divId = action.id;

                if (action.id == 'close') {
                    divId += action.get('label').split(' ').join('');
                    this.$el.append('<div style="float:left"  bind="method" name="close" id="' + divId + '">' + '<button attribute="submit">' + action.get('label') + '</button>' + '</div>');
                }
                else if (action.id !== this.model.id) {
                    this.$el.append('<div style="float:left" bind="method" name="' + action.id + '" id="' + divId + '">' + '<button attribute="submit">' + action.get('label') + '</button>' + '</div>');
                    var methodView = new expanz.views.MethodView({
                        el: $('div#' + action.id, this.el),
                        id: action.id,
                        model: action
                    });
                }

                /* if response data are present we have to send it during the click event as well */
                if (action.get('response') !== undefined) {
                    var button = this.$el.find('#' + divId + ' button');
                    var that = this;

                    button.click(function () {
                        that.postCloseActions(that.model.get('title'));

                        if (action.get('response').find("closeWindow")) {
                            if (that.parentPopup !== undefined) {
                                that.parentPopup.close();
                            }
                            else {
                                window.expanz.logToConsole("Cannot find parent popup");
                            }
                        }

                    });
                }

            }, this);

        },
        
        postCloseActions: function (windowTitle) {
            if (windowTitle == "Order Submitted" || windowTitle == "Order Saved") {
                /* clear activity cookies and reload the page */
                //window.expanz.Storage.clearActivityHandles();
                $("body").trigger("CheckoutFinished");
            }
        }
    });
});
