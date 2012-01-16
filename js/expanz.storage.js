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
			this.clearActivityCookies();
			return true;
		},

		clearActivityCookies : function(activityName, activityStyle) {
			_.each($.cookies.filter(expanz.Storage._getCookiesGlobalName() + '.activity.handle'), function(value, name) {
				$.cookies.del(name);
			});
		},

		clearActivityCookie : function(activityName, activityStyle) {
			$.cookies.del(expanz.Storage._getCookiesGlobalName() + '.activity.handle.' + activityName + activityStyle);
		},

		// objects

		AppSiteMenu : function() {
			this.processAreas = [];

			this.load = function(el) {
				el.html("");
				if (el.attr('type') == 'icon') {
					_.each(this.processAreas, function(pA) {
						pA.load(el, 0, true);
					});
				}
				else {
					// clear the DOM menu

					// load process areas into DOM menu
					el.append('<ul id="menuUL"></ul>');

					// add home page if defined
					if (window.config._homepage) {
						el.find("#menuUL").append('<li class="processarea menuitem" id="home"><a href="' + window.config._homepage + '" class="menuTitle">Home</a></li>');
					}

					_.each(this.processAreas, function(pA) {
						el.find("#menuUL").append('<li class="processarea menuitem" id="' + pA.id + '"><a class="menuTitle" href="#">' + pA.title + '</a></li>');
						pA.load(el.find('#' + pA.id + '.processarea.menuitem'), 0, false);
					});
					// add html and click handler to DOM
					el.find("#menuUL").append('<li class="processarea menuitem" id="logout"><a class="menuTitle">logout</a></li>');
					el.append('<div style="clear:both"></div>');

					$(el.find('#logout')[0]).click(function(e) {
						expanz.Logout();
					});
				}

			}
		},

		ProcessAreaMenu : function(id, title) {
			this.id = id;
			this.title = title;
			this.activities = [];
			this.pa = []; /* sub process area */

			this.load = function(el, level, displayAsIcons) {
				if (displayAsIcons === true) {

					_.each(this.activities, function(activity) {
						activity.load(el, true);
					});

					if (this.pa && this.pa.length > 0) {
						_.each(this.pa, function(subprocess) {
							subprocess.load(el, level + 1, true);
						});
					}
				}
				else {
					var ulId = this.id + '_' + level;
					if (this.activities.length > 0) {
						/* replace the link of the div a if only one activity in the menu */
						if (this.activities.length == 1) {
							// el.find("class='menuTitle'").html(this.activities[0].title);
							var url = this.activities[0].url;
							el.find("[class='menuTitle']").attr('href', url);
						}
						else {
							el.append('<ul style="display:none" id="' + ulId + '"></ul>');
							el.click(function() {
								el.find("#" + ulId).toggle();
							});
							_.each(this.activities, function(activity) {
								activity.load(el.find("#" + ulId), false);
							});
						}
					}

					if (this.pa && this.pa.length > 0) {
						if (el.find("#" + ulId).find().length == 0) {
							el.append('<ul style="display:none" id="' + ulId + '"></ul>');
						}
						var i = 0;
						_.each(this.pa, function(subprocess) {
							var liID = subprocess.id + '_li_' + i++;
							el.find("#" + ulId).append('<li class="processarea menuitem" id="' + liID + '"><a class="menuTitle" href="#">' + subprocess.title + '</a></li>');
							subprocess.load(el.find('#' + liID + '.processarea.menuitem'), level + 1);
						});
					}
				}
			};
		},

		ActivityMenu : function(name, title, url, img) {
			this.name = name;
			this.title = title;
			this.url = url;
			this.img = img;

			this.load = function(el, displayAsIcons) {
				if (displayAsIcons === true) {
					el.append('<div class="icon"><a href="' + this.url + '"><img src="' + this.img + '"/></a><br/> ' + this.title + '</div>');
				}
				else {
					el.append('<li class="activity">' + '<a href=\'' + this.url + '\'>' + this.title + '</a>' + '</li>');
				}
			};

		}

	};

	var setLoginURL = function(url) {
		$.cookies.set(expanz.Storage._getCookiesGlobalName() + '.login.url', url);
		return true;
	};

});
