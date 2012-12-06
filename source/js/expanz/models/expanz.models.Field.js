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
	            expanz.net.DeltaRequest(this.get('id'), attrs.value, this.get('parent'));
	        }
	        return;
	    },

	    publish: function (xml) {
	        if (xml.attr !== undefined) {
	            // Assign all the attributes on the XML element to the model, except for
	            // those that need special processing later.
	            var ignoreAttributeList = ['id', 'value', 'visualType']; // Attributes in this list will be handled manually later, as they need special processing
	            var boolAttributeList = ['disabled', 'hidden', 'null', 'valid']; // Attributes in this list will be converted to a boolean value
	            var model = this;
	            
	            _.each(xml[0].attributes, function (item) {
	                var processAttribute = _.indexOf(ignoreAttributeList, item.name) === -1;
	                
	                if (processAttribute) {
	                    var attributeValue = item.value;
	                    var convertValueToBool = _.indexOf(boolAttributeList, item.name) !== -1;
	                    
	                    if (convertValueToBool) {
	                        attributeValue = boolValue(attributeValue);
	                    }
	                    
	                    // TODO: When updating to backbone 0.9+, the following lines can be replaced with this one:
	                    //model.set(item.name, attributeValue);
	                    var property = {};
	                    property[item.name] = attributeValue;
	                    model.set(property);
	                    model.attributes[item.name] = attributeValue;
	                }
	            });
	            
	            // Now do special attribute processing. Reasons for processing these attributes separately include
	            // needing to be processed in a specific order, or needing their values transformed (e.g. converted 
	            // to bool, long data handling, etc)
	            if ((this.get('value') && (this.get('value') != xml.attr('value'))) || !this.get('value')) {
	                this.set({
	                    items: xml.find("Item"),
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
	            
                // TODO: Unsure why this is handled as such - to investigate
	            if (this.get('datatype') && this.get('datatype').toLowerCase() === 'blob' && xml.attr('url')) {
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
	    },

	    setFocus: function () {
	        this.trigger("setFocus");
	    }
	});
});
