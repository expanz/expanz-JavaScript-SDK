$(function () {

   window.expanz = window.expanz || {};

   window.expanz.Net = {

      // Request Objects -> to be passed to SendRequest
      CreateSessionRequest: function (username, password, appsite, callbacks) {
         SendRequest(
         CreateSessionRequestObject(username, password, appsite), parseCreateSessionResponse(callbacks));
      },

      GetSessionDataRequest: function (callbacks) {
         SendRequest(
         GetSessionDataRequestObject(expanz.Storage.getSessionHandle()), parseGetSessionDataResponse(callbacks));
      },

      CreateActivityRequest: function (activity, callbacks) {
         SendRequest(
         CreateActivityRequestObject(activity, "", expanz.Storage.getSessionHandle()), parseCreateActivityResponse(activity, callbacks));
      },

      DeltaRequest: function (id, value, activity, callbacks) {
         SendRequest(
         DeltaRequestObject(id, value, activity, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, callbacks));
      },

      MethodRequest: function( name, contextObject, activity, callbacks) {
         SendRequest(
         MethodRequestObject( name, contextObject, activity, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, callbacks));
      },

      DestroyActivityRequest: function( activity, callbacks) {
         SendRequest(
         DestroyActivityRequestObject( activity, expanz.Storage.getSessionHandle()), parseDestroyActivityResponse(activity, callbacks));
      },

      ReleaseSessionRequest: function( callbacks) {
         SendRequest(
         ReleaseSessionRequestObject(expanz.Storage.getSessionHandle()), parseReleaseSessionResponse(callbacks));
      },
   };



   //
   // Request Objects  (used when passed to SendRequest( ... )
   //

   var CreateSessionRequestObject = function (username, password, appsite) {
         return {
            data: buildRequest( 'CreateSessionX', 'http://www.expanz.com/ESAService')( getCreateSessionRequestBody(username, password, appsite) ),
            url: 'CreateSessionX'
         };
      };

   var GetSessionDataRequestObject = function (sessionHandle) {
         return {
            data: buildRequest( 'ExecX', 'http://www.expanz.com/ESAService', sessionHandle )( getCreateGetSessionDataRequestBody() ),
            url: 'ExecX'
         };
      };

   var CreateActivityRequestObject = function( activity, style, sessionHandle ){
         return {
            data: buildRequest( 'ExecX', 'http://www.expanz.com/ESAService', sessionHandle )( getCreateActivityRequestBody( activity, style ) ),
            url: 'ExecX'
         };
      };

   var DeltaRequestObject = function( id, value, activity, sessionHandle ){
         return {
            data: buildRequest( 'ExecX', 'http://www.expanz.com/ESAService', sessionHandle )( getDeltaRequestBody( id, value, activity ) ),
            url: 'ExecX'
         };
      };

   var MethodRequestObject = function( name, contextObject, activity, sessionHandle ) {
         return {
            data: buildRequest( 'ExecX', 'http://www.expanz.com/ESAService', sessionHandle )( getCreateMethodRequestBody( name, contextObject, activity ) ),
            url: 'ExecX'
         };
      };

   var DestroyActivityRequestObject = function( activity, sessionHandle ){
         return {
            data: buildRequest( 'ExecX', 'http://www.expanz.com/ESAService', sessionHandle )( getDestroyActivityRequestBody( activity ) ),
            url:  'ExecX'
         };
      };

   var ReleaseSessionRequestObject = function( sessionHandle ){
         return {
            data: buildRequest( 'ReleaseSession', 'http://www.expanz.com/ESAService', sessionHandle )( getCreateReleaseSessionRequestBody() ),
            url:  'ExecX'
         };
      };



      //
      // XML Message Contruction Functions
      //

   var buildRequest = function ( requestType,      // CreateSessionX, ExecX
                                 xmlns,            // http://www.expanz.com/ESAService
                                 sessionHandle )
   {
      return function insertBody( body ){

         var head = '<' + requestType + ' xmlns="' + xmlns + '">' + '<xml>' + '<ESA>';
         var tail = '</ESA>' + '</xml>';
         tail += sessionHandle? '<sessionHandle>' + sessionHandle + '</sessionHandle>': '';
         tail += '</' + requestType + '>';

         return head + body + tail;
      }
   }

   var getCreateSessionRequestBody = function (username, password, appsite) {

         return '<CreateSession user="' + username + '" password="' + password + '" appSite="' + appsite + '" authenticationMode="Primary" clientVersion="Flex 1.0" schemaVersion="2.0"/>' ;
      };

   var getCreateGetSessionDataRequestBody = function() {
         return '<GetSessionData/>';
   };

   
   function getCreateActivityRequestBody(activity, style) {
      var center = '<CreateActivity name="' + activity.getAttr('name') + '"';
      style ? center += ' style="' + style + '"' : '';
      center += activity.getAttr('key')?  ' initialKey="' + activity.getAttr('key') + '">' : '>';
      
      if ( activity.hasGrid() ) {
         _.each( activity.getGrids(), function ( grid, gridId ) {
            center += '<DataPublication id="' + gridId + '" populateMethod="' + grid.getAttr('populateMethod') + '"';
            grid.getAttr('contextObject')? center += ' contextObject="' + grid.getAttr('contextObject') + '"': '';
            center += '/>';
         });
      } 
      center += '</CreateActivity>';
      return center;
   }

   function getDeltaRequestBody (id, value, activity) {
      return '<Activity activityHandle="' + activity.getAttr('handle') + '">' + '<Delta id="' + id + '" value="' + value + '"/>' + '</Activity>';
   }

   function getCreateMethodRequestBody( name, contextObject, activity ) {
      var body = '<Activity activityHandle="' + activity.getAttr('handle') + '">' + '<Method name="' + name + '"';
      body += contextObject? ' contextObject="' + contextObject + '"' : '';
      body += '/>' + '</Activity>';
      return body;
   }

   function getCreateMenuActionRequestBody(activity, contextId, contextType, menuAction) {
      return '<Activity activityHandle="' + activity.getAttr('handle') + '">' + '<Context id="' + contextId + '" Type="' + contextType + '"/>' + '<MenuAction defaultAction="' + menuAction + '"/>' + '</Activity>';
   }

   function getDestroyActivityRequestBody( activity, sessionHandle) {
      return '<Close activityHandle="' + activity.getAttr('handle') + '"/>';
   }

   function getCreateReleaseSessionRequestBody() {
      return '<ReleaseSession/>';
   }



   //
   // XML Message Response Parsers
   //

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
   };

   
   function parseCreateActivityResponse( activity, callbacks ){
      return function apply( xml ){

         var execResults = $(xml).find("ExecXResult");
         if( execResults ){

            $(execResults).find( 'Message' ).each( function ()
            {
               if( $(this).attr('type') == 'Error' ){
                  if( callbacks && callbacks.error ){
                     callbacks.error( $(this).text() );
                  }
               }
            });

	    $( execResults ).find( 'Activity' ).each( function ()
	    {
	       activity.setAttr({handle: $(this).attr('activityHandle') });
	    });

	    $( execResults ).find( 'Field' ).each( function() 
	    {
               var field = activity.get( $(this).attr('id') );
               if( field  ){
                  field.set({ label:      $(this).attr('label'),
                              value:      $(this).attr('value')
                              });
                  if( $(this).attr('datatype') ){
                     field.set({ datatype:      $(this).attr('datatype') }, { silent: true });
                     if(   $(this).attr('datatype').toLowerCase() === 'blob' 
                           && $(this).attr('url') )
                     {
                        field.set({ value:      $(this).attr('url') });
                     }
                  }
               }
	    });

            _.each( $( execResults ).find( 'Data' ),  function( data ) {
               var gridId = $(data).attr('id');
               var gridModel = activity.getGrid( gridId );
               gridModel.setAttr({ source: $(data).attr('source') });

               // add columns to the grid Model
               _.each( $(data).find( 'Column' ),  function( column ) {
                  
                  gridModel.addColumn( $(column).attr('id'),
                                       $(column).attr('field'),
                                       $(column).attr('label'),
                                       $(column).attr('datatype'),
                                       $(column).attr('width')
                                       );
               });

               // add rows to the grid Model
               _.each( $(data).find( 'Row' ),  function ( row ) {

                  var rowId = $(row).attr('id');
                  gridModel.addRow( rowId, $(row).attr('type') );
                  
                  // add cells to this row
                  _.each( $(row).find( 'Cell' ),   function( cell ){
                     gridModel.addCell( rowId, $(cell).attr('id'), $(cell).html() );
                  });
               });
            });   // foreach 'Data'

            if( callbacks && callbacks.success ){
               callbacks.success( 'Activity (' + activity.name + ') has been loaded: ' + execResults );
            }

         } else {
            if( callbacks && callbacks.error ){
               callbacks.error( 'Server gave an empty response to a CreateActivity request: ' + xml );
            }
         }
      }
   };
   

   function parseDeltaResponse( activity, callbacks ){
      return function apply ( xml ){

         var execResults = $(xml).find("ExecXResult");
         if( execResults ){
            $( execResults ).find( 'Message' ).each( function()	
	    {
	       if(   $(this).attr('type') == 'Error' 
                     || $(this).attr('type') == 'Warning'
                     )
               {
	          if( callbacks && callbacks.error ){
                     callbacks.error( $(this).text() );
                  }
	       }
	    });
            $( execResults ).find( 'Field' ).each( function() 
	    { 
               var id = $(this).attr('id');
               var field = activity.get( id );
               if(   field 
                     && field.get('value')
                     && (field.get('value') != $(this).attr('value')) 
                     )
               {
	          field.set({ value:   $(this).attr('value') });
               }
               if(   field 
                     && field.get('url')
                     && (field.get('url') != $(this).attr('url')) 
                     )
               {
	          field.set({ value:   $(this).attr('url') });
               }
	    });
         }
         return;
      }
   };


   function parseDestroyActivityResponse( activity, callbacks ){
      return function apply ( xml ){
         var execResults = $(xml).find('ExecXResult');
         if( xml && execResults ){
            var esaResult = $(execResults).find('ESA');
            if( esaResult ){
               if( $(esaResult).attr('success') === 1 ){
                  if( callbacks && callbacks.success ){
                     callbacks.success( true );
                     return true;
                  }
               }
            }
         }
         if( callbacks && callbacks.error ){
            callbacks.error( true );
         }
         return;
      }
   };

   function parseReleaseSessionResponse( callbacks ){
     return function apply( xml ){
         var result = $(xml).find("ReleaseSessionResult").text();
         if( result === 'true' ){
            if( deleteSessionHandle() ){
               if( callbacks && callbacks.success){
                  callbacks.success( result );
                  return;
               }
            } 
         }
         if( callbacks && callbacks.error ){
            callbacks.error( result );
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


