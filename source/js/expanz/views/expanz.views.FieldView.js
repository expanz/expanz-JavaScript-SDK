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
            this.model.bind("change:date", this.modelUpdate('date'), this);
            this.model.bind("change:time", this.modelUpdate('time'), this);
            this.model.bind("change:DayOfWeek", this.modelUpdate('DayOfWeek'), this);
            this.model.bind("change:time24", this.modelUpdate('time24'), this);
            this.model.bind("change:timeAMPM", this.modelUpdate('timeAMPM'), this);
            this.model.bind("change:data", this.publishData, this);
            this.model.bind("change:disabled", this.onDisabledChanged, this);
            this.model.bind("change:hidden", this.onHiddenChanged, this);
            this.model.bind("change:errorMessage", this.displayError(), this);
            this.model.bind("change:loading", this.loading, this);
            this.model.bind("setFocus", this.setFocus, this);
        },

        modelUpdate: function (attr) {
            var view = this;
            
            return function () {
                var elem = null;

                if (this.$el.attr("attribute") === "value")
                    elem = this.$el;
                else
                    elem = this.$el.find('[attribute=' + attr + ']');
                
                expanz.views.updateViewElement(view, elem, this.model.attributes, attr, this.model);
                view.render();
                
                this.$el.trigger('update:field');
            };
        },

        publishData: function () {
            this.$el.trigger("publishData", [
				this.model.get("data"), this
            ]);
        },
        
        onDisabledChanged: function () {
            // If the field is disabled, apply the disabled attribute and style
            if (this.model.get("disabled") === true) {
                this.$el.attr('disabled', true);
                this.$el.addClass('readonlyInput');
            } else {
                this.$el.removeAttr('disabled');
                this.$el.removeClass('readonlyInput');
            }
            
            var inputElement = this.getInputElement();

            if (inputElement === undefined || inputElement === null)
                inputElement = this.$el;
            
            inputElement.trigger("disabledChanged", this.model.get("disabled"));
        },
        
        onHiddenChanged: function () {
            // If the field is hidden, hide the element
            var isVisible = !this.model.get("hidden");

            setVisibility(this.$el, isVisible);
            
            this.$el.trigger("visibilityChanged", isVisible);
        },

        displayError: function () {
            return function () {
                var errorId = 'error' + this.model.get('id').replace(/\./g, "_");
                
                // TODO: Also change the label font colour to red?
                if (this.$el.attr('showError') !== 'false') {
                    var errorEl;
                    
                    if (this.model.get('errorMessage') !== undefined) {
                        errorEl = this.$el.find('#' + errorId);
                        
                        if (errorEl.length < 1) {
                            this.$el.append('<p class="errorMessage" id="' + errorId + '"></p>');
                            errorEl = this.$el.find('#' + errorId);
                        }
                        
                        errorEl.html(this.model.get("errorMessage"));
                        
                        this.$el.addClass("errorField");
                    }
                    else {
                        errorEl = this.$el.find('#' + errorId);
                        
                        if (errorEl) {
                            errorEl.remove();
                        }
                        
                        this.$el.removeClass("errorField");
                    }
                }

                this.getInputElement().trigger("errorChanged", this.model.get("errorMessage"));
            };
        },

        events: {
            "change [attribute=value]": "viewUpdate"
        },
        
        getInputElement: function () {
            if (this.$el.attr("attribute") === "value")
                return this.$el;
            else
                return this.$el.find('[attribute=value]');
        },

        getValue: function () {
            var elem = this.getInputElement();

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

            this.$el.trigger('update:field');
        },

        loading: function () {
            /* nothing special done when a field is loading at the moment */
        },

        setFocus: function () {
            var inputElement = this.getInputElement();
            
            if (inputElement != undefined && inputElement != null)
                inputElement.focus();
        }
    });
});
