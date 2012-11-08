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

    // TODO: To extend FieldView???
    window.expanz.views.VariantFieldView = Backbone.View.extend({

        template: _.template("<input id='textinput' attribute='value' type='text' style='display: none' /> " +
	                         "<label id='booleaninput' style='display: none'><input attribute='value' type='checkbox' /> Yes / I Agree</label>" +
	                         "<div id='options' style='display: none' />"),

        initialize: function () {
            //this.model.bind("change:label", this.modelUpdate('label'), this);
            this.model.bind("change:value", this.valueChanged(), this);
            this.model.bind("change:data", this.dataChanged(), this);
            this.model.bind("change:visualType", this.visualTypeChanged(), this);
            this.model.bind("change:errorMessage", this.displayError(), this);
            this.model.bind("change:loading", this.loading, this);

            $(this.el).html(this.template({ 'name': $(this.el).attr('name') }));

            this.textInput = this.el.find('[id=textinput]');
            this.booleanControl = this.el.find('[id=booleaninput]');
            this.booleanInput = this.booleanControl.find('[attribute=value]');
            this.optionInput = this.el.find('[id=options]');
        },

        visualTypeChanged: function () {
            var view = this;
            return function () {
                view.render();
                this.el.trigger('update:field');
            };
        },

        valueChanged: function () {
            var view = this;
            return function () {
                var inputField = this.activeInputField();
                expanz.views.updateViewElement(view, inputField, this.model.attributes, 'value');
                this.el.trigger('update:field');
            };
        },

        dataChanged: function () {
            var view = this;
            return function () {
                this.optionInput.html("");

                var radioButtonItemTemplate = _.template("<div><label><input id='<%= id %>' name='<%= group %>' value='<%= rowId %>' attribute='value' type='radio' /> <%= label %></label></div>");

                var xml = this.model.get("data");

                _.each(xml.find('Row'), function (row) {
                    var fieldName = $(view.el).attr('name');
                    var rowId = $(row).attr('id');

                    var cell = $(row).find('Cell');

                    var label = $(cell).text();
                    var id = view.model.id.replace(/\./g, "_") + "_" + rowId;

                    view.optionInput.append(radioButtonItemTemplate({
                        'id': id,
                        'rowId': rowId,
                        'label': label,
                        'group': fieldName
                    }));
                });

                var selectedCheckBox = this.optionInput.find("[value=" + this.model.get("value") + "]"); // Gets the radio button to be selected
                selectedCheckBox.prop("checked", true);

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

        render: function () {
            this.textInput.hide();
            this.booleanControl.hide();
            this.optionInput.hide();

            var inputField = this.activeInputField();

            if (inputField != null) {
                expanz.views.updateViewElement(this, inputField, this.model.attributes, 'value');

                this.activeInputControl().show();
            }

            return this;
        },

        events: {
            "change [attribute=value]": "viewUpdate"
        },

        viewUpdate: function (event) {
            this.model.update({
                value: this.getValue()
            });

            this.el.trigger('update:field');
        },

        getValue: function () {
            var value = null;

            var visualType = this.model.get("visualType");

            if (visualType == "cb") {
                value = boolString(this.booleanInput.prop("checked"));
            } else if (visualType == 'rb') {
                var selectedCheckBox = $(this.el).find(":checked"); // Gets the selected radio button
                value = selectedCheckBox.val();
            } else if (visualType == 'txt') {
                value = this.textInput.val();
            }

            return value;

        },

        activeInputControl: function () {
            var visualType = this.model.get("visualType");
            var control = null;

            if (visualType == 'cb') {
                control = this.booleanControl;
            } else if (visualType == 'rb') {
                control = this.optionInput;
            } else if (visualType == 'txt') {
                control = this.textInput;
            }

            return control;
        },

        activeInputField: function () {
            // Returns the active input field. NOTE: Unlike activeInputControl, this returns the checkbox instance, not its surrounding label element
            var visualType = this.model.get("visualType");
            var control = null;

            if (visualType == 'cb') {
                control = this.booleanInput;
            } else {
                control = this.activeInputControl();
            }

            return control;
        },

        loading: function () {
            /* nothing special done when a field is loading at the moment */
        }

    });
});
