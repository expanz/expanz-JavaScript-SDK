/* Author: Adam Tait

 */
$(function() {

	//
	// Global Namespace definitions
	//
	window.App = [];
	window.expanz = window.expanz || {};

	window.expanz._error = window.expanz._error || function(error) {
		window.expanz.logToConsole("Expanz JavaScript SDK has encountered an error: " + error);
	};

	window.expanz._info = window.expanz._info || function(info) {
		window.expanz.logToConsole("Info received: " + info);
	};

	window.expanz.logToConsole = function(message) {
		if (typeof (console) != "undefined" && console.log) {
			console.log(message);
		}
	}

	window.expanz.getLoginURL = function() {
		var loginUrl = window.config._loginpage;
		/* if login url is null try to guess it by removing the filename */
		if (loginUrl == null) {
			loginUrl = document.location.pathname.substring(0, document.location.pathname.lastIndexOf("/"));
		}
		window.expanz.logToConsole("getLoginURL : " + loginUrl);
		return loginUrl;
	}

	//
	// Public Functions & Objects in the Expanz Namespace
	//
	window.expanz.CreateActivity = function(DOMObject, callbacks) {

		//
		DOMObject || (DOMObject = $('body'));

		var activities = createActivity(DOMObject, callbacks);
		_.each(activities, function(activity) {
			window.App.push(activity);
		});
		return;
	};

	window.expanz.CreateLogin = function(DOMObject, callbacks) {

		DOMObject || (DOMObject = $('body'));

		var login = createLogin(DOMObject, callbacks);
		return;
	};

	// window.expanz.DestroyActivity = function(DOMObject) {
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

	window.expanz.Logout = function() {
		function redirect() {
			expanz.Storage.clearSession();
			expanz.Views.redirect(expanz.getLoginURL());
		}
		;
		expanz.Net.ReleaseSessionRequest({
			success : redirect,
			error : redirect
		});
	};

	window.expanz.showLoginPopup = function(activity, sessionLost) {
		var content = '';
		if (sessionLost === true) {
			content = 'Session not found or expired, please log in again';
		}
		else {
			content = 'Please log in';
		}

		content += "<br/><br/>";
		content += '<form bind="login" name="login" action="javascript:">';
		content += '<div name="username" id="username">';
		content += '<input attribute="value" type="text" placeholder="Username"/>';
		content += '</div>';
		content += '<div name="password" id="password">';
		content += '<input attribute="value" type="password" placeholder="Password"/>';
		content += '</div>';
		content += '<div style="margin-top:10px" name="login" id="login">';
		content += '<button type="submit" attribute="submit">login</button>';
		content += '</div>';
		content += '<div bind="message" type="error" class="error">';
		content += '<span attribute="value"></span>';
		content += '</div>';
		content += '</form>';

		var clientMessage = new expanz.Model.ClientMessage({
			id : 'ExpanzLoginPopup',
			title : 'Login',
			text : content,
			parent : activity
		});

		var loginPopup = new window.expanz.Views.ManuallyClosedPopup({
			id : clientMessage.id,
			model : clientMessage
		}, $('body'));

		var callbackLogin = function() {
			window.expanz.logToConsole('callbackLogin');
		}

		createLogin(loginPopup.el.find('[bind=login]'));

		window.expanz.logToConsole("sessionLost");

		return;

	}

	window.expanz.SetErrorCallback = function(fn) {

		expanz._error = fn;
	};

	window.expanz.basicErrorDisplay = function(el) {
		return function error(str) {
			$(el).find('[attribute=value]').html(str);
			if (!str || str.length < 1) {
				$(el).hide('slow');
			}
			else {
				$(el).show('slow');
			}
		};
	}

	window.expanz.basicMsgDisplay = function(el) {
		return function display(str) {

			if (str instanceof Array) {
				str = str.join("<br/>");
			}

			/* display the message in the popup as well if visible */
			if (window.expanz.currentPopup != undefined && $(window.expanz.currentPopup.el).is(":visible")) {
				var popupEl = window.expanz.currentPopup.el.find(el);
				if (popupEl) {
					popupEl.find('[attribute=value]').html(str);
					if (!str || str.length < 1) {
						$(popupEl).hide('slow');
					}
					else {
						$(popupEl).show('slow');
					}
				}
			}

			$(el).find('[attribute=value]').html(str);
			if (!str || str.length < 1) {
				$(el).hide('slow');
			}
			else {
				$(el).show('slow');
			}
		};
	}

	window.expanz.SetInfoCallback = function(fn) {

		expanz._info = fn;
	};

	window.expanz.SetHomePage = function(homepage) {

		expanz._home = homepage;
	};

	//
	// Helper Functions
	//

	window.expanz.helper.findActivity = function(activityId) {
		if (window && window.App) {
			for ( var i = 0; i < window.App.length; i++) {
				if (window.App[i].id == activityId) {
					return window.App[i];
				}
			}
		}
		return null;
	}

	window.expanz.helper.findActivityMetadata = function(activityName, activityStyle, callback) {
		var jqxhr = $.get('./formmapping.xml', function(data) {
			$(data).find('activity').each(function() {
				var name = $(this).attr('name');
				var url = $(this).attr('form');
				var onRequest = $(this).attr('onRequest');
				var style = $(this).attr('style');
				if (name == activityName && style == activityStyle) {
					callback(url, onRequest);
					return;
				}
			});
		});
	}

	//
	// Private Functions
	//
	function createActivity(dom, callbacks) {

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

			var activityView = expanz.Factory.Activity(dom);

			/* look for initial key in the query parameters */
			var initialKey = getQueryParameterByName(activityView.collection.getAttr('name') + (activityView.collection.getAttr('style') || '') + 'initialKey');
			activityView.collection.setAttr({
				'key' : initialKey
			});

			activityView.collection.load(callbacks);
			activities.push(activityView);
		});

		return activities;
	}

	function createLogin(dom, callbacks) {

		var loginView;
		if ($(dom).attr('bind') && ($(dom).attr('bind').toLowerCase() === 'login')) {
			loginView = expanz.Factory.Login(dom);
		}

		return loginView;
	}

	function loadMenu(el, displayEmptyItems) {

		// Load Menu & insert it into #menu
		var menu = new expanz.Storage.AppSiteMenu();
		var processAreas = loadProcessArea(expanz.Storage.getProcessAreaList(), displayEmptyItems);
		if (processAreas.length > 0)
			menu.processAreas = processAreas;
		menu.load(el);
	}

	function loadProcessArea(processAreas, displayEmptyItems, parentProcessAreaMenu) {
		var processAreasMenu = [];
		_.each(processAreas, function(processArea) {
			if (displayEmptyItems || processArea.activities.length > 0 || processArea.pa.length > 0) {
				var menuItem = new expanz.Storage.ProcessAreaMenu(processArea.id, processArea.title);

				if (parentProcessAreaMenu)
					menuItem.parent = parentProcessAreaMenu;

				_.each(processArea.activities, function(activity) {
					if (displayEmptyItems || (activity.url != '' && activity.url.length > 1)) {
						menuItem.activities.push(new expanz.Storage.ActivityMenu(activity.name, activity.title, activity.url, activity.img));
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

	window.expanz.logToConsole("Loading menu, setting callbacks and creating activities");

	/* prompt the user to install chrome frame for IE6 */
	if ($.browser.msie && $.browser.version == "6.0") {
		loadjscssfile("//ajax.googleapis.com/ajax/libs/chrome-frame/1.0.3/CFInstall.min.js", "js");
		window.attachEvent('onload', function() {
			CFInstall.check({
				mode : 'overlay'
			})
		});
	}

	/* load resource bundle */
	jQuery.i18n.properties({
		name : 'Messages',
		path : 'assets/bundle/',
		mode : 'map',
		language : ' ', /* set to en to load Messages-en.properties as well, set to '' to load as well Messages-en-XX.properties - add to config.js if different for some customers */
		cache : true,
		callback : function() {
			window.expanz.logToConsole("Bundle loaded");
		}
	});

	/* Load the Expanz Process Area menu without empty items */
	_.each($('[bind=menu]'), function(el) {
		loadMenu($(el), false);
	});

	/* registering callback for error/info messages */
	expanz.SetErrorCallback(expanz.basicMsgDisplay('[bind=message][type=error]'));
	expanz.SetInfoCallback(expanz.basicMsgDisplay('[bind=message][type=info]'));

	/* create login if exists */
	expanz.CreateLogin($('[bind=login]'));

	/* create all activities where autoLoad attribute is not set to false */
	_.each($('[bind=activity][autoLoad!="false"]'), function(el) {
		expanz.CreateActivity($(el));
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

})
