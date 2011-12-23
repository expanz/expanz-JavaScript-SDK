/* Author: Adam Tait

*/
$(function () {

   window.expanz = window.expanz || {};

   window.expanz.Net = {

      // Request Objects -> to be passed to SendRequest
      CreateSessionRequest: function (username, password, callbacks) {
         var appsite = config._AppSite;
         SendRequest(
         RequestObject.CreateSession(username, password, appsite), parseCreateSessionResponse(callbacks));
      },

      GetSessionDataRequest: function (callbacks) {
         SendRequest(
         RequestObject.GetSessionData(expanz.Storage.getSessionHandle()), parseGetSessionDataResponse(callbacks));
      },

      CreateActivityRequest: function (activity, callbacks) {
         SendRequest(
         RequestObject.CreateActivity(activity, "", expanz.Storage.getSessionHandle()), parseCreateActivityResponse(activity, callbacks));
      },

      DeltaRequest: function (id, value, activity, callbacks) {
         SendRequest(
         RequestObject.Delta(id, value, activity, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, callbacks));
      },

      MethodRequest: function (name, contextObject, activity, callbacks) {
         SendRequest(
         RequestObject.Method(name, contextObject, activity, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, callbacks));
      },

      DestroyActivityRequest: function (activity, callbacks) {
         SendRequest(
         RequestObject.DestroyActivity(activity, expanz.Storage.getSessionHandle()), parseDestroyActivityResponse(activity, callbacks));
      },

      ReleaseSessionRequest: function (callbacks) {
         SendRequest(
         RequestObject.ReleaseSession(expanz.Storage.getSessionHandle()), parseReleaseSessionResponse(callbacks));
      }
   };



   //
   // Request Objects  (used when passed to SendRequest( ... )
   //
   var XMLNamespace = window.config._XMLNamespace || 'http://www.expanz.com/ESAService'; 
      // TODO: throw an error here, saying that window.config._XMLNamespace is required
   var RequestObject = {

      CreateSession: function (username, password, appsite) {
         return {
            data: buildRequest('CreateSessionX', XMLNamespace)(RequestBody.CreateSession(username, password, appsite)),
            url: 'CreateSessionX'
         };
      },

      GetSessionData: function (sessionHandle) {
         return {
            data: buildRequest('ExecX', 'http://www.expanz.com/ESAService', sessionHandle)(RequestBody.GetSessionData()),
            url: 'ExecX'
         };
      },

      CreateActivity: function (activity, style, sessionHandle) {
         return {
            data: buildRequest('ExecX', 'http://www.expanz.com/ESAService', sessionHandle)(RequestBody.CreateActivity(activity, style)),
            url: 'ExecX'
         };
      },

      Delta: function (id, value, activity, sessionHandle) {
         return {
            data: buildRequest('ExecX', 'http://www.expanz.com/ESAService', sessionHandle)(RequestBody.Delta(id, value, activity)),
            url: 'ExecX'
         };
      },

      Method: function (name, contextObject, activity, sessionHandle) {
         return {
            data: buildRequest('ExecX', 'http://www.expanz.com/ESAService', sessionHandle)(RequestBody.CreateMethod(name, contextObject, activity)),
            url: 'ExecX'
         };
      },

      DestroyActivity: function (activity, sessionHandle) {
         return {
            data: buildRequest('ExecX', 'http://www.expanz.com/ESAService', sessionHandle)(RequestBody.DestroyActivity(activity)),
            url: 'ExecX'
         };
      },

      ReleaseSession: function (sessionHandle) {
         return {
            data: buildRequest('ReleaseSession', 'http://www.expanz.com/ESAService', sessionHandle)(RequestBody.CreateReleaseSession()),
            url: 'ExecX'
         };
      }
   };



   //
   // XML Message Contruction Functions
   //
   var buildRequest = function (requestType, xmlns, sessionHandle) {
         return function insertBody(body) {

            var head = '<' + requestType + ' xmlns="' + xmlns + '">' + '<xml>' + '<ESA>';
            var tail = '</ESA>' + '</xml>';
            tail += sessionHandle ? '<sessionHandle>' + sessionHandle + '</sessionHandle>' : '';
            tail += '</' + requestType + '>';

            return head + body + tail;
         }
      }

   var RequestBody = {

      CreateSession: function (username, password, appsite) {
         return '<CreateSession user="' + username + '" password="' + password + '" appSite="' + appsite + '" authenticationMode="Primary" clientVersion="Flex 1.0" schemaVersion="2.0"/>';
      },

      GetSessionData: function () {
         return '<GetSessionData/>';
      },

      CreateActivity: function (activity, style) {
         var center = '<CreateActivity name="' + activity.getAttr('name') + '"';
         style ? center += ' style="' + style + '"' : '';
         center += activity.getAttr('key') ? ' initialKey="' + activity.getAttr('key') + '">' : '>';

         if (activity.hasGrid()) {
            _.each(activity.getGrids(), function (grid, gridId) {
               center += '<DataPublication id="' + gridId + '" populateMethod="' + grid.getAttr('populateMethod') + '"';
               grid.getAttr('contextObject') ? center += ' contextObject="' + grid.getAttr('contextObject') + '"' : '';
               center += '/>';
            });
         }
         center += '</CreateActivity>';
         return center;
      },

      Delta: function (id, value, activity) {
         return '<Activity activityHandle="' + activity.getAttr('handle') + '">' + '<Delta id="' + id + '" value="' + value + '"/>' + '</Activity>';
      },

      CreateMethod: function (name, contextObject, activity) {
         var body = '<Activity activityHandle="' + activity.getAttr('handle') + '">' + '<Method name="' + name + '"';
         body += contextObject ? ' contextObject="' + contextObject + '"' : '';
         body += '/>' + '</Activity>';
         return body;
      },

      CreateMenuAction: function (activity, contextId, contextType, menuAction) {
         return '<Activity activityHandle="' + activity.getAttr('handle') + '">' + '<Context id="' + contextId + '" Type="' + contextType + '"/>' + '<MenuAction defaultAction="' + menuAction + '"/>' + '</Activity>';
      },

      DestroyActivity: function (activity, sessionHandle) {
         return '<Close activityHandle="' + activity.getAttr('handle') + '"/>';
      },

      CreateReleaseSession: function () {
         return '<ReleaseSession/>';
      }

   };


   //
   // XML Message Response Parsers
   //
   var parseCreateSessionResponse = function (callbacks) {
         return function apply(xml) {

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
               $(xml).find('errorMessage').each(function () {
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
                  if( callbacks && callbacks.success ){
                     callbacks.success($(this).attr('form'));
                  }
                  return;
               }
            });
         });
      };
   };


   function parseCreateActivityResponse(activity, callbacks) {
      return function apply(xml) {

         var execResults = $(xml).find("ExecXResult");
         if (execResults) {

            $(execResults).find('Message').each(function () {
               if ($(this).attr('type') == 'Error') {
                  if (callbacks && callbacks.error) {
                     callbacks.error($(this).text());
                  }
               }
            });

            $(execResults).find('Activity').each(function () {
               activity.setAttr({
                  handle: $(this).attr('activityHandle')
               });
            });

            $(execResults).find('Field').each(function () {
               var field = activity.get($(this).attr('id'));
               if (field) {
                  field.set({
                     label: $(this).attr('label'),
                     value: $(this).attr('value')
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
               var gridId = $(data).attr('id');
               var gridModel = activity.getGrid(gridId);
               gridModel.setAttr({
                  source: $(data).attr('source')
               });

               // add columns to the grid Model
               _.each($(data).find('Column'), function (column) {
                  gridModel.addColumn($(column).attr('id'), $(column).attr('field'), $(column).attr('label'), $(column).attr('datatype'), $(column).attr('width'));
               });

               // add rows to the grid Model
               _.each($(data).find('Row'), function (row) {

                  var rowId = $(row).attr('id');
                  gridModel.addRow(rowId, $(row).attr('type'));

                  // add cells to this row
                  _.each($(row).find('Cell'), function (cell) {
                     gridModel.addCell(rowId, $(cell).attr('id'), $(cell).html());
                  });
               });
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
   };


   function parseDeltaResponse(activity, callbacks) {
      return function apply(xml) {

         var execResults = $('ExecXResult', xml);
         if (execResults) {
            $('Message', execResults).each(function () {
               if ($(this).attr('type') == 'Error' || $(this).attr('type') == 'Warning') {
                  if (callbacks && callbacks.error) {
                     callbacks.error($(this).text());
                     return false;
                  }
               }
            });
            $('UIMessage', execResults).each(function () {
               var clientMessage = new expanz.Model.ClientMessage({  id: 'ExpanzClientMessage',
                                                                     title: $(this).attr('title'),
                                                                     text: $(this).attr('text'),
                                                                     parent: activity
                                                                     });
               $('Action', this).each(function () {
                  var actionModel = new expanz.Model.Method({
                                                id:   $('Request > Method', this)[0] ? $($('Request > Method', this)[0]).attr('name') : 'close',
                                                label: $(this).attr('label'),
                                                parent: activity
                                                });
                  clientMessage.add( actionModel );
               });
               activity.add( clientMessage );
               var clientMessageView = new expanz.Views.ClientMessage({
                                             id: clientMessage.get('id'),
                                             model: clientMessage
                                             }, $('body')
                                             );

            });
            $(execResults).find('Field').each(function () {
               var id = $(this).attr('id');
               var field = activity.get(id);
               if (  field 
                        && (
                           (field.get('value') && (field.get('value') != $(this).attr('value')))
                           || !field.get('value')
                           )
                  )
               {
                  field.set({
                     value: $(this).attr('value')
                  });
               }
               if (field && field.get('url') && (field.get('url') != $(this).attr('url'))) {
                  field.set({
                     value: $(this).attr('url')
                  });
               }
            });
         }
         if( callbacks && callbacks.success ){
            callbacks.success();
         }
         return true;
      }
   };


   function parseDestroyActivityResponse(activity, callbacks) {
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
         return;
      }
   };

   function parseReleaseSessionResponse(callbacks) {
      return function apply(xml) {
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
    *    Send Request
    *        :manage the sending of XML requests to the server, and dispatching of response handlers
    */

   var SendRequest = function (request, responseHandler) {
         $.ajax({
            type: 'POST',
            url: config._URLproxy,
            data: {
               url: config._URLprefix + request.url,
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

   //
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

      this.addColumn = function (field, width) {
         this.columns.push(new ColumnInfo(field, width));
      }

      function ColumnInfo(field, width) {
         this.field = field;
         this.width = width;
      }
   }

});

