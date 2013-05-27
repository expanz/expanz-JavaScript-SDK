////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Chris Anderson
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

    window.expanz.views.EnumCollectionFieldView = window.expanz.views.FieldView.extend({

        template: _.template("<div class='enumcollectionitem'><label><input type='checkbox' value='<%= value %>' <%= isSelected ? 'checked' : '' %> /> <%= text %></label><div>"),

        initialize: function () {
            this.model.bind("change:label", this.modelUpdate('label'), this);
            this.model.bind("change:disabled", this.onDisabledChanged, this);
            this.model.bind("change:hidden", this.onHiddenChanged, this);
            this.model.bind("change:errorMessage", this.displayError(), this);
            this.model.bind("change:loading", this.loading, this);
            this.model.items.bind("reset", this.onItemsChanged(), this);

            this.$contentArea = this.$el.find("[attribute=value]");

            if (this.$contentArea.length === 0)
                this.$contentArea = this.$el;
            
            this.$contentArea.html(""); // Clear the content area
        },

        onItemsChanged: function () {
            var view = this;
            return function () {
                view.render();
            };
        },

        render: function () {
            var view = this;
            
            this.$contentArea.html(""); // Clear the content area
            
            this.model.items.each(function (fieldItem) {
                view.$contentArea.append(view.template({ value: fieldItem.get("value"), text: fieldItem.get("text"), isSelected: fieldItem.get("isSelected") }));
            });

            return this;
        },

        viewUpdate: function (event) {
            this.model.update({
                value: (event.target.checked ? 1 : -1) * (event.target.value)
            });

            this.$el.trigger('update:field');
        }
    });
});