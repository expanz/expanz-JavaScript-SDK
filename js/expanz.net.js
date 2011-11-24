$(function () {

   window.expanz = window.expanz || {};

   window.expanz.Net = {

      // Request Objects -> to be passed to SendRequest
      CreateSessionRequest: function (username, password, appsite, callback) {
         SendRequest(
         CreateSessionRequestObject(username, password, appsite), parseCreateSessionResponse(callback));
      },

      GetSessionDataRequest: function (callback) {
         SendRequest(
         GetSessionDataRequestObject(expanz.Storage.getSessionHandle()), parseGetSessionDataResponse(callback));
      },

      CreateActivityRequest: function (activity, callback) {
         SendRequest(
         CreateActivityRequestObject(activity, "", expanz.Storage.getSessionHandle()), parseCreateActivityResponse(activity, callback));
      },

      DeltaRequest: function (id, value, activity, callback) {
         SendRequest(
         DeltaRequestObject(id, value, activity, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, callback));
      },

      MethodRequest: function( id, activity, callback) {
         SendRequest(
         MethodRequestObject( id, activity, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, callback));
      },

   };



   //
   // Request Objects  (used when passed to SendRequest( ... )
   //

   var CreateSessionRequestObject = function (username, password, appsite) {
         return {
            data: getCreateSessionRequestBody(username, password, appsite),
            url: 'CreateSessionX'
         };
      };

   var GetSessionDataRequestObject = function (sessionHandle) {
         return {
            data: getCreateGetSessionDataRequestBody(sessionHandle),
            url: 'ExecX'
         };
      };

   var CreateActivityRequestObject = function( activity, style, sessionHandle ){
         return {
            data: getCreateActivityRequestBody( activity, style, sessionHandle ),
            url: 'ExecX'
         };
      };

   var DeltaRequestObject = function( id, value, activity, sessionHandle ){
         return {
            data: getDeltaRequestBody( id, value, activity, sessionHandle ),
            url: 'ExecX'
         };
      };

   var MethodRequestObject = function( methodName, contextObject, activity ) {
         return {
            data: getCreateMethodRequestBody( methodName, contextObject, activity ),
            url: 'ExecX'
         };
      };




      //
      // XML Message Contruction Functions
      //

   var getCreateSessionRequestBody = function (username, password, appsite) {

         var body = '<CreateSessionX xmlns="http://www.expanz.com/ESAService">' + '<xml>' + '<ESA>' + '<CreateSession user="' + username + '" password="' + password + '" appSite="' + appsite + '" authenticationMode="Primary" clientVersion="Flex 1.0" schemaVersion="2.0"/>' + '</ESA>' + '</xml>' + '</CreateSessionX>';

         return body;
      };

   var getCreateGetSessionDataRequestBody = function (sessionHandle) {

         var body = '<ExecX xmlns="http://www.expanz.com/ESAService">' + '<xml>' + '<ESA>' + '<GetSessionData/>' + '</ESA>' + '</xml>' + '<sessionHandle>' + sessionHandle + '</sessionHandle>' + '</ExecX>';

         return body;
      };

   function getCreateActivityRequestBody(activity, style, sessionHandle) {

      var head = '<ExecX xmlns="http://www.expanz.com/ESAService">' + '<xml>' + '<ESA>';
      var center = '<CreateActivity name="' + activity.getAttr('name') + '"';
      style ? center += ' style="' + style + '"' : '';
      center += activity.getAttr('initialkey')?  ' initialKey="' + activity.getAttr('initialkey') + '">' : '>';
      
      if ( activity.hasGrid() ) {
         _.each( activity.getGrids(), function ( grid, gridId ) {
            center += '<DataPublication id="' + gridId + '" populateMethod="' + grid.getAttr('populateMethod') + '"';
            grid.getAttr('contextObject')? center += ' contextObject="' + grid.getAttr('contextObject') + '"': '';
            center += '/>';
         });
         
      } 
      center += '</CreateActivity>';

      var tail = '</ESA>' + '</xml>' + '<sessionHandle>' + sessionHandle + '</sessionHandle>' + '</ExecX>';

      return head + center + tail;
   }

   function getDeltaRequestBody (id, value, activity, sessionHandle) {

      var body = '<ExecX xmlns="http://www.expanz.com/ESAService">' + '<xml>' + '<ESA>' + '<Activity activityHandle="' + activity.getAttr('handle') + '">' + '<Delta id="' + id + '" value="' + value + '"/>' + '</Activity>' + '</ESA>' + '</xml>' + '<sessionHandle>' + sessionHandle + '</sessionHandle>' + '</ExecX>';

      return body;
   }

   function getCreateMethodRequestBody( methodName, activity, sessionHandle, contextObject ) {


      var body = '<ExecX xmlns="http://www.expanz.com/ESAService">' + '<xml>' + '<ESA>' + '<Activity activityHandle="' + activity.getAttr('handle') + '">' + '<Method name="' + methodName + '"';
      contextObject ? body += ' contextObject="' + contextObject + '"' : '';
      body += '/>' + '</Activity>' + '</ESA>' + '</xml>' + '<sessionHandle>' + sessionHandle + '</sessionHandle>' + '</ExecX>';

      return body;
   }

   function getCreateMenuActionRequestBody(activity, contextId, contextType, menuAction) {


      var body = '<ExecX xmlns="http://www.expanz.com/ESAService">' + '<xml>' + '<ESA>' + '<Activity activityHandle="' + activity.getAttr('handle') + '">' + '<Context id="' + contextId + '" Type="' + contextType + '"/>' + '<MenuAction defaultAction="' + menuAction + '"/>' + '</Activity>' + '</ESA>' + '</xml>' + '<sessionHandle>' + expanz.Storage.getSessionHandle() + '</sessionHandle>' + '</ExecX>';

      return body;
   }


   function getCreateReleaseSessionRequestBody() {

      var body = '<ReleaseSession xmlns="http://www.expanz.com/ESAService">' + '<xml>' + '<ESA>' + '<ReleaseSession/>' + '</ESA>' + '</xml>' + '<sessionHandle>' + expanz.Storage.getSessionHandle() + '</sessionHandle>' + '</ReleaseSession>';

      return body;
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

   
   function parseCreateActivityResponse( activity, callback ){
      return function apply( xml ){

         var execResults = $(xml).find("ExecXResult");
         if( execResults ){

            $(execResults).find( 'Message' ).each( function ()
            {
               if( $(this).attr('type') == 'Error' ){
                  callback( $(this).text() );
               }
            });

	    $( execResults ).find( 'Activity' ).each( function ()
	    {
	       activity.setAttr({handle: $(this).attr('activityHandle') });
	    });

	    $( execResults ).find( 'Field' ).each( function() 
	    {
               var field = activity.get( $(this).attr('id') );
               if( field  ) {
                  field.set({ label:   $(this).attr('label') });
                  field.set({ value:   $(this).attr('value') });
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

         } else {
            callback( false );
         }
      }
   };
   

   function parseDeltaResponse( activity, callback ){
      return function apply ( xml ){

         var execResults = $(xml).find("ExecXResult");
         var errorOccurred = false;

         if( execResults ){
            $( execResults ).find( 'Message' ).each( function()	
	    {
	       if( $(this).attr('type') == 'Error' || $(this).attr('type') == 'Warning'  )
               {
	          if( callback ) callback( $(this).text() );
	          errorOccurred = true;
	       }
	    });
            $( execResults ).find( 'Field' ).each( function() 
	    { 
               var id = $(this).attr('id');
               var field = activity.get( id );
               if(  field.get('value') != $(this).attr('value') )
               {
	          field.set({ value:   $(this).attr('value') });
               }
	    });
         }
         return;
      }
   };


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


