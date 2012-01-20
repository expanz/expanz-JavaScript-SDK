/* Author: Adam Tait

 */

$(function() {

	window.expanz = window.expanz || {};

	window.expanz.Storage = {

		// functions

		_getBestStorage : function() {
			if (window.localStorage)
				return this.localStorage;
			else
				return this.cookies;
		},

		_getStorageGlobalName : function() {
			return "_expanz_" + config._AppSite + "_";
		},

		getSessionHandle : function() {
			var sessionHandle = this._getBestStorage().get('session.handle');
			if (sessionHandle == 'undefined')
				return undefined;
			return sessionHandle;
		},

		setSessionHandle : function(sessionHandle) {
			this._getBestStorage().set('session.handle', sessionHandle);
			if (this._getBestStorage().get('login.url') == null) {
				this.setLoginURL(document.location.pathname);
			}
			return true;
		},

		getActivityHandle : function(activityName, activityStyle) {
			var activityHandle = this._getBestStorage().get('activity.handle.' + activityName + activityStyle);
			if (activityHandle == 'undefined')
				return undefined;
			if (activityHandle)
				activityHandle = activityHandle.replace('_', '.');
			return activityHandle;
		},

		setActivityHandle : function(activityHandle, activityName, activityStyle) {
			this._getBestStorage().set('activity.handle.' + activityName + activityStyle, activityHandle.replace('.', '_'));
			return true;
		},

		getProcessAreaList : function() {
			return JSON.parse(this._getBestStorage().get('processarea.list'));
		},

		setProcessAreaList : function(list) {
			this._getBestStorage().set('processarea.list', JSON.stringify(list));
			return true;
		},

		getLoginURL : function() {
			var loginUrl = this._getBestStorage().get('login.url');
			/* if login url is null try to guess it by removing the filename */
			if (loginUrl == null) {
				loginUrl = document.location.pathname.substring(0, document.location.pathname.lastIndexOf("/"));
			}
			return loginUrl;
		},

		clearSession : function() {
			this._getBestStorage().remove('session.handle');
			this.clearActivityHandles();
			return true;
		},

		clearActivityHandles : function(activityName, activityStyle) {
			var storage = this._getBestStorage();
			var keys = storage.getKeys('activity.handle');
			_.each(keys, function(key) {
				storage.remove(key);
			});
		},

		clearActivityHandle : function(activityName, activityStyle) {
			this._getBestStorage().remove('activity.handle.' + activityName + activityStyle);
		},

		setLoginURL : function(url) {
			this._getBestStorage().set('login.url', url);
			return true;
		},

		/* storage implementations */
		/* cookies */
		cookies : {
			name : 'cookie',
			set : function(key, data) {
				$.cookies.set(expanz.Storage._getStorageGlobalName() + key, data);
			},

			get : function(key) {
				return $.cookies.get(expanz.Storage._getStorageGlobalName() + key);
			},

			getKeys : function(pattern) {
				var keys = [];
				_.each($.cookies.filter(pattern), function(value, key) {
					keys.push(key);
				});
				return keys;
			},

			remove : function(key) {
				$.cookies.del(expanz.Storage._getStorageGlobalName() + key);
			},
		},

		/* localStorage */
		localStorage : {
			name : 'localStorage',
			set : function(key, data) {
				window.localStorage.setItem(expanz.Storage._getStorageGlobalName() + key, data);
			},

			get : function(key) {
				return window.localStorage.getItem(expanz.Storage._getStorageGlobalName() + key);
			},

			getKeys : function(pattern) {
				var keys = [];
				for (i = 0; i < window.localStorage.length; i++) {
					key = window.localStorage.key(i).substring(expanz.Storage._getStorageGlobalName().length);
					if (pattern) {
						if (key.indexOf(pattern) >= 0) {
							keys.push(key);
						}

					}
					else {
						keys.push(key);
					}
				}

				return keys;
			},

			remove : function(key) {
				return window.localStorage.removeItem(expanz.Storage._getStorageGlobalName() + key);
			},
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
						/* replace the link of the parent if only one activity in the menu */
						if (this.activities.length == 1) {
							var url = this.activities[0].url;
							el.find("[class='menuTitle']").attr('href', url);
						}
						else {
							el.append('<ul style="display:none" id="' + ulId + '"></ul>');
							el.click(function() {
								//el.find("#" + ulId).toggle();
							});
							_.each(this.activities, function(activity) {
								activity.load(el.find("#" + ulId), false);
							});
						}
					}

					if (this.pa && this.pa.length > 0) {
						if (el.find("#" + ulId).length == 0) {
							el.append('<ul style="display:none" id="' + ulId + '"></ul>');
						}
						var i = 0;
						_.each(this.pa, function(subprocess) {
							var liID = ulId + '_li_' + i++;
							if(subprocess.id == undefined) subprocess.id = liID;
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

});
