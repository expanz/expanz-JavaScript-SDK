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
		lastRequest:"", lastResponse:"",
		// Request Objects -> to be passed to SendRequest
		CreateSessionRequest : function(username, password, authenticationMode, callbacks) {
			expanz.Storage.clearSession(); /* clear previous existing sessions */
			var appsite = config.appSite;
			SendRequest(requestBuilder.CreateSession(username, password, appsite, authenticationMode), parseCreateSessionResponse(callbacks));
		},

		WebServerPing : function(nbAttempts) {
			if (nbAttempts === undefined)
			    nbAttempts = 3;
		    
			if (window.expanz.pingError === undefined)
				window.expanz.pingError = 0;

			SendRequest(requestBuilder.WebServerPing(), function(data) {
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

			SendRequest(requestBuilder.GetSessionData(expanz.Storage.getSessionHandle()), parseGetSessionDataResponse(callbacks));
		},

		CreateActivityRequest : function(activity, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

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

				SendRequest(requestBuilder.CreateActivity(activity, expanz.Storage.getSessionHandle()), parseResponse(activity, initiator, callbacks));
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
				SendRequest(requestBuilder.GetSavePreferences(key, value, expanz.Storage.getSessionHandle()));
			}
		},

		DeltaRequest : function(id, value, activity, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

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

			SendRequest(requestBuilder.Delta(id, value, activity, expanz.Storage.getSessionHandle()), parseResponse(activity, initiator, callbacks),null,true);
		},

		MethodRequest : function(name, methodAttributes, context, activity, anonymousFields, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

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
			    SendRequest(requestBuilder.AnonymousMethod(name, methodAttributes, context, activity, anonymousFields), parseResponse(activity, initiator, callbacks), null, true);
			}
			else {
			    SendRequest(requestBuilder.Method(name, methodAttributes, context, activity, expanz.Storage.getSessionHandle()), parseResponse(activity, initiator, callbacks), null, true);
			}

		},

		/* only use on load of the page to load the datapublications in anonymous context */
		AnonymousMethodsRequest : function(methods, activity, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

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

			SendRequest(requestBuilder.AnonymousMethods(methods, activity), parseResponse(activity, initiator, callbacks), null, true);

		},
		
		SetContextAndDeltaRequest: function (contextInfo, deltaInfo, activity, callbacks) {
		    if (callbacks === undefined)
		        callbacks = activity.callbacks;

		    var initiator = {};
		    
		    SendRequest(requestBuilder.SetContextAndDelta(contextInfo, deltaInfo, activity, expanz.Storage.getSessionHandle()), parseResponse(activity, initiator, callbacks), null, true);
	    },

		CloseActivityRequest: function (activityHandle, callbacks, callAsync) {

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.views.requestLogin();
				return;
			}

			SendRequest(requestBuilder.CloseActivity(activityHandle, expanz.Storage.getSessionHandle()), parseCloseActivityResponse(callbacks), false, callAsync);
		},

		DataRefreshRequest : function(dataId, activity, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

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

			SendRequest(requestBuilder.DataRefresh(dataId, activity, expanz.Storage.getSessionHandle()), parseResponse(activity, initiator, callbacks), null, true);
		},

		ReleaseSessionRequest : function(callbacks) {
			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.views.requestLogin();
				return;
			}
			SendRequest(requestBuilder.ReleaseSession(expanz.Storage.getSessionHandle()), parseReleaseSessionResponse(callbacks));
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

			SendNormalRequest(requestBuilder.GetBlob(blobId, activity, expanz.Storage.getSessionHandle()));
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

			SendNormalRequest(requestBuilder.GetFile(filename, activity, expanz.Storage.getSessionHandle()));
		},

		/* call when selecting something from the tree view (file) or menu action */
		CreateMenuActionRequest: function (activity, contextId, contextType, contextObject, menuAction, defaultAction, setIdFromContext, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

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

			SendRequest(requestBuilder.CreateMenuAction(activity, contextId, contextType, contextObject, menuAction, defaultAction, setIdFromContext, expanz.Storage.getSessionHandle()), parseResponse(activity, initiator, callbacks), null, true);
		},

		/* call when selecting something from the tree view (file) or menu action */
		CreateContextMenuRequest : function(activity, contextId, contextMenuType, contextObject, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

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

			SendRequest(requestBuilder.CreateContextMenuAction(activity, contextId, contextMenuType, contextObject, expanz.Storage.getSessionHandle()), parseResponse(activity, initiator, callbacks), null, true);
		},

		/* create an anonymous request */
		CreateAnonymousRequest : function(xmlData, callbacks) {
			if (callbacks === undefined)
			    callbacks = window.expanz.defaultCallbacks;
		    
			SendRequest(requestBuilder.CreateAnonymousRequest(xmlData), parseExecAnonymousResponse(callbacks));
		}

	};


	/*
	 * Send Request :manage the sending of XML requests to the server, and dispatching of response handlers
	 */
	var requestBusy;
	var requestQueue = [];
    
	var SendRequest = function (request, responseHandler, isPopup, callAsync) {
		if (false && requestBusy) {
			requestQueue.push([request, responseHandler, isPopup]);
		}

		window.expanz.logToConsole("REQUEST:");
		window.expanz.logToConsole(request.data);

		requestBusy = true;
		window.expanz.net.lastRequest = request.data;
	    
		var isAsync = callAsync === undefined || callAsync;

	    $(window).trigger("serverRequestStarted");
	    
		$.ajaxSetup({
		    headers: { "cache-control": "no-cache" } // http://stackoverflow.com/questions/12506897/is-safari-on-ios-6-caching-ajax-results
		});

		var onRequestComplete = function (HTTPrequest) {
		    requestBusy = false;
		    window.expanz.net.lastResponse = HTTPrequest.responseText;

		    window.expanz.logToConsole("RESPONSE:");
		    window.expanz.logToConsole(HTTPrequest.responseText);

		    if (HTTPrequest.status === 0) {
		        // Request was cancelled
		    }
		    else if (HTTPrequest.status != 200) {
		        //eval(responseHandler)('There was a problem with the last request.');
		        alert("There was a problem with the last server request. Status code " + HTTPrequest.status);
		    }
		    else {
		        if (isPopup !== undefined && isPopup === true) {
		            var WinId = window.open('', 'newwin', 'width=400,height=500');
		            WinId.document.open();
		            WinId.document.write(HTTPrequest.responseText);
		            WinId.document.close();
		        }
		        else {
		            if (responseHandler) {
		                eval(responseHandler)(HTTPrequest.responseXML);
		            }
		        }
		    }

		    $(window).trigger("serverRequestCompleted");
		};
	    
		if (config.urlProxy !== undefined && config.urlProxy.length > 0) {
			$.ajax({
				type : 'POST',

				url: config.urlProxy,

				data: {
					url : getUrlRestService(request.url),
					data : request.data,
					method : request.method || "POST"
				},

				dataType: 'XML',

				processData: true,
				
				async: isAsync,

				complete: onRequestComplete
			});
		}
		else {
			$.ajax({
			    type: request.method || "POST",
			    
			    url: getUrlRestService(request.url),
			    
			    data: request.data,
			    
			    dataType: 'XML',
			    
			    processData: true,

			    async: isAsync,
			    
			    complete : onRequestComplete
			});
		}
	};

	/*
	 * Send Request :manage the sending of XML requests to the server, and dispatching of response handlers. Proxy is needed.
	 */

	var SendNormalRequest = function(request) {

		if ($("#formFile")) {
			$("#formFile").remove();
		}

		var form = '';
		form += "<form method='post' id='formFile' target='_blank' action='" + config.urlProxy + "'>";
		form += "<input type='hidden' name='url' value='" + getUrlRestService(request.url) + "'>";

		form += "<input type='hidden' name='data' value='" + request.data + "'>";
		form += "</form>";
		$("body").append(form);

		$("#formFile").submit();

	};

	function getUrlRestService(path) {
	    var sep = "";
	    
		if (!config.urlPrefix.endsWith("/"))
		    sep = "/";
	    
		return config.urlPrefix + sep + path;
	}
});
