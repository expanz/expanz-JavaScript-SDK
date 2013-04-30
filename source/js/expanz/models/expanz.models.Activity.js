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

	window.expanz.models.Activity = Backbone.Model.extend({

	    isAnonymous: function () {
	        return !this.get('handle');
	    },
	    
        defaults: {
        },

	    initialize: function () {
	        this.fields = new expanz.Collection();
	        this.methods = new expanz.Collection();
	        this.dataPublications = new expanz.Collection();
	        this.customContentCollection = new expanz.Collection();
	        this.messageCollection = new expanz.models.MessageCollection();
	        this.loading = false;
	    },

	    load: function () {
	        expanz.net.CreateActivityRequest(this, this.callbacks);
	    },
	    
	    closeActivity: function (callAsync) {
	        this.trigger("closingActivity");
	        
	        // Remove the cached activity handle
	        window.expanz.Storage.clearActivityHandle(this.get("name"), this.get("style"));

	        // Remove the activity from the list of open activities
	        window.expanz.OnActivityClosed(this.get('handle'));

	        // Close the activity on the server
	        expanz.net.CloseActivityRequest(this.get('handle'), null, callAsync);
	        
	        this.destroy();
	    },
	    
	    setFieldFocus: function (focusFieldId) {
	        // Find the field
	        var focusField = this.fields.where({ fieldId: focusFieldId });
	        
	        // Now set focus to it
	        if (focusField.length !== 0)
	            focusField[0].setFocus();
	    },

	    destroy: function () {
	        // TODO: Destory field, method, and data publication models
	    }
	});
});
