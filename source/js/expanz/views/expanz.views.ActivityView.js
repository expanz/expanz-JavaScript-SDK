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

    window.expanz.views.ActivityView = Backbone.View.extend({

        initialize: function (attrs) {
            Backbone.View.prototype.initialize.call(attrs);
            if (attrs.key) {
                this.key = attrs.key;
            }

            this.messageControl = null;
            
            this.collection.bind("error", this.updateError, this);
            this.collection.bind("update:loading", this.loading, this);
            this.collection.bind("update:deltaLoading", this.deltaLoading, this);
        },

        updateError: function (model, error) {
            this.collection.messageCollection.addErrorMessageByText(error);
        },

        events: {
            "update:field": "update"
        },

        update: function () {
            // perform full activity validation after a field updates ... if
            // necessary
        },

        loading: function () {
            var loadingId = "Loading_" + this.id.replace(/\./g, "_");
            var loadingEL = $(this.el).find("#" + loadingId);
            if (loadingEL.length === 0) {
                $(this.el).append('<div class="loading" id="' + loadingId + '"><span>Loading content, please wait.. <img src="assets/images/loading.gif" alt="loading.." /></span></div>');
                loadingEL = $(this.el).find("#" + loadingId);
            }

            var isLoading = this.collection.getAttr('loading');
            if (isLoading) {
                var off = this.el.offset();
                /* set the loading element as a mask on top of the div to avoid user doing any action */
                $(this.el).addClass('activityLoading');
                loadingEL.css("position", "absolute"); /* parent need to be relative //todo enfore it ? */
                loadingEL.css('width', '100%');
                loadingEL.css('height', '100%');
                loadingEL.css('margin', '0');
                loadingEL.css('padding', '0');
                loadingEL.css('top', '0px');
                loadingEL.css('left', '0px');
                loadingEL.css('z-index', '999');
                loadingEL.css('overflow', 'hidden');
                loadingEL.find("span").center();
                loadingEL.css('background', 'url(data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==) center');

                loadingEL.show();
            }
            else {
                $(this.el).removeClass('activityLoading');
                loadingEL.hide();
            }

        },

        deltaLoading: function () {
            var deltaLoading = this.collection.getAttr('deltaLoading');

            var initiatorID = deltaLoading.initiator.id;
            var initiatorType = deltaLoading.initiator.type;

            var initiator = this.collection.get(initiatorID);
            if (initiator) {
                // window.expanz.logToConsole("delta method loading " + deltaLoading.isLoading + " " + initiatorID);
                initiator.set({
                    loading: deltaLoading.isLoading
                });
            }
            else {
                /* most probably coming from a grid/list view */
                /* in that case the button has already been set in a loading state so we just switch it back to normal when loading is finished */
                if (initiatorType == 'method' && !deltaLoading.isLoading) {
                    /* can be either a element with methodName or a name */
                    var actionSelector = ".actionLoading[methodName='" + initiatorID + "'], [name='" + initiatorID + "'] .actionLoading, .actionLoading[autoUpdate='" + initiatorID + "']";
                    var dataControlEl = this.el.find(actionSelector).first().closest("[bind='DataControl']");
                    if (dataControlEl && dataControlEl.length > 0) {
                        dataControlEl.find(actionSelector).removeAttr('disabled');
                        dataControlEl.find(actionSelector).removeClass('actionLoading');
                    }
                }
            }
        }

    });
});
