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

    window.expanz.views.DataFieldView = window.expanz.views.FieldView.extend({

        initialize: function (params) {
            this.dataModel = params["dataModel"];
            
            this.model.bind("change:label", this.modelUpdate('label'), this);
            this.model.bind("change:value", this.valueChanged, this);
            this.model.bind("change:text", this.modelUpdate('text'), this);
            this.model.bind("change:items", this.modelUpdate('value'), this);
            //this.model.bind("change:data", this.dataChanged, this);
            this.model.bind("change:disabled", this.onDisabledChanged, this);
            this.model.bind("change:hidden", this.onHiddenChanged, this);
            this.model.bind("change:errorMessage", this.displayError(), this);
            this.model.bind("change:loading", this.loading, this);
            this.model.bind("setFocus", this.setFocus, this);
            
            this.dataModel.bind("update:xml", this.dataChanged, this);

            this.$el = $(this.el); // Can be removed when upgrading to backbone 0.9+
        },

        valueChanged: function () {
            var elem = this.getInputElement();
            var value = this.model.get("value");
            
            elem.val(value);
            elem.trigger("valueUpdated", [value, this.model]); // Extensibility point for adapters
        },

        dataChanged: function () {
            this.getInputElement().trigger("publishData", [
				this.dataModel.getAttr('xml'), this
            ]);
            
            // A value might have been added to the field (such as a dropdown list) that can now be selected 
            // since it will now be in the list (setting it earlier will have failed).
            this.valueChanged();
        }
    });
});