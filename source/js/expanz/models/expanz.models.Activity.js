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

	window.expanz.models.Activity = expanz.Collection.extend({

	    model: expanz.models.Bindable,

	    isAnonymous: function () {
	        return !this.getAttr('handle');
	    },

	    callbacks: {
	        success: function (message) {
	            expanz.messageController.addSuccessMessageByText(message);
	        },
	        error: function (message) {
	            expanz.messageController.addErrorMessageByText(message);
	        },
	        info: function (message) {
	            expanz.messageController.addInfoMessageByText(message);
	        }
	    },

	    initialize: function (attrs) {
	        this.dataControls = {};
	        this.loading = false;
	        expanz.Collection.prototype.initialize.call(this, attrs);
	    },

	    getAll: function () {
	        return this.reject(function (field) {
	            // NOTE: 'this' has been set as expanz.models.Activity
	            return (field.get('id') === 'error') || (field.getAttr && field.getAttr('name'));
	        }, this);
	    },

	    addDataControl: function (DataControl) {
	        var id = DataControl.id || DataControl.getAttr('dataId');

	        if (this.dataControls[id] === undefined)
	            this.dataControls[id] = [];
	        this.dataControls[id].push(DataControl);
	        return;
	    },
	    
	    getDataControl: function (id) {
	        return this.dataControls[id];
	    },
	    getDataControls: function () {
	        return this.dataControls;
	    },
	    
	    hasDataControl: function () {
	        return this.dataControls != {};
	    },

	    load: function () {
	        expanz.net.CreateActivityRequest(this, this.callbacks);
	    },

	    destroy: function () {
	        expanz.net.CloseActivityRequest(this.getAttr('handle'));
	        expanz.Collection.prototype.destroy.call(this, this.callbacks);
	    }
	});
});
