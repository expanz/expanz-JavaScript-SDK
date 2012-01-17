/* Author: Adam Tait

 */
$(function() {

	window.expanz = window.expanz || {};

	window.expanz.helper = window.expanz.helper || {};

	window.expanz.Net = {

		// Request Objects -> to be passed to SendRequest
		CreateSessionRequest : function(username, password, callbacks) {
			var appsite = config._AppSite;
			var authenticationMode = config._AuthenticationMode;
			SendRequest(RequestObject.CreateSession(username, password, appsite, authenticationMode), parseCreateSessionResponse(callbacks));
		},

		GetSessionDataRequest : function(callbacks) {

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() == "") {
				expanz.Views.redirect(expanz.Storage.getLoginURL())
				return;
			}

			SendRequest(RequestObject.GetSessionData(expanz.Storage.getSessionHandle()), parseGetSessionDataResponse(callbacks));
		},

		CreateActivityRequest : function(activity, callbacks) {
			if (callbacks == undefined)
				callbacks = activity.callbacks;

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() == "") {
				expanz.Views.redirect(expanz.Storage.getLoginURL())
				return;
			}

			/* check if an activity has already been created, if so specify it instead of creating a new one */
			var activityHandle = expanz.Storage.getActivityHandle(activity.getAttr('name'), activity.getAttr('style'));

			if (activityHandle && activityHandle != undefined) {
				activity.setAttr({
					'handle' : activityHandle
				});
			}

			activity.setAttr({
				loading : true
			});

			SendRequest(RequestObject.CreateActivity(activity, expanz.Storage.getSessionHandle()), parseCreateActivityResponse(activity, callbacks));

		},

		DeltaRequest : function(id, value, activity, callbacks) {
			if (callbacks == undefined)
				callbacks = activity.callbacks;

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() == "") {
				expanz.Views.redirect(expanz.Storage.getLoginURL())
				return;
			}

			activity.setAttr({
				loading : true
			});

			SendRequest(RequestObject.Delta(id, value, activity, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, callbacks));
		},

		MethodRequest : function(name, methodAttributes, context, activity, callbacks) {
			if (callbacks == undefined)
				callbacks = activity.callbacks;

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() == "") {
				expanz.Views.redirect(expanz.Storage.getLoginURL())
				return;
			}

			SendRequest(RequestObject.Method(name, methodAttributes, context, activity, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, callbacks));
		},

		DestroyActivityRequest : function(activity, callbacks) {
			if (callbacks == undefined)
				callbacks = activity.callbacks;

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() == "") {
				expanz.Views.redirect(expanz.Storage.getLoginURL())
				return;
			}

			SendRequest(RequestObject.DestroyActivity(activity, expanz.Storage.getSessionHandle()), parseDestroyActivityResponse(activity, callbacks));
		},

		DataRefreshRequest : function(dataId, activity, callbacks) {
			if (callbacks == undefined)
				callbacks = activity.callbacks;

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() == "") {
				expanz.Views.redirect(expanz.Storage.getLoginURL())
				return;
			}

			SendRequest(RequestObject.DataRefresh(dataId, activity, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, callbacks));
		},

		ReleaseSessionRequest : function(callbacks) {
			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() == "") {
				expanz.Views.redirect(expanz.Storage.getLoginURL())
				return;
			}
			SendRequest(RequestObject.ReleaseSession(expanz.Storage.getSessionHandle()), parseReleaseSessionResponse(callbacks));
		},

		GetBlobRequest : function(blobId, activity, callbacks) {
			if (callbacks == undefined)
				callbacks = activity.callbacks;

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() == "") {
				expanz.Views.redirect(expanz.Storage.getLoginURL())
				return;
			}

			SendNormalRequest(RequestObject.GetBlob(blobId, activity, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, callbacks), true);
		},
		

		GetFileRequest : function(filename, activity, callbacks) {
			if (callbacks == undefined)
				callbacks = activity.callbacks;

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() == "") {
				expanz.Views.redirect(expanz.Storage.getLoginURL())
				return;
			}

			SendNormalRequest(RequestObject.GetFile(filename, activity, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, callbacks), true);
		},		

		/* call when selecting something from the tree view (file) */
		CreateMenuActionRequest : function(activity, contextId, contextType, menuAction, defaultAction, callbacks) {
			if (callbacks == undefined)
				callbacks = activity.callbacks;

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle() == "") {
				expanz.Views.redirect(expanz.Storage.getLoginURL())
				return;
			}

			SendRequest(RequestObject.CreateMenuAction(activity, contextId, contextType, menuAction, defaultAction, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, callbacks));
		},

	};

	//
	// Request Objects (used when passed to SendRequest( ... )
	//
	var XMLNamespace = window.config._XMLNamespace || 'http://www.expanz.com/ESAService'; // TODO: throw an error here, saying that window.config._XMLNamespace is required
	var RequestObject = {

		CreateSession : function(username, password, appsite, authenticationMode) {
			return {
				data : buildRequest('CreateSessionX', XMLNamespace)(RequestBody.CreateSession(username, password, appsite, authenticationMode)),
				url : 'CreateSessionX'
			};
		},

		GetSessionData : function(sessionHandle) {
			return {
				data : buildRequest('ExecX', 'http://www.expanz.com/ESAService', sessionHandle)(RequestBody.GetSessionData()),
				url : 'ExecX'
			};
		},

		CreateActivity : function(activity, sessionHandle) {
			return {
				data : buildRequest('ExecX', 'http://www.expanz.com/ESAService', sessionHandle)(RequestBody.CreateActivity(activity)),
				url : 'ExecX'
			};
		},

		Delta : function(id, value, activity, sessionHandle) {
			return {
				data : buildRequest('ExecX', 'http://www.expanz.com/ESAService', sessionHandle)(RequestBody.Delta(id, value, activity)),
				url : 'ExecX'
			};
		},

		Method : function(name, methodAttributes, context, activity, sessionHandle) {
			return {
				data : buildRequest('ExecX', 'http://www.expanz.com/ESAService', sessionHandle)(RequestBody.CreateMethod(name, methodAttributes, context, activity)),
				url : 'ExecX'
			};
		},

		DestroyActivity : function(activity, sessionHandle) {
			return {
				data : buildRequest('ExecX', 'http://www.expanz.com/ESAService', sessionHandle)(RequestBody.DestroyActivity(activity)),
				url : 'ExecX'
			};
		},

		ReleaseSession : function(sessionHandle) {
			return {
				data : buildRequest('ReleaseSession', 'http://www.expanz.com/ESAService', sessionHandle)(RequestBody.CreateReleaseSession()),
				url : 'ReleaseSession'
			};
		},

		GetBlob : function(blobId, activity, sessionHandle) {
			return {
				data : buildRequestWithoutESA('GetBlob', 'http://www.expanz.com/ESAService', sessionHandle)(RequestBody.GetBlob(blobId, activity)),
				url : 'GetBlob'
			};
		},
		

		GetFile : function(filename, activity, sessionHandle) {
			return {
				data : buildRequestWithoutESA('GetFile', 'http://www.expanz.com/ESAService', sessionHandle)(RequestBody.GetFile(filename, activity)),
				url : 'GetFile'
			};
		},
		

		DataRefresh : function(dataId, activity, sessionHandle) {
			return {
				data : buildRequest('ExecX', 'http://www.expanz.com/ESAService', sessionHandle)(RequestBody.DataRefresh(dataId, activity)),
				url : 'ExecX'
			};
		},

		CreateMenuAction : function(activity, contextId, contextType, menuAction, defaultAction, sessionHandle) {
			return {
				data : buildRequest('ExecX', 'http://www.expanz.com/ESAService', sessionHandle)(RequestBody.CreateMenuAction(activity, contextId, contextType, menuAction, defaultAction)),
				url : 'ExecX'
			};
		},

	};

	//
	// XML Message Contruction Functions
	//
	var buildRequest = function(requestType, xmlns, sessionHandle) {
		return function insertBody(body) {

			var head = '<' + requestType + ' xmlns="' + xmlns + '">' + '<xml>' + '<ESA>';
			var tail = '</ESA>' + '</xml>';
			tail += sessionHandle ? '<sessionHandle>' + sessionHandle + '</sessionHandle>' : '';
			tail += '</' + requestType + '>';

			return head + body + tail;
		}
	}

	//
	// XML Message Contruction Functions
	//
	var buildRequestWithoutESA = function(requestType, xmlns, sessionHandle) {
		return function insertBody(body) {

			var head = '<' + requestType + ' xmlns="' + xmlns + '">';
			head += sessionHandle ? '<sessionHandle>' + sessionHandle + '</sessionHandle>' : '';
			var tail = '';
			tail += '</' + requestType + '>';

			return head + body + tail;
		}
	}

	var RequestBody = {

		CreateSession : function(username, password, appsite, authenticationMode) {
			if (authenticationMode == undefined)
				authenticationMode = "Primary"
			return '<CreateSession user="' + username + '" password="' + password + '" appSite="' + appsite + '" authenticationMode="' + authenticationMode + '" clientVersion="Flex 1.0" schemaVersion="2.0"/>';
		},

		GetSessionData : function() {
			return '<GetSessionData/>';
		},

		CreateActivity : function(activity) {
			var handle = activity.getAttr('handle');
			var center = '';
			if (handle) {
				center = '<PublishSchema activityHandle="' + handle + '"> ';
			}
			else {
				center = '<CreateActivity ';
				center += 'name="' + activity.getAttr('name') + '"';
				activity.getAttr('style') ? center += ' style="' + activity.getAttr('style') + '"' : '';
				center += activity.getAttr('key') ? ' initialKey="' + activity.getAttr('key') + '">' : '>';
			}

			if (activity.hasGrid()) {
				_.each(activity.getGrids(), function(grid, gridId) {
					var populateMethod = grid.getAttr('populateMethod') ? ' populateMethod="' + grid.getAttr('populateMethod') + '"' : '';
					center += '<DataPublication id="' + gridId + '"' + populateMethod;
					grid.getAttr('contextObject') ? center += ' contextObject="' + grid.getAttr('contextObject') + '"' : '';
					center += '/>';
				});
			}

			if (activity.hasDataControl()) {
				_.each(activity.getDataControls(), function(dataControl, dataControlId) {
					var populateMethod = dataControl.get('populateMethod') ? ' populateMethod="' + dataControl.get('populateMethod') + '"' : '';
					center += '<DataPublication id="' + dataControlId + '"' + populateMethod + ' Type="' + dataControl.get('type') + '"';
					dataControl.get('contextObject') ? center += ' contextObject="' + dataControl.get('contextObject') + '"' : '';
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

		CreateMethod : function(name, methodAttributes, context, activity) {
			var body = '<Activity activityHandle="' + activity.getAttr('handle') + '">';

			if (context != null && context.id) {
				body += '<Context contextObject="' + context.contextObject + '" id="' + context.id + '" type="' + context.type + '" />'
			}

			body += '<Method name="' + name + '"';
			if (methodAttributes != undefined && methodAttributes.length > 0) {
				_.each(methodAttributes, function(attribute) {
					if (attribute.value != undefined) {
						body += " " + attribute.name + "='" + attribute.value + "' ";
					}
				});
			}

			body += '/>';

			body += '</Activity>';
			return body;
		},

		CreateMenuAction : function(activity, contextId, contextType, menuAction, defaultAction) {
			var mnuActionStr = '<Activity activityHandle="' + activity.getAttr('handle') + '">';
			var contextObjectStr = contextType ? ' contextObject="' + contextType + '"' : '';
			if (contextId) {
				mnuActionStr += '<Context id="' + contextId + '"' + contextObjectStr + '/>';
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

		DestroyActivity : function(activity, sessionHandle) {
			return '<Close activityHandle="' + activity.getAttr('handle') + '"/>';
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

	//
	// XML Message Response Parsers
	//
	var parseCreateSessionResponse = function(callbacks) {
		return function apply(xml) {
			window.expanz.logToConsole("start parseCreateSessionResponse");
			if ($(xml).find('CreateSessionXResult').length > 0) {
				expanz.Storage.clearSession();
				expanz.Storage.setSessionHandle($(xml).find('CreateSessionXResult').text());
			}
			else {
				if (callbacks && callbacks.error) {
					callbacks.error("Error: Server did not provide a sessionhandle. We are unable to log you in at this time.");
				}
				return;
			}

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle().length == 0) {

				var errorString = '';
				$(xml).find('errorMessage').each(function() {
					errorString = $(this).text();
				});
				if (errorString.length > 0) {
					if (callbacks && callbacks.error) {
						callbacks.error(errorString);
					}
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
		var processAreas = [];
		$(xmlElement).children('processarea').each(function() {
			var processArea = new ProcessArea($(this).attr('id'), $(this).attr('title'));
			var subProcessAreas = parseProcessAreas($(this));
			if (subProcessAreas.length > 0) {
				processArea.pa = subProcessAreas;
			}
			$(this).children('activity').each(function() {
				processArea.activities.push(new ActivityInfo($(this).attr('name'), $(this).attr('title'), '#', $(this).attr('activityStyle'), $(this).attr('image')));
			});
			processAreas.push(processArea);
		});
		return processAreas;
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

	function parseGetSessionDataResponse(callbacks) {
		return function apply(xml) {
			/* bug fix for IE style attribute is removed when using jquery find... */
			xml = xml.replace(/style=/g, "activityStyle=");
			window.expanz.logToConsole("start parseGetSessionDataResponse");
			var processAreas = parseProcessAreas($(xml).find("Menu"));

			$.get('./formmapping.xml', function(data) {

				$(data).find('activity').each(function() {
					var name = $(this).attr('name');
					var url = $(this).attr('form');
					var style = $(this).attr('style');
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
	;

	function parseCreateActivityResponse(activity, callbacks) {
		return function apply(xml) {
			window.expanz.logToConsole("start parseCreateActivityResponse");
			var execResults = $(xml).find("ExecXResult");
			if (execResults) {

				$(execResults).find('Message').each(function() {
					if ($(this).attr('type') == 'Error') {
						var sessionLost = /Session .* not found/.test($(this).text());
						if (sessionLost) {
							window.expanz.showLoginPopup(activity, true);
							return;
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
							value : $(this).attr('value')

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

					var gridId = $(data).attr('id');
					var gridModel = activity.getGrid(gridId);

					if (gridModel !== undefined) {
						fillGridModel(gridModel, data);

						/* add a method handler for each action button */
						gridModel.actionSelected = function(selectedId, methodName, methodParam) {

							expanz.Net.MethodRequest(methodName, methodParam, null, activity);
							window.expanz.logToConsole(".net:actionSelected id:" + selectedId + ' ,methodName:' + methodName + ' ,methodParam:' + JSON.stringify(methodParam));
						};
					}

					var dataControlId = $(data).attr('id');
					var dataControlModel = activity.getDataControl(dataControlId);

					/* push the data to the view */
					if (dataControlModel !== undefined) {
						dataControlModel.set({
							xml : $(data)
						});
					}

				}); // foreach 'Data'
				if (callbacks && callbacks.success) {
					callbacks.success('Activity (' + activity.name + ') has been loaded: ' + execResults);
				}

			}
			else {
				if (callbacks && callbacks.error) {
					callbacks.error('Server gave an empty response to a CreateActivity request: ' + xml);
				}
			}

			activity.setAttr({
				loading : false
			});

			return;
		}
	}

	function parseDeltaResponse(activity, callbacks) {
		return function apply(xml) {
			window.expanz.logToConsole("start parseDeltaResponse");
			/* bug fix for IE style attribute is removed when using jquery find... */
			xml = xml.replace(/style=/g, "activityStyle=");

			var execResults = $(xml).find("ExecXResult");
			if (execResults) {
				var errors = new Array();
				var infos = new Array();
				/* MESSAGE CASE */
				$(execResults).find('Message').each(function() {
					if ($(this).attr('type') == 'Error' || $(this).attr('type') == 'Warning') {
						var source = $(this).attr('source');
						if (source && source != undefined) {
							var field = activity.get(source);
							if (field && field != undefined) {
								field.set({
									errorMessage : this.textContent,
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
						callbacks.info(infos);
					}
					else {
						callbacks.info(null);
					}
				}

				/* Activity Request CASE */
				$(execResults).find('ActivityRequest').each(function() {
					var id = $(this).attr('id');
					var style = $(this).attr('activityStyle');

					var callback = function(url) {
						if (url != null) {
							window.expanz.logToConsole(url);
						}
						else {
							window.expanz.logToConsole("Url of activity not found");
						}

						/* an activity request shouldn't be reloaded from any state -> clean an eventual cookie */
						window.expanz.Storage.clearActivityCookie(id, style);

						var clientMessage = new expanz.Model.ClientMessage({
							id : 'ActivityRequest',
							url : url + "?random=" + new Date().getTime(),
							parent : activity
						});

						var popup = new window.expanz.Views.ManuallyClosedPopup({
							id : clientMessage.id,
							model : clientMessage
						}, $('body'));
					};

					/* find url of activity */
					window.expanz.helper.findActivityURL(id, style, callback);

				});
				
				/* Activity Request CASE */
				$(execResults).find('ContextMenu').each(function() {
					window.expanz.logToConsole('ContextMenu received');
					var caller = window.expanz.currentContextMenu;
					if(caller != null){
						window.expanz.logToConsole('Caller found');
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
					if (field && field != undefined) {
						if ((field.get('value') && (field.get('value') != $(this).attr('value'))) || !field.get('value')) {

							if ($(this).attr('disabled')) {
								field.set({
									disabled : boolValue(this.getAttribute('disabled')),
								});
							}

							field.set({
								text : $(this).attr('text'),
								value : $(this).attr('value'),
							});
						}

						/* remove error message if field is valid */
						if (boolValue($(this).attr('valid')) && field.get('errorMessage') != undefined) {
							field.set({
								'errorMessage' : undefined
							});

						}

						if (field.get('url') && (field.get('url') != $(this).attr('url'))) {
							field.set({
								value : $(this).attr('url')
							});
						}
					}
				});

				/* FILE CASE */
				$(execResults).find('File').each(function(data) {

					if ($(this).attr('field') != undefined && $(this).attr('path') != undefined) {
						window.expanz.logToConsole("File found: " + $(this).attr('field') + " - " + $(this).attr('path'));
						expanz.Net.GetBlobRequest($(this).attr('field'), activity);
					}
					else if ($(this).attr('name') != undefined) {
						window.expanz.logToConsole("File found: " + $(this).attr('name'));
						expanz.Net.GetFileRequest($(this).attr('name'), activity);
					}
					else {
						window.expanz.logToConsole("Not implemented yet");
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

						var actionModel = new expanz.Model.Method({
							id : $('Request > Method', this)[0] ? $($('Request > Method', this)[0]).attr('name') : 'close',
							label : $(this).attr('label'),
							response : $('Response', this)[0] ? $($('Response', this)[0]).children() : undefined,
							parent : activity
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
					var pickfield = $(this).attr('pickfield');
					var contextObject = $(this).attr('contextObject');
					if (id == 'picklist') {
						window.expanz.logToConsole("picklist received");
						var elId = id + pickfield;

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

						expanz.Factory.bindGrids(activity, expanz.Views, expanz.Model, picklistWindow.el.parent());

						var gridModel = activity.getGrid(elId);

						if (gridModel !== undefined) {
							fillGridModel(gridModel, $(this));
							picklistWindow.center();
							gridModel.updateRowSelected = function(selectedId, type) {
								window.expanz.logToConsole("From parseDeltaResponse:updateRowSelected id:" + selectedId + ' ,type:' + type);

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
								picklistWindow.close();
							}

						}
						else {
							alert("Unexpected error while trying to display the picklist");
						}

					}
					else {
						var gridModel = activity.getGrid(id);
						if (gridModel !== undefined) {
							fillGridModel(gridModel, $(this));

							/* add a method handler for each action button */
							gridModel.actionSelected = function(selectedId, methodName, methodParam) {

								expanz.Net.MethodRequest(methodName, methodParam, null, activity);
								window.expanz.logToConsole(".net:actionSelected id:" + selectedId + ' ,methodName:' + methodName + ' ,methodParam:' + JSON.stringify(methodParam));
							};
						}
					}
				});

				if (callbacks && callbacks.success) {
					callbacks.success('Delta handled: ' + execResults);
				}
			}

			activity.setAttr({
				loading : false
			});
			return;
		}
	}

	function parseDestroyActivityResponse(activity, callbacks) {
		return function apply(xml) {
			window.expanz.logToConsole("start parseDestroyActivityResponse");
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
		}
	}

	function parseReleaseSessionResponse(callbacks) {
		return function apply(xml) {
			window.expanz.logToConsole("start parseReleaseSessionResponse");
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
		}
	}

	/*
	 * Send Request :manage the sending of XML requests to the server, and dispatching of response handlers
	 */

	var SendRequest = function(request, responseHandler, isPopup) {

		if (config._URLproxy != undefined && config._URLproxy.length > 0) {
			$.ajax({
				type : 'POST',
				url : config._URLproxy,
				data : {
					url : config._URLprefix + request.url,
					data : request.data
				},
				dataType : 'string',
				processData : true,
				complete : function(HTTPrequest) {
					if (HTTPrequest.status != 200) {
						eval(responseHandler)('There was a problem with the last request.');
					}
					else {
						var response = HTTPrequest.responseText;
						if (isPopup != undefined && isPopup == true) {
							var WinId = window.open('', 'newwin', 'width=400,height=500');
							WinId.document.open();
							WinId.document.write(response);
							WinId.document.close();
						}
						else {
							if (responseHandler) {
								var xml = response.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
								eval(responseHandler)(xml);
							}
						}
					}
				}
			});
		}
		else {
			$.ajax({
				type : 'POST',
				url : config._URLprefix + request.url,
				data : request.data,
				dataType : 'xml',
				processData : true,
				complete : function(HTTPrequest) {
					if (HTTPrequest.status != 200) {
						eval(responseHandler)('There was a problem with the last request.');
					}
					else {
						var response = HTTPrequest.responseText;
						if (isPopup != undefined && isPopup == true) {
							var WinId = window.open('', 'newwin', 'width=400,height=500');
							WinId.document.open();
							WinId.document.write(response);
							WinId.document.close();
						}
						else {
							if (responseHandler) {
								var xml = response.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
								eval(responseHandler)(xml);
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

	var SendNormalRequest = function(request, responseHandler, isPopup) {

		if ($("#formFile")) {
			$("#formFile").remove();
		}

		var form = ''
		form += "<form method='post' id='formFile' target='content_frame' action='" + config._URLproxy + "'>";
		form += "<input type='hidden' name='url' value='" + config._URLprefix + request.url + "'>"

		form += "<input type='hidden' name='data' value='" + request.data + "'>"
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
		this.style = style;
		this.img = image;
		this.gridviews = [];
	}

	function GridViewInfo(id) {
		this.id = id;
		this.columns = [];

		this.addColumn = function(field, width) {
			this.columns.push(new ColumnInfo(field, width));
		}

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
			field = field.replace(".", "_");
			columnMap[$(column).attr('id')] = field;
			gridModel.addColumn($(column).attr('id'), $(column).attr('field'), $(column).attr('label'), $(column).attr('datatype'), $(column).attr('width'));
		});

		// add rows to the grid Model
		_.each($(data).find('Row'), function(row) {

			var rowId = $(row).attr('id');
			gridModel.addRow(rowId, $(row).attr('type'));

			// add cells to this row
			_.each($(row).find('Cell'), function(cell) {
				gridModel.addCell(rowId, $(cell).attr('id'), $(cell).html(), columnMap[$(cell).attr('id')]);
			});
		});
		gridModel.trigger("update:grid");
	}

});
