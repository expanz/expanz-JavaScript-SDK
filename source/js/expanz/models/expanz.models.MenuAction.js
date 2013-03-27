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

	window.expanz.models.MenuAction = window.expanz.models.Bindable.extend({

	    _type: 'MenuAction',

	    initialize: function () {

	    },

	    menuItemSelected: function (action) {

	        expanz.net.CreateMenuActionRequest(this.get('parentActivity'), null, null, null, action);
	        return;

	    }

	});
});
