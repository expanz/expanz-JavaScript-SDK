////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function() {

	window.expanz = window.expanz || {};

	window.expanz.Component = Backbone.View
		.extend({
			componentName : '',
			
			activity : null, /* initialised when the activity is created */
			
			modules: [],
			
			initialize : function() {
				var that = this;
				/* render component if present in the page */
				_.each(this.modules, function(module) {
					var moduleEl = window.expanz.html.findComponentModuleElement(that.componentName, module);
					if (moduleEl !== undefined) {
						moduleEl.each(function() {
							// if (moduleEl.attr('loaded') === undefined) {
							var moduleContent = that['render' + module + 'Module']($(this));
							$(this).append(moduleContent);
							moduleEl.attr('loaded', '1');
							// }
						});

					}
				});
			},
			
			_executeAfterInitalize : function(that) {
				_.each(this.modules, function(module) {
					var componentEl = window.expanz.html.findComponentModuleElement(that.componentName, module);
					if (componentEl !== undefined) {
						componentEl.each(function() {
							/* execute script after adding to content to the dom */
							if (that['_executeAfterRender' + module + 'Module']) {
								that['_executeAfterRender' + module + 'Module']($(this));
							}
						});

					}
				});
			}
		
	});
	
});
