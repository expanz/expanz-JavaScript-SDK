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

    window.expanz.views.FieldView = Backbone.View.extend({

        initialize: function () {
            this.model.bind("change:label", this.modelUpdate('label'), this);
            this.model.bind("change:value", this.modelUpdate('value'), this);
            this.model.bind("change:text", this.modelUpdate('text'), this);
            this.model.bind("change:items", this.modelUpdate('value'), this);
            this.model.bind("change:visualType", this.modelUpdate('visualType'), this);
            this.model.bind("change:errorMessage", this.displayError(), this);
            this.model.bind("change:loading", this.loading, this);
        },

        modelUpdate: function (attr) {
            var view = this;
            return function () {
                var elem = this.el.find('[attribute=' + attr + ']');
                expanz.views.updateViewElement(view, elem, this.model.attributes, attr);
                //view.render();
                this.el.trigger('update:field');
            };
        },

        displayError: function () {
            return function () {
                var errorId = 'error' + this.model.get('id').replace(/\./g, "_");
                if (this.el.attr('showError') !== 'false') {
                    var errorEl;
                    if (this.model.get('errorMessage') !== undefined) {
                        errorEl = this.el.find('#' + errorId);
                        if (errorEl.length < 1) {
                            this.el.append('<p class="errorMessage" onclick="javascript:$(this).hide();" style="display:inline" id="' + errorId + '"></p>');
                            errorEl = this.el.find('#' + errorId);
                        }
                        errorEl.html(this.model.get("errorMessage"));
                        errorEl.show();
                        errorEl.css('display', 'inline');
                        this.el.addClass("errorField");
                        // window.expanz.logToConsole("showing error : " + this.model.get("errorMessage"));
                    }
                    else {
                        errorEl = this.el.find('#' + errorId);
                        if (errorEl) {
                            errorEl.hide();
                        }
                        this.el.removeClass("errorField");
                        // window.expanz.logToConsole("hiding error message");
                    }
                }

            };
        },

        events: {
            "change [attribute=value]": "viewUpdate"
        },

        getValue: function () {
            var elem = this.el.find('[attribute=value]');

            var value = null;
            // handle checkbox field case
            if ($(elem).is(":checkbox")) {
                var checkedValue = $(elem).attr("checkedValue") !== undefined ? $(elem).attr("checkedValue") : 1;
                var uncheckedValue = $(elem).attr("uncheckedValue") !== undefined ? $(elem).attr("uncheckedValue") : 0;
                value = $(elem).prop("checked") ? checkedValue : uncheckedValue;
            }
            else {
                value = $(elem).val();
            }
            return value;

        },

        viewUpdate: function (event) {
            // handle multi-choices
            if (this.model.get('items') !== undefined && this.model.get('items').length > 0) {
                this.model.update({
                    value: (event.target.checked ? 1 : -1) * (event.target.value)
                });
            }
            else {
                this.model.update({
                    value: this.getValue()
                });
            }

            this.el.trigger('update:field');
        },

        loading: function () {
            /* nothing special done when a field is loading at the moment */
        }

    });
});
