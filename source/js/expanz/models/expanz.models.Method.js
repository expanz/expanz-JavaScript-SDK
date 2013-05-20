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

	window.expanz.models.Method = expanz.models.Bindable.extend({

	    _type: 'Method',

	    submit: function () {
	        window.expanz.currentContextMenu = this; // Used for context menu buttons, as need a way to know which button was pressed when handling response. TODO: Find a better way.

	        var anonymousFields = [];

	        if (this.get('anonymousFields')) {
	            $.each(this.get('anonymousFields'), function (index, value) {
	                if (value instanceof expanz.models.DataPublication) {
	                    anonymousFields.push({
	                        id: value.get('dataId'),
	                        value: value.get('lastValues') || ""
	                    });
	                }
	                else {
	                    anonymousFields.push({
	                        id: value.get('id'),
	                        value: value.get('lastValue') || ""
	                    });
	                }
	            });
	        }

	        var methodAttributes = [
				{
				    name: "contextObject",
				    value: this.get('contextObject')
				}
	        ];

	        if (this.get('methodAttributes')) {
	            methodAttributes = methodAttributes.concat(this.get('methodAttributes'));
	        }

	        /* bind eventual dynamic values -> requiring user input for example, format is %input_id% */
	        /* input id must be unique in the page */
	        methodAttributes = methodAttributes.clone();
	        
	        for (var i = 0; i < methodAttributes.length; i++) {
	            var value = methodAttributes[i].value;
	            var inputField = /^%(.*)%$/.exec(value);
	            
	            if (inputField) {
	                methodAttributes[i].value = $("#" + inputField[1]).val();
	            }
	        }

	        expanz.net.MethodRequest(this.get('id'), methodAttributes, null, this.get('parent'), anonymousFields);
	    },

	    publish: function (xml) {
	        if (xml.attr !== undefined) {
	            if (xml.attr('label')) {
	                this.set({
	                    label: xml.attr('label')
	                });
	            }
	            
	            if (xml.attr('state')) {
	                this.set({
	                    state: xml.attr('state')
	                });
	            }
	        } else {
	            window.expanz.logToConsole("window.expanz.models.Method: xml.attr is undefined");
	        }
	    },

	    /* add an anonymous field or datacontrol to the method, will be added to the xml message when the method is called */
	    addAnonymousElement: function (element) {
	        var anonymousFields = this.get('anonymousFields');
	        
	        if (anonymousFields === undefined || anonymousFields === null) {
	            anonymousFields = [];
	        }
	        
	        anonymousFields.push(element);
	        
	        this.set({
	            anonymousFields: anonymousFields
	        });
	    },
        
	    setContextMenu: function(contextMenuModel) {
	        this.contextMenuModel = contextMenuModel;
	        this.trigger("contextMenuLoaded"); // The view will respond to this and create and render the context menu view
	    }
	});
});
