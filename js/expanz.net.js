$(function () {

   window.expanz = window.expanz || {};

   window.expanz.Net = {

      // Request Objects -> to be passed to SendRequest
      CreateSessionRequest: function (username, password, callback) {
         SendRequest(
         CreateSessionRequestObject(username, password), parseCreateSessionResponse(callback));
      },

      GetSessionDataRequest: function (callback) {
         SendRequest(
         GetSessionDataRequestObject(expanz.Storage.getSessionHandle()), parseGetSessionDataResponse(callback));
      },

   };


   // Request Objects  (used when passed to SendRequest( ... )
   var CreateSessionRequestObject = function (username, password) {
         return {
            data: getCreateSessionRequestBody(username, password),
            url: 'CreateSessionX'
         };
      };

   var GetSessionDataRequestObject = function (sessionHandle) {
         return {
            data: getCreateGetSessionDataRequestBody(sessionHandle),
            url: 'ExecX'
         };
      }

      // XML Message Contruction Functions
   var getCreateSessionRequestBody = function (username, password) {

         var body = '<CreateSessionX xmlns="http://www.expanz.com/ESAService">' + '<xml>' + '<ESA>' + '<CreateSession user="' + username + '" password="' + password + '" appSite="SALES" authenticationMode="Primary" clientVersion="Flex 1.0" schemaVersion="2.0"/>' + '</ESA>' + '</xml>' + '</CreateSessionX>';

         return body;
      };

   var getCreateGetSessionDataRequestBody = function (sessionHandle) {

         var body = '<ExecX xmlns="http://www.expanz.com/ESAService">' + '<xml>' + '<ESA>' + '<GetSessionData/>' + '</ESA>' + '</xml>' + '<sessionHandle>' + sessionHandle + '</sessionHandle>' + '</ExecX>';

         return body;
      };

   function getCreateActivityRequestBody(activity, style) {

      var head = '<ExecX xmlns="http://www.expanz.com/ESAService">' + '<xml>' + '<ESA>';
      var center = '';
      if (activity.datapublication.length > 0) {
         if (activity.initialkey) {
            center += '<CreateActivity name="' + activity.name + '"';
            style ? center += ' style="' + style + '"' : '';
            center += ' initialKey="' + activity.initialkey + '">';
         } else {
            center += '<CreateActivity name="' + activity.name + '" ';
            style ? center += 'style="' + style + '"' : '';
            center += '>';
         }
         $.each(activity.datapublication, function () {
            if (this.contextObject) {
               center += '<DataPublication id="' + this.id + '" populateMethod="' + this.populateMethod + '" contextObject="' + this.contextObject + '"/>';
            } else {
               center += '<DataPublication id="' + this.id + '" populateMethod="' + this.populateMethod + '"/>';
            }
         });
         center += '</CreateActivity>';
      } else {
         center += '<CreateActivity name="' + activity.name + '"';
         style ? center += ' style="' + style + '"' : '';
         activity.initialkey ? center += ' initialKey="' + activity.initialkey + '"' : '';
         center += '/>';
      }
      var tail = '</ESA>' + '</xml>' + '<sessionHandle>' + getSessionHandle() + '</sessionHandle>' + '</ExecX>';

      return head + center + tail;
   }

   function getCreateDeltaRequestBody(activity, id, value) {

      var body = '<ExecX xmlns="http://www.expanz.com/ESAService">' + '<xml>' + '<ESA>' + '<Activity activityHandle="' + activity.handle + '">' + '<Delta id="' + id + '" value="' + value + '"/>' + '</Activity>' + '</ESA>' + '</xml>' + '<sessionHandle>' + getSessionHandle() + '</sessionHandle>' + '</ExecX>';

      return body;
   }

   function getCreateMethodRequestBody(activity, methodName, contextObject) {


      var body = '<ExecX xmlns="http://www.expanz.com/ESAService">' + '<xml>' + '<ESA>' + '<Activity activityHandle="' + activity.handle + '">' + '<Method name="' + methodName + '"';
      contextObject ? body += ' contextObject="' + contextObject + '"' : '';
      body += '/>' + '</Activity>' + '</ESA>' + '</xml>' + '<sessionHandle>' + getSessionHandle() + '</sessionHandle>' + '</ExecX>';

      return body;
   }

   function getCreateMenuActionRequestBody(activity, contextId, contextType, menuAction) {


      var body = '<ExecX xmlns="http://www.expanz.com/ESAService">' + '<xml>' + '<ESA>' + '<Activity activityHandle="' + activity.handle + '">' + '<Context id="' + contextId + '" Type="' + contextType + '"/>' + '<MenuAction defaultAction="' + menuAction + '"/>' + '</Activity>' + '</ESA>' + '</xml>' + '<sessionHandle>' + getSessionHandle() + '</sessionHandle>' + '</ExecX>';

      return body;
   }


   function getCreateReleaseSessionRequestBody() {

      var body = '<ReleaseSession xmlns="http://www.expanz.com/ESAService">' + '<xml>' + '<ESA>' + '<ReleaseSession/>' + '</ESA>' + '</xml>' + '<sessionHandle>' + getSessionHandle() + '</sessionHandle>' + '</ReleaseSession>';

      return body;
   }

   // XML Message Response Parsers
   var parseCreateSessionResponse = function (callback) {
         return function apply(xml) {

            xml.replace('&lt;', '<');
            xml.replace('&gt;', '>');

            if ($(xml).find('CreateSessionXResult').length > 0) {
               expanz.Storage.setSessionHandle($(xml).find('CreateSessionXResult').text());
            }

            if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle.length > 0) {

               var errorString = '';

               $(xml).find('errorMessage').each(function () {
                  errorString = $(this).text();
               });

               if (errorString.length > 0) {
                  eval(callback)(errorString);
                  return false;
               }
            }

            return eval(callback)();
         };
      };


   function parseGetSessionDataResponse(callback) {
      return function apply(xml) {

         var processAreas = [];

         $(xml).find('processarea').each(function () {

            var processArea = new ProcessArea($(this).attr('id'), $(this).attr('title'));
            $(this).find('activity').each(function () {
               processArea.activities.push(new ActivityInfo($(this).attr('name'), $(this).attr('title'), '#'));
            });
            processAreas.push(processArea);
         });

         $.get('./formmapping.xml', function (data) {

            $(data).find('activity').each(function () {
               var name = $(this).attr('name');
               var url = $(this).attr('form');
               var gridviewList = [];
               $(this).find('gridview').each(function () {
                  var gridview = new GridViewInfo($(this).attr('id'));
                  $(this).find('column').each(function () {
                     gridview.addColumn($(this).attr('field'), $(this).attr('width'));
                  });
                  gridviewList.push(gridview);
               });

               $.each(processAreas, function (i, processArea) {
                  $.each(processArea.activities, function (j, activity) {
                     if (activity.name == name) {
                        activity.url = url;
                        activity.gridviews = gridviewList;
                     }
                  });
               });
            });

            expanz.Storage.setProcessAreaList(processAreas);

            $(data).find('activity').each(function () {
               if ($(this).attr('default') == 'true') {
                  return callback($(this).attr('form'));
               }
            });
         });
      };
   }

   /*
    *    Send Request
    *        :manage the sending of XML requests to the server, and dispatching of response handlers
    */

   var SendRequest = function (request, responseHandler) {
         $.ajax({
            type: 'POST',
            url: _URLproxy,
            data: {
               url: _URLprefix + request.url,
               data: request.data
            },
            dataType: 'string',
            processData: true,
            complete: function (HTTPrequest) {
               if (HTTPrequest.status != 200) {
                  eval(responseHandler)('There was a problem with the last request.');
               } else {
                  var response = HTTPrequest.responseText;
                  if (responseHandler) {
                     var xml = response.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                     eval(responseHandler)(xml);
                  }
               }
            }
         });
      };

   var _URLproxy = '../../expanz-Proxy/proxy.php';
   var _URLprefix = 'http://expanzdemo.cloudapp.net:8080/esaservice.svc/restish/'; //'http://test.expanz.com/ESADemoService/ESAService.svc/restish/';
   var _URLprefixSSL = 'https://test.expanz.com/ESADemoService/ESAService.svc/restishssl/';


   // Session Data Stub Objects

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

      this.addColumn = function (field, width) {
         this.columns.push(new ColumnInfo(field, width));
      }

      function ColumnInfo(field, width) {
         this.field = field;
         this.width = width;
      }
   }

});


