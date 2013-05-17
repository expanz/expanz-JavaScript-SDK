////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Chris Anderson
//  Copyright 2008-2013 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////


/*
 * Send Request :manage the sending of XML requests to the server, and dispatching of response handlers
 */
var serverRequestManager = {
    isRequestInProgress: false,
    requestQueue: [],

    queueRequest: function (payload, responseCallback, isPopup, callAsync) {
        var requestInfo = {
            payload: payload,
            responseCallback: responseCallback,
            isPopup: isPopup,
            isAsync: callAsync === undefined || callAsync
        };

        // Push this request onto the queue
        this.requestQueue.push(requestInfo);

        if (this.isRequestInProgress === false)
            this.startNextQueuedRequest();
    },

    startNextQueuedRequest: function () {
        // Execute the next request in the queue
        if (this.requestQueue.length !== 0) {
            window.expanz.logToConsole("Executing queued request");

            var executeRequestInfo = this.requestQueue.shift();
            this.sendRequest(executeRequestInfo);
        }
    },

    sendRequest: function (requestInfo) {
        window.expanz.logToConsole("REQUEST:");
        window.expanz.logToConsole(requestInfo.payload.data);

        this.isRequestInProgress = true;

        var manager = this;

        $(window).trigger("serverRequestStarted");

        $.ajaxSetup({
            headers: { "cache-control": "no-cache" } // http://stackoverflow.com/questions/12506897/is-safari-on-ios-6-caching-ajax-results
        });

        if (config.urlProxy !== undefined && config.urlProxy.length > 0) {
            $.ajax({
                type: 'POST',
                url: config.urlProxy,

                data: {
                    url: this.getUrlRestService(requestInfo.payload.url),
                    data: requestInfo.payload.data,
                    method: requestInfo.payload.method || "POST"
                },

                dataType: 'XML',
                processData: true,
                async: requestInfo.isAsync,
                complete: function (jqXHR) {
                    manager.onRequestComplete.call(manager, jqXHR, requestInfo);
                }
            });
        }
        else {
            $.ajax({
                type: requestInfo.payload.method || "POST",
                url: this.getUrlRestService(requestInfo.payload.url),
                data: requestInfo.payload.data,
                dataType: 'XML',
                processData: true,
                async: requestInfo.isAsync,
                complete: function (jqXHR) {
                    manager.onRequestComplete.call(manager, jqXHR, requestInfo);
                }
            });
        }
    },

    onRequestComplete: function (jqXHR, requestInfo) {
        this.isRequestInProgress = false;

        window.expanz.logToConsole("RESPONSE:");
        window.expanz.logToConsole(jqXHR.responseText);

        if (jqXHR.status === 0) {
            // Request was cancelled
            requestQueue = [];  // Future requests made invalid due to error, so clear the queue. TODO: Determine whether there is a better strategy for dealing with queued requests after an error.
        }
        else if (jqXHR.status != 200) {
            alert("There was a problem with the last server request. Status code " + jqXHR.status);
            requestQueue = [];  // Future requests made invalid due to error, so clear the queue. TODO: Determine whether there is a better strategy for dealing with queued requests after an error.
        }
        else {
            if (requestInfo.isPopup !== undefined && requestInfo.isPopup === true) {
                var WinId = window.open('', 'newwin', 'width=400,height=500');
                WinId.document.open();
                WinId.document.write(jqXHR.responseText);
                WinId.document.close();
            }
            else {
                if (requestInfo.responseCallback) {
                    eval(requestInfo.responseCallback)(jqXHR.responseXML);
                }
            }
        }

        $(window).trigger("serverRequestCompleted", requestInfo);

        // Send next queued request
        this.startNextQueuedRequest();
    },

    sendNormalRequest: function (request) {
        // Send Request :manage the sending of XML requests to the server, and dispatching of response handlers. Proxy is needed.
        if ($("#formFile")) {
            $("#formFile").remove();
        }

        var form = '';
        form += "<form method='post' id='formFile' target='_blank' action='" + config.urlProxy + "'>";
        form += "<input type='hidden' name='url' value='" + this.getUrlRestService(request.url) + "'>";
        form += "<input type='hidden' name='data' value='" + request.data + "'>";
        form += "</form>";

        $("body").append(form);

        $("#formFile").submit();
    },

    getUrlRestService: function (path) {
        var sep = "";

        if (!config.urlPrefix.endsWith("/"))
            sep = "/";

        return config.urlPrefix + sep + path;
    }
};