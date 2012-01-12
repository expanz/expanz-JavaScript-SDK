/* Author: Adam Tait

 */

$(function() {

	window.expanz = window.expanz || {};

	window.expanz.Storage = {

		// functions

		_getCookiesGlobalName : function() {
			return "_expanz_" + config._AppSite + "_";
		},

		getSessionHandle : function() {
			var cookie = $.cookies.get(expanz.Storage._getCookiesGlobalName() + '.session.handle');
			if (cookie == 'undefined')
				return undefined;
			return cookie;
		},

		setSessionHandle : function(sessionHandle) {
			$.cookies.set(expanz.Storage._getCookiesGlobalName() + '.session.handle', sessionHandle);
			if ($.cookies.get(expanz.Storage._getCookiesGlobalName() + '.login.url') == null) {
				setLoginURL(document.location.pathname);
			}
			return true;
		},

		getActivityHandle : function(activityName, activityStyle) {
			var cookie = $.cookies.get(expanz.Storage._getCookiesGlobalName() + '.activity.handle.' + activityName + activityStyle);
			if (cookie == 'undefined')
				return undefined;
			if (cookie)
				cookie = cookie.replace('_', '.');
			return cookie;
		},

		setActivityHandle : function(activityHandle, activityName, activityStyle) {
			$.cookies.set(expanz.Storage._getCookiesGlobalName() + '.activity.handle.' + activityName + activityStyle, activityHandle.replace('.', '_'));
			return true;
		},

		getProcessAreaList : function() {
			return $.cookies.get(expanz.Storage._getCookiesGlobalName() + '.processarea.list');
		},

		setProcessAreaList : function(list) {
			$.cookies.set(expanz.Storage._getCookiesGlobalName() + '.processarea.list', JSON.stringify(list));
			return true;
		},

		getLoginURL : function() {
			var loginUrl = $.cookies.get(expanz.Storage._getCookiesGlobalName() + '.login.url');
			/* if login url is null try to guess it by removing the filename */
			if (loginUrl == null) {
				loginUrl = document.location.pathname.substring(0, document.location.pathname.lastIndexOf("/"));
			}
			return loginUrl;
		},

		clearSession : function() {
			$.cookies.del(expanz.Storage._getCookiesGlobalName() + '.session.handle');
			_.each($.cookies.filter(expanz.Storage._getCookiesGlobalName() + '.activity.handle'), function(value, name) {
				$.cookies.del(name);
			});
			return true;
		},

		// objects

		AppSiteMenu : function() {
			this.processAreas = [];

			this.load = function(el) {
				// clear the DOM menu
				el.html("");
				// load process areas into DOM menu
				_.each(this.processAreas, function(pA) {
					el.append('<ul id="' + pA.id + '" class="processarea menuitem"><li><div class="menuTitle"><a href="#">' + pA.title + '</a></div></li></ul>');
					pA.load(el.find('#' + pA.id + '.processarea.menuitem li'));
				});
				// add html and click handler to DOM
				el.append('<ul id="logout" class="processarea menuitem"><li><div class="menuTitle">logout</div></li></ul>');
				$(el.find('#logout')[0]).click(function(e) {
					expanz.Logout();
				});
			}
		},

		ProcessAreaMenu : function(id, title) {
			this.id = id;
			this.title = title;
			this.activities = [];

			this.load = function(el) {
				if (this.activities.length > 0) {
					/* replace the link of the div a if only one activity in the menu */
					if (this.activities.length == 1) {
						// el.find("class='menuTitle'").html(this.activities[0].title);
						var url = this.activities[0].url;
						el.find("[class='menuTitle'] a").attr('href', url);
					}
					else {
						el.append('<ul style="display:none" id="' + this.id + '"></ul>');
						_.each(this.activities, function(activity) {
							activity.load(el.find('ul'));
						});
					}
				}
			};
		},

		ActivityMenu : function(name, title, url) {
			this.name = name;
			this.title = title;
			this.url = url;

			this.load = function(el) {
				el.append('<li class="activity">' + '<a href=\'' + this.url + '\'>' + this.title + '</a>' + '</li>');
			};
		}

	};

	var setLoginURL = function(url) {
		$.cookies.set(expanz.Storage._getCookiesGlobalName() + '.login.url', url);
		return true;
	};

});
