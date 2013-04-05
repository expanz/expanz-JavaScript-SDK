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

//
// Request Objects (used when passed to SendRequest( ... )
//
var XMLNamespace = window.config.xmlNamespace || XMLNamespace; // TODO: throw an error here, saying that window.config.xmlNamespace is required

var requestBuilder = {

    CreateSession: function (username, password, appsite, authenticationMode) {
        return {
            data: this.buildRequest('CreateSessionX', XMLNamespace)(requestBody.createSession(username, password, appsite, authenticationMode)),
            url: 'CreateSessionX'
        };
    },

    Ping: function () {
        return {
            data: this.buildRequest('Ping', XMLNamespace)(""),
            url: 'Ping'
        };
    },

    WebServerPing: function () {
        return {
            data: "",
            url: 'WebServerPing',
            method: "GET"
        };
    },

    GetSessionData: function (sessionHandle) {
        return {
            data: this.buildRequest('ExecX', XMLNamespace, sessionHandle)(requestBody.getSessionData()),
            url: 'ExecX'
        };
    },

    GetSavePreferences: function (key, value, sessionHandle) {
        return {
            data: this.buildRequest('ExecX', XMLNamespace, sessionHandle)(requestBody.createSavePreferences(key, value)),
            url: 'ExecX'
        };
    },

    CreateActivity: function (activity, sessionHandle) {
        return {
            data: this.buildRequest('ExecX', XMLNamespace, sessionHandle)(requestBody.createActivity(activity)),
            url: 'ExecX'
        };
    },

    Delta: function (id, value, activity, sessionHandle) {
        return {
            data: this.buildRequest('ExecX', XMLNamespace, sessionHandle)(requestBody.delta(id, value, activity)),
            url: 'ExecX'
        };
    },

    Method: function (name, methodAttributes, context, activity, sessionHandle) {
        return {
            data: this.buildRequest('ExecX', XMLNamespace, sessionHandle)(requestBody.createMethod(name, methodAttributes, context, activity)),
            url: 'ExecX'
        };
    },

    AnonymousMethod: function (name, methodAttributes, context, activity, anonymousFields) {
        return {
            data: this.buildRequest('ExecAnonymousX', XMLNamespace, null, true)(requestBody.createMethod(name, methodAttributes, context, activity, anonymousFields)),
            url: 'ExecAnonymousX'
        };
    },

    AnonymousMethods: function (methods, activity) {
        return {
            data: this.buildRequest('ExecAnonymousX', XMLNamespace, null, true)(requestBody.createAnonymousMethods(methods, activity)),
            url: 'ExecAnonymousX'
        };
    },

    SetContextAndDelta: function (contextInfo, deltaInfo, activity, sessionHandle) {
        var setContextRequestBody = requestBody.createSetContextElement(contextInfo.id, contextInfo.contextObject, contextInfo.type);
        var deltaRequestBody = requestBody.createDeltaElement(deltaInfo.id, deltaInfo.value, deltaInfo.matrixKey);
        var fullRequestBody = requestBody.wrapPayloadInActivityRequest(setContextRequestBody + deltaRequestBody, activity);
        
        return {
            data: this.buildRequest('ExecX', XMLNamespace, sessionHandle)(fullRequestBody),
            url: 'ExecX'
        };
    },

    CloseActivity: function (activityHandle, sessionHandle) {
        return {
            data: this.buildRequest('ExecX', XMLNamespace, sessionHandle)(requestBody.closeActivity(activityHandle)),
            url: 'ExecX'
        };
    },

    ReleaseSession: function (sessionHandle) {
        return {
            data: this.buildRequest('ReleaseSession', XMLNamespace, sessionHandle)(requestBody.createReleaseSession()),
            url: 'ReleaseSession'
        };
    },

    GetBlob: function (blobId, activity, sessionHandle) {
        return {
            data: this.buildRequestWithoutESA('GetBlob', XMLNamespace, sessionHandle)(requestBody.getBlob(blobId, activity)),
            url: 'GetBlob'
        };
    },

    GetFile: function (filename, activity, sessionHandle) {
        return {
            data: this.buildRequestWithoutESA('GetFile', XMLNamespace, sessionHandle)(requestBody.getFile(filename, activity)),
            url: 'GetFile'
        };
    },

    DataRefresh: function (dataId, activity, sessionHandle) {
        return {
            data: this.buildRequest('ExecX', XMLNamespace, sessionHandle)(requestBody.dataRefresh(dataId, activity)),
            url: 'ExecX'
        };
    },

    CreateMenuAction: function (activity, contextId, contextType, contextObject, menuAction, defaultAction, setIdFromContext, sessionHandle) {
        return {
            data: this.buildRequest('ExecX', XMLNamespace, sessionHandle)(requestBody.createMenuAction(activity, contextId, contextType, contextObject, menuAction, defaultAction, setIdFromContext)),
            url: 'ExecX'
        };
    },

    CreateContextMenuAction: function (activity, contextId, contextMenuType, contextObject, sessionHandle) {
        return {
            data: this.buildRequest('ExecX', XMLNamespace, sessionHandle)(requestBody.createContextMenuAction(activity, contextId, contextMenuType, contextObject)),
            url: 'ExecX'
        };
    },

    CreateAnonymousRequest: function (xmlData) {
        return {
            data: this.buildRequest('ExecAnonymousX', XMLNamespace, null, true)(xmlData),
            url: 'ExecAnonymousX'
        };
    },

    buildRequest: function(requestType, xmlns, sessionHandle, includeSite) {
        return function insertBody(body) {
            var site = includeSite ? '<site>' + config.appSite + '</site>' : '';
            var namespace = xmlns ? ' xmlns="' + xmlns + '" ' : '';
            var head = '<' + requestType + namespace + '>' + site + '<xml><ESA>';
            var tail = '</ESA>' + '</xml>';
            tail += sessionHandle ? '<sessionHandle>' + sessionHandle + '</sessionHandle>' : '';
            tail += '</' + requestType + '>';

            return head + body + tail;
        };
    },
    
    buildRequestWithoutESA: function(requestType, xmlns, sessionHandle) {
        return function insertBody(body) {

            var head = '<' + requestType + ' xmlns="' + xmlns + '">';
            head += sessionHandle ? '<sessionHandle>' + sessionHandle + '</sessionHandle>' : '';
            var tail = '';
            tail += '</' + requestType + '>';

            return head + body + tail;
        };
    }
};