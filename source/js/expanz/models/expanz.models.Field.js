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
$(function() {

	window.expanz = window.expanz || {};
	window.expanz.models = window.expanz.models || {};

	window.expanz.models.Field = expanz.models.Bindable.extend({

	    _type: 'Field',

	    defaults: function () {

	        return {
	            error: false
	        };
	    },

	    validate: function (attrs) {
	        // window.expanz.logToConsole("validating field " + this.get('id'));
	    },

	    update: function (attrs) {
	        if (this.get('parent').isAnonymous()) {
	            this.set({
	                lastValue: attrs.value
	            });
	        }
	        else {
	            expanz.Net.DeltaRequest(this.get('id'), attrs.value, this.get('parent'));
	        }
	        return;
	    },

	    publish: function (xml) {
	        if (xml.attr !== undefined) {
	            if ((this.get('value') && (this.get('value') != xml.attr('value'))) || !this.get('value')) {

	                if (xml.attr('disabled')) {
	                    this.set({
	                        disabled: boolValue(xml.getAttribute !== undefined ? xml.getAttribute('disabled') : xml.attr('disabled'))
	                    });
	                }

	                this.set({
	                    items: xml.find("Item"),
	                    text: xml.attr('text'),
	                    value: xml.attr('value') == '$longData$' ? xml.text() : xml.attr('value')
	                });
	            }

	            if (xml.attr('visualType')) {
	                this.set({
	                    visualType: xml.attr('visualType')
	                });
	            }

	            /* remove error message if field is valid */
	            if (boolValue(xml.attr('valid')) && this.get('errorMessage') !== undefined) {
	                this.set({
	                    'errorMessage': undefined
	                });

	            }

	            if (this.get('url') && (this.get('url') != xml.attr('url'))) {
	                this.set({
	                    value: xml.attr('url')
	                });
	            }
	        } else {
	            window.expanz.logToConsole("window.expanz.models.Field: xml.attr is undefined");
	        }
	    },

	    publishData: function (xml) {
	        // Only variant panels will use this method. They consume data publications, but 
	        // they behave more like fields than data publications (ie. they don't register as 
	        // data publications with the activity).
	        if (xml.attr !== undefined) {
	            // Unset required, as the set function in FireFox and IE doesn't seem to recognise
	            // that the data has changed, and thus doesn't actually change the value or raise
	            // the change event
	            this.unset("data", {
	                silent: true
	            });

	            this.set({
	                data: xml
	            });
	        }
	    }
	});
});
