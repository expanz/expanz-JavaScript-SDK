////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////

var requestBody = {

    createSession: function (username, password, appsite, authenticationMode) {
        if (authenticationMode === undefined)
            authenticationMode = "Primary";
        return '<CreateSession source="MixiLink" user="' + username + '" password="' + password + '" appSite="' + appsite + '" authenticationMode="' + authenticationMode + '" clientType="HTML" clientVersion="' + window.expanz.clientVersion + '" schemaVersion="2.0"/>';
    },

    getSessionData: function () {
        return '<GetSessionData/>';
    },

    createSavePreferences: function (key, value) {
        return '<SavePreferences><UserPreference key="' + key + '" value="' + value + '" /></SavePreferences>';
    },

    createActivity: function (activity) {
        var handle = activity.getAttr('handle');
        var center = '';

        var unmaskedFields = '';
        
        /* if optimisation is true, ask for fields we want to avoid getting everything */
        if (activity.getAttr('optimisation') === true) {
            var fields = activity.getAll();
            
            if (fields) {
                _.each(fields, function (field) {
                    if (field._type == 'Field') {
                        unmaskedFields += '<Field id="' + field.get('id') + '" masked="0" />';
                    }
                });
            }
        }

        center = '';
        
        if (handle) {
            if (activity.getAttr('optimisation') === true) {
                center += this.wrapPayloadInActivityRequest(unmaskedFields, activity);
            }
            
            center += '<PublishSchema activityHandle="' + handle + '"> ';
        }
        else {
            center += '<CreateActivity ';
            center += 'name="' + activity.getAttr('name') + '"';
            center += activity.getAttr('style') ? ' style="' + activity.getAttr('style') + '"' : '';
            center += activity.getAttr('optimisation') ? ' suppressFields="1"' : '';
            center += activity.getAttr('key') ? ' initialKey="' + activity.getAttr('key') + '">' : '>';

            if (activity.getAttr('optimisation') === true) {
                center += unmaskedFields;
            }
        }

        center += this.getActivityDataPublicationRequests(activity);
        
        if (handle) {
            center += '</PublishSchema>';
        }
        else {
            center += '</CreateActivity>';
        }
        
        return center;
    },

    delta: function (id, value, activity) {
        return this.wrapPayloadInActivityRequest('<Delta id="' + id + '" value="' + value + '"/>', activity);
    },

    createMethod: function (name, methodAttributes, context, activity, anonymousFields) {
        var body = '';
        
        if (activity.isAnonymous()) {
            body += this.getActivityDataPublicationRequests(activity);
        }

        if (context !== null && context.id) {
            body += '<Context contextObject="' + context.contextObject + '" id="' + context.id + '" type="' + context.type + '" />';
        }

        body += '<Method name="' + name + '"';
        
        if (methodAttributes !== undefined && methodAttributes.length > 0) {
            _.each(methodAttributes, function (attribute) {
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
            _.each(anonymousFields, function (field) {
                body += '<' + field.id + '>' + field.value + '</' + field.id + '>';
            });
        }

        body += '</Method>';
        
        return this.wrapPayloadInActivityRequest(body, activity);
    },

    createAnonymousMethods: function (methods, activity) {
        /* add all DataPublication as well since no activity exists, we just need id and populate method */
        var body = this.getActivityDataPublicationRequests(activity);

        $.each(methods, function (index, value) {
            body += '<Method name="' + value.name + '"';
            body += " contextObject='" + value.contextObject + "' ";
            body += " company='" + config._anonymousCompanyCode + "' ";
            body += '>';
            
            if (value.additionalElement) {
                body += value.additionalElement;
            }
            
            body += '</Method>';
        });
        
        return this.wrapPayloadInActivityRequest(body, activity);
    },

    createMenuAction: function (activity, contextId, contextType, menuAction, defaultAction, setIdFromContext) {
        var mnuActionStr = '';
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

        mnuActionStr += contextObjectStr + '/>';
        
        return this.wrapPayloadInActivityRequest(mnuActionStr, activity);
    },

    createContextMenuAction: function (activity, contextId, contextMenuType, contextObject) {
        var ctxtMenuStr = '';
        var contextObjectStr = contextObject ? ' contextObject="' + contextObject + '"' : '';
        var contextTypeStr = contextMenuType ? contextMenuType : contextObject;

        if (contextId) {
            ctxtMenuStr += '<Context id="' + contextId + '"' + contextObjectStr;
            ctxtMenuStr += contextTypeStr ? " Type='" + contextTypeStr + "' " : "";
            ctxtMenuStr += '/>';
        }
        
        ctxtMenuStr += '<ContextMenu ';
        ctxtMenuStr += contextObjectStr + '/>';
        
        return this.wrapPayloadInActivityRequest(ctxtMenuStr, activity);
    },

    closeActivity: function (activityHandle) {
        return '<Close activityHandle="' + activityHandle + '"/>';
    },

    createReleaseSession: function () {
        return '<ReleaseSession/>';
    },

    getBlob: function (blobId, activity) { // TODO: Activity handle element? Investigate...
        return '<activityHandle>' + activity.getAttr('handle') + '</activityHandle><blobId>' + blobId + '</blobId><isbyteArray>false</isbyteArray>';
    },

    getFile: function (filename, activity) { // TODO: Activity handle element? Investigate...
        return '<activityHandle>' + activity.getAttr('handle') + '</activityHandle><fileName>' + filename + '</fileName><isbyteArray>false</isbyteArray>';
    },

    dataRefresh: function (dataId, activity) { // TODO: Activity handle element? Investigate...
        return '<activityHandle>' + activity.getAttr('handle') + '</activityHandle><DataPublication id="' + dataId + '" refresh="1" />';
    },
    
    wrapPayloadInActivityRequest: function (payload, activity) {
        if (activity.isAnonymous())
            return '<Activity id="' + activity.getAttr('name') + '">' + payload + '</Activity>';
        else
            return '<Activity activityHandle="' + activity.getAttr('handle') + '">' + payload + '</Activity>';
    },
    
    getActivityDataPublicationRequests: function (activity) {
        var dataPublicationRequests = '';
        
        /* add datapublication for data controls */
        if (activity.hasDataControl()) {
            _.each(activity.getDataControls(), function (dataControl, dataControlId) {
                /* dataControl is an array if many UI element are using the same data but they should all be for the same parameters, we take only the first one then */
                dataControl = dataControl[0];

                var populateMethod = dataControl.getAttr('populateMethod') ? ' populateMethod="' + dataControl.getAttr('populateMethod') + '"' : '';
                var query = dataControl.getAttr('query') ? ' query="' + dataControl.getAttr('query') + '"' : '';
                var autoPopulate = dataControl.getAttr('autoPopulate') ? ' autoPopulate="' + dataControl.getAttr('autoPopulate') + '"' : '';
                var type = dataControl.getAttr('type') ? ' type="' + dataControl.getAttr('type') + '"' : '';

                dataPublicationRequests += '<DataPublication id="' + dataControlId + '"' + query + populateMethod + autoPopulate + type;
                dataPublicationRequests += dataControl.getAttr('contextObject') ? ' contextObject="' + dataControl.getAttr('contextObject') + '"' : '';
                dataPublicationRequests += '/>';
            });
        }

        return dataPublicationRequests;
    }
};