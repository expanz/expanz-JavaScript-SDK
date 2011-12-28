/* Author: Adam Tait

 */
$(function() {

	window.expanz = window.expanz || {};

	window.expanz.Net = {

		// Request Objects -> to be passed to SendRequest
		CreateSessionRequest : function(username, password, callbacks) {
			var appsite = config._AppSite;
			var authenticationMode = config._AuthenticationMode;
			SendRequest(RequestObject.CreateSession(username, password, appsite, authenticationMode), parseCreateSessionResponse(callbacks));
		},

		GetSessionDataRequest : function(callbacks) {
			SendRequest(RequestObject.GetSessionData(expanz.Storage.getSessionHandle()), parseGetSessionDataResponse(callbacks));
		},

		CreateActivityRequest : function(activity, callbacks) {
			if (callbacks == undefined)
				callbacks = activity.callbacks;
			SendRequest(RequestObject.CreateActivity(activity, activity.getAttr('style'), expanz.Storage.getSessionHandle()), parseCreateActivityResponse(activity, callbacks));
		},

		DeltaRequest : function(id, value, activity, callbacks) {
			if (callbacks == undefined)
				callbacks = activity.callbacks;
			SendRequest(RequestObject.Delta(id, value, activity, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, callbacks));
		},

		MethodRequest : function(name, methodAttributes, context, activity, callbacks) {
			if (callbacks == undefined)
				callbacks = activity.callbacks;
			SendRequest(RequestObject.Method(name, methodAttributes, context, activity, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, callbacks));
		},

		DestroyActivityRequest : function(activity, callbacks) {
			if (callbacks == undefined)
				callbacks = activity.callbacks;
			SendRequest(RequestObject.DestroyActivity(activity, expanz.Storage.getSessionHandle()), parseDestroyActivityResponse(activity, callbacks));
		},

		ReleaseSessionRequest : function(callbacks) {
			SendRequest(RequestObject.ReleaseSession(expanz.Storage.getSessionHandle()), parseReleaseSessionResponse(callbacks));
		},

		GetBlobRequest : function(blobId, activity, callbacks) {
			if (callbacks == undefined)
				callbacks = activity.callbacks;
			SendNormalRequest(RequestObject.GetBlob(blobId, activity, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, callbacks), true);
		}
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

		CreateActivity : function(activity, style, sessionHandle) {
			return {
				data : buildRequest('ExecX', 'http://www.expanz.com/ESAService', sessionHandle)(RequestBody.CreateActivity(activity, style)),
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
				url : 'ExecX'
			};
		},

		GetBlob : function(blobId, activity, sessionHandle) {
			return {
				data : buildRequest2('GetBlob', 'http://www.expanz.com/ESAService', sessionHandle)(RequestBody.GetBlob(blobId, activity)),
				url : 'GetBlob'
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
	var buildRequest2 = function(requestType, xmlns, sessionHandle) {
		return function insertBody(body) {

			var head = '<' + requestType + ' xmlns="' + xmlns + '">';
			var tail = '';
			head += sessionHandle ? '<sessionHandle>' + sessionHandle + '</sessionHandle>' : '';
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

		CreateActivity : function(activity, style) {
			var center = '<CreateActivity name="' + activity.getAttr('name') + '"';
			style ? center += ' style="' + style + '"' : '';
			center += activity.getAttr('key') ? ' initialKey="' + activity.getAttr('key') + '">' : '>';

			if (activity.hasGrid()) {
				_.each(activity.getGrids(), function(grid, gridId) {
					center += '<DataPublication id="' + gridId + '" populateMethod="' + grid.getAttr('populateMethod') + '"';
					grid.getAttr('contextObject') ? center += ' contextObject="' + grid.getAttr('contextObject') + '"' : '';
					center += '/>';
				});
			}

			if (activity.hasDataControl()) {
				_.each(activity.getDataControls(), function(DataControl, DataControlId) {
					center += '<DataPublication id="' + DataControlId + '"';
					center += '/>';
				});
			}
			center += '</CreateActivity>';
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
						body += " " + attribute.id + "='" + attribute.value + "' ";
					}
				});
			}

			body += '/>';

			body += '</Activity>';
			return body;
		},

		CreateMenuAction : function(activity, contextId, contextType, menuAction) {
			return '<Activity activityHandle="' + activity.getAttr('handle') + '">' + '<Context id="' + contextId + '" Type="' + contextType + '"/>' + '<MenuAction defaultAction="' + menuAction + '"/>' + '</Activity>';
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

	};

	//
	// XML Message Response Parsers
	//
	var parseCreateSessionResponse = function(callbacks) {
		return function apply(xml) {
			console.log("start parseCreateSessionResponse");
			if ($(xml).find('CreateSessionXResult').length > 0) {
				expanz.Storage.setSessionHandle($(xml).find('CreateSessionXResult').text());
			} else {
				if (callbacks && callbacks.error) {
					callbacks.error("Error: Server did not provide a sessionhandle. We are unable to log you in at this time.");
				}
				return;
			}

			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle.length > 0) {

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
			if (callbacks && callbacks.success) {
				callbacks.success();
			}
			return;
		};
	};

	function parseGetSessionDataResponse(callbacks) {
		return function apply(xml) {
			console.log("start parseGetSessionDataResponse");
			var processAreas = [];
			$(xml).find('processarea').each(function() {
				var processArea = new ProcessArea($(this).attr('id'), $(this).attr('title'));
				$(this).find('activity').each(function() {
					processArea.activities.push(new ActivityInfo($(this).attr('name'), $(this).attr('title'), '#'));
				});
				processAreas.push(processArea);
			});

			$.get('./formmapping.xml', function(data) {

				$(data).find('activity').each(function() {
					var name = $(this).attr('name');
					var url = $(this).attr('form');
					var gridviewList = [];
					$(this).find('gridview').each(function() {
						var gridview = new GridViewInfo($(this).attr('id'));
						$(this).find('column').each(function() {
							gridview.addColumn($(this).attr('field'), $(this).attr('width'));
						});
						gridviewList.push(gridview);
					});

					$.each(processAreas, function(i, processArea) {
						$.each(processArea.activities, function(j, activity) {
							if (activity.name == name) {
								activity.url = url;
								activity.gridviews = gridviewList;
							}
						});
					});
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
			console.log("start parseCreateActivityResponse");
			var execResults = $(xml).find("ExecXResult");
			if (execResults) {

				$(execResults).find('Message').each(function() {
					if ($(this).attr('type') == 'Error') {
						if (callbacks && callbacks.error) {
							callbacks.error($(this).text());
						}
					} else
						if ($(this).attr('type') == 'Info') {
							if (callbacks && callbacks.info) {
								callbacks.info($(this).text());
							}
						}
				});

				$(execResults).find('Activity').each(function() {
					activity.setAttr({
						handle : $(this).attr('activityHandle')
					});
				});

				$(execResults).find('Field').each(function() {
					var field = activity.get($(this).attr('id'));
					if (field) {

						field.set({
							text : $(this).attr('text'),
							disabled : $(this).attr('disabled') == "disabled" ? true : false,
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
						gridModel.actionSelected = function(selectedId, methodName, attributeId) {
							var methodAttributes = [
								{
									id : attributeId,
									value : selectedId
								}
							];
							expanz.Net.MethodRequest(methodName, methodAttributes, null, activity);
							console.log(".net:actionSelected id:" + selectedId + ' ,methodName:' + methodName + ' ,attributeId:' + attributeId);
						};
					}

					var dataControlId = $(data).attr('id');
					var dataControlModel = activity.getDataControl(dataControlId);

					/* push the data to the view */
					if (dataControlModel !== undefined) {
						dataControlModel.get("view").trigger("publishData", $(data));
					}

				}); // foreach 'Data'
				if (callbacks && callbacks.success) {
					callbacks.success('Activity (' + activity.name + ') has been loaded: ' + execResults);
				}

			} else {
				if (callbacks && callbacks.error) {
					callbacks.error('Server gave an empty response to a CreateActivity request: ' + xml);
				}
			}
			return;
		}
	}
	;

	function parseDeltaResponse(activity, callbacks) {
		return function apply(xml) {
			console.log("start parseDeltaResponse");
			var execResults = $(xml).find("ExecXResult");
			if (execResults) {
				var errors = new Array();
				var infos = new Array();
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

					} else
						if ($(this).attr('type') == 'Info') {
							infos.push($(this).text());
						}
				});

				if (errors) {
					callbacks.error(errors);
				} else {
					callbacks.error(null);
				}
				if (infos) {
					callbacks.info(infos);
				} else {
					callbacks.info(null);
				}

				$(execResults).find('Field').each(function() {
					var id = $(this).attr('id');
					var field = activity.get(id);
					if (field && field != undefined) {
						if ((field.get('value') && (field.get('value') != $(this).attr('value'))) || !field.get('value')) {

							if ($(this).attr('disabled')) {
								field.set({
									disabled : $(this).attr('disabled') == "disabled" ? true : false
								});
							}

							field.set({
								text : $(this).attr('text'),
								value : $(this).attr('value'),
							});
						}

						/* remove error message if field is valid */
						if ($(this).attr('valid') == "1" && field.get('errorMessage') != undefined) {
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

				$(execResults).find('File').each(function(data) {

					if ($(this).attr('field') != undefined && $(this).attr('path') != undefined) {
						expanz.Net.GetBlobRequest($(this).attr('field'), activity);
					} else
						if ($(this).attr('name') != undefined) {

						} else {
							console.log("Not implemented yet");
						}

					console.log("File found: " + $(this).attr('field') + " - " + $(this).attr('path'));

				});

				$(execResults).find('UIMessage').each(function(data) {
					var content = $(this).attr('text');
					var title = $(this).attr('title');

					var uiMsg = new window.expanz.Views.UIMessage({
						windowId : "UIMessage",
						title : title,
						el : $('body'),
						content : content
					});
					uiMsg.render();

					$(this).find('Action').each(function(action) {
						var methodName = '';
						if ($(this).find('Method').length > 0) {
							methodName = $(this).find('Method').attr('name');
						}
						uiMsg.addAction(methodName, $(this).attr('label'));
					});

					expanz.Factory.bindMethods(activity, expanz.Views, expanz.Model, uiMsg.windowEl.parent());

					uiMsg.display();
				});

				$(execResults).find('Data').each(function(data) {
					var id = $(this).attr('id');
					var pickfield = $(this).attr('pickfield');
					var contextObject = $(this).attr('contextObject');
					if (id == 'picklist') {
						console.log("picklist received");
						var elId = id + pickfield;

						var gridEl = $("#" + elId);

						var picklistWindow = new window.expanz.Views.PicklistWindowView({
							windowId : elId,
							title : pickfield,
							el : $('body')
						});
						picklistWindow.render();

						expanz.Factory.bindGrids(activity, expanz.Views, expanz.Model, picklistWindow.windowEl.parent());

						var gridModel = activity.getGrid(elId);

						if (gridModel !== undefined) {
							fillGridModel(gridModel, $(this));
							gridModel.updateRowSelected = function(selectedId, type) {
								console.log("From parseDeltaResponse:updateRowSelected id:" + selectedId + ' ,type:' + type);

								var context = {
									id : selectedId,
									contextObject : contextObject,
									type : type
								};

								var methodAttributes = [
									{
										id : "contextObject",
										value : contextObject
									}
								];

								expanz.Net.MethodRequest('SetIdFromContext', methodAttributes, context, activity);
								picklistWindow.close();
							}

							picklistWindow.display();

						} else {
							alert("Unexpected error while trying to display the picklist");
						}

					}
				});

			}
			return;
		}
	}
	;

	function parseDestroyActivityResponse(activity, callbacks) {
		return function apply(xml) {
			console.log("start parseDestroyActivityResponse");
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
	;

	function parseReleaseSessionResponse(callbacks) {
		return function apply(xml) {
			console.log("start parseReleaseSessionResponse");
			var result = $(xml).find("ReleaseSessionResult").text();
			if (result === 'true') {
				if (deleteSessionHandle()) {
					if (callbacks && callbacks.success) {
						callbacks.success(result);
						return;
					}
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
				} else {
					var response = HTTPrequest.responseText;
					if (isPopup != undefined && isPopup == true) {
						var WinId = window.open('', 'newwin', 'width=400,height=500');
						WinId.document.open();
						WinId.document.write(response);
						WinId.document.close();
					} else {
						if (responseHandler) {
							var xml = response.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
							eval(responseHandler)(xml);
						}
					}
				}
			}
		});
	};
	
	
	/*
	 * Send Request :manage the sending of XML requests to the server, and dispatching of response handlers
	 */

	var SendNormalRequest = function(request, responseHandler, isPopup) {
		
		if ($("#formFile")){
			$("#formFile").remove();
		}
		
		var form = "<form method='post' id='formFile' target='content_frame' action='" + config._URLproxy+ "'>";
		form += "<input type='hidden' name='url' value='" + config._URLprefix + request.url + "'>"
		form += "<input type='hidden' name='data' value='" + request.data + "'>"
		form += "</form>";
		$("body").append(form);
		
		$("#formFile").submit();

	};	
	
	
	

	// GetSessionData Stub Objects
	//

	function ProcessArea(id, title) {
		this.id = id;
		this.title = title;
		this.activities = [];
	}

	function ActivityInfo(name, title, url) {
		this.name = name;
		this.title = title;
		this.url = url;
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
		gridModel.setAttr({
			source : $(data).attr('source')
		});

		// add columns to the grid Model
		_.each($(data).find('Column'), function(column) {
			gridModel.addColumn($(column).attr('id'), $(column).attr('field'), $(column).attr('label'), $(column).attr('datatype'), $(column).attr('width'));
		});

		// add rows to the grid Model
		_.each($(data).find('Row'), function(row) {

			var rowId = $(row).attr('id');
			gridModel.addRow(rowId, $(row).attr('type'));

			// add cells to this row
			_.each($(row).find('Cell'), function(cell) {
				gridModel.addCell(rowId, $(cell).attr('id'), $(cell).html());
			});
		});
		gridModel.trigger("update:grid");
	}

});
