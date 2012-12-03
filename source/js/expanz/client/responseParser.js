var parseCreateSessionResponse = function (callbacks) {
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

            $(xml).find('errorMessage').each(function () {
                errorString = $(this).text();
            });

            if (errorString.length > 0) {
                if (callbacks && callbacks.error) {
                    callbacks.error(errorString);
                }

                window.expanz.logToConsole(errorString);
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

function parseUserDetails(xml) {
    var userDetails = {};
    var xmlElement = $(xml).find("ESA");
    var userName = xmlElement.attr('userName');

    xmlElement = $(xml).find("MyManager");

    userDetails = {
        userName: userName,
        managerName: xmlElement.children('FirstName').text() + ' ' + xmlElement.children('LastName').text(),
        managerPhone: xmlElement.children('Phone').text(),
        managerMobilePhone: xmlElement.children('MobilePhone').text(),
        managerLevel: xmlElement.children('Level').text()
    };

    return userDetails;
}

function parseProcessAreas(xmlElement) {
    // window.expanz.logToConsole("start parseProcessAreas");
    var processAreas = [];
    $(xmlElement).children('processarea').each(function () {
        var processArea = new ProcessArea($(this).attr('id'), $(this).attr('title'));
        var subProcessAreas = parseProcessAreas($(this));
        if (subProcessAreas.length > 0) {
            processArea.pa = subProcessAreas;
        }
        $(this).children('activity').each(function () {
            processArea.activities.push(new ActivityInfo($(this).attr('name'), $(this).attr('title'), '#', $(this).attr('style'), $(this).attr('image')));
        });
        processAreas.push(processArea);
    });
    return processAreas;
}

function parseRoles(xmlElement) {

    if (xmlElement === undefined || xmlElement.length === 0)
        return null;
    var roles = {};
    $(xmlElement).children('UserRole').each(function () {
        roles[$(this).attr('id')] = {
            id: $(this).attr('id'),
            name: $(this).text()
        };
    });
    return roles;
}

function parseDashboards(xmlElement) {
    // TODO: test and validate working
    if (xmlElement === undefined || xmlElement.length === 0)
        return null;
    var dashboards = {};
    $(xmlElement).children().each(function () {
        dashboards[this.tagName] = {
            'id': this.tagName
        };
        for (var j = 0; j < this.attributes.length; j++) {
            var attribute = this.attributes.item(j);
            dashboards[this.tagName][attribute.nodeName] = attribute.nodeValue;

            /* update field if in the view */
            var dashboardField = window.expanz.Dashboards.get(this.tagName + "_" + attribute.nodeName);
            if (dashboardField !== null) {
                dashboardField.set({
                    value: attribute.nodeValue
                });
            }
        }

    });
    return dashboards;
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
            $(execResults).find('Method').each(function () {
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

            $(execResults).find('Message').each(function () {
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

        var userDetails = parseUserDetails(xml);
        expanz.Storage.setUserDetails(userDetails);

        var processAreas = parseProcessAreas($(xml).find("Menu"));

        var roles = parseRoles($(xml).find("Roles"));
        expanz.Storage.setRolesList(roles);

        var dashboards = parseDashboards($(xml).find("Dashboards"));
        expanz.Storage.setDashboards(dashboards);

        /* store user preference if existing */
        $(xml).find('PublishPreferences').find('Preference').each(function () {
            window.expanz.Storage.setUserPreference($(this).attr('key'), $(this).attr('value'));
        });

        $.get('./formmapping.xml', function (data) {
            expanz.Storage.setFormMapping(data);
            
            $(data).find('activity').each(function () {
                var name = $(this).attr('name');
                var url = getPageUrl($(this).attr('form'));
                var style = $(this).attr('style') || "";
                var gridviewList = [];
                $(this).find('gridview').each(function () {
                    var gridview = new GridViewInfo($(this).attr('id'));
                    gridviewList.push(gridview);
                });

                fillActivityData(processAreas, url, name, style, gridviewList);

            });

            expanz.Storage.setProcessAreaList(processAreas);

            $(data).find('activity').each(function () {
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

// TODO: Merge into core response handler
function parseCreateActivityResponse(activity, callbacks) {
    return function apply(xml) {
        // window.expanz.logToConsole("start parseCreateActivityResponse");

        /* Errors case -> server is most likely not running */
        $(xml).find('errors').each(function () {
            if ($(xml).find('errors').text().indexOf(':Your session cannot be contacted') != -1) {
                if (activity.getAttr('allowAnonymous') === false) {
                    expanz.views.redirect(window.expanz.getMaintenancePage());
                }
            }
        });

        var execResults = $(xml).find("ExecXResult");
        if (execResults) {
            $(execResults).find('Message').each(function () {
                if ($(this).attr('type') == 'Error' || $(this).attr('type') == 'Warning') {
                    var sessionLost = /Session .* not found/.test($(this).text());
                    var activityNotFound = /Activity .* not found/.test($(this).text());
                    if (sessionLost || activityNotFound) {
                        expanz.Storage.clearSession();
                        if (activity.getAttr('allowAnonymous') === false) {
                            window.expanz.security.showLoginPopup();
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
            if (dashboards !== null) {
                expanz.Storage.setDashboards(dashboards);
            }

            $(execResults).find('Activity').each(function () {
                activity.setAttr({
                    handle: $(this).attr('activityHandle')
                });
                expanz.Storage.setActivityHandle($(this).attr('activityHandle'), activity.getAttr('name'), activity.getAttr('style'));
            });

            $(execResults).find('Field').each(function () {
                var field = activity.get($(this).attr('id'));
                if (field) {
                    field.set({
                        text: $(this).attr('text'),
                        disabled: boolValue(this.getAttribute('disabled')),
                        maxLength: $(this).attr('maxLength'),
                        mask: $(this).attr('mask'),
                        label: $(this).attr('label'),
                        items: $(this).find("Item"),
                        visualType: $(this).attr("visualType"),
                        value: $(this).attr('value') == '$longData$' ? $(this).text() : $(this).attr('value')

                    });

                    if ($(this).attr('datatype')) {
                        field.set({
                            datatype: $(this).attr('datatype')
                        }, {
                            silent: true
                        });
                        if ($(this).attr('datatype').toLowerCase() === 'blob' && $(this).attr('url')) {
                            field.set({
                                value: $(this).attr('url')
                            });
                        }
                    }
                }
            });

            _.each($(execResults).find('Data'), function (data) {

                var dataControlId = $(data).attr('id');
                var dataControlModels = activity.getDataControl(dataControlId);

                if (dataControlModels !== undefined) {

                    for (var i = 0; i < dataControlModels.length; i++) {
                        dataControlModel = dataControlModels[i];
                        /* grid case */
                        if (dataControlModel.getAttr('renderingType') == 'popupGrid') {
                            /* don't display it on load, only happening with deltas */
                        }
                        else if (dataControlModel.getAttr('renderingType') == 'grid' || dataControlModel.getAttr('renderingType') == 'rotatingBar') {
                            fillGridModel(dataControlModel, data);

                            /* add a method handler for each action button */
                            dataControlModel.actionSelected = function (selectedId, name, params) {
                                expanz.net.MethodRequest(name, params, null, activity);
                            };

                            /* override a method handler for each menuaction button */
                            dataControlModel.menuActionSelected = function (selectedId, name, params) {
                                expanz.net.CreateMenuActionRequest(this.getAttr('parent'), selectedId, null, name, "1", true, callbacks);
                            };

                            /* override a method handler for each contextmenu button */
                            dataControlModel.contextMenuSelected = function (selectedId, contextMenuType, contextObject, params) {
                                expanz.net.CreateContextMenuRequest(this.getAttr('parent'), selectedId, contextMenuType, contextObject, callbacks);
                            };

                        }
                            /* others cases (tree, combobox) */
                        else {
                            /* update the xml data in the model, view will get a event if bound */
                            dataControlModel.setAttr({
                                xml: $(data)
                            });
                        }
                    }
                }

            }); // foreach 'Data'
            //if (callbacks && callbacks.success) {
            //if (activity.name !== undefined) {
            //	callbacks.success('Activity (' + activity.name + ') has been loaded: ' + execResults);
            //} else {
            //window.expanz.logToConsole('Activity (' + activity.name + ') has been loaded: ' + execResults);
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
            loading: false
        });

        return;
    };
}

function parseResponse(activity, initiator, callbacks) {
    return function apply(xml) {
        /* Errors case -> server is most likely not running */
        $(xml).find('errors').each(function() {
            if ($(xml).find('errors').text().indexOf(':Your session cannot be contacted') != -1) {
                expanz.views.redirect(window.expanz.getMaintenancePage());
            }
        });

        var execResults = $(xml).find("ExecXResult");

        if (execResults === null || execResults.length === 0) {
            execResults = $(xml).find("ExecAnonymousXResult");
        }

        if (execResults) {
            // REMOVED as I don't know why it would do this
            /* remove other activities from the xml except for anonymous activity */
            //if (!activity.isAnonymous()) {
            //    $(execResults).find("Activity[activityHandle!='" + activity.getAttr('handle') + "']").remove();
            //}

            var esaNode = execResults.children("ESA");

            if (esaNode.length !== 0) {
                esaNode.children().each(function () {
                    var currentElement = this;
                    
                    switch (currentElement.nodeName) {
                        case "Activity":
                            parseActivityResponse(currentElement);
                            break;
                        case "ActivityRequest":
                            parseActivityRequestResponse(currentElement);
                            break;
                        case "Messages":
                            parseApplicationMessagesResponse(currentElement);
                            break;
                        case "Dashboards":
                            parseDashboardsResponse(currentElement);
                            break;
                        case "Files":
                            parseFilesResponse(currentElement);
                            break;
                        default:
                            expanz.logToConsole("Unexpected element '" + currentElement.nodeName + "' found in response. Ignored.");
                            break;
                    }
                });
            }
        }
        
        // TODO: Check if this should really be here, and what it actually does
        activity.setAttr({
            'deltaLoading': {
                isLoading: false,
                initiator: initiator
            }
        });
    };
}

function parseActivityResponse(activityElement) {
    // Find the corresponding activity in the list of open activities
    var $activityElement = $(activityElement);
    var activityHandle = $activityElement.attr('activityHandle');
    var activityView = window.expanz.findOpenActivityView(activityHandle);
    
    if (activityView != null) {
        // Activity found, so parse the XML in the response for it, and apply it to the model
        var activityModel = activityView.collection;
        
        // Clear any current errors being displayed
        activityModel.messageCollection.reset();

        $activityElement.children().each(function () {
            var currentElement = this;

            switch (currentElement.nodeName) {
                case "Field":
                    parseFieldResponse(currentElement, activityModel);
                    break;
                case "Method":
                    parseMethodResponse(currentElement, activityModel);
                    break;
                case "Data":
                    parseDataResponse(currentElement, activityModel);
                    break;
                case "Messages":
                    parseActivityLevelMessagesResponse(currentElement, activityModel);
                    break;
                case "UIMessage":
                    parseUIMessageResponse(currentElement, activityModel);
                    break;
                case "ModelObject":
                    parseModelObjectResponse(currentElement, activityModel);
                    break;
                case "Graph":
                    // Not currently supported - placeholder for the future
                    expanz.logToConsole("Graph data is not currently supported by this SDK. Ignored.");
                    break;
                case "ContextMenu":
                    parseContextMenuResponse(currentElement, activityModel);
                    break;
                case "CustomContent":
                    // Not currently supported - placeholder for the future
                    expanz.logToConsole("CustomContent data is not currently supported by this SDK. Ignored.");
                    break;
                case "Types":
                    // Ignore
                    break;
                default:
                    expanz.logToConsole("Unexpected element '" + currentElement.nodeName + "' found in response. Ignored.");
                    break;
            }
        });
        
        // Check if the activity is to be closed
        if ($activityElement.attr("closeWindow") !== undefined && boolValue($activityElement.attr("closeWindow"))) {
            activityView.closeActivity();
        }
        
        // Check if the focus is to be set to a specific field
        // TODO
    } else {
        // Houston, we have a problem. For now at least, just ignore.
        expanz.logToConsole("An activity with handle '" + activityHandle + "' is not found!");
    }
}

function parseFieldResponse(fieldElement, activityModel) {
    var $fieldElement = $(fieldElement);
    var id = $fieldElement.attr('id');
    var field = activityModel.get(id);
    
    if (field && field !== undefined) {
        field.publish($fieldElement);
    }
}

function parseMethodResponse(methodElement, activityModel) {
    var $methodElement = $(methodElement);
    var id = $methodElement.attr('id');
    var method = activityModel.get(id);
    
    if (method && method !== undefined) {
        method.publish($methodElement);
    }
}

function parseDataResponse(dataElement, activityModel) {
    var $dataElement = $(dataElement);
    var id = $dataElement.attr('id');
    var pickfield = $dataElement.attr('pickField');
    var contextObject = $dataElement.attr('contextObject');
    
    if (id == 'picklist') {
        // window.expanz.logToConsole("picklist received");
        var elId = id + pickfield.replace(/ /g, "_");

        var clientMessage = new expanz.models.ClientMessage({
            id: elId,
            title: pickfield,
            text: '',
            parent: activityModel
        });

        var gridEl = $("#" + elId);

        var picklistWindow = new window.expanz.views.PicklistWindowView({
            id: clientMessage.id,
            model: clientMessage
        }, $('body'));

        expanz.Factory.bindDataControls(activityModel, picklistWindow.el.parent());

        var gridModels = activityModel.getDataControl(elId);

        if (gridModels !== undefined) {
            for (var i = 0; i < gridModels.length; i++) {
                gridModel = gridModels[i];
                fillGridModel(gridModel, $dataElement);
                picklistWindow.center();
                gridModel.updateRowSelected = function (selectedId, type) {
                    // window.expanz.logToConsole("From parseDeltaResponse:updateRowSelected id:" + selectedId + ' ,type:' + type);

                    var clientFunction = window["picklistUpdateRowSelected" + type];
                    if (typeof (clientFunction) == "function") {
                        clientFunction(selectedId);
                    }
                    else {
                        var context = {
                            id: selectedId,
                            contextObject: contextObject,
                            type: type
                        };

                        var methodAttributes = [
                            {
                                name: "contextObject",
                                value: contextObject
                            }
                        ];

                        expanz.net.MethodRequest('SetIdFromContext', methodAttributes, context, activityModel);

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
        var dataControlModels = activityModel.getDataControl(id);

        if (dataControlModels !== undefined) {
            for (var i = 0; i < dataControlModels.length; i++) {
                dataControlModel = dataControlModels[i];

                if (dataControlModel.getAttr('renderingType') == 'grid' || dataControlModel.getAttr('renderingType') == 'popupGrid' || dataControlModel.getAttr('renderingType') == 'rotatingBar') {
                    fillGridModel(dataControlModel, $dataElement);

                    /* override the method handler for each action button */
                    dataControlModel.actionSelected = function (selectedId, name, params) {
                        expanz.net.MethodRequest(name, params, null, activityModel);
                    };

                    /* override a method handler for each menuaction button */
                    dataControlModel.menuActionSelected = function (selectedId, name, params) {
                        expanz.net.CreateMenuActionRequest($dataElement.getAttr('parent'), selectedId, null, name, "1", true, callbacks);
                    };
                }
                else {
                    /* update the xml data in the model, view will get a event if bound */
                    dataControlModel.setAttr({
                        xml: $dataElement
                    });
                }
            }
        }

        // Variant fields also can consume data publications, but are handled separately as
        // they behave more like fields than data publications (ie. they don't register as 
        // data publications with the activity).
        var variantField = activityModel.get(id);

        if (variantField && variantField !== undefined) {
            variantField.publishData($dataElement, activityModel);
        }
    }
}

function parseActivityLevelMessagesResponse(messagesElement, activityModel) {
    var $messagesElement = $(messagesElement);

    $messagesElement.children('Message').each(function () {
        var $messageElement = $(this);

        var messageModel = {
            type: $messageElement.attr('type'),
            key: $messageElement.attr('key'),
            source: $messageElement.attr('source'),
            messageSource: $messageElement.attr('messageSource'),
            message: $messageElement.text()
        };
        
        activityModel.messageCollection.addMessage(messageModel);
        
        // Now look for any fields with the same id as the source specified by the message, and
        // pass them the message if there are.
        var source = messageModel.source;

        if (source && source !== undefined) {
            var field = activityModel.get(source);

            if (field && field !== undefined) {
                field.set({
                    errorMessage: messageModel.message,
                    error: true
                });
            }
        }
    });
}

function parseUIMessageResponse(uiMessageElement, activityModel) {
    var $uiMessageElement = $(uiMessageElement);
    
    var clientMessage = new expanz.models.ClientMessage({
        id: 'ExpanzClientMessage',
        title: $uiMessageElement.attr('title'),
        text: $uiMessageElement.attr('text'),
        parent: activityModel
    });

    $uiMessageElement.find('Action').each(function () {
        var $actionElement = $(this);

        var methodAttributes = [];
        
        if ($('Request > Method', $actionElement)[0] && $('Request > Method', $actionElement)[0].attributes.length > 0) {
            _.each($('Request > Method', $actionElement)[0].attributes, function (attribute) {
                if (attribute.name != 'name') {
                    methodAttributes.push({
                        name: attribute.name,
                        value: attribute.value
                    });
                }
            });
        }

        var actionModel = new expanz.models.Method({
            id: $('Request > Method', $actionElement)[0] ? $($('Request > Method', $actionElement)[0]).attr('name') : 'close',
            label: $actionElement.attr('label'),
            response: $('Response', $actionElement)[0] ? $($('Response', $actionElement)[0]).children() : undefined,
            parent: activityModel,
            methodAttributes: methodAttributes
        });
        
        clientMessage.add(actionModel);
    });

    var uiMsg = new window.expanz.views.UIMessage({
        id: clientMessage.id,
        model: clientMessage
    }, $('body'));
}

function parseModelObjectResponse(modelObjectElement, activityModel) {
    // TODO: Not currently handled
    // NOTE: Only passes the dirty status of the model objects included in the activity
}

function parseContextMenuResponse(contextMenuElement, activityModel) {
    var $contextMenuElement = $(contextMenuElement);
    var caller = window.expanz.currentContextMenu;
    
    if (caller !== undefined && caller !== null) {
        caller.set({
            data: null
        });
        
        caller.set({
            data: $contextMenuElement
        });
    }
}

function parseActivityRequestResponse(activityRequestElement) {
    var $activityRequestElement = $(activityRequestElement);
    
    var id = $activityRequestElement.attr('id');
    var key = $activityRequestElement.attr('key');
    var style = $activityRequestElement.attr('style') || "";

    window.expanz.openActivity(id, style, key);
}

function parseApplicationMessagesResponse(messagesElement) {
    var $messagesElement = $(messagesElement);
    
    var message = "";
    
    $messagesElement.children('Message').each(function () {
        var $messageElement = $(this);
        
        // First check if the message relates to the session being lost.
        // If so, ask the user to log in again.
        var sessionLost = /Session .* not found/.test($messageElement.text());
        var activityNotFound = /Activity .* not found/.test($messageElement.text());

        if (sessionLost || activityNotFound) {
            window.expanz.security.showLoginPopup();
        } else {
            // Add any other messages to a list to be displayed to the user in a message box
            message += "\n\n";
            message += $messageElement.text();
        }
    });

    if (message.length !== 0) {
        alert("The following message(s) have been returned from the server:" + message);
    }
}

function parseDashboardsResponse(dashboardsElement) {
    var $dashboardsElement = $(dashboardsElement);
    
    // TODO: test and validate working
    var dashboards = parseDashboards($dashboardsElement.find("Dashboards"));
    
    if (dashboards !== null) {
        expanz.Storage.setDashboards(dashboards);
    }
}

function parseFilesResponse(filesElement) {
    var $filesElement = $(filesElement);

    $filesElement.children('File').each(function (data) {
        var $fileElement = $(this);
        
        if ($fileElement.attr('field') !== undefined && $fileElement.attr('path') !== undefined) {
            window.expanz.logToConsole("Blob found by field: " + $fileElement.attr('field') + " - " + $fileElement.attr('path'));
            expanz.net.GetBlobRequest($fileElement.attr('field'), activity, initiator);
        }
        else if ($fileElement.attr('name') !== undefined) {
            window.expanz.logToConsole("File found by name: " + $fileElement.attr('name'));
            expanz.net.GetFileRequest($fileElement.attr('name'), activity, initiator);
        }
        else {
            window.expanz.logToConsole("Not yet implemented");
        }
    });
}

// TODO: Merge into core response handler
function parseCloseActivityResponse(callbacks) {
    return function apply(xml) {
        // window.expanz.logToConsole("start parseCloseActivityResponse");
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

function fillActivityData(processAreas, url, name, style, gridviewList) {
    $.each(processAreas, function (i, processArea) {
        $.each(processArea.activities, function (j, activity) {
            if (activity.name == name && activity.style == style) {
                activity.url = url;
                activity.gridviews = gridviewList;
            }
        });

        /* do it for sub process activity */
        fillActivityData(processArea.pa, url, name, style, gridviewList);

    });

}

function fillGridModel(gridModel, data) {
    gridModel.clear();

    gridModel.setAttr({
        source: $(data).attr('source')
    });

    var columnMap = Object();

    // add columns to the grid Model
    _.each($(data).find('Column'), function (column) {
        var field = $(column).attr('field') ? $(column).attr('field') : $(column).attr('id');
        field = field.replace(/\./g, "_");
        columnMap[$(column).attr('id')] = field;
        gridModel.addColumn($(column).attr('id'), $(column).attr('field'), $(column).attr('label'), $(column).attr('datatype'), $(column).attr('width'));
    });

    // add rows to the grid Model
    _.each($(data).find('Row'), function (row) {

        var rowId = $(row).attr('id');
        gridModel.addRow(rowId, $(row).attr('type') || $(row).attr('Type'));

        // add cells to this row
        _.each($(row).find('Cell'), function (cell) {
            // nextline is quick fix for htmlunit
            cell = serializeXML(cell);
            gridModel.addCell(rowId, $(cell).attr('id'), $(cell).text(), columnMap[$(cell).attr('id')], $(cell).attr('sortValue'));
        });
    });

    gridModel.trigger("update:grid");
}