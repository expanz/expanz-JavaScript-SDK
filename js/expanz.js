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
	};

	window.expanz.getLoginURL = function() {
		var loginUrl = window.config._loginpage;
		/* if login url is null try to guess it by removing the filename */
		if (loginUrl === undefined) {
			loginUrl = document.location.pathname.substring(0, document.location.pathname.lastIndexOf("/"));
			/* if empty mean we are at the root of the website */
			if (loginUrl == "")
				loginUrl = "/";
		}
		//window.expanz.logToConsole("getLoginURL : " + loginUrl);
		return loginUrl;
	};

	window.expanz.getMaintenancePage = function() {
		return 'maintenance.html';
	};

	window.expanz.isOnMaintenance = function() {
		var maintenance = window.config.maintenance;
		if (maintenance === true) {
			return true;
		}
		return false;
	};

	//
	// Public Functions & Objects in the Expanz Namespace
	//
	window.expanz.CreateActivity = function(DOMObject, callbacks, initialKey) {

		DOMObject || (DOMObject = $('body'));

		var activities = createActivity(DOMObject, callbacks, initialKey);
		_.each(activities, function(activity) {
			window.App.push(activity);
		});
		return activities;
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
		expanz.Net.ReleaseSessionRequest({
			success : redirect,
			error : redirect
		});
	};

	window.expanz.showManuallyClosedPopup = function(content, title, id, activity) {

		content = unescape(content);

		var clientMessage = new expanz.Model.ClientMessage({
			id : id,
			title : title,
			text : content,
			parent : activity
		});

		var loginPopup = new window.expanz.Views.ManuallyClosedPopup({
			id : clientMessage.id,
			model : clientMessage
		}, $('body'));

		return loginPopup;

	};

	window.expanz.showLoginPopup = function(activity, sessionLost) {
		var content = '';
		if (sessionLost === true) {
			content = '<div class="loginMsg">Sorry, your session timed out, please log in again.</div>';
		}
		else {
			content = '<div class="loginMsg">Please log in.</div>';
		}

		content += '<form bind="login" type="popup" name="login" action="javascript:">';
		content += '<div name="username" id="username">';
		content += '<input class="loginInput"  attribute="value" type="text" placeholder="Username"/>';
		content += '</div>';
		content += '<div name="password" id="password">';
		content += '<input class="loginInput" attribute="value" type="password" placeholder="Password"/>';
		content += '</div>';
		content += '<div name="login" id="login">';
		content += '<button type="submit" attribute="submit">login</button>';
		content += '</div>';
		content += '<div bind="message" type="error" class="error">';
		content += '<span attribute="value"></span>';
		content += '</div>';
		content += '</form>';

		loginPopup = window.expanz.showManuallyClosedPopup(content, 'Login', 'ExpanzLoginPopup', activity);

		/* set focus on username field */
		$("#username input").focus()
		
		createLogin(loginPopup.el.find('[bind=login]'));

		return;

	};

	window.expanz.createActivityWindow = function(parentActivity, id, style, key, title) {
		var callback = function(url, onRequest) {
			if (url !== null) {
				//window.expanz.logToConsole(url);
			}
			else {
				window.expanz.logToConsole("Url of activity not found");
			}

			/* case 'popup' */
			if (onRequest == 'popup') {

				/* an activity request shouldn't be reloaded from any state -> clean an eventual cookie if popup was not closed properly */
				window.expanz.Storage.clearActivityHandle(id, style);

				var clientMessage = new expanz.Model.ClientMessage({
					id : 'ActivityRequest',
					url : url + "?random=" + new Date().getTime(),
					parent : parentActivity,
					title : unescape(title || '')
				});

				var popup = new window.expanz.Views.ManuallyClosedPopup({
					id : clientMessage.id,
					model : clientMessage
				}, $('body'));

				popup.bind('contentLoaded', function() {
					expanz.CreateActivity($(popup.el).find("[bind=activity]"), null, key);
				});

				popup.bind('popupClosed', function() {
					window.expanz.Storage.clearActivityHandle(id, style);
				});
			}
			/* case 'navigate' or default */
			else {
				window.location = url + "?random=" + new Date().getTime() + "&" + id + style + "initialKey=" + key;
			}

		};

		/* find url of activity */
		window.expanz.helper.findActivityMetadata(id, style, callback);

	};

	window.expanz.SetErrorCallback = function(fn) {

		expanz._error = fn;
	};

	// window.expanz.basicErrorDisplay = function(el) {
	// return function error(str) {
	// $(el).find('[attribute=value]').html(str);
	// if (!str || str.length < 1) {
	// $(el).hide('slow');
	// }
	// else {
	// $(el).show('slow');
	// }
	// };
	// };

	window.expanz.basicMsgDisplay = function(el) {
		return function display(str) {

			if (str instanceof Array) {
				str = str.join("<br/>");
			}

			var msgDisplayedInPopup = false;

			/* display the message in the popup as well if visible */
			if (window.expanz.currentPopup !== undefined && $(window.expanz.currentPopup.el).is(":visible")) {
				var popupEl = window.expanz.currentPopup.el.find(el);
				if (popupEl) {
					msgDisplayedInPopup = true;
					popupEl.find('[attribute=value]').html(str);
					if (!str || str.length < 1) {
						$(popupEl).hide('slow');
					}
					else {
						$(popupEl).slideDown(800, function() {
							$(popupEl).delay(5000).slideUp(800);
						});
					}
				}
			}

			if (!msgDisplayedInPopup) {
				$(el).find('[attribute=value]').html(str);
				if (!str || str.length < 1) {
					$(el).hide('slow');
				}
				else {
					// $(el).show('slow');
					$(el).slideDown(800, function() {
						$(el).delay(5000).slideUp(800);
					});
				}
			}
		};
	};

	window.expanz.SetInfoCallback = function(fn) {

		expanz._info = fn;
	};

	window.expanz.defaultCallbacks = {
		success : function(message) {
		},
		error : function(message) {
			expanz._error(message);
		},
		info : function(message) {
			expanz._info(message);
		}
	};
	// window.expanz.SetHomePage = function(homepage) {
	//
	// expanz._home = homepage;
	// };

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
	};

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

			var activityView = expanz.Factory.Activity(dom);

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
					if (displayEmptyItems || (activity.url !== '' && activity.url.length > 1)) {
						menuItem.activities.push(new expanz.Storage.ActivityMenu(activity.name, activity.style, activity.title, activity.url, activity.img));
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
	if (document.location.pathname.indexOf(window.expanz.getMaintenancePage()) === -1) {
		if (window.expanz.isOnMaintenance()) {
			expanz.Views.redirect(window.expanz.getMaintenancePage());
		}

		/* check if web server is down and last success was more than 1 minutes ago */
		var currentTime = (new Date()).getTime();
		var lastSuccess = window.expanz.Storage.getLastPingSuccess();
		if (lastSuccess === undefined || (currentTime - lastSuccess) > (1 * 60 * 1000)) {
			expanz.Net.WebServerPing(3);
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

	/* load resource bundle */
	jQuery.i18n.properties({
		name : 'Messages',
		path : 'assets/bundle/',
		mode : 'map',
		language : ' ', /* set to en to load Messages-en.properties as well, set to '' to load as well Messages-en-XX.properties - add to config.js if different for some customers */
		cache : true,
		callback : function() {
			//window.expanz.logToConsole("Bundle loaded");
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

});
