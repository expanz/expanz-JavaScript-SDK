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

		endSession : function() {
			$.cookies.del(expanz.Storage._getCookiesGlobalName() + '.session.handle');
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
					el.append('<div id="' + pA.id + '" class="processarea menuitem">' + '<a>' + pA.title + '</a>' + '</div>');
					pA.load(el.find('#' + pA.id + '.processarea.menuitem'));
				});
				// add html and click handler to DOM
				el.append('<div id="logout" class="processarea menuitem"><a>logout</a></div>');
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
				el.append('<ul id="' + this.id + '"></ul>');
				_.each(this.activities, function(activity) {
					activity.load(el.find('ul'));
				});
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
