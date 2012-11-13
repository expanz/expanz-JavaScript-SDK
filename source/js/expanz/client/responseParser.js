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
            loading: false
        });

        return;
    };
}

function parseDeltaResponse(activity, initiator, callbacks) {
    return function apply(xml) {
        // window.expanz.logToConsole("start parseDeltaResponse");

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
            /* remove other activities from the xml except for anonymous activity */
            if (!activity.isAnonymous()) {
                $(execResults).find("Activity[activityHandle!='" + activity.getAttr('handle') + "']").remove();
            }

            var errors = [];
            var infos = [];

            /* DASHBOARD UPDATE CASE */
            var dashboards = parseDashboards($(execResults).find("Dashboards"));
            if (dashboards !== null) {
                expanz.Storage.setDashboards(dashboards);
            }

            /* MESSAGE CASE */
            $(execResults).find('Message').each(function () {
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
                                errorMessage: (this.textContent || this.innerText),
                                error: true
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
            $(execResults).find('ActivityRequest').each(function () {
                var id = $(this).attr('id');
                var key = $(this).attr('key');
                var style = $(this).attr('style') || "";

                window.expanz.createActivityWindow(activity, id, style, key);

            });

            /* Activity Request CASE */
            $(execResults).find('ContextMenu').each(function () {
                // window.expanz.logToConsole('ContextMenu received');
                var caller = window.expanz.currentContextMenu;
                if (caller !== undefined) {
                    // window.expanz.logToConsole('Caller found');
                    caller.set({
                        data: null
                    });
                    caller.set({
                        data: $(this)
                    });
                }
            });

            /* FIELD CASE */
            $(execResults).find('Field').each(function () {
                var id = $(this).attr('id');
                var field = activity.get(id);
                if (field && field !== undefined) {
                    field.publish($(this), activity);
                    /*if (field.attributes.visualType !== undefined) {
                        //loginPopup.el.find('[bind=login]')
                        window.expanz.showVariantPanel(activity);
                        //window.expanz.CreateVariantPanel($(this));
                    }*/
                }
            });

            /* METHOD CASE */
            $(execResults).find('Method').each(function () {
                var id = $(this).attr('id');
                var method = activity.get(id);
                if (method && method !== undefined) {
                    method.publish($(this), activity);
                    /*if (field.attributes.visualType !== undefined) {
                        //loginPopup.el.find('[bind=login]')
                        window.expanz.showVariantPanel(activity);
                        //window.expanz.CreateVariantPanel($(this));
                    }*/
                }
            });

            /* FILE CASE */
            /*if ($(execResults).find('File').length === 0) {
                expanz.messageController.addErrorMessageByText("Unable to find the requested file");
            } else {*/
            $(execResults).find('File').each(function (data) {

                if ($(this).attr('field') !== undefined && $(this).attr('path') !== undefined) {
                    window.expanz.logToConsole("Blob found by field: " + $(this).attr('field') + " - " + $(this).attr('path'));
                    expanz.net.GetBlobRequest($(this).attr('field'), activity, initiator);
                }
                else if ($(this).attr('name') !== undefined) {
                    window.expanz.logToConsole("File found by name: " + $(this).attr('name'));
                    expanz.net.GetFileRequest($(this).attr('name'), activity, initiator);
                }
                else {
                    window.expanz.logToConsole("Not yet implemented");
                }
            });
            //}

            /* UIMESSAGE CASE */
            $(execResults).find('UIMessage').each(function () {

                var clientMessage = new expanz.models.ClientMessage({
                    id: 'ExpanzClientMessage',
                    title: $(this).attr('title'),
                    text: $(this).attr('text'),
                    parent: activity
                });

                $(this).find('Action').each(function (action) {

                    if (!window.XMLSerializer) {
                        window.XMLSerializer = function () {
                        };

                        window.XMLSerializer.prototype.serializeToString = function (XMLObject) {
                            return XMLObject.xml || '';
                        };
                    }

                    var methodAttributes = [];
                    if ($('Request > Method', this)[0] && $('Request > Method', this)[0].attributes.length > 0) {
                        _.each($('Request > Method', this)[0].attributes, function (attribute) {
                            if (attribute.name != 'name') {
                                methodAttributes.push({
                                    name: attribute.name,
                                    value: attribute.value
                                });
                            }
                        });
                    }

                    var actionModel = new expanz.models.Method({
                        id: $('Request > Method', this)[0] ? $($('Request > Method', this)[0]).attr('name') : 'close',
                        label: $(this).attr('label'),
                        response: $('Response', this)[0] ? $($('Response', this)[0]).children() : undefined,
                        parent: activity,
                        methodAttributes: methodAttributes
                    });
                    clientMessage.add(actionModel);
                });

                var uiMsg = new window.expanz.views.UIMessage({
                    id: clientMessage.id,
                    model: clientMessage
                }, $('body'));
            });

            /* DATA */
            $(execResults).find('Data').each(function () {
                var id = $(this).attr('id');
                var pickfield = $(this).attr('pickField');
                var contextObject = $(this).attr('contextObject');
                if (id == 'picklist') {
                    // window.expanz.logToConsole("picklist received");
                    var elId = id + pickfield.replace(/ /g, "_");

                    var clientMessage = new expanz.models.ClientMessage({
                        id: elId,
                        title: pickfield,
                        text: '',
                        parent: activity
                    });

                    var gridEl = $("#" + elId);

                    var picklistWindow = new window.expanz.views.PicklistWindowView({
                        id: clientMessage.id,
                        model: clientMessage
                    }, $('body'));

                    expanz.Factory.bindDataControls(activity, picklistWindow.el.parent());

                    var gridModels = activity.getDataControl(elId);

                    if (gridModels !== undefined) {
                        for (var i = 0; i < gridModels.length; i++) {
                            gridModel = gridModels[i];
                            fillGridModel(gridModel, $(this));
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

                                    expanz.net.MethodRequest('SetIdFromContext', methodAttributes, context, activity);

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
                        for (var i = 0; i < dataControlModels.length; i++) {
                            dataControlModel = dataControlModels[i];

                            if (dataControlModel.getAttr('renderingType') == 'grid' || dataControlModel.getAttr('renderingType') == 'popupGrid' || dataControlModel.getAttr('renderingType') == 'rotatingBar') {
                                fillGridModel(dataControlModel, $(this));

                                /* override the method handler for each action button */
                                dataControlModel.actionSelected = function (selectedId, name, params) {
                                    expanz.net.MethodRequest(name, params, null, activity);
                                };

                                /* override a method handler for each menuaction button */
                                dataControlModel.menuActionSelected = function (selectedId, name, params) {
                                    expanz.net.CreateMenuActionRequest(this.getAttr('parent'), selectedId, null, name, "1", true, callbacks);
                                };
                            }
                            else {
                                /* update the xml data in the model, view will get a event if bound */
                                dataControlModel.setAttr({
                                    xml: $(this)
                                });
                            }
                        }
                    }

                    // Variant fields also can consume data publications, but are handled separately as
                    // they behave more like fields than data publications (ie. they don't register as 
                    // data publications with the activity).
                    var variantField = activity.get(id);

                    if (variantField && variantField !== undefined) {
                        variantField.publishData($(this), activity);
                    }
                }
            });

            //if (callbacks && callbacks.success) {
            //callbacks.success('Delta handled: ' + execResults);
            window.expanz.logToConsole('Delta handled: ' + execResults);
            //}
        }

        activity.setAttr({
            'deltaLoading': {
                isLoading: false,
                initiator: initiator
            }
        });

        return;
    };
}

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
            cell = XMLDocumentsToXMLString(cell);
            gridModel.addCell(rowId, $(cell).attr('id'), $(cell).text(), columnMap[$(cell).attr('id')], $(cell).attr('sortValue'));
        });
    });

    gridModel.trigger("update:grid");
}