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

    window.expanz.views.DependantFieldView = Backbone.View.extend({

        initialize: function () {
            this.model.bind("change:value", this.toggle, this);
            this.el.hide();
        },

        toggle: function () {
            var elem = this.el.find('[attribute=value]');
            expanz.views.updateViewElement(this, elem, this.model.get('value'));

            if (this.model.get('value').length > 0) {
                this.el.show('slow');
            }
            else {
                this.el.hide('slow');
            }
        }

    });
});
