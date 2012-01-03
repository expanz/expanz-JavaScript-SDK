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

	// Load the Expanz Process Area menu
	loadMenu($('[bind=menu]'));

	window.expanz.logToConsole = function(message) {
		if (typeof (console) != "undefined" && console.log) {
			console.log(message);
		}
	}

	//
	// Public Functions & Objects in the Expanz Namespace
	//
	window.expanz.CreateActivity = function(DOMObject, callbacks) {

		//
		DOMObject || (DOMObject = $('body'));
		var viewNamespace = expanz.Views;
		var modelNamespace = expanz.Model;

		var activities = createActivity(viewNamespace, modelNamespace, DOMObject, callbacks);
		_.each(activities, function(activity) {
			window.App.push(activity);
		});
		return;
	};
	
	//
	// Public Functions & Objects in the Expanz Namespace
	//
	window.expanz.CreateLoginActivity = function(DOMObject, callbacks) {

		//
		DOMObject || (DOMObject = $('body'));
		var viewNamespace = expanz.Views.Login;
		var modelNamespace = expanz.Model.Login;

		var activities = createLoginActivity(viewNamespace, modelNamespace, DOMObject, callbacks);
		_.each(activities, function(activity) {
			window.App.push(activity);
		});
		return;
	};	

	window.expanz.DestroyActivity = function(DOMObject) {

		// find the given activity in list from the DOMObject
		if ($(DOMObject).attr('bind').toLowerCase() === 'activity') {
			var activityEl = DOMObject;
			var activity = pop(window.App, {
				name : $(activityEl).attr('name'),
				key : $(activityEl).attr('key')
			});
			activity.collection.destroy();
			activity.remove(); // remove from DOM
		} else {
			// top-level DOMObject wasn't an activity, let's go through the entire DOMObject looking for activities
			_.each($(dom).find('[bind=activity]'), function(activityEl) {
				var activity = popActivity(window.App, $(activityEl).attr('name'), $(activityEl).attr('key'));
				activity.model.destroy();
				activity.remove(); // remove from DOM
			});
		}
		return;
	};

	window.expanz.Logout = function() {
		function redirect() {
			expanz.Views.redirect(expanz.Storage.getLoginURL())
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
		} else {
			content = 'Please log in';
		}

		content += "<br/><br/>";
		content += '<section bind="activity" name="login" id="login">';
		content += '<div bind="field" name="username" id="username">';
		content += '<input attribute="value" type="text" placeholder="Username"/>';
		content += '</div>';
		content += '<div bind="field" name="password" id="password">';
		content += '<input attribute="value" type="password" placeholder="Password"/>';
		content += '</div>';
		content += '<div style="margin-top:10px" bind="method" name="login" id="login">';
		content += '<button type="submit" attribute="submit">login</button>';
		content += '</div>';
		content += '<div bind="dependant" name="error" id="error">';
		content += '<span attribute="value"></span>';
		content += '</div>';
		content += '</section>';

		var clientMessage = new expanz.Model.ClientMessage({
			id : 'ExpanzLoginPopup',
			title : 'Login',
			text : content,
			parent : activity
		});

		/*
		 * var cancelActionModel = new expanz.Model.Method({ id : 'close', label : 'Cancel', parent : activity }); clientMessage.add(cancelActionModel);
		 */

		/*
		 * var LoginActionModel = new expanz.Model.Method({ id : 'attemptLogin', label : 'Login', parent : activity }); clientMessage.add(LoginActionModel);
		 */

		var loginPopup = new window.expanz.Views.LoginPopup({
			id : clientMessage.id,
			model : clientMessage
		}, $('body'));

		var callbackLogin = function() {
			window.expanz.logToConsole('callbackLogin');
		}

		createLoginActivity(expanz.Views.Login, expanz.Model.Login, loginPopup.el);

		window.expanz.logToConsole("sessionLost");
		// expanz.Views.redirect( expanz.Storage.getLoginURL() + "?error=" + encodeURIComponent($(this).text()));
		return;

	}

	window.expanz.SetErrorCallback = function(fn) {

		expanz._error = fn;
	};
	
	window.expanz.basicErrorDisplay = function(el){
		return function error(str) {
			$(el).find('[attribute=value]').html(str);
			if (!str || str.length < 1) {
				$(el).hide('slow');
			} else {
				$(el).show('slow');
			}
		}
		;
	}

	window.expanz.SetInfoCallback = function(fn) {

		expanz._info = fn;
	};

	//
	// Private Functions
	//
	function createActivity(viewNamespace, modelNamespace, dom, callbacks) {

		var activities = [];
		if ($(dom).attr('bind') && ($(dom).attr('bind').toLowerCase() === 'activity')) {

			var activityView = expanz.Factory.Activity(viewNamespace, modelNamespace, dom);
			activityView.collection.load(callbacks);
			activities.push(activityView);

		} else {
			// search through DOM body, looking for elements with 'bind' attribute
			_.each($(dom).find('[bind=activity]'), function(activityEl) {
				var activityView = expanz.Factory.Activity(viewNamespace, modelNamespace, dom);
				activityView.collection.load(callbacks);
				activities.push(activityView);
			}); // _.each activity
		}
		return activities;
	}
	;

	function createLoginActivity(viewNamespace, modelNamespace, dom) {

		var activities = [];
		if ($(dom).attr('bind') && ($(dom).attr('bind').toLowerCase() === 'activity')) {

			var activityView = expanz.Factory.Activity(viewNamespace, modelNamespace, dom);
			activities.push(activityView);

		} else {
			// search through DOM body, looking for elements with 'bind' attribute
			_.each($(dom).find('[bind=activity]'), function(activityEl) {
				var activityView = expanz.Factory.Activity(viewNamespace, modelNamespace, dom);
				activities.push(activityView);
			}); // _.each activity
		}
		return activities;
	}
	;

	function findActivity(activityId) {
		if (window && window.App) {
			for ( var i = 0; i < window.App.length; i++) {
				if (window.App[i].id == activityId) {
					return window.App[i];
				}
			}
		}
		return null;
	}
	;

	function loadMenu(el) {

		// Load Menu & insert it into #menu
		var menu = new expanz.Storage.AppSiteMenu();
		_.each(expanz.Storage.getProcessAreaList(), function(processArea) {
			var menuItem = new expanz.Storage.ProcessAreaMenu(processArea.id, processArea.title);
			menu.processAreas.push(menuItem);

			_.each(processArea.activities, function(activity) {
				menuItem.activities.push(new expanz.Storage.ActivityMenu(activity.name, activity.title, activity.url));
			});
		});

		menu.load(el);
	}
	;

	function pop(ary, map) { // , name, key ) {

		for ( var i = 0; i < ary.length; i++) {
			if (_.reduce(map, function(memo, key) {
				return memo && (map.key === ary[i].key);
			}, true)) {
				var found = ary[i];
				ary.remove(i);
				return found;
			}
		}
		return null;
	}
	;

	// Array Remove - By John Resig (MIT Licensed)
	Array.prototype.remove = function(from, to) {
		var rest = this.slice((to || from) + 1 || this.length);
		this.length = from < 0 ? this.length + from : from;
		return this.push.apply(this, rest);
	};

}) // $(function() --

