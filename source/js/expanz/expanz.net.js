/*!
////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Usage: http://expanz.com/docs/client-technologies/javascript-sdk/
//  Author: Kim Damevin
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

	window.expanz.Net = {
        
	    lastRequest:"", lastResponse:"",
		// Request Objects -> to be passed to SendRequest
		CreateSessionRequest : function(username, password, callbacks) {
			expanz.Storage.clearSession(); /* clear previous existing sessions */
			var appsite = config._AppSite;
			var authenticationMode = config._AuthenticationMode;
			SendRequest(RequestObject.CreateSession(username, password, appsite, authenticationMode), parseCreateSessionResponse(callbacks));
		},

		WebServerPing : function(nbAttempts) {
			if (nbAttempts == undefined)
				nbAttempts = 3;
			if (window.expanz.pingError === undefined)
				window.expanz.pingError = 0;

			SendRequest(RequestObject.WebServerPing(), function(data) {
				var res = ($(data).find("WebServerPingResult"));
				if (res.length > 0 && res.text() == "true") {
					window.expanz.pingError = 0;
					window.expanz.Storage.setPingSuccess();
					window.expanz.logToConsole("WEB SERVER PING OK");
				}
				else {
					window.expanz.pingError++;
					if (window.expanz.pingError === nbAttempts) {
						expanz.Views.redirect(window.expanz.getMaintenancePage());
					}
					else {
						// ping again
						window.expanz.Net.WebServerPing(nbAttempts);
					}
				}
			});

		},

		GetSessionDataRequest : function(callbacks) {

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.Views.requestLogin();
				return;
			}

			SendRequest(RequestObject.GetSessionData(expanz.Storage.getSessionHandle()), parseGetSessionDataResponse(callbacks));
		},

		CreateActivityRequest : function(activity, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

			if (activity.getAttr('allowAnonymous') === false) {
				if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
					expanz.Views.requestLogin();
					return;
				}
			}

			/* if allow anonymous and session doesn't exist we don't create anything on the server */
			if (expanz.Storage.getSessionHandle() && expanz.Storage.getSessionHandle() !== "") {

				/* check if an activity has already been created, if so specify it instead of creating a new one */
				var activityHandle = expanz.Storage.getActivityHandle(activity.getAttr('name'), activity.getAttr('style'));

				if (activityHandle && activityHandle !== undefined) {
					activity.setAttr({
						'handle' : activityHandle
					});
				}

				activity.setAttr({
					loading : true
				});

				SendRequest(RequestObject.CreateActivity(activity, expanz.Storage.getSessionHandle()), parseCreateActivityResponse(activity, callbacks));
			}
			else {
				/* anonymous case because no session handle is set */
			}
		},

		GetSavePreferencesRequest : function(activity, key, value, updateClientStorage, callbacks) {

			if (activity.getAttr('allowAnonymous') === false) {
				if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
					expanz.Views.requestLogin();
					return;
				}
			}

			if (updateClientStorage === true) {
				window.expanz.Storage.setUserPreference(key, value);
			}

			if (!activity.isAnonymous()) {
				// TODO check if we need a callback
				SendRequest(RequestObject.GetSavePreferences(key, value, expanz.Storage.getSessionHandle()));
			}
		},

		DeltaRequest : function(id, value, activity, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

			if (activity.getAttr('allowAnonymous') === false) {
				if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
					expanz.Views.requestLogin();
					return;
				}
			}

			var initiator = {
				type : "field",
				id : id
			};

			activity.setAttr({
				'deltaLoading' : {
					isLoading : true,
					initiator : initiator
				}
			});

			SendRequest(RequestObject.Delta(id, value, activity, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, initiator, callbacks),null,true);
		},

		MethodRequest : function(name, methodAttributes, context, activity, anonymousFields, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

			if (activity.getAttr('allowAnonymous') === false) {
				if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
					expanz.Views.requestLogin();
					return;
				}
			}

			var initiator = {
				type : "method",
				id : name
			};

			activity.setAttr({
				'deltaLoading' : {
					isLoading : true,
					initiator : initiator
				}
			});

			// activity allows anonymous and user not logged in
			if (activity.isAnonymous()) {
				SendRequest(RequestObject.AnonymousMethod(name, methodAttributes, context, activity, anonymousFields), parseDeltaResponse(activity, initiator, callbacks),null,true);
			}
			else {
			    SendRequest(RequestObject.Method(name, methodAttributes, context, activity, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, initiator, callbacks), null, true);
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

			activity.setAttr({
				'deltaLoading' : {
					isLoading : true,
					initiator : initiator
				}
			});

			SendRequest(RequestObject.AnonymousMethods(methods, activity), parseDeltaResponse(activity, initiator, callbacks), null, true);

		},

		DestroyActivityRequest : function(activityHandle, callbacks) {

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.Views.requestLogin();
				return;
			}

			SendRequest(RequestObject.DestroyActivity(activityHandle, expanz.Storage.getSessionHandle()), parseDestroyActivityResponse(callbacks));
		},

		DataRefreshRequest : function(dataId, activity, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.Views.requestLogin();
				return;
			}

			var initiator = {
				type : "resfresh",
				id : dataId
			};

			activity.setAttr({
				'deltaLoading' : {
					isLoading : true,
					initiator : initiator
				}
			});

			SendRequest(RequestObject.DataRefresh(dataId, activity, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, initiator, callbacks), null, true);
		},

		ReleaseSessionRequest : function(callbacks) {
			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.Views.requestLogin();
				return;
			}
			SendRequest(RequestObject.ReleaseSession(expanz.Storage.getSessionHandle()), parseReleaseSessionResponse(callbacks));
		},

		GetBlobRequest : function(blobId, activity, initiator) {

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.Views.requestLogin();
				return;
			}

			/* even if the file is not opened yet, we consider the delta loading is finished */
			activity.setAttr({
				'deltaLoading' : {
					isLoading : false,
					initiator : initiator
				}
			});

			SendNormalRequest(RequestObject.GetBlob(blobId, activity, expanz.Storage.getSessionHandle()));
		},

		GetFileRequest : function(filename, activity, initiator) {

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.Views.requestLogin();
				return;
			}

			/* even if the file is not opened yet, we consider the delta loading is finished */
			activity.setAttr({
				'deltaLoading' : {
					isLoading : false,
					initiator : initiator
				}
			});

			SendNormalRequest(RequestObject.GetFile(filename, activity, expanz.Storage.getSessionHandle()));
		},

		/* call when selecting something from the tree view (file) or menu action */
		CreateMenuActionRequest : function(activity, contextId, contextType, menuAction, defaultAction, setIdFromContext, callbacks) {
			if (callbacks === undefined)
				callbacks = activity.callbacks;

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() === "") {
				expanz.Views.requestLogin();
				return;
			}

			var initiator = {
				type : "menuaction",
				id : contextId
			};

			activity.setAttr({
				'deltaLoading' : {
					isLoading : true,
					initiator : initiator
				}
			});

			SendRequest(RequestObject.CreateMenuAction(activity, contextId, contextType, menuAction, defaultAction, setIdFromContext, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, initiator, callbacks), null, true);
		},

		/* create an anonymous request */
		CreateAnonymousRequest : function(xmlData, callbacks) {
			if (callbacks === undefined)
				callbacks = window.expanz.defaultCallbacks;
			SendRequest(RequestObject.CreateAnonymousRequest(xmlData), parseExecAnonymousResponse(callbacks));
		}

	};

	//
	// Request Objects (used when passed to SendRequest( ... )
	//
	var XMLNamespace = window.config._XMLNamespace || XMLNamespace; // TODO: throw an error here, saying that window.config._XMLNamespace is required
	var RequestObject = {

		CreateSession : function(username, password, appsite, authenticationMode) {
			return {
				data : buildRequest('CreateSessionX', XMLNamespace)(RequestBody.CreateSession(username, password, appsite, authenticationMode)),
				url : 'CreateSessionX'
			};
		},

		Ping : function() {
			return {
				data : buildRequest('Ping', XMLNamespace)(""),
				url : 'Ping'
			};
		},

		WebServerPing : function() {
			return {
				data : "",
				url : 'WebServerPing',
				method : "GET"
			};
		},

		GetSessionData : function(sessionHandle) {
			return {
				data : buildRequest('ExecX', XMLNamespace, sessionHandle)(RequestBody.GetSessionData()),
				url : 'ExecX'
			};
		},

		GetSavePreferences : function(key, value, sessionHandle) {
			return {
				data : buildRequest('ExecX', XMLNamespace, sessionHandle)(RequestBody.CreateSavePreferences(key, value)),
				url : 'ExecX'
			};
		},

		CreateActivity : function(activity, sessionHandle) {
			return {
				data : buildRequest('ExecX', XMLNamespace, sessionHandle)(RequestBody.CreateActivity(activity)),
				url : 'ExecX'
			};
		},

		Delta : function(id, value, activity, sessionHandle) {
			return {
				data : buildRequest('ExecX', XMLNamespace, sessionHandle)(RequestBody.Delta(id, value, activity)),
				url : 'ExecX'
			};
		},

		Method : function(name, methodAttributes, context, activity, sessionHandle) {
			return {
				data : buildRequest('ExecX', XMLNamespace, sessionHandle)(RequestBody.CreateMethod(name, methodAttributes, context, activity)),
				url : 'ExecX'
			};
		},

		AnonymousMethod : function(name, methodAttributes, context, activity, anonymousFields) {
			return {
				data : buildRequest('ExecAnonymousX', XMLNamespace, null, true)(RequestBody.CreateMethod(name, methodAttributes, context, activity, anonymousFields)),
				url : 'ExecAnonymousX'
			};
		},

		AnonymousMethods : function(methods, activity) {
			return {
				data : buildRequest('ExecAnonymousX', XMLNamespace, null, true)(RequestBody.CreateAnonymousMethods(methods, activity)),
				url : 'ExecAnonymousX'
			};
		},

		DestroyActivity : function(activityHandle, sessionHandle) {
			return {
				data : buildRequest('ExecX', XMLNamespace, sessionHandle)(RequestBody.DestroyActivity(activityHandle)),
				url : 'ExecX'
			};
		},

		ReleaseSession : function(sessionHandle) {
			return {
				data : buildRequest('ReleaseSession', XMLNamespace, sessionHandle)(RequestBody.CreateReleaseSession()),
				url : 'ReleaseSession'
			};
		},

		GetBlob : function(blobId, activity, sessionHandle) {
			return {
				data : buildRequestWithoutESA('GetBlob', XMLNamespace, sessionHandle)(RequestBody.GetBlob(blobId, activity)),
				url : 'GetBlob'
			};
		},

		GetFile : function(filename, activity, sessionHandle) {
			return {
				data : buildRequestWithoutESA('GetFile', XMLNamespace, sessionHandle)(RequestBody.GetFile(filename, activity)),
				url : 'GetFile'
			};
		},

		DataRefresh : function(dataId, activity, sessionHandle) {
			return {
				data : buildRequest('ExecX', XMLNamespace, sessionHandle)(RequestBody.DataRefresh(dataId, activity)),
				url : 'ExecX'
			};
		},

		CreateMenuAction : function(activity, contextId, contextType, menuAction, defaultAction, setIdFromContext, sessionHandle) {
			return {
				data : buildRequest('ExecX', XMLNamespace, sessionHandle)(RequestBody.CreateMenuAction(activity, contextId, contextType, menuAction, defaultAction, setIdFromContext)),
				url : 'ExecX'
			};
		},

		CreateAnonymousRequest : function(xmlData) {
			return {
				data : buildRequest('ExecAnonymousX', XMLNamespace, null, true)(xmlData),
				url : 'ExecAnonymousX'
			};
		}

	};

	var buildRequest = function(requestType, xmlns, sessionHandle, includeSite) {
		return function insertBody(body) {
			var site = includeSite ? '<site>' + config._AppSite + '</site>' : '';
			var namespace = xmlns ? ' xmlns="' + xmlns + '" ' : '';
			var head = '<' + requestType + namespace + '>' + site + '<xml><ESA>';
			var tail = '</ESA>' + '</xml>';
			tail += sessionHandle ? '<sessionHandle>' + sessionHandle + '</sessionHandle>' : '';
			tail += '</' + requestType + '>';

			return head + body + tail;
		};
	};

	var buildRequestWithoutESA = function(requestType, xmlns, sessionHandle) {
		return function insertBody(body) {

			var head = '<' + requestType + ' xmlns="' + xmlns + '">';
			head += sessionHandle ? '<sessionHandle>' + sessionHandle + '</sessionHandle>' : '';
			var tail = '';
			tail += '</' + requestType + '>';

			return head + body + tail;
		};
	};

	var RequestBody = {

		CreateSession : function(username, password, appsite, authenticationMode) {
			if (authenticationMode === undefined)
				authenticationMode = "Primary";
			return '<CreateSession user="' + username + '" password="' + password + '" appSite="' + appsite + '" authenticationMode="' + authenticationMode + '" clientType="HTML" clientVersion="' + window.expanz.clientVersion + '" schemaVersion="2.0"/>';
		},

		GetSessionData : function() {
			return '<GetSessionData/>';
		},

		CreateSavePreferences : function(key, value) {
			return '<SavePreferences><UserPreference key="' + key + '" value="' + value + '" /></SavePreferences>';
		},

		CreateActivity : function(activity) {
			var handle = activity.getAttr('handle');
			var center = '';

			var unmaskedFields = '';
			/* if optimisation is true, ask for fields we want to avoid getting everything */
			if (activity.getAttr('optimisation') === true) {
				var fields = activity.getAll();
				if (fields) {
					_.each(fields, function(field) {
						if (field._type == 'Field') {
							unmaskedFields += '<Field id="' + field.get('id') + '" masked="0" />';
						}
					});
				}
			}

			center = '';
			if (handle) {
				if (activity.getAttr('optimisation') === true) {
					center += '<Activity activityHandle="' + handle + '">' + unmaskedFields + '</Activity> ';
				}
				center += '<PublishSchema activityHandle="' + handle + '"> ';
			}
			else {
				center += '<CreateActivity ';
				center += 'name="' + activity.getAttr('name') + '"';
				activity.getAttr('style') ? center += ' style="' + activity.getAttr('style') + '"' : '';
				activity.getAttr('optimisation') ? center += ' suppressFields="1"' : '';
				center += activity.getAttr('key') ? ' initialKey="' + activity.getAttr('key') + '">' : '>';

				if (activity.getAttr('optimisation') === true) {
					center += unmaskedFields;
				}
			}

			/* add datapublication for data controls */
			if (activity.hasDataControl()) {
				_.each(activity.getDataControls(), function(dataControl, dataControlId) {
					/* dataControl is an array if many UI element are using the same data but they should all be for the same parameters, we take only the first one then */
					dataControl = dataControl[0];

					var populateMethod = dataControl.getAttr('populateMethod') ? ' populateMethod="' + dataControl.getAttr('populateMethod') + '"' : '';
					var query = dataControl.getAttr('query') ? ' query="' + dataControl.getAttr('query') + '"' : '';
					var autoPopulate = dataControl.getAttr('autoPopulate') ? ' autoPopulate="' + dataControl.getAttr('autoPopulate') + '"' : '';
					var type = dataControl.getAttr('type') ? ' type="' + dataControl.getAttr('type') + '"' : '';

					center += '<DataPublication id="' + dataControlId + '"' + query + populateMethod + autoPopulate + type;
					dataControl.getAttr('contextObject') ? center += ' contextObject="' + dataControl.getAttr('contextObject') + '"' : '';
					center += '/>';

				});

			}
			if (handle) {
				center += '</PublishSchema>';
			}
			else {
				center += '</CreateActivity>';
			}
			return center;
		},

		Delta : function(id, value, activity) {
			return '<Activity activityHandle="' + activity.getAttr('handle') + '">' + '<Delta id="' + id + '" value="' + value + '"/>' + '</Activity>';
		},

		CreateMethod : function(name, methodAttributes, context, activity, anonymousFields) {
			var body = '<Activity ';
			if (activity.isAnonymous()) {
				body += 'id="' + activity.getAttr('name') + '" >';
				/* add all DataPublication as well since no activity exists, we just need id and populate method */
				if (activity.hasDataControl()) {
					_.each(activity.getDataControls(), function(dataControl, dataControlId) {
						dataControl = dataControl[0];
						var populateMethod = dataControl.getAttr('populateMethod') ? ' populateMethod="' + dataControl.getAttr('populateMethod') + '"' : '';
						var query = dataControl.getAttr('query') ? ' query="' + dataControl.getAttr('query') + '"' : '';
						var autoPopulate = dataControl.getAttr('autoPopulate') ? ' autoPopulate="' + dataControl.getAttr('autoPopulate') + '"' : '';
						var type = dataControl.getAttr('type') ? ' type="' + dataControl.getAttr('type') + '"' : '';

						body += '<DataPublication id="' + dataControlId + '"' + query + populateMethod + autoPopulate + type;
						dataControl.getAttr('contextObject') ? body += ' contextObject="' + dataControl.getAttr('contextObject') + '"' : '';
						body += '/>';
					});
				}

			}
			else {
				body += ' activityHandle="' + activity.getAttr('handle') + '">';
			}

			if (context !== null && context.id) {
				body += '<Context contextObject="' + context.contextObject + '" id="' + context.id + '" type="' + context.type + '" />';
			}

			body += '<Method name="' + name + '"';
			if (methodAttributes !== undefined && methodAttributes.length > 0) {
				_.each(methodAttributes, function(attribute) {
					if (attribute.value !== undefined) {
						body += " " + attribute.name + "='" + attribute.value + "' ";
					}
				});
			}

			/* add company code if anonymous */
			if (activity.isAnonymous()) {
				body += " company='" + config._anonymousCompanyCode + "' ";
			}

			body += '>';

			/* add all bound fields in anonymous activity case */
			if (activity.isAnonymous() && anonymousFields && anonymousFields.length > 0) {
				_.each(anonymousFields, function(field) {
					body += '<' + field.id + '>' + field.value + '</' + field.id + '>';
				});
			}

			body += '</Method>';

			body += '</Activity>';
			return body;
		},

		CreateAnonymousMethods : function(methods, activity) {
			var body = '<Activity ';
			body += 'id="' + activity.getAttr('name') + '" >';
			/* add all DataPublication as well since no activity exists, we just need id and populate method */
			if (activity.hasDataControl()) {
				_.each(activity.getDataControls(), function(dataControl, dataControlId) {
					dataControl = dataControl[0];
					var populateMethod = dataControl.getAttr('populateMethod') ? ' populateMethod="' + dataControl.getAttr('populateMethod') + '"' : '';
					var query = dataControl.getAttr('query') ? ' query="' + dataControl.getAttr('query') + '"' : '';
					var autoPopulate = dataControl.getAttr('autoPopulate') ? ' autoPopulate="' + dataControl.getAttr('autoPopulate') + '"' : '';
					var type = dataControl.getAttr('type') ? ' type="' + dataControl.getAttr('type') + '"' : '';

					body += '<DataPublication id="' + dataControlId + '"' + query + populateMethod + autoPopulate + type;
					dataControl.getAttr('contextObject') ? body += ' contextObject="' + dataControl.getAttr('contextObject') + '"' : '';
					body += '/>';
				});
			}

			$.each(methods, function(index, value) {
				body += '<Method name="' + value.name + '"';
				body += " contextObject='" + value.contextObject + "' ";
				body += " company='" + config._anonymousCompanyCode + "' ";
				body += '>';
				if (value.additionalElement) {
					body += value.additionalElement;
				}
				body += '</Method>';
			});

			body += '</Activity>';
			return body;
		},

		CreateMenuAction : function(activity, contextId, contextType, menuAction, defaultAction, setIdFromContext) {
			var mnuActionStr = '<Activity activityHandle="' + activity.getAttr('handle') + '">';
			var contextObjectStr = contextType ? ' contextObject="' + contextType + '"' : '';

			if (contextId) {
				mnuActionStr += '<Context id="' + contextId + '"' + contextObjectStr;
				mnuActionStr += setIdFromContext ? " setIdFromContext='1' " : "";
				mnuActionStr += '/>';
			}
			mnuActionStr += '<MenuAction ';
			if (menuAction) {
				mnuActionStr += ' action="' + menuAction + '" ';
			}
			else {
				mnuActionStr += ' defaultAction="' + defaultAction + '" ';
			}
			mnuActionStr += contextObjectStr + '/>' + '</Activity>';
			return mnuActionStr;
		},

		DestroyActivity : function(activityHandle, sessionHandle) {
			return '<Close activityHandle="' + activityHandle + '"/>';
		},

		CreateReleaseSession : function() {
			return '<ReleaseSession/>';
		},

		GetBlob : function(blobId, activity) {
			return '<activityHandle>' + activity.getAttr('handle') + '</activityHandle><blobId>' + blobId + '</blobId><isbyteArray>false</isbyteArray>';
		},

		GetFile : function(filename, activity) {
			return '<activityHandle>' + activity.getAttr('handle') + '</activityHandle><fileName>' + filename + '</fileName><isbyteArray>false</isbyteArray>';
		},

		DataRefresh : function(dataId, activity) {
			return '<activityHandle>' + activity.getAttr('handle') + '</activityHandle><DataPublication id="' + dataId + '" refresh="1" />';
		}

	};

	var parseCreateSessionResponse = function(callbacks) {
		return function apply(xml) {
			// window.expanz.logToConsole("start parseCreateSessionResponse");

			if ($(xml).find('CreateSessionXResult').length > 0) {
				expanz.Storage.setSessionHandle($(xml).find('CreateSessionXResult').text());
			}
			else {
				if (callbacks && callbacks.error) {
					callbacks.error("Server session error. We are unable to log you in at this time.");
				}
				window.expanz.logToConsole("Error: Server did not provide a sessionhandle. Unable to login. " + xml);
				return;
			}

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle().length === 0) {

				var errorString = '';
				$(xml).find('errorMessage').each(function() {
					errorString = $(this).text();
				});
				if (errorString.length > 0) {
					if (callbacks && callbacks.error) {
						callbacks.error(errorString);
					}
					window.expanz.logToConsole(errorString + " " + xml);
					return;
				}
			}
			else {
				if (callbacks && callbacks.success) {
					callbacks.success();
				}
			}
			return;
		};
	};

	function parseProcessAreas(xmlElement) {
		// window.expanz.logToConsole("start parseProcessAreas");
		var processAreas = [];
		$(xmlElement).children('processarea').each(function() {
			var processArea = new ProcessArea($(this).attr('id'), $(this).attr('title'));
			var subProcessAreas = parseProcessAreas($(this));
			if (subProcessAreas.length > 0) {
				processArea.pa = subProcessAreas;
			}
			$(this).children('activity').each(function() {
				processArea.activities.push(new ActivityInfo($(this).attr('name'), $(this).attr('title'), '#', $(this).attr('style'), $(this).attr('image')));
			});
			processAreas.push(processArea);
		});
		return processAreas;
	}

	function parseRoles(xmlElement) {

		if (xmlElement == undefined || xmlElement.length == 0)
			return null;
		var roles = {};
		$(xmlElement).children('UserRole').each(function() {
			roles[$(this).attr('id')] = {
				id : $(this).attr('id'),
				name : $(this).text()
			}
		});
		return roles;
	}

	function parseDashboards(xmlElement) {

		if (xmlElement == undefined || xmlElement.length == 0)
			return null;
		var dashboards = {};
		$(xmlElement).children().each(function() {
			dashboards[this.tagName] = {
				'id' : this.tagName
			}
			for ( var j = 0; j < this.attributes.length; j++) {
				var attribute = this.attributes.item(j);
				dashboards[this.tagName][attribute.nodeName] = attribute.nodeValue;

				/* update field if in the view */
				var dashboardField = window.expanz.Dashboards.get(this.tagName + "_" + attribute.nodeName);
				if (dashboardField != null) {
					dashboardField.set({
						value : attribute.nodeValue
					})
				}
			}

		});
		return dashboards;
	}

	function fillActivityData(processAreas, url, name, style, gridviewList) {
		$.each(processAreas, function(i, processArea) {
			$.each(processArea.activities, function(j, activity) {
				if (activity.name == name && activity.style == style) {
					activity.url = url;
					activity.gridviews = gridviewList;
				}
			});

			/* do it for sub process activity */
			fillActivityData(processArea.pa, url, name, style, gridviewList);

		});

	}

	function parseExecAnonymousResponse(callbacks) {
		return function apply(xml) {
			// window.expanz.logToConsole("start parseExecAnonymousResponse");
			var execResults = $(xml).find('ExecAnonymousXResult');
			var success = false;
			if (execResults.length > 0) {
				var esaResult = $(execResults).find('ESA');
				success = boolValue(esaResult.attr('success'));

				/* METHOD CASE */
				$(execResults).find('Method').each(function() {
					var res = boolValue($(this).attr('result'));
					var methodName = $(this).attr('name');
					var event = jQuery.Event(methodName);
					event.methodResult = res;
					$("body").trigger(event);
				});

				var serverMessage = esaResult.attr('serverMessage') || "";
				if (!success && $(xml).find('errors').length > 0) {
					serverMessage += $(xml).find('errors').text();
				}

				// window.expanz.logToConsole("Success:" + success);

				if (serverMessage !== undefined && serverMessage.length > 0) {
					if (success) {
						if (callbacks && callbacks.info) {
							callbacks.info(serverMessage);
						}
					}
					else {
						if (callbacks && callbacks.error) {
							callbacks.error(serverMessage);
						}
					}
				}

				$(execResults).find('Message').each(function() {
					if ($(this).attr('type') == 'Error' || $(this).attr('type') == 'Warning') {
						if (callbacks && callbacks.error) {
							callbacks.error($(this).text());
						}
					}
					else if ($(this).attr('type') == 'Info' && $(this).attr('messageSource') != 'System') {
						if (callbacks && callbacks.info) {
							callbacks.info($(this).text());
						}
					}
					else if ($(this).attr('type') == 'Info' && $(this).attr('messageSource') == 'System') {
						window.expanz.logToConsole("System-Info: " + $(this).text());
					}
				});
			}
		};
	}
	
	function parseGetSessionDataResponse(callbacks) {
		return function apply(xml) {
			// window.expanz.logToConsole("start parseGetSessionDataResponse");

			var processAreas = parseProcessAreas($(xml).find("Menu"));

			var roles = parseRoles($(xml).find("Roles"));
			expanz.Storage.setRolesList(roles);

			var dashboards = parseDashboards($(xml).find("Dashboards"));
			expanz.Storage.setDashboards(dashboards);

			/* store user preference if existing */
			$(xml).find('PublishPreferences').find('Preference').each(function() {
				window.expanz.Storage.setUserPreference($(this).attr('key'), $(this).attr('value'));
			});

			$.get('./formmapping.xml', function(data) {

				$(data).find('activity').each(function() {
					var name = $(this).attr('name');
					var url = getPageUrl($(this).attr('form'));
					var style = $(this).attr('style') || "";
					var gridviewList = [];
					$(this).find('gridview').each(function() {
						var gridview = new GridViewInfo($(this).attr('id'));
						gridviewList.push(gridview);
					});

					fillActivityData(processAreas, url, name, style, gridviewList);

				});

				expanz.Storage.setProcessAreaList(processAreas);

				$(data).find('activity').each(function() {
					if ($(this).attr('default') == 'true') {
						if (callbacks && callbacks.success) {
							callbacks.success($(this).attr('form'));
						}
						return;
					}
				});
			});

		};
	}

	function parseCreateActivityResponse(activity, callbacks) {
		return function apply(xml) {
			// window.expanz.logToConsole("start parseCreateActivityResponse");

			/* Errors case -> server is most likely not running */
			$(xml).find('errors').each(function() {
				if ($(xml).find('errors').text().indexOf(':Your session cannot be contacted') != -1) {
					if (activity.getAttr('allowAnonymous') === false) {
						expanz.Views.redirect(window.expanz.getMaintenancePage());
					}
				}
			});

			var execResults = $(xml).find("ExecXResult");
			if (execResults) {
				$(execResults).find('Message').each(function() {
					if ($(this).attr('type') == 'Error' || $(this).attr('type') == 'Warning') {
						var sessionLost = /Session .* not found/.test($(this).text());
						var activityNotFound = /Activity .* not found/.test($(this).text());
						if (sessionLost || activityNotFound) {
							expanz.Storage.clearSession();
							if (activity.getAttr('allowAnonymous') === false) {
								window.expanz.showLoginPopup(activity, true);
								return;
							}
						}

						if (callbacks && callbacks.error) {
							callbacks.error($(this).text());
						}
					}
					else if ($(this).attr('type') == 'Info') {
						if (callbacks && callbacks.info) {
							callbacks.info($(this).text());
						}
					}
				});

				/* DASHBOARD UPDATE CASE */
				var dashboards = parseDashboards($(execResults).find("Dashboards"));
				if (dashboards != null) {
					expanz.Storage.setDashboards(dashboards);
				}

				$(execResults).find('Activity').each(function() {
					activity.setAttr({
						handle : $(this).attr('activityHandle')
					});
					expanz.Storage.setActivityHandle($(this).attr('activityHandle'), activity.getAttr('name'), activity.getAttr('style'));
				});

				$(execResults).find('Field').each(function() {
					var field = activity.get($(this).attr('id'));
					if (field) {
						field.set({
							text : $(this).attr('text'),
							disabled : boolValue(this.getAttribute('disabled')),
							maxLength : $(this).attr('maxLength'),
							mask : $(this).attr('mask'),
							label : $(this).attr('label'),
							items : $(this).find("Item"),
							value : $(this).attr('value') == '$longData$' ? $(this).text() : $(this).attr('value')

						});

						if ($(this).attr('datatype')) {
							field.set({
								datatype : $(this).attr('datatype')
							}, {
								silent : true
							});
							if ($(this).attr('datatype').toLowerCase() === 'blob' && $(this).attr('url')) {
								field.set({
									value : $(this).attr('url')
								});
							}
						}
					}
				});

				_.each($(execResults).find('Data'), function(data) {

					var dataControlId = $(data).attr('id');
					var dataControlModels = activity.getDataControl(dataControlId);

					if (dataControlModels !== undefined) {

						for ( var i = 0; i < dataControlModels.length; i++) {
							dataControlModel = dataControlModels[i];
							/* grid case */
							if (dataControlModel.getAttr('renderingType') == 'popupGrid') {
								/* don't display it on load, only happening with deltas */
							}
							else if (dataControlModel.getAttr('renderingType') == 'grid' || dataControlModel.getAttr('renderingType') == 'rotatingBar') {
								fillGridModel(dataControlModel, data);

								/* add a method handler for each action button */
								dataControlModel.actionSelected = function(selectedId, name, params) {
									expanz.Net.MethodRequest(name, params, null, activity);
								};

								/* override a method handler for each menuaction button */
								dataControlModel.menuActionSelected = function(selectedId, name, params) {
									expanz.Net.CreateMenuActionRequest(this.getAttr('parent'), selectedId, null, name, "1", true, callbacks);
								};
							}
							/* others cases (tree, combobox) */
							else {
								/* update the xml data in the model, view will get a event if bound */
								dataControlModel.setAttr({
									xml : $(data)
								});
							}
						}
					}

				}); // foreach 'Data'
				//if (callbacks && callbacks.success) {
					//if (activity.name !== undefined) {
					//	callbacks.success('Activity (' + activity.name + ') has been loaded: ' + execResults);
					//} else {
						window.expanz.logToConsole('Activity (' + activity.name + ') has been loaded: ' + execResults);
					//}
				//}

			}
			else {
				if (callbacks && callbacks.error) {
					callbacks.error('The response from the server was empty');
				}
				window.expanz.logToConsole('Server gave an empty response to a CreateActivity request: ' + xml);
			}

			activity.setAttr({
				loading : false
			});

			return;
		};
	}

	function parseDeltaResponse(activity, initiator, callbacks) {
		return function apply(xml) {
			// window.expanz.logToConsole("start parseDeltaResponse");

			/* Errors case -> server is most likely not running */
			$(xml).find('errors').each(function() {
				if ($(xml).find('errors').text().indexOf(':Your session cannot be contacted') != -1) {
					expanz.Views.redirect(window.expanz.getMaintenancePage());
				}
			});

			var execResults = $(xml).find("ExecXResult");
			if (execResults == null || execResults.length == 0) {
				execResults = $(xml).find("ExecAnonymousXResult");
			}

			if (execResults) {
				/* remove other activities from the xml except for anonymous activity */
				if (!activity.isAnonymous()) {
					$(execResults).find("Activity[activityHandle!='" + activity.getAttr('handle') + "']").remove();
				}

				var errors = [];
				var infos = [];

				/* DASHBOARD UPDATE CASE */
				var dashboards = parseDashboards($(execResults).find("Dashboards"));
				if (dashboards != null) {
					expanz.Storage.setDashboards(dashboards);
				}

				/* MESSAGE CASE */
				$(execResults).find('Message').each(function() {
					if ($(this).attr('type') == 'Error' || $(this).attr('type') == 'Warning') {
						var sessionLost = /Session .* not found/.test($(this).text());
						var activityNotFound = /Activity .* not found/.test($(this).text());
						if (sessionLost || activityNotFound) {
							window.expanz.showLoginPopup(activity, true);
							return;
						}

						var source = $(this).attr('source');
						if (source && source !== undefined) {
							var field = activity.get(source);
							if (field && field !== undefined) {
								field.set({
									errorMessage : (this.textContent || this.innerText),
									error : true
								});
							}
						}

						errors.push($(this).text());

					}
					else if ($(this).attr('type') == 'Info') {
						infos.push($(this).text());
					}
				});

				if (callbacks && callbacks.error) {
					if (errors) {
						callbacks.error(errors);
					}
					else {
						callbacks.error(null);
					}
				}

				if (callbacks && callbacks.info) {
					if (infos) {
						//window.expanz.logToConsole(infos)
						callbacks.info(infos);
					}
					else {
						callbacks.info(null);
					}
				}

				/* Activity Request CASE */
				$(execResults).find('ActivityRequest').each(function() {
					var id = $(this).attr('id');
					var key = $(this).attr('key');
					var style = $(this).attr('style') || "";

					window.expanz.createActivityWindow(activity, id, style, key);

				});

				/* Activity Request CASE */
				$(execResults).find('ContextMenu').each(function() {
					// window.expanz.logToConsole('ContextMenu received');
					var caller = window.expanz.currentContextMenu;
					if (caller !== null) {
						// window.expanz.logToConsole('Caller found');
						caller.set({
							data : null
						});
						caller.set({
							data : $(this)
						});
					}
				});

				/* FIELD CASE */
				$(execResults).find('Field').each(function() {
					var id = $(this).attr('id');
					var field = activity.get(id);
					if (field && field !== undefined) {
						field.publish($(this), activity);
					}
				});

				/* FILE CASE */
				$(execResults).find('File').each(function(data) {

					if ($(this).attr('field') !== undefined && $(this).attr('path') != undefined) {
						window.expanz.logToConsole("File found: " + $(this).attr('field') + " - " + $(this).attr('path'));
						expanz.Net.GetBlobRequest($(this).attr('field'), activity, initiator);
					}
					else if ($(this).attr('name') !== undefined) {
						window.expanz.logToConsole("File found: " + $(this).attr('name'));
						expanz.Net.GetFileRequest($(this).attr('name'), activity, initiator);
					}
					else {
						window.expanz.logToConsole("Not yet implemented");
					}
				});

				/* UIMESSAGE CASE */
				$(execResults).find('UIMessage').each(function() {

					var clientMessage = new expanz.Model.ClientMessage({
						id : 'ExpanzClientMessage',
						title : $(this).attr('title'),
						text : $(this).attr('text'),
						parent : activity
					});

					$(this).find('Action').each(function(action) {

						if (!window.XMLSerializer) {
							window.XMLSerializer = function() {
							};

							window.XMLSerializer.prototype.serializeToString = function(XMLObject) {
								return XMLObject.xml || '';
							};
						}

						var methodAttributes = [];
						if ($('Request > Method', this)[0] && $('Request > Method', this)[0].attributes.length > 0) {
							_.each($('Request > Method', this)[0].attributes, function(attribute) {
								if (attribute.name != 'name') {
									methodAttributes.push({
										name : attribute.name,
										value : attribute.value
									});
								}
							});
						}

						var actionModel = new expanz.Model.Method({
							id : $('Request > Method', this)[0] ? $($('Request > Method', this)[0]).attr('name') : 'close',
							label : $(this).attr('label'),
							response : $('Response', this)[0] ? $($('Response', this)[0]).children() : undefined,
							parent : activity,
							methodAttributes : methodAttributes
						});
						clientMessage.add(actionModel);
					});

					var uiMsg = new window.expanz.Views.UIMessage({
						id : clientMessage.id,
						model : clientMessage
					}, $('body'));
				});

				/* DATA */
				$(execResults).find('Data').each(function() {
					var id = $(this).attr('id');
					var pickfield = $(this).attr('pickField');
					var contextObject = $(this).attr('contextObject');
					if (id == 'picklist') {
						// window.expanz.logToConsole("picklist received");
						var elId = id + pickfield.replace(/ /g, "_");

						var clientMessage = new expanz.Model.ClientMessage({
							id : elId,
							title : pickfield,
							text : '',
							parent : activity
						});

						var gridEl = $("#" + elId);

						var picklistWindow = new window.expanz.Views.PicklistWindowView({
							id : clientMessage.id,
							model : clientMessage
						}, $('body'));

						expanz.Factory.bindDataControls(activity, picklistWindow.el.parent());

						var gridModels = activity.getDataControl(elId);

						if (gridModels !== undefined) {
							for ( var i = 0; i < gridModels.length; i++) {
								gridModel = gridModels[i];
								fillGridModel(gridModel, $(this));
								picklistWindow.center();
								gridModel.updateRowSelected = function(selectedId, type) {
									// window.expanz.logToConsole("From parseDeltaResponse:updateRowSelected id:" + selectedId + ' ,type:' + type);

									var clientFunction = window["picklistUpdateRowSelected" + type];
									if (typeof (clientFunction) == "function") {
										clientFunction(selectedId);
									}
									else {
										var context = {
											id : selectedId,
											contextObject : contextObject,
											type : type
										};

										var methodAttributes = [
											{
												name : "contextObject",
												value : contextObject
											}
										];

										expanz.Net.MethodRequest('SetIdFromContext', methodAttributes, context, activity);

									}
									picklistWindow.close();
								};

							}
						}
						else {
							alert("Unexpected error while trying to display the picklist");
						}

					}
					else {
						var dataControlModels = activity.getDataControl(id);
						if (dataControlModels !== undefined) {
							for ( var i = 0; i < dataControlModels.length; i++) {
								dataControlModel = dataControlModels[i];
								if (dataControlModel.getAttr('renderingType') == 'grid' || dataControlModel.getAttr('renderingType') == 'popupGrid' || dataControlModel.getAttr('renderingType') == 'rotatingBar') {
									fillGridModel(dataControlModel, $(this));

									/* override the method handler for each action button */
									dataControlModel.actionSelected = function(selectedId, name, params) {
										expanz.Net.MethodRequest(name, params, null, activity);
									};

									/* override a method handler for each menuaction button */
									dataControlModel.menuActionSelected = function(selectedId, name, params) {
										expanz.Net.CreateMenuActionRequest(this.getAttr('parent'), selectedId, null, name, "1", true, callbacks);
									};
								}
								else {
									/* update the xml data in the model, view will get a event if bound */
									dataControlModel.setAttr({
										xml : $(this)
									});
								}
							}
						}
					}
				});

				//if (callbacks && callbacks.success) {
					//callbacks.success('Delta handled: ' + execResults);
					window.expanz.logToConsole('Delta handled: ' + execResults);
				//}
			}

			activity.setAttr({
				'deltaLoading' : {
					isLoading : false,
					initiator : initiator
				}
			});

			return;
		};
	}

	function parseDestroyActivityResponse(callbacks) {
		return function apply(xml) {
			// window.expanz.logToConsole("start parseDestroyActivityResponse");
			var execResults = $(xml).find('ExecXResult');
			if (xml && execResults) {
				var esaResult = $(execResults).find('ESA');
				if (esaResult) {
					if ($(esaResult).attr('success') === 1) {
						if (callbacks && callbacks.success) {
							callbacks.success(true);
							return true;
						}
					}
				}
			}
			if (callbacks && callbacks.error) {
				callbacks.error(true);
			}
			return;
		};
	}

	function parseReleaseSessionResponse(callbacks) {
		return function apply(xml) {
			// window.expanz.logToConsole("start parseReleaseSessionResponse");
			var result = $(xml).find("ReleaseSessionResult").text();
			if (result === 'true') {
				if (callbacks && callbacks.success) {
					callbacks.success(result);
					return;
				}

			}
			if (callbacks && callbacks.error) {
				callbacks.error(result);
			}
			return;
		};
	}

	/*
	 * Send Request :manage the sending of XML requests to the server, and dispatching of response handlers
	 */
	var requestBusy;
	var requestQueue = [];
	var SendRequest = function (request, responseHandler, isPopup, callAsync) {
	    if (false && requestBusy) {
            requestQueue.push([request, responseHandler, isPopup])
	    }
	    requestBusy = true;
	    window.expanz.Net.lastRequest = request;
	    var isAsync = true;
	    if (callAsync !== undefined && callAsync) {
	        isAsync = true;
	    }
	    $(window.expanz.html.busyIndicator()).trigger("isBusy");
		if (config._URLproxy !== undefined && config._URLproxy.length > 0) {
			$.ajax({
				type : 'POST',
				url : config._URLproxy,
				data : {
					url : getURLRestService(request.url),
					data : request.data,
					method : request.method || "POST"
				},
				dataType : 'XML',
				processData: true,
                async: isAsync,
				complete: function (HTTPrequest) {
				    requestBusy = false;
				    window.expanz.Net.lastResponse = HTTPrequest.responseText;
				    $(window.expanz.html.busyIndicator()).trigger("notBusy");
					if (HTTPrequest.status != 200) {
						eval(responseHandler)('There was a problem with the last request.');
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
				}
			});
		}
		else {
			$.ajax({
				type : request.method || "POST",
				url : getURLRestService(request.url),
				data : request.data,
				dataType : 'XML',
				processData : true,
				complete : function(HTTPrequest) {
					if (HTTPrequest.status != 200) {
						eval(responseHandler)('There was a problem with the last request.');
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
				}
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
		form += "<form method='post' id='formFile' target='_blank' action='" + config._URLproxy + "'>";
		form += "<input type='hidden' name='url' value='" + getURLRestService(request.url) + "'>";

		form += "<input type='hidden' name='data' value='" + request.data + "'>";
		form += "</form>";
		$("body").append(form);

		$("#formFile").submit();

	};

	// GetSessionData Stub Objects
	//
	// TODO reduce name length because store in cookies as json string and take bandwiths (limitation on cookie size can be reached as well)
	function ProcessArea(id, title) {
		this.id = id;
		this.title = title;
		this.activities = [];
		this.pa = []; /* sub process area */
	}

	function ActivityInfo(name, title, url, style, image) {
		this.name = name;
		this.title = title;
		this.url = url;
		this.style = style || "";
		/* if the image if not defined we look for the activity name + style .png instead */
		if (image !== undefined) {
			this.img = image;
		}
		else {
			this.img = "assets/images/" + name + style + ".png";
		}
		this.gridviews = [];
	}

	function GridViewInfo(id) {
		this.id = id;
		this.columns = [];

		this.addColumn = function(field, width) {
			this.columns.push(new ColumnInfo(field, width));
		};

		function ColumnInfo(field, width) {
			this.field = field;
			this.width = width;
		}
	}

	function fillGridModel(gridModel, data) {
		gridModel.clear();

		gridModel.setAttr({
			source : $(data).attr('source')
		});

		var columnMap = Object();
		// add columns to the grid Model
		_.each($(data).find('Column'), function(column) {
			var field = $(column).attr('field') ? $(column).attr('field') : $(column).attr('id');
			field = field.replace(/\./g, "_");
			columnMap[$(column).attr('id')] = field;
			gridModel.addColumn($(column).attr('id'), $(column).attr('field'), $(column).attr('label'), $(column).attr('datatype'), $(column).attr('width'));
		});

		// add rows to the grid Model
		_.each($(data).find('Row'), function(row) {

			var rowId = $(row).attr('id');
			gridModel.addRow(rowId, $(row).attr('type') || $(row).attr('Type'));

			// add cells to this row
			_.each($(row).find('Cell'), function(cell) {
				// nextline is quick fix for htmlunit
				cell = XMLDocumentsToXMLString(cell);
				gridModel.addCell(rowId, $(cell).attr('id'), $(cell).text(), columnMap[$(cell).attr('id')], $(cell).attr('sortValue'));
			});
		});
		gridModel.trigger("update:grid");
	}

	function getURLRestService(path) {
		var sep = "";
		if (!config._URLprefix.endsWith("/"))
			sep = "/";
		return config._URLprefix + sep + path;
	}
});
