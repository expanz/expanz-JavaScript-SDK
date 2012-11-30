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

	window.expanz.models.MessageCollection = expanz.Collection.extend({

	    model: expanz.models.Message,

	    //callbacks: {
	    //    success: function (message) {
	    //        expanz.messageController.addSuccessMessageByText(message);
	    //    },
	    //    error: function (message) {
	    //        expanz.messageController.addErrorMessageByText(message);
	    //    },
	    //    info: function (message) {
	    //        expanz.messageController.addInfoMessageByText(message);
	    //    }
	    //},

	    initialize: function () {
	        this.loading = false;
	    }
	});
});
