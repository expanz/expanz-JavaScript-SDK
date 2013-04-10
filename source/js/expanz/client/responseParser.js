var parseCreateSessionResponse = function (callbacks) {
    return function apply(xml) {
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

function parseResponse(activity, initiator, callbacks) {
    return function apply(xml) {
        /* Errors case -> server is most likely not running */
        $(xml).find('errors').each(function () {
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
            //    $(execResults).find("Activity[activityHandle!='" + activity.get('handle') + "']").remove();
            //}

            var esaNode = execResults.children("ESA");

            if (esaNode.length !== 0) {
                esaNode.children().each(function () {
                    var currentElement = this;

                    switch (currentElement.nodeName) {
                        case "Activity":
                            parseActivityResponse(currentElement, initiator);
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
                            parseFilesResponse(currentElement, activity, initiator);
                            break;
                        default:
                            expanz.logToConsole("Unexpected element '" + currentElement.nodeName + "' found in response. Ignored.");
                            break;
                    }
                });
            }
        }

        // TODO: Check if this should really be here, and what it actually does
        activity.set({
            'deltaLoading': {
                isLoading: false,
                initiator: initiator
            }
        });
    };
}

function parseActivityResponse(activityElement, initiator) {
    // Find the corresponding activity in the list of open activities
    var $activityElement = $(activityElement);
    var activityHandle = $activityElement.attr('activityHandle');
    var activityView = null;

    if (initiator && initiator !== null && initiator.type === "CreateActivity") {
        // This activity is the result of a create activity request, where the model doesn't have a handle yet
        activityView = window.expanz.findOpenActivityViewByModel(initiator.activityModel);
        
        initiator.activityModel.set({
            handle: $activityElement.attr('activityHandle')
        });
        
        expanz.Storage.setActivityHandle(initiator.activityModel.get('handle'), initiator.activityModel.get('name'), initiator.activityModel.get('style'));
    } else {
        activityView = window.expanz.findOpenActivityViewByHandle(activityHandle);
    }

    if (activityView != null) {
        // Activity found, so parse the XML in the response for it, and apply it to the model
        var activityModel = activityView.model;

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
                    parseDataResponse(currentElement, activityModel, activityView);
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
            activityModel.closeActivity();
        }

        // Check if the focus is to be set to a specific field
        var focusFieldId = $activityElement.attr("focusField");

        if (focusFieldId !== undefined) {
            activityModel.setFieldFocus(focusFieldId);
        }

        activityModel.set({
            loading: false
        });
    } else {
        // Houston, we have a problem. For now at least, just ignore.
        expanz.logToConsole("An activity with handle '" + activityHandle + "' is not found!");
    }
}

function parseFieldResponse(fieldElement, activityModel) {
    var $fieldElement = $(fieldElement);
    var id = $fieldElement.attr('id');

    _.each(activityModel.fields.where({ fieldId: id }), function (field) {
        field.publish($fieldElement);
    });
}

function parseMethodResponse(methodElement, activityModel) {
    var $methodElement = $(methodElement);
    var id = $methodElement.attr('id');
    var method = activityModel.methods.get(id);

    if (method && method !== undefined) {
        method.publish($methodElement);
    }
}

function parseDataResponse(dataElement, activityModel, activityView) {
    var $dataElement = $(dataElement);
    var id = $dataElement.attr('id');
    var pickfield = $dataElement.attr('pickField');

    if (id == 'picklist') {
        // Server has sent back a picklist, so pop up a window to display it
        var elId = id + pickfield.replace(/ /g, "_");

        var clientMessage = new expanz.models.ClientMessage({
            id: elId,
            title: pickfield,
            text: '',
            parent: activityModel
        });

        var picklistWindow = new window.expanz.views.PicklistWindowView({
            id: clientMessage.id,
            model: clientMessage
        }, $('body'));

        expanz.Factory.bindDataControls(activityView, picklistWindow.$el.parent());

        var dataPublicationModel = activityModel.dataPublications.get(elId + "_host_0");
        populateDataPublicationModel(dataPublicationModel, $dataElement);
    }
    else {
        var dataControlModels = activityModel.dataPublications.getChildrenByAttribute("dataId", id);

        _.each(dataControlModels, function(dataControlModel) {
            populateDataPublicationModel(dataControlModel, $dataElement);
        });

        // Variant fields also can consume data publications, but are handled separately 
        // as they behave more like fields than data publications (ie. they don't register 
        // as data publications with the activity).
        _.each(activityModel.fields.where({ fieldId: id }), function (field) {
            field.publishData($dataElement);
        });
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
            _.each(activityModel.fields.where({ fieldId: source }), function (field) {
                field.set({
                    errorMessage: activityModel.messageCollection.transformMessage(messageModel.message),
                    error: true
                });
            });
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

        clientMessage.actions.add(actionModel);
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
    var caller = window.expanz.currentContextMenu;

    if (caller !== undefined && caller !== null) {
        if (caller.loadMenu !== undefined) {
            // If the caller was a context menu model, then this method will exist
            caller.loadMenu(contextMenuElement, activityModel);
        } else {
            // If the caller was a method model, then we'll need to create a
            // context menu view and model
            var contextMenuModel = new expanz.models.ContextMenu({
                id: caller.id + "_contextmenu",
                parentActivity: activityModel
            });

            contextMenuModel.loadMenu(contextMenuElement, activityModel);
            caller.setContextMenu(contextMenuModel);
        }
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
            if (window.config.useBundle === true) {
                // Pass the message to an implementation specific message converter, that may
                // transform the message from the server to something more suitable for display
                var data = null;

                if (typeof window.expanz.findMessageKey == 'function') {
                    data = window.expanz.findMessageKey($messageElement.text());
                } else {
                    expanz.logToConsole("window.expanz.findMessageKey not found in your implementation");
                }

                if (data !== null) {
                    var tempMessage = jQuery.i18n.prop(data['key'], data['data']);
                    
                    if (tempMessage.length !== 0) {
                        message += "\n\n" + tempMessage;
                    }
                }
            } else {
                message += "\n\n";
                message += $messageElement.text();
            }
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

function parseFilesResponse(filesElement, activity, initiator) {
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
    };
}

function parseReleaseSessionResponse(callbacks) {
    return function apply(xml) {
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

function populateDataPublicationModel(dataPublicationModel, data) {
    var $data = $(data);
    
    dataPublicationModel.rows.reset();

    dataPublicationModel.contextObject = $data.attr('contextObject');
    dataPublicationModel.isEditable = $(data).attr('hasEditableColumns') === "1";
    
    if ($data.attr('clearColumnDefinitions') !== "0") {
        dataPublicationModel.columns.reset();
    }

    // Add columns to the grid Model
    _.each($data.find('Column'), function (column) {
        var $column = $(column);
        dataPublicationModel.addColumn($column.attr('id'), $column.attr('field'), $column.attr('label'), $column.attr('datatype'), $column.attr('displayStyle'), $column.attr('width'), $column.attr('editable') === "1", $column.attr('matrixKey'));
    });

    // Add rows to the grid Model
    _.each($data.find('Row'), function (row) {
        var $row = $(row);
        var rowId = $(row).attr('id');
        
        var rowModel = dataPublicationModel.addRow(rowId, $row.attr('type') || $row.attr('Type'), $row.attr('displayStyle'));

        // Add cells to this row
        _.each($row.find('Cell'), function (cell) {
            cell = serializeXML(cell); // quick fix for htmlunit
            var $cell = $(cell);
            
            rowModel.addCell($cell.attr('id'), $cell.text(), dataPublicationModel.columns.get($cell.attr('id')), $cell.attr('sortValue'), $cell.attr('displayStyle'));
        });
    });

    dataPublicationModel.dataPublished($data);
}