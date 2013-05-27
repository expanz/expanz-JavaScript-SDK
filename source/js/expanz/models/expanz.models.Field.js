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

	    initialize: function (params) {
	        this.items = new expanz.models.FieldItemCollection(); // Items are used in enum collection fields
	    },

	    update: function (attrs) {
	        this.set({
	                value: attrs.value
	            }, {
	                silent: true // Must be silent, or controls like the time adapter start behaving wierdly
	            });
	        
	        if (this.get('parent').isAnonymous()) {
	            this.set({
	                lastValue: attrs.value
	            });
	        }
	        else {
	            expanz.net.DeltaRequest(this.get('fieldId'), attrs.value, this.get('parent'));
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
	                    
	                    model.set(item.name, attributeValue);
	                }
	            });
	            
	            // Now do special attribute processing. Reasons for processing these attributes separately include
	            // needing to be processed in a specific order, or needing their values transformed (e.g. converted 
	            // to bool, long data handling, etc)
	            if (xml.is("[value]")) {
	                // Need to unset the value so that controls (like the time adapter) which rely on 
	                // a different attribute than the value attribute get change notifications. Essentially,
	                // this just forces the change event to be triggered when the value is set.
	                this.unset("value", {
	                    silent: true
	                });
	                
	                this.set({
	                    value: xml.attr('value') == '$longData$' ? xml.text() : xml.attr('value')
	                });
	            }
	            
	            if (xml.find("Item").length !== 0) {
	                // Items are used in enum collection fields
	                var items = [];
	                
	                xml.find("Item").each(function () {
	                    var $item = $(this);
	                    items.push({ value: $item.attr("value"), text: $item.attr("text"), isSelected: boolValue($item.attr("selected")) });
	                });
	                
                    // NOTE: The EnumCollectionFieldView is listening for the reset event
	                this.items.reset(items);
                }

	            if (xml.is('[visualType]')) {
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
	        // Variant panels will use this method. They consume data publications,
	        // but they behave more like fields than data publications (ie. they don't register as 
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
    
	window.expanz.models.FieldItem = expanz.models.Bindable.extend({
	    
	});

	window.expanz.models.FieldItemCollection = expanz.Collection.extend({
	    model: expanz.models.FieldItem
	});
});
