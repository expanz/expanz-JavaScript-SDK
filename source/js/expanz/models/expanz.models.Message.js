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

	window.expanz.models.Message = expanz.models.Bindable.extend({

	    _type: 'Message',
	    
        initialize: function () {
            
        },

	    publish: function (xml) {
	        if (xml.attr !== undefined) {
	            // Assign all the attributes on the XML element to the model
	            //if (xml.attr('visualType')) {
	            //    this.set({
	            //        visualType: xml.attr('visualType')
	            //    });
	            //}
	        } else {
	            window.expanz.logToConsole("window.expanz.models.Message: xml.attr is undefined");
	        }
	    }
	});
});
