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

	window.expanz.models.Bindable = Backbone.Model.extend({

	    destroy: function () {
	        // DO NOTHING
	        // this will be used if server changes API to use proper REST model. In a REST model, Backbone can link Models to specific URLs and interact using HTTP GET/PUT/UPDATE/DELETE. When that happens this override should be removed.
	    }

	});
});
