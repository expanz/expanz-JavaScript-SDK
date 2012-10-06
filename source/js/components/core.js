/* Author: kdamevin

 */
$(function() {

	window.expanz = window.expanz || {};

	window.expanz.Core = window.expanz.Component
		.extend({

			componentName : 'core',

			modules : window.expanz.Component.prototype.modules.concat([
				'Header',
				//'MainMenu',
				//'Notification',
				'Footer'
			]),

			initialize : function() {
				var that = this;
				//window.expanz.Component.prototype.componentName = this.componentName;
				window.expanz.Component.prototype.initialize.call(this);
				/* render component if present in the page */
				/*_.each(this.modules, function(module) {
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
				});*/
				
				this._executeAfterInitalize(that);
			},
			
			/*_executeAfterInitalize : function(that) {
				_.each(this.modules, function(module) {
					var componentEl = window.expanz.html.findComponentModuleElement(this.componentName, module);
					if (componentEl !== undefined) {
						componentEl.each(function() {*/
							/* execute script after adding to content to the dom */
							/*if (that['_executeAfterRender' + module + 'Module']) {
								that['_executeAfterRender' + module + 'Module']($(this));
							}
						});

					}
				});
			},*/

			renderHeaderModule : function(el) {
				var siteName = el.attr('siteName') !== undefined ? el.attr('siteName') : window.config._siteName;
				var siteUrl = el.attr('siteUrl') !== undefined ? el.attr('siteUrl') : getSiteUrl();
				var html = '';
				html += window.expanz.html.renderHeader(siteName, siteUrl);
				return html;
			},
			
			/*renderMainMenuModule : function(el) {
				var html = '';
				html += window.expanz.html.renderMainMenu();
				return html;
			},
			
			renderNotificationModule : function(el) {
				var html = '';
				html += window.expanz.html.renderNotification();
				return html;
			},*/
			
			renderFooterModule : function(el) {
				var html = '';
				html += window.expanz.html.renderFooter();
				return html;
			}

		});
	
});
