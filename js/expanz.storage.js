/* Author: Adam Tait

 */

$(function() {

	window.expanz = window.expanz || {};

	window.expanz.Storage = {

		// functions

		_getBestStorage : function() {
			if (window['localStorage'] !== null) {
				/*
				 * length is unused but please leave it. I don't know why but sometimes firefox get an empty window.localStorage by mistake Doing this force it to evaluate the window.localStorage object and it seems to work
				 */
				window.localStorage.length;
				return this.localStorage;
			}
			else {
				return this.cookies;
			}
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

		getLastPingSuccess : function() {
			return this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'lastPingSuccess');
		},

		setPingSuccess : function() {
			this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'lastPingSuccess', (new Date()).getTime());
			return true;
		},

		clearSession : function() {
			this._getBestStorage().remove(expanz.Storage._getStorageGlobalName() + 'session.handle');
			this._getBestStorage().remove(expanz.Storage._getStorageGlobalName() + 'lastPingSuccess');
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
			/* send a request to the servr to remove it as well */
			var ah = this.getActivityHandle(activityName, activityStyle);
			if (ah !== undefined) {
				this._getBestStorage().remove(expanz.Storage._getStorageGlobalName() + 'activity.handle.' + activityName + activityStyle);
				expanz.Net.DestroyActivityRequest(ah);
			}
			return ah;

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
			}
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
			}
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

					var url = window.location.pathname;
					var currentPage = url.substring(url.lastIndexOf('/') + 1);

					// load process areas into DOM menu
					el.append('<ul id="menuUL" class="menu"></ul>');

					var homeLabel = el.attr('homeLabel') || 'Home';
					var logoutLabel = el.attr('logoutLabel') || 'Logout';
					var backLabel = el.attr('backLabel') || 'Back';

					// add back button if defined
					if (window.config._backButton === true) {
						el.find("#menuUL").append('<li class="processarea menuitem" id="home"><a href="#" onclick="history.go(-1);return true;" class="backbutton menuTitle">' + backLabel + '</a></li>');
					}
					
					// add home page if defined
					if (window.config._homepage) {
						var homeClass = "";
						if (window.config._homepage.endsWith(currentPage)) {
							homeClass = "selected selectedNew ";
						}
						el.find("#menuUL").append('<li class="' + homeClass + ' processarea menuitem" id="home"><a href="' + window.config._homepage + '" class="home menuTitle">' + homeLabel + '</a></li>');
					}

					_.each(this.processAreas, function(pA) {
						el.find("#menuUL").append('<li class="processarea menuitem" id="' + pA.id + '"><a class="menuTitle" href="#">' + pA.title + '</a></li>');
						pA.load(el.find('#' + pA.id + '.processarea.menuitem'), 0, false);
					});
					// add html and click handler to DOM
					el.append('<ul class="right logoutContainer"><li class="processarea" id="logout"><a class="logout menuTitle">' + logoutLabel + '</a></li></ul>');
					el.append('<div style="clear:both"></div>');

					$(el.find('#logout')[0]).click(function(e) {
						expanz.Logout();
					});
				}

			};
		},

		ProcessAreaMenu : function(id, title) {
			this.id = id;
			this.title = title;
			this.activities = [];
			this.pa = []; /* sub process area */

			this.load = function(el, level, displayAsIcons, parentSubProcesses) {
				var url = window.location.pathname;
				var currentPage = url.substring(url.lastIndexOf('/') + 1);

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
							/* workaround for kendo issue : bind touchend */
							el.find("[class='menuTitle']").bind("touchend", function(e) {
								window.location.href = url;
							});

							/* add selected class if current */
							if (url.endsWith(currentPage)) {
								el.addClass("selected selectedNew");
							}
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
						if (el.find("#" + ulId).length === 0) {
							el.append('<ul style="display:none" id="' + ulId + '"></ul>');
						}
						var i = 0;
						_.each(this.pa, function(subprocess) {
							var liID = ulId + '_li_' + i++;
							if (subprocess.id === undefined)
								subprocess.id = liID;
							el.find("#" + ulId).append('<li class="processarea menuitem" id="' + liID + '"><a class="menuTitle" href="#">' + subprocess.title + '</a></li>');
							subprocess.load(el.find('#' + liID + '.processarea.menuitem'), level + 1);
						});
					}
				}
			};
		},

		ActivityMenu : function(name, style, title, url, img) {
			this.name = name;
			this.style = style;
			this.title = title;
			this.url = url;
			this.img = img;

			this.load = function(el, displayAsIcons) {
				if (displayAsIcons === true) {
					el.append('<li><div class="icon navContainer"><a class="nav-' + this.name.replace(/\./g, "-") + "-" + this.style.replace(/\./g, "-") + ' navItem" href="' + this.url + '"></a><a class="navText" href="' + this.url + '">' + this.title + '</a></div></li>');
				}
				else {
					el.append('<li class="activity">' + '<a href=\'' + this.url + '\'>' + this.title + '</a>' + '</li>');
				}
			};

		}

	};

});
