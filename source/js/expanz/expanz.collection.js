////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function() {

	window.expanz = window.expanz || {};

	window.expanz.Collection = Backbone.Collection.extend({

		initialize : function(attrs, options) {
			this.attrs = {};
			this.setAttr(attrs);
			return;
		},

		getAttr : function(key) {
			if (this.attrs[key])
			    return this.attrs[key];
		    
			return false;
		},

		setAttr : function(attrs) {
			for ( var key in attrs) {
				if (key === 'id') {
					this.id = attrs[key];
				}
			    
				var oldValue = this.attrs[key];
				this.attrs[key] = attrs[key];
			    
				if (oldValue != this.attrs[key]) {
					this.trigger('update:' + key);
				}
			}
			return true;
		},

		getChildrenByAttribute: function (attributeName, attributeValue) {
		    // Returns all children which have an attribute with a given value
		    return this.filter(function (child) {
		        return (child !== undefined && child.get(attributeName) === attributeValue);
		    });
		},

		getFirstChildByAttribute: function (attributeName, attributeValue) {
		    var matches = this.getChildrenByAttribute(attributeName, attributeValue);

		    if (matches.length !== 0)
		        return matches[0];
		    else
		        return null;
		},

		//forEachChildWithAttributeValue: function (attributeName, attributeValue, callback) {
		//    // Provides an easy way to loop through all models with a given attribute name/value 
		//    // combination, and call a function passing the model as a parameter
		//    this.getChildrenByAttribute(attributeName, attributeValue).forEach(function (child) {
		//        callback(child);
		//    });
		//},

		destroy : function() {
			this.each(function(m) {
				m.destroy();
			});
		    
			return;
		}
	});
});
