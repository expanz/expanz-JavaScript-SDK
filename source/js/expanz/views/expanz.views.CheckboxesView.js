﻿////////////////////////////////////////////////////////////////////////////////
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

    window.expanz.views.CheckboxesView = expanz.views.DataControlView.extend({
        publishData: function () {
            /* clean elements */
            this.$el.html();
            var that = this;
            /* no external component needed just have to draw the checkboxes and handle the clicks */

            _.each(this.model.get('xml').find('Row'), function (row) {
                var rowId = $(row).attr('id');
                var selected = boolValue($(row).attr('selected')) === true ? ' checked="checked" ' : '';
                _.each($(row).find('Cell'), function (cell) {
                    var text = $(cell).text();
                    var id = that.model.id.replace(/\./g, "_") + "_" + rowId;
                    that.$el.append("<div><input " + selected + " id='" + id + "' value='" + rowId + "' name='checkbox' type='checkbox'></input><span>" + text + "</span></div>");

                    /* handle checkboxes click */
                    that.$el.find("#" + id).click(function () {
                        // window.expanz.logToConsole(that.model.id + " filtered with " + $(this).val());
                        /* send negative value of id to say it has been unselected */
                        var val = $(this).val();
                        if (!$(this).is(":checked")) {
                            val = -val;
                        }
                        /* send the delta to the server */
                        that.model.updateItemSelected(val);
                    });

                });
            });

        }

    });
});
