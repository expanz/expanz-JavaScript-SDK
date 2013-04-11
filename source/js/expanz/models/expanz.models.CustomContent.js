////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Chris Anderson
//  Copyright 2008-2013 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////

$(function () {

    window.expanz = window.expanz || {};
    window.expanz.models = window.expanz.models || {};

    window.expanz.models.CustomContent = Backbone.Model.extend({

        publish: function ($rawXml) {
            // Content has been published to this model, so notify the associated view by raising an event.
            // Adapters can parse this content as they wish.
            this.$rawXml = $rawXml;
            this.trigger("customcontent:contentPublished");
        }
    });
});
