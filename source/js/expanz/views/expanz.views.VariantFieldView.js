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

    window.expanz.views.VariantFieldView = window.expanz.views.FieldView.extend({

        template: _.template("<input id='textinput' attribute='value' type='text' style='display: none' /> " +
	                         "<label id='booleaninput' style='display: none'><input attribute='value' type='checkbox' /> Yes / I Agree</label>" +
	                         "<div id='options' style='display: none' />"),

        initialize: function () {
            //this.model.bind("change:label", this.modelUpdate('label'), this);
            this.model.bind("change:value", this.valueChanged(), this);
            this.model.bind("change:data", this.dataChanged(), this);
            this.model.bind("change:visualType", this.visualTypeChanged(), this);
            this.model.bind("change:disabled", this.onDisabledChanged, this);
            this.model.bind("change:hidden", this.onHiddenChanged, this);
            this.model.bind("change:errorMessage", this.displayError(), this);
            this.model.bind("change:loading", this.loading, this);

            this.$el = $(this.el); // Can be removed when upgrading to backbone 0.9+
            
            this.$el.html(this.template({ 'name': this.$el.attr('name') }));

            this.textInput = this.$el.find('[id=textinput]');
            this.booleanControl = this.$el.find('[id=booleaninput]');
            this.booleanInput = this.booleanControl.find('[attribute=value]');
            this.optionInput = this.$el.find('[id=options]');
        },

        visualTypeChanged: function () {
            var view = this;
            return function () {
                view.render();
                this.$el.trigger('update:field');
            };
        },

        valueChanged: function () {
            var view = this;
            return function () {
                this.updateActiveInputValue(this.model.get("value"));
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

                this.updateActiveInputValue(this.model.get("value"));

                this.$el.trigger('update:field');
            };
        },

        render: function () {
            this.textInput.hide();
            this.booleanControl.hide();
            this.optionInput.hide();

            var inputField = this.activeInputField();

            if (inputField != null) {
                this.updateActiveInputValue(this.model.get("value"));

                this.activeInputControl().show();
            }

            return this;
        },

        getValue: function () {
            var value = null;

            var visualType = this.model.get("visualType");

            if (visualType == "cb") {
                value = boolString(this.booleanInput.prop("checked"));
            } else if (visualType == 'rb') {
                var selectedCheckBox = this.optionInput.find(":checked"); // Gets the selected radio button
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
        
        updateActiveInputValue: function (value) {
            var visualType = this.model.get("visualType");
            
            if (visualType == 'cb') {
                this.booleanInput.prop("checked", value == 1);
            } else if (visualType == 'rb') {
                var selectedCheckBox = this.optionInput.find("[value=" + value + "]"); // Gets the radio button to be selected
                selectedCheckBox.prop("checked", true);
            } else if (visualType == 'txt') {
                this.textInput.val(value);
            }
        }
    });
});
