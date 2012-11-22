////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////

$(function() {

	window.expanz = window.expanz || {};

	window.expanz.Storage = {
		// functions

		_getBestStorage : function() {
			if (window['localStorage'] !== null && window.localStorage) {
				/*
				 * length is unused but please leave it. I don't know why but sometimes firefox get an empty window.localStorage by mistake 
                   Doing this force it to evaluate the window.localStorage object and it seems to work
				 * SMN Possibly try Modernizr (http://diveintohtml5.info/storage.html)
				 */
				var lth = window.localStorage.length;
				lth = lth;
				return this.localStorage;
			}
			else {
				return this.cookies;
			}
		},

		_getStorageGlobalName : function() {
			var siteCountry = config._siteCountry === undefined ? '' : '_' + config._siteCountry;
			var siteEnvironment = config._siteEnvironment === undefined ? '' : '_' + config._siteEnvironment;
		
			return "_expanz_" + config._AppSite + siteCountry + siteEnvironment + "_";
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

		getUserDetailsList : function() {
			var userDetails = JSON.parse(this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'userDetails.list'));
			return userDetails;
		},
		
		setUserDetails : function(userDetails) {
			this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'userDetails.list', JSON.stringify(userDetails));
			return true;
		},
		
		setRolesList : function(roles) {
			this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'roles.list', JSON.stringify(roles));
			return true;
		},

		/* is used for display but HAVE TO be enforced on the server as well */
		hasRole : function(id) {
			var roles = JSON.parse(this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'roles.list'));
			if (roles !== null) {
				return (roles[id] !== undefined);
			}
			return false;
		},

		setDashboards : function(dashboards) {
			this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'dashboards', JSON.stringify(dashboards));
			return true;
		},

		getDashboardFieldValue : function(dashboardName, fieldName) {
			var dashboards = JSON.parse(this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'dashboards'));
			if (dashboards !== null && dashboards[dashboardName] !== null) {
				return (dashboards[dashboardName][fieldName]);
			}
			return null;
		},

		getLastPingSuccess : function() {
			return this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'lastPingSuccess');
		},

		setPingSuccess : function() {
			this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'lastPingSuccess', (new Date()).getTime());
			return true;
		},

		getLastURL : function() {
			return this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'lastURL');
		},

		setLastURL : function(url) {
			this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'lastURL', url);
			return true;
		},

		clearLastURL : function() {
			this._getBestStorage().remove(expanz.Storage._getStorageGlobalName() + 'lastURL');
			return true;
		},

		setUserPreference : function(key, value) {
			this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'UserPreference' + key, value);
			return true;
		},

		getUserPreference : function(key) {
			return this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'UserPreference' + key);
		},

		setFormMapping: function (value) {
		    this._formMappingData = value;
		    this._getBestStorage().set(expanz.Storage._getStorageGlobalName() + 'FormMapping', this.serializeXML(value));
			return true;
		},

		getFormMapping: function () {
		    if (this._formMappingData === undefined) {
		        var formMappingXml = this._getBestStorage().get(expanz.Storage._getStorageGlobalName() + 'FormMapping');
		        
		        if (formMappingXml != null)
		            this._formMappingData = $.parseXML(formMappingXml);
		    }
		    
		    return this._formMappingData;
		},

		clearSession : function() {
			var storage = this._getBestStorage();
			var storageGlobalName = expanz.Storage._getStorageGlobalName();
			storage.remove(storageGlobalName + 'session.handle');
			storage.remove(storageGlobalName + 'lastPingSuccess');
			storage.remove(storageGlobalName + 'roles.list');
			storage.remove(storageGlobalName + 'dashboards');
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
				expanz.net.CloseActivityRequest(ah);
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
		
		sessionStorage: {
		    name: 'sessionStorage',
		    set: function (key, data) {
		        window.sessionStorage.setItem(key, data);
		    },

		    get: function (key) {
		        return window.sessionStorage.getItem(key);
		    },

		    getKeys: function (pattern) {
		        var keys = [];
		        for (i = 0; i < window.sessionStorage.length; i++) {
		            key = window.sessionStorage.key(i);
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

		    remove: function (key) {
		        return window.sessionStorage.removeItem(key);
		    }
		},
		
	    // Serialize an XML Document or Element and return it as a string.
		serializeXML: function(xmlElement) {
		    if (xmlElement.xml) 
		        return xmlElement.xml;
		    else if (typeof XMLSerializer != "undefined")
		        return (new XMLSerializer()).serializeToString(xmlElement) ;
		    else 
		        throw "Browser cannot serialize objects to XML";
		}
	};
});
