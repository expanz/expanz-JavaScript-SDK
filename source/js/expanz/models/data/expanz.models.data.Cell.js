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
	window.expanz.models = window.expanz.models || {};
	window.expanz.models.data = window.expanz.models.data || {};
    
	window.expanz.models.data.Cell = expanz.models.Bindable.extend({

		initialize : function(attrs, options) {
			expanz.models.Bindable.prototype.initialize.call(this, attrs, options);
			this.set({
				selected : false
			});
		}

	});

});