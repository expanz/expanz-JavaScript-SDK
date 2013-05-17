/*!
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Usage: http://expanz.com/docs/client-technologies/javascript-sdk/
//  Author: Kim Damevin, Chris Anderson
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
 */
$(function() {

	window.expanz = window.expanz || {};

	window.expanz.clientVersion = "1.0";

	window.expanz.helper = window.expanz.helper || {};

	window.expanz.net = {
		// Request Objects -> to be passed to ServerRequestManager
		CreateSessionRequest : function(username, password, authenticationMode, callbacks) {
			expanz.Storage.clearSession(); /* clear previous existing sessions */
			var appsite = config.appSite;
			serverRequestManager.queueRequest(requestBuilder.CreateSession(username, password, appsite, authenticationMode), parseCreateSessionResponse(callbacks));
		},

		WebServerPing : function(nbAttempts) {
			if (nbAttempts === undefined)
			    nbAttempts = 3;
		    
			if (window.expanz.pingError === undefined)
				window.expanz.pingError = 0;

			serverRequestManager.queueRequest(requestBuilder.WebServerPing(), function(data) {
			    var res = ($(data).find("WebServerPingResult"));
			    
				if (res.length > 0 && res.text() == "true") {
					window.expanz.pingError = 0;
					window.expanz.Storage.setPingSuccess();
					window.expanz.logToConsole("WEB SERVER PING OK");
				}
				else {
					//window.expanz.logToConsole("WEB SERVER PING FAILED" + getUrlRestService(requestBuilder.WebServerPing().url) + " DATA " + data);
				    window.expanz.pingError++;
				    
					if (window.expanz.pingError === nbAttempts) {
						expanz.views.redirect(window.expanz.getMaintenancePage());
					}
					else {
						// ping again
						window.expanz.net.WebServerPing(nbAttempts);
					}
				}
			});
		},

		GetSessionDataRequest : function(callbacks) {
			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.views.requestLogin();
				return;
			}

			serverRequestManager.queueRequest(requestBuilder.GetSessionData(expanz.Storage.getSessionHandle()), parseGetSessionDataResponse(callbacks));
		},

		CreateActivityRequest : function(activity, callbacks) {
			if (activity.get('allowAnonymous') === false) {
				if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
					expanz.views.requestLogin();
					return;
				}
			}

			/* if allow anonymous and session doesn't exist we don't create anything on the server */
			if (expanz.Storage.getSessionHandle() && expanz.Storage.getSessionHandle() !== "") {
			    var initiator = null;

			    /* check if an activity has already been created, if so specify it instead of creating a new one */
			    var activityHandle = expanz.Storage.getActivityHandle(activity.get('name'), activity.get('style'));

			    if (activity.get("keepOpenForSession") === true && activityHandle !== undefined && activityHandle !== null) {
			        activity.set({
			            'handle': activityHandle
			        });
			    } else {
			        // When parsing the create activity response, the parser won't have an activity handle
			        // that it can use to find the activity in the list of open activities, so we need to
			        // pass the instance as an initiator.
			        initiator = {
			            type: "CreateActivity",
			            activityModel: activity
			        };
			    }

			    activity.set({
					loading : true
				});

			    serverRequestManager.queueRequest(requestBuilder.CreateActivity(activity, expanz.Storage.getSessionHandle()), parseResponse(activity, initiator, callbacks || activity.callbacks));
			}
			else {
				/* anonymous case because no session handle is set */
			}
		},

		GetSavePreferencesRequest : function(activity, key, value, updateClientStorage, callbacks) {
			if (activity.get('allowAnonymous') === false) {
				if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
					expanz.views.requestLogin();
					return;
				}
			}

			if (updateClientStorage === true) {
				window.expanz.Storage.setUserPreference(key, value);
			}

			if (!activity.isAnonymous()) {
				// TODO check if we need a callback
				serverRequestManager.queueRequest(requestBuilder.GetSavePreferences(key, value, expanz.Storage.getSessionHandle()));
			}
		},

		DeltaRequest : function(id, value, activity, callbacks) {
			if (activity.get('allowAnonymous') === false) {
				if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
					expanz.views.requestLogin();
					return;
				}
			}

			var initiator = {
				type : "field",
				id : id
			};

			activity.set({
				'deltaLoading' : {
					isLoading : true,
					initiator : initiator
				}
			});

			serverRequestManager.queueRequest(requestBuilder.Delta(id, value, activity, expanz.Storage.getSessionHandle()), parseResponse(activity, initiator, callbacks || activity.callbacks), null, true);
		},

		MethodRequest : function(name, methodAttributes, context, activity, anonymousFields, callbacks) {
			if (activity.get('allowAnonymous') === false) {
				if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
					expanz.views.requestLogin();
					return;
				}
			}

			var initiator = {
				type : "method",
				id : name
			};

			activity.set({
				'deltaLoading' : {
					isLoading : true,
					initiator : initiator
				}
			});

			// activity allows anonymous and user not logged in
			if (activity.isAnonymous()) {
			    serverRequestManager.queueRequest(requestBuilder.AnonymousMethod(name, methodAttributes, context, activity, anonymousFields), parseResponse(activity, initiator, callbacks || activity.callbacks), null, true);
			}
			else {
			    serverRequestManager.queueRequest(requestBuilder.Method(name, methodAttributes, context, activity, expanz.Storage.getSessionHandle()), parseResponse(activity, initiator, callbacks || activity.callbacks), null, true);
			}
		},

		/* only use on load of the page to load the datapublications in anonymous context */
		AnonymousMethodsRequest : function(methods, activity, callbacks) {
			var initiator = {
				type : "anonymous",
				id : "anonymous"
			};

			activity.set({
				'deltaLoading' : {
					isLoading : true,
					initiator : initiator
				}
			});

			serverRequestManager.queueRequest(requestBuilder.AnonymousMethods(methods, activity), parseResponse(activity, initiator, callbacks || activity.callbacks), null, true);
		},
		
		SetContextAndDeltaRequest: function (contextInfo, deltaInfo, activity, callbacks) {
		    var initiator = {};
		    serverRequestManager.queueRequest(requestBuilder.SetContextAndDelta(contextInfo, deltaInfo, activity, expanz.Storage.getSessionHandle()), parseResponse(activity, initiator, callbacks || activity.callbacks), null, true);
	    },

		CloseActivityRequest: function (activityHandle, callbacks, callAsync) {
			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.views.requestLogin();
				return;
			}

			serverRequestManager.queueRequest(requestBuilder.CloseActivity(activityHandle, expanz.Storage.getSessionHandle()), parseCloseActivityResponse(callbacks), false, callAsync);
		},

		DataRefreshRequest : function(dataId, activity, callbacks) {
			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.views.requestLogin();
				return;
			}

			var initiator = {
				type : "resfresh",
				id : dataId
			};

			activity.set({
				'deltaLoading' : {
					isLoading : true,
					initiator : initiator
				}
			});

			serverRequestManager.queueRequest(requestBuilder.DataRefresh(dataId, activity, expanz.Storage.getSessionHandle()), parseResponse(activity, initiator, callbacks || activity.callbacks), null, true);
		},

		ReleaseSessionRequest : function(callbacks) {
			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.views.requestLogin();
				return;
			}
		    
			serverRequestManager.queueRequest(requestBuilder.ReleaseSession(expanz.Storage.getSessionHandle()), parseReleaseSessionResponse(callbacks));
		},

		GetBlobRequest : function(blobId, activity, initiator) {
			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.views.requestLogin();
				return;
			}

			/* even if the file is not opened yet, we consider the delta loading is finished */
			activity.set({
				'deltaLoading' : {
					isLoading : false,
					initiator : initiator
				}
			});

			serverRequestManager.sendNormalRequest(requestBuilder.GetBlob(blobId, activity, expanz.Storage.getSessionHandle()));
		},

		GetFileRequest : function(filename, activity, initiator) {
			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.views.requestLogin();
				return;
			}

			/* even if the file is not opened yet, we consider the delta loading is finished */
			activity.set({
				'deltaLoading' : {
					isLoading : false,
					initiator : initiator
				}
			});

			serverRequestManager.sendNormalRequest(requestBuilder.GetFile(filename, activity, expanz.Storage.getSessionHandle()));
		},

		/* call when selecting something from the tree view (file) or menu action */
		CreateMenuActionRequest: function (activity, contextId, contextType, contextObject, menuAction, defaultAction, setIdFromContext, callbacks) {
			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.views.requestLogin();
				return;
			}

			var initiator = {
				type : "menuaction",
				id : contextId
			};

			activity.set({
				'deltaLoading' : {
					isLoading : true,
					initiator : initiator
				}
			});

			serverRequestManager.queueRequest(requestBuilder.CreateMenuAction(activity, contextId, contextType, contextObject, menuAction, defaultAction, setIdFromContext, expanz.Storage.getSessionHandle()), parseResponse(activity, initiator, callbacks || activity.callbacks), null, true);
		},

		/* call when selecting something from the tree view (file) or menu action */
		CreateContextMenuRequest : function(activity, contextId, contextMenuType, contextObject, callbacks) {
			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.views.requestLogin();
				return;
			}

			var initiator = {
				type : "contextmenu",
				id : contextId
			};

			activity.set({
				'deltaLoading' : {
					isLoading : true,
					initiator : initiator
				}
			});

			serverRequestManager.queueRequest(requestBuilder.CreateContextMenuAction(activity, contextId, contextMenuType, contextObject, expanz.Storage.getSessionHandle()), parseResponse(activity, initiator, callbacks || activity.callbacks), null, true);
		},

		/* create an anonymous request */
		CreateAnonymousRequest : function(xmlData, callbacks) {
			serverRequestManager.queueRequest(requestBuilder.CreateAnonymousRequest(xmlData), parseExecAnonymousResponse(callbacks || window.expanz.defaultCallbacks));
		}
	};
});
