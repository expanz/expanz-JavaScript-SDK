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
			var sessionHandle = this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'session.handle');
			if (sessionHandle == 'undefined')
				return undefined;
			return sessionHandle;
		},

		setSessionHandle : function(sessionHandle) {
			this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'session.handle', sessionHandle);
			if (this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'login.url') == null) {
				this.setLoginURL(document.location.pathname);
			}
			return true;
		},

		getActivityHandle : function(activityName, activityStyle) {
			var activityHandle = this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'activity.handle.' + activityName + activityStyle);
			if (activityHandle == 'undefined')
				return undefined;
			if (activityHandle)
				activityHandle = activityHandle.replace('_', '.');
			return activityHandle;
		},

		setActivityHandle : function(activityHandle, activityName, activityStyle) {
			this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'activity.handle.' + activityName + activityStyle, activityHandle.replace('.', '_'));
			return true;
		},

		getProcessAreaList : function() {
			if (typeof this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'processarea.list') == "object") {
				return this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'processarea.list');
			}
			return JSON.parse(this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'processarea.list'));
		},

		setProcessAreaList : function(list) {
			this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'processarea.list', JSON.stringify(list));
			return true;
		},

		getLoginURL : function() {
			var loginUrl = this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'login.url');
			/* if login url is null try to guess it by removing the filename */
			if (loginUrl == null) {
				loginUrl = document.location.pathname.substring(0, document.location.pathname.lastIndexOf("/"));
			}
			return loginUrl;
		},

		clearSession : function() {
			this._getBestStorage().remove(expanz.Storage._getStorageGlobalName() + 'session.handle');
			this.clearActivityHandles();
			return true;
		},

		clearActivityHandles : function(activityName, activityStyle) {
			var storage = this._getBestStorage();
			var keys = storage.getKeys(expanz.Storage._getStorageGlobalName() + 'activity.handle');
			_.each(keys, function(key) {
				storage.remove(key);
			});
		},

		clearActivityHandle : function(activityName, activityStyle) {
			this._getBestStorage().remove(expanz.Storage._getStorageGlobalName() + 'activity.handle.' + activityName + activityStyle);
		},

		setLoginURL : function(url) {
			this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'login.url', url);
			return true;
		},

		/* storage implementations */
		/* cookies */
		cookies : {
			name : 'cookie',
			set : function(key, data) {
				$.cookies.set(key, data);
			},

			get : function(key) {
				return $.cookies.get(key);
			},

			getKeys : function(pattern) {
				var keys = [];
				_.each($.cookies.filter(pattern), function(value, key) {
					keys.push(key);
				});
				return keys;
			},

			remove : function(key) {
				$.cookies.del(key);
			},
		},

		/* localStorage */
		localStorage : {
			name : 'localStorage',
			set : function(key, data) {
				window.localStorage.setItem(key, data);
			},

			get : function(key) {
				return window.localStorage.getItem(key);
			},

			getKeys : function(pattern) {
				var keys = [];
				for (i = 0; i < window.localStorage.length; i++) {
					key = window.localStorage.key(i);
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
				return window.localStorage.removeItem(key);
			},
		},

		// objects

		AppSiteMenu : function() {
			this.processAreas = [];

			this.load = function(el, level, parentSubProcesses) {
				el.html("");
				if (el.attr('type') == 'icon') {
					if (level > 0) {
						el.append('<div id="backOneLevel" class="icon"><img src="assets/images/home.png">Back</div>');
						el.find("#backOneLevel").click(function() {
							var menu = new expanz.Storage.AppSiteMenu();
							menu.processAreas = parentSubProcesses;
							menu.load(el.closest("[bind=menu]"), level - 1);
						});
					}
					var that = this;
					_.each(this.processAreas, function(pA) {
						pA.load(el, 0, true, that.processAreas);
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

			this.load = function(el, level, displayAsIcons, parentSubProcesses) {
				if (displayAsIcons === true) {

					_.each(this.activities, function(activity) {
						activity.load(el, true);
					});

					if (this.pa && this.pa.length > 0) {
						var i = 0;
						var j = new Date().getTime();
						_.each(this.pa, function(subprocess) {
							var subId = 'subprocess' + j + "_" + i++;
							el.append('<div id="' + subId + '" class="icon"><img src="' + subprocess.img + '"/><br/> ' + subprocess.title + '</div>');

							el.find("#" + subId).click(function() {
								var menu = new expanz.Storage.AppSiteMenu();
								menu.processAreas = [
									subprocess
								];
								menu.load(el.closest("[bind=menu]"), level + 1, parentSubProcesses);
							});
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
								// el.find("#" + ulId).toggle();
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
							if (subprocess.id == undefined)
								subprocess.id = liID;
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
