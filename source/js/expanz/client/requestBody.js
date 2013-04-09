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
        var handle = activity.get('handle');
        var center = '';

        var unmaskedFields = '';
        
        /* if optimisation is true, ask for fields we want to avoid getting everything */
        if (activity.get('optimisation') === true) {
            activity.fields.forEach(function (field) {
                unmaskedFields += '<Field id="' + field.get('fieldId') + '" masked="0" />';
            });
        }

        center = '';
        
        if (handle) {
            if (activity.get('optimisation') === true) {
                center += this.wrapPayloadInActivityRequest(unmaskedFields, activity);
            }
            
            center += '<PublishSchema activityHandle="' + handle + '"> ';
        }
        else {
            center += '<CreateActivity ';
            center += 'name="' + activity.get('name') + '"';
            center += activity.get('style') ? ' style="' + activity.get('style') + '"' : '';
            center += activity.get('optimisation') ? ' suppressFields="1"' : '';
            center += activity.get('key') ? ' initialKey="' + activity.get('key') + '">' : '>';

            if (activity.get('optimisation') === true) {
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
        return this.wrapPayloadInActivityRequest(this.createDeltaElement(id, value), activity);
    },

    createDeltaElement: function (id, value, matrixKey) {
        var delta = '<Delta id="' + id + '" value="' + value + '"';

        if (matrixKey)
            delta += ' matrixKey="' + matrixKey + '"';

        delta += ' />';

        return delta;
    },

    createSetContextElement: function (id, contextObject, type) {
        var body = "";

        if (id) {
            body += '<Context';

            if (contextObject)
                body += ' contextObject="' + contextObject + '"';

            body += ' id="' + id + '" type="' + type + '" />';
        }

        return body;
    },

    createMethod: function (name, methodAttributes, context, activity, anonymousFields) {
        var body = '';
        
        if (activity.isAnonymous()) {
            body += this.getActivityDataPublicationRequests(activity);
        }

        if (context)
            body += this.createSetContextElement(context.id, context.contextObject, context.type);

        body += '<Method name="' + name + '"';
        
        if (methodAttributes !== undefined) {
            _.each(methodAttributes, function (attribute) {
                if (attribute.value !== undefined) {
                    body += " " + attribute.name + "='" + attribute.value + "' ";
                }
            });
        }

        /* add company code if anonymous */
        if (activity.isAnonymous()) {
            body += " company='" + config.anonymousCompanyCode + "' ";
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
            body += " company='" + config.anonymousCompanyCode + "' ";
            body += '>';
            
            if (value.additionalElement) {
                body += value.additionalElement;
            }
            
            body += '</Method>';
        });
        
        return this.wrapPayloadInActivityRequest(body, activity);
    },

    createMenuAction: function (activity, contextId, contextType, contextObject, menuAction, defaultAction, setIdFromContext) {
        var mnuActionStr = '';
        var contextObjectStr = contextObject ? ' contextObject="' + contextObject + '"' : '';
        var contextTypeStr = contextType ? contextType : "";

        if (contextId) {
            mnuActionStr += '<Context id="' + contextId + '"' + contextObjectStr;
            mnuActionStr += contextTypeStr ? " Type='" + contextTypeStr + "' " : "";
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
        return '<activityHandle>' + activity.get('handle') + '</activityHandle><blobId>' + blobId + '</blobId><isbyteArray>false</isbyteArray>';
    },

    getFile: function (filename, activity) { // TODO: Activity handle element? Investigate...
        return '<activityHandle>' + activity.get('handle') + '</activityHandle><fileName>' + filename + '</fileName><isbyteArray>false</isbyteArray>';
    },

    dataRefresh: function (dataId, activity) { // TODO: Activity handle element? Investigate...
        return '<activityHandle>' + activity.get('handle') + '</activityHandle><DataPublication id="' + dataId + '" refresh="1" />';
    },
    
    wrapPayloadInActivityRequest: function (payload, activity) {
        if (activity.isAnonymous())
            return '<Activity id="' + activity.get('name') + '">' + payload + '</Activity>';
        else
            return '<Activity activityHandle="' + activity.get('handle') + '">' + payload + '</Activity>';
    },
    
    getActivityDataPublicationRequests: function (activity) {
        var dataPublicationRequests = '';
        
        /* add datapublication for data controls */
        activity.dataPublications.each(function (dataControl) {
            var populateMethod = dataControl.get('populateMethod') ? ' populateMethod="' + dataControl.get('populateMethod') + '"' : '';
            var query = dataControl.get('query') ? ' query="' + dataControl.get('query') + '"' : '';
            var autoPopulate = dataControl.get('autoPopulate') ? ' autoPopulate="' + dataControl.get('autoPopulate') + '"' : '';
            var type = dataControl.get('type') ? ' type="' + dataControl.get('type') + '"' : '';

            dataPublicationRequests += '<DataPublication id="' + dataControl.get('dataId') + '"' + query + populateMethod + autoPopulate + type;
            dataPublicationRequests += dataControl.get('contextObject') ? ' contextObject="' + dataControl.get('contextObject') + '"' : '';
            dataPublicationRequests += '/>';
        });

        return dataPublicationRequests;
    }
};