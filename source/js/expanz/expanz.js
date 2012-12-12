////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function() {

	//
	// Global Namespace definitions
	//
	window.expanz = window.expanz || {};
	window.expanz.helper = window.expanz.helper || {};
	window.expanz.Storage = window.expanz.Storage || {};

	window.openActivityViews = [];
    window.messageControlView = null; // Application-wide default message control view will be assigned to this

	window.expanz.logToConsole = function(message) {
		if (typeof (console) != "undefined" && console.log) {
			console.log(message);
		}
	};

	window.expanz.getMaintenancePage = function() {
		return window.config._maintenancePage ? window.config._maintenancePage : 'maintenance';
	};

	window.expanz.isOnMaintenance = function() {
		var maintenance = window.config._onMaintenance;
		if (maintenance === true) {
			return true;
		}
		return false;
	};

	//
	// Public Functions & Objects in the Expanz Namespace
	//
	window.expanz.CreateActivity = function(DOMObject, callbacks, initialKey, container) {

		DOMObject || (DOMObject = $('body'));

		var activities = createActivity(DOMObject, callbacks, initialKey);
	    
		_.each(activities, function(activityView) {
		    window.openActivityViews.push(activityView); // Push the view to the collection of open activity views
		    
            if (container !== undefined) {
                container.setActivityView(activityView);
            }
		});
	    
		return activities;
	};
	
	// window.expanz.CloseActivity = function(DOMObject) {
	//
	// // find the given activity in list from the DOMObject
	// if ($(DOMObject).attr('bind').toLowerCase() === 'activity') {
	// var activityEl = DOMObject;
	// var activity = pop(window.App, {
	// name : $(activityEl).attr('name'),
	// key : $(activityEl).attr('key')
	// });
	// activity.collection.destroy();
	// activity.remove(); // remove from DOM
	// }
	// else {
	// // top-level DOMObject wasn't an activity, let's go through the entire DOMObject looking for activities
	// _.each($(dom).find('[bind=activity]'), function(activityEl) {
	// var activity = popActivity(window.App, $(activityEl).attr('name'), $(activityEl).attr('key'));
	// activity.model.destroy();
	// activity.remove(); // remove from DOM
	// });
	// }
	// return;
	// };

	window.expanz.showManuallyClosedPopup = function(content, title, id) {

		content = unescape(content);

		var clientMessage = new expanz.models.ClientMessage({
			id : id,
			title : title,
			text : content //,
			//parent : activity
		});

		var loginPopup = new window.expanz.views.ManuallyClosedPopup({
			id : clientMessage.id,
			model : clientMessage
		}, $('body'));

		return loginPopup;

	};

	window.expanz.openActivity = function(id, style, key, title) {
		var callback = function(activityMetadata) {
			if (activityMetadata.url === null) {
				window.expanz.logToConsole("Url of activity not found");
			}

			/* case 'popup' */
			if (activityMetadata.onRequest == 'popup') {

			    /* an activity request shouldn't be reloaded from any state -> clean an eventual cookie if popup was not closed properly */
			    var existingHandle = window.expanz.Storage.getActivityHandle(id, style);

			    if (existingHandle !== undefined) {
			        window.expanz.Storage.clearActivityHandle(id, style);
			        expanz.net.CloseActivityRequest(existingHandle); // Tell the server to close the existig activity
			    }
			    
			    var clientMessage = new expanz.models.ClientMessage({
					id : 'ActivityRequest',
					url : activityMetadata.url + "&random=" + new Date().getTime(),
					//parent : parentActivity,
					title : unescape(title || activityMetadata.title || '')
				});

				var popup = new window.expanz.views.ManuallyClosedPopup({
					id : clientMessage.id,
					model : clientMessage
				}, $('body'));

				popup.bind('contentLoaded', function() {
				    expanz.CreateActivity(popup.$el.find("[bind=activity]"), null, key, popup);
				});
			}
			/* case 'navigate' or default */
			else {
				window.location = activityMetadata.url + "&random=" + new Date().getTime() + "&" + id + style + "initialKey=" + key;
			}
		};

		/* find url of activity */
		window.expanz.helper.findActivityMetadata(id, style, callback);

	};

	//
	// Helper Functions
	//

	window.expanz.findOpenActivityViewByHandle = function(activityHandle) {
	    if (window && window.openActivityViews) {
	        for (var i = 0; i < window.openActivityViews.length; i++) {
	            if (window.openActivityViews[i] !== undefined && window.openActivityViews[i].collection.getAttr("handle") == activityHandle) {
	                return window.openActivityViews[i];
				}
			}
		}
	    
		return null;
	};

	window.expanz.findOpenActivityViewByModel = function(activityModel) {
	    if (window && window.openActivityViews) {
	        for (var i = 0; i < window.openActivityViews.length; i++) {
	            if (window.openActivityViews[i] !== undefined && window.openActivityViews[i].collection === activityModel) {
	                return window.openActivityViews[i];
				}
			}
		}
	    
		return null;
	};

	window.expanz.OnActivityClosed = function (activityId) {
	    // Remove the activity with the matching ID from the list of open activities
	    if (window && window.openActivityViews) {
	        for (var i = 0; i < window.openActivityViews.length; i++) {
	            if (window.openActivityViews[i] !== undefined && window.openActivityViews[i].collection.getAttr("handle") == activityId) {
	                delete window.openActivityViews[i];
	                return;
				}
			}
		}
	};

	window.expanz.helper.findActivityMetadata = function (activityName, activityStyle, callback) {
	    var data = expanz.Storage.getFormMapping();

	    $(data).find('activity').each(function () {
			var name = $(this).attr('name');
			var url = getPageUrl($(this).attr('form'));
			var onRequest = $(this).attr('onRequest');
			var title = $(this).attr('title');
			var style = $(this).attr('style');
			if (name == activityName && style == activityStyle) {
				var activityMetadata = {};
				activityMetadata.url = url;
				activityMetadata.onRequest = onRequest;
				activityMetadata.title = title;
				callback(activityMetadata);
				return;
			}
		});
	};

	//
	// Private Functions
	//
	function createActivity(dom, callbacks, paramInitialKey) {

		var activities = [];

		var domActivities = [];

		if ($(dom).attr('bind') && ($(dom).attr('bind').toLowerCase() === 'activity')) {
			domActivities.push(dom);
		}
		else {
			// search through DOM body, looking for elements with 'bind' attribute
			_.each($(dom).find('[bind=activity]'), function(activityEl) {
				domActivities.push(activityEl);
			});
		}

		_.each(domActivities, function(activityEl) {

		    var activityView = expanz.Factory.createActivityView(dom);

			/* look for initial key in the query parameters */
			var initialKey = paramInitialKey || getQueryParameterByName(activityView.collection.getAttr('name') + (activityView.collection.getAttr('style') || '') + 'initialKey');
			activityView.collection.setAttr({
				'key' : initialKey
			});

			activityView.collection.load(callbacks);
			activities.push(activityView);
		});

		return activities;
	}

	function loadMenu(el, displayEmptyItems) {

		// Load Menu & insert it into #menu
		var menu = new expanz.menu.AppSiteMenu();
		var processAreas = loadProcessMap(expanz.Storage.getProcessAreaList(), displayEmptyItems);
		if (processAreas.length > 0)
			menu.processAreas = processAreas;
		menu.load(el);
	}

	function loadProcessMap(processAreas, displayEmptyItems, parentProcessAreaMenu) {
		var processAreasMenu = [];
		_.each(processAreas, function(processArea) {
			if (displayEmptyItems || processArea.activities.length > 0 || processArea.pa.length > 0) {
				var menuItem = new expanz.menu.ProcessAreaMenu(processArea.id, processArea.title);

				if (parentProcessAreaMenu)
					menuItem.parent = parentProcessAreaMenu;

				_.each(processArea.activities, function(activity) {
					if (displayEmptyItems || (activity.url !== '' && activity.url.length > 1)) {
						menuItem.activities.push(new expanz.menu.ActivityMenu(activity.name, activity.style, activity.title, activity.url, activity.img));
					}
				});

				if (processArea.pa.length > 0) {
					menuItem.pa = loadProcessArea(processArea.pa, displayEmptyItems, menuItem);
				}

				if (displayEmptyItems || menuItem.activities.length > 0) {
					processAreasMenu.push(menuItem);
				}
			}
		});
		return processAreasMenu;
	}

	/* check if website is on maintenance or web server is down except on maintenance page */
	if (document.location.href.indexOf(window.expanz.getMaintenancePage()) === -1) {
		if (window.expanz.isOnMaintenance()) {
			expanz.views.redirect(window.expanz.getMaintenancePage());
		}

		/* check if web server is down and last success was more than 1 minutes ago */
		var currentTime = (new Date()).getTime();
		var lastSuccess = window.expanz.Storage.getLastPingSuccess();
		if (lastSuccess === undefined || (currentTime - lastSuccess) > (1 * 60 * 1000)) {
			expanz.net.WebServerPing(3);
		}
	}

	/* defined a fake console to avoid bug if any console.log have been forgotten in the code */
	if (!window.console) {
		window.console = {
			log : function(e) {
				// alert(e);
			}
		};
	}

	window.expanz.logToConsole("Loading menu, setting callbacks and creating activities");

	/* prompt the user to install chrome frame for IE6 */
	if ($.browser.msie && $.browser.version == "6.0") {
		loadjscssfile("//ajax.googleapis.com/ajax/libs/chrome-frame/1.0.3/CFInstall.min.js", "js");
		window.attachEvent('onload', function() {
			CFInstall.check({
				mode : 'overlay'
			});
		});
	}

	/* init dashboards object */
	window.expanz.Dashboards = new window.expanz.models.Dashboards();

	/* Load the Expanz Process Area menu without empty items */
	_.each($('[bind=menu]'), function(el) {
		loadMenu($(el), false);
	});

	/* create login if exists */
	expanz.security.createLogin($('[bind=login]'));

	/* create all activities where autoLoad attribute is not set to false */
	_.each($('[bind=activity][autoLoad!="false"]'), function(el) {
		expanz.CreateActivity($(el));
	});

	/* apply security roles -> hide stuff */
	_.each($("body").find("[requiresRole]"), function(el) {
		var roles = $(el).attr("requiresRole");
		if (roles !== null && roles !== "") {
			var roleFound = false;
			roles = roles.split(" ");
			for ( var i = 0; i < roles.length; i++) {
				if (expanz.Storage.hasRole(roles[i])) {
					roleFound = true;
					break;
				}
			}
			if (roleFound !== true) {
				$(el).hide();
			}
		}

	});

	/* load UI plugin */
	var expanzPlugin = $("body").attr("expanzPlugin");
	if (expanzPlugin) {
		switch (expanzPlugin) {
			case "kendo":
				if (typeof useKendo == 'function')
					useKendo();
				else
					window.expanz.logToConsole("useKendo method is undefined");
				break;

			case "kendoMobile":
				if (typeof useKendoMobile == 'function')
					useKendoMobile();
				else
					window.expanz.logToConsole("useKendoMobile method is undefined");
				break;

			default:
				break;
		}
	}

});
