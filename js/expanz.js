/*
 *                EXPANZ JavaScript SDK
 *
 *
 */


/*
 *   SDK Exposed Functions
 *           Use these functions to write your apps
 */

function redirect( destinationURL ){
	window.location.href = destinationURL;
}


var onDynamicLoadFunctions = new Array();
var onDynamicLoad = function applyLater(fn){
                              if( fn )
                                 onDynamicLoadFunctions.push( fn );
                              else
                                 for( var i=0; i < onDynamicLoadFunctions.length; i++ )
                                    eval( onDynamicLoadFunctions[i] )();
                           };

var activities = {};
function DynamicLoadActivity(){
   
   // TODO: remove duplicates every time this gets run
   $('.Activity').each( function(){
         if( ! activities[ $(this).attr('name') ] || 
                  ( activities[ $(this).attr('name') ] && 
                     ($(this).attr('initialKey') != activities[ $(this).attr('name') ].initialKey) 
                  )
            ){
               var activity = new Activity( $(this).attr('name'), $(this).attr('initialKey') );
               $(this).find('.GridView').each( function(){
                     activity.datapublication.push(   new GridView(  $(this).attr('id'),
                                                                     $(this).attr('popluateMethod'),
                                                                     $(this).attr('contextObject'),
                                                                     $(this)
                                                                     )
                                                   );
               });
               LoadActivity( activity );
               activities[ activity.name ] = activity;
            }
   });
}


(function( $ ){
  $.fn.ExpanzLoad = function( fn ) {
   onDynamicLoad( fn );
  };
  $.fn.ExpanzLoadActivity = DynamicLoadActivity;
})( jQuery );


/*
 *   Session Functions
 *         These functions create, query, maintain, destroy user sessions
 */


function getSessionHandle() {
	return $.cookies.get( '_expanz.session.handle' );
}

function deleteSessionHandle() {

   $.cookies.set( '_expanz.session.handle' );
   return true;
}



function networkError( e ){
	console.log( e );
}

function getLoginURL(){
   return $.cookies.get( '_expanz.login.url' );
}

function getProcessAreaList(){
   return $.cookies.get( '_expanz.processarea.list' );
}


function onLogout( event ){

   var successFn = function(){ redirect( getLoginURL() ); }; 
   var errorFn = networkError;

   SendRequest(   new CreateReleaseSessionRequest(),
                  parseReleaseSessionResponse( successFn, successFn ),
                  networkError
                  );

   eval( successFn )();
}



/*
 *   On Ready (once the page loads, do: )
 *          :check the SessionHandle, then load all the Activities in the DOM
 */

$(document).ready( function() {

   if( !getSessionHandle() ){
      deleteSessionHandle();
      redirect( getLoginURL() );
   }

   // Load Menu & insert it into .menu
   $.each( getProcessAreaList(), function( i, processArea ) {
      $('#menu').append(   '<div class=\'menuitem ' + processArea.id + '\'>' +
                              '<a>' + processArea.title + '</a>' + 
                              '<ul></ul>' +
                           '</div>'
                           );
      $.each( processArea.activities, function( j, activity ){
         $('#menu .menuitem ul').append(   '<li>' + 
                                                   '<a href=\'' + activity.url + '\'>' + activity.title + '</a>' + 
                                                   '</li>'
                                                   );
      });
   });

   // insert the logout button into .logout
   $('#menu').append( '<div id=\'logout\' class=\'menuitem\'><a data-bind=\'click: Logout\' >logout</a></div>' );


   DynamicLoadActivity();
	
});







function LoadActivity( activity ){

   //if( ! activity.loaded ){
	SendRequest( new CreateActivityRequest( activity ),
		     parseCreateActivityResponse( activity, setupBindings( activity ) ),
         	     networkError
         	     ); 
   //}
}


/*
 *   Setup Bindings
 *        :use Knockout.js (ko) to connect local objects with DOM elements
 */

function setupBindings( activity ){
   return function apply( fields ){

      for( attr in fields ){ Bindings[attr] = fields[attr]; }

         setupObservers( activity, fields ); //Bindings );

         Bindings.Method = callMethod( activity, Bindings );
         Bindings.MenuAction = callMenuAction( activity, Bindings );
         Bindings.Logout = onLogout;

         ko.applyBindings( Bindings );

         onDynamicLoad();
   }
}

/*
 *   Setup Observers
 *        :use Knockout.js (ko) to recognize changes in DOM fields and issue an update request to the server
 */

function setupObservers( activity, fields ){

	for( var id in fields ){

		if( fields[id] instanceof Field ){
			fields[id].value.subscribe( 
				function( field, allFields ){
					return function( newValue ){

						var success = function(){
							field.error( "" );
						}; 
						var error = function( string ){ 
							field.error( string );
						};

						if( field.disabled != 1 && !field.serverUpdated ){
							SendRequest(	new CreateDeltaRequest( activity, field.id.replace(/_/g, '.'), newValue ),
         									parseUpdateResponse( allFields, success, error ),
         									networkError
         									);
						}

                                                field.serverUpdated = false;
					}
				} ( fields[id], fields )
			);
		}
	}

}

function setupClickGridViewClickHandlers( ){}



/*
 *    Actions
 *        :top-level functions issued by user input or server request
 */


function callMethod( activity, fields ){
	return function apply( event ){

		var name = $(event.currentTarget).attr('method-name');
		var successFn = getFunctionFromDOMByName( $(event.currentTarget).attr('onSuccess') );
		var errorFn = getFunctionFromDOMByName( $(event.currentTarget).attr('onError') );

		SendRequest( 	new CreateMethodRequest( activity, name ),
         				parseUpdateResponse( fields, successFn, errorFn ),
         				errorFn
           				);

		return true;
	}
}

function callMenuAction( activity, fields ){
   return function apply( event ){
      
      var actionName = $(event.currentTarget).attr('action-name');
      var contextSelectorFn = getFunctionFromDOMByName( $(event.currentTarget).attr('context-selector') );
      var contextId = eval( contextSelectorFn )();

      var successFn = getFunctionFromDOMByName( $(event.currentTarget).attr('onSuccess') );
      var errorFn = getFunctionFromDOMByName( $(event.currentTarget).attr('onError') );

      SendRequest(   new CreateMenuActionRequest( activity, contextId, actionName ),
                     parseMenuActionResponse( fields, successFn, errorFn ),
         	     errorFn
           	     );

      
   };
}


/*
 *    Response Parsers
 *         :used to parse XML results from server requests. Use these functions for the 'responseHandler' argument to 'SendRequest'
 */

function parseCreateActivityResponse( activity, callback ){
   return function apply( xml ){

      var execResults = $(xml).find("ExecXResult");
      var fields = {};  //new Array();

      if( execResults ){

         $(execResults).find( 'Message' ).each( function ()
         {
            if( $(this).attr('type') == 'Error' ){
               networkError( $(this).text() );
            }
         });

			$( execResults ).find( 'Activity' ).each( function ()
			{
				activity.handle = $(this).attr('activityHandle');
			});

			$( execResults ).find( 'Field' ).each( function() 
			{ 
				var field = new Field(   $(this).attr('id').replace(/\./g, '_'),
							 $(this).attr('label'),
               						 $(this).attr('disabled'),
					               	 $(this).attr('null'),
               						 $(this).attr('value'),
               						 $(this).attr('datatype'),
					               	 $(this).attr('valid')
            						 );  
				fields[ field.id ] = field;
			});

                        $( execResults ).find( 'Data' ).each( function()
                        {
                           var gridview = activity.findDatapublicationForID( $(this).attr('id') );
                           gridview.source = $(this).attr('source');
                           gridview.clear();

                           $(this).find( 'Column' ).each( function() {
                              gridview.addColumn(  $(this).attr('id'),
                                                   $(this).attr('field'),
                                                   $(this).attr('label'),
                                                   $(this).attr('datatype'),
                                                   $(this).attr('width')
                                                );
                           });

                           $(this).find( 'Row' ).each( function(){
                              var row = gridview.addRow( $(this).attr('id'),
                                                               $(this).attr('type'),
                                                               $(this).html()
                                                               );
                              for( var i=0; i < row.cells.length; i++ )
                                 fields[ row.cells[i].id ] = row.cells[i];
                           });
                        });


		}
      else{
         networkError( execResults );
      }

      activity.loaded = true;
      return eval( callback )( fields );
   }
}

function parseUpdateResponse( fields, success, error ){
   return function apply ( xml ){

      var execResults = $(xml).find("ExecXResult");
      var errorOccurred = false;

      if( execResults ){
         $( execResults ).find( 'Field' ).each( function() 
	 { 
            var id = $(this).attr('id').replace(/\./g, '_');
            if(  fields[ id ].value() != $(this).attr('value') )
            {
               fields[ id ].serverUpdated = true;
	       fields[ id ].value( $(this).attr('value') );
            }
	 });
	 $( execResults ).find( 'Message' ).each( function()	
	 {
	    if( $(this).attr('type') == 'Error' || $(this).attr('type') == 'Warning'  )
            {
	       eval( error )( $(this).text() );
	       errorOccurred = true;
	    }
	 });
      }

      if( !errorOccurred ){	eval( success )( execResults );	}
      return execResults;
   }
}


function parseMenuActionResponse( fields, success, error ){
	return function apply ( xml ){

			var execResults = $(xml).find("ExecXResult");

			if( execResults ){
                           var fields = new Array();

                           var fieldsXml = $( execResults ).find( 'Field' );
                           for( var i=0; i < fieldsXml.length; i++ ) {
				var field = new Field(   $(fieldsXml[i]).attr('id'),
							 $(fieldsXml[i]).attr('label'),
               						 $(fieldsXml[i]).attr('disabled'),
					               	 $(fieldsXml[i]).attr('null'),
               						 $(fieldsXml[i]).attr('value'),
               						 $(fieldsXml[i]).attr('datatype'),
					               	 $(fieldsXml[i]).attr('valid')
            						 );  
				fields[ field.id ] = field;
			   }

                           eval( success )( fields );
                        } else {
                           eval( error )( xml );
                        }
			return xml;
	}
}


function parseReleaseSessionResponse( success, error ){
   return function apply( xml ){

      if( $(xml).find("ReleaseSessionResult").text() == 'true' ){
         if( deleteSessionHandle() ){
            return eval( success )();
         }
      }

      return error( $(xml).find('errors').text() );
   }
}   




/*
 *    Send Request
 *        :manage the sending of XML requests to the server, and dispatching of response handlers
 */

function SendRequest ( request, responseHandler, error ){

      $.ajax({
         type: 'POST',
	 url: _URLproxy,
	 data: { url: _URLprefix + request.url, data: request.data },
	 dataType: "string",
	 processData: true,
	 complete: function( HTTPrequest ){
	    if( HTTPrequest.status != 200 ){
               eval( error )( 'There was a problem with the last request.' );
            } else {
	       var response = HTTPrequest.responseText;
	          if( responseHandler ){
                     var xml = response.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
		     eval( responseHandler )( xml );
		  } 
	    }
	 }
      });
}


/*
 *   Request Objects
 *
 */

function CreateActivityRequest( activity, style ){
   this.data = getCreateActivityRequestBody( activity, style );
   this.url = 'ExecX';
}
function CreateDeltaRequest( activity, id, value ){
   this.data = getCreateDeltaRequestBody( activity, id, value );
   this.url = 'ExecX';
}
function CreateMethodRequest( activity, methodName ){
   this.data = getCreateMethodRequestBody( activity, methodName );
   this.url = 'ExecX';
}
function CreateMenuActionRequest( activity, contextId, menuAction ){
   this.data = getCreateMenuActionRequestBody( activity, contextId, activity.name, menuAction );
   this.url = 'ExecX';
}
function CreateReleaseSessionRequest(){
   this.data = getCreateReleaseSessionRequestBody();
   this.url = 'ReleaseSession';
}


/*
 *   XML Message Contruction Functions
 *
 */

function getCreateActivityRequestBody( activity, style ){

   var head = '<ExecX xmlns="http://www.expanz.com/ESAService">' +
                  '<xml>' +
                     '<ESA>';
   var center = '';
   if( activity.datapublication.length > 0 ){
      if( activity.initialkey ){
         center +=  '<CreateActivity name="' + activity.name + '"';
         //style? center += ' style="' + style + '"' : '';
         style? center += ' style="' + style + '"': '';
         center += ' initialKey="' + activity.initialkey + '">';
      } else {
         center +=  '<CreateActivity name="' + activity.name + '" ';
         style? center += 'style="' + style + '"' : '';
         center += '>';
      }
      $.each( activity.datapublication, function(){                     
         if( this.contextObject ){
            center += '<DataPublication id="' + this.id + '" populateMethod="' + this.populateMethod + '" contextObject="' + this.contextObject + '"/>';
         } else {
            center += '<DataPublication id="' + this.id + '" populateMethod="' + this.populateMethod + '"/>'; 
         }
      });
      center += '</CreateActivity>';
   } else {
      center +=  '<CreateActivity name="' + activity.name + '" style="' + style + '"/>';
   }
   var tail = '</ESA>' +
                  '</xml>' +
                  '<sessionHandle>' + getSessionHandle() + '</sessionHandle>' +
               '</ExecX>';

   return head + center + tail;
}

function getCreateDeltaRequestBody( activity, id, value ){

   var body = '<ExecX xmlns="http://www.expanz.com/ESAService">' +
                  '<xml>' +
                     '<ESA>' +
                        '<Activity activityHandle="' + activity.handle + '">' +
                           '<Delta id="' + id + '" value="' + value + '"/>' +
                        '</Activity>' +
                     '</ESA>' +
                  '</xml>' +
                  '<sessionHandle>' + getSessionHandle() + '</sessionHandle>' +
               '</ExecX>';

	return body;
}

function getCreateMethodRequestBody( activity, methodName ){


	var body = '<ExecX xmlns="http://www.expanz.com/ESAService">' +
                  '<xml>' +
                     '<ESA>' +
                        '<Activity activityHandle="' + activity.handle + '">' +
                           '<Method name="' + methodName + '"/>' +
                        '</Activity>' +
                     '</ESA>' +
                  '</xml>' +
                  '<sessionHandle>' + getSessionHandle() + '</sessionHandle>' +
               '</ExecX>';

	return body;
}

function getCreateMenuActionRequestBody( activity, contextId, contextType, menuAction ){


	var body = '<ExecX xmlns="http://www.expanz.com/ESAService">' +
                  '<xml>' +
                     '<ESA>' +
                        '<Activity activityHandle="' + activity.handle + '">' +
                           '<Context id="' + contextId + '" Type="' + contextType + '"/>' +
                           '<MenuAction defaultAction="' + menuAction + '"/>' +
                        '</Activity>' +
                     '</ESA>' +
                  '</xml>' +
                  '<sessionHandle>' + getSessionHandle() + '</sessionHandle>' +
               '</ExecX>';

	return body;
}


function getCreateReleaseSessionRequestBody(){

   var body = '<ReleaseSession xmlns="http://www.expanz.com/ESAService">' +
                  '<xml>' +
                     '<ESA>' +
                        '<ReleaseSession/>' +
                     '</ESA>' +
                   '</xml>' +
                   '<sessionHandle>' + getSessionHandle() + '</sessionHandle>' +
               '</ReleaseSession>';

	return body;
}


/*
 *   Private Variables
 *
 */

var _URLproxy = '../../expanz-Proxy/proxy.php';
var _URLprefix = 'http://expanzdemo.cloudapp.net:8080/esaservice.svc/restish/';   //'http://test.expanz.com/ESADemoService/ESAService.svc/restish/';
var _URLprefixSSL = 'https://test.expanz.com/ESADemoService/ESAService.svc/restishssl/';

var Bindings = {};


/*
 *   Private Object Prototypes
 *
 */


function Activity( name, initialkey ) {
	this.name = name;
        this.initialkey = initialkey;
	this.handle = "";
        this.datapublication = new Array();
        this.loaded = false;

        this.findDatapublicationForID = function( id ){
            for( var i=0; i < this.datapublication.length; i++ ){
               if( this.datapublication[i].id = id )
                  return this.datapublication[i];
            }
            return null;
         };
}

function Field( id, label, disabled, nullvalue, value, datatype, valid ){
   this.id = id;
   this.label = label;
   this.disabled = disabled;
   this.nullvalue = nullvalue;
   this.value = ko.observable( value );
   this.datatype = datatype;
   this.valid = valid;
   this.error = ko.observable( "" );
   this.serverUpdated = false;
}

function GridView( id, popluateMethod, contextObject, jQ ) {
   this.id = id;
   this.populateMethod = popluateMethod;
   this.contextObject = contextObject;
   this.jQ = jQ;

   this.columns = new Array();
   this.rows = new Array();
   createScaffold( id );

   function Column( id, field, label, datatype, width ){
      this.id = id;
      this.field = field;
      this.datatype = datatype;
      this.label = label;
      this.width = width;
   }
   function Row( mother, id, type ){
      this.mother = mother;
      this.id = mother.id + '_' + id;
      this.rawId = id;
      this.type = type;
      this.cells = new Array();
   }
   function Cell( mother, id, value, sortType ){
      this.mother = mother;
      this.id = mother.id + '_' + id;
      this.rawId = id;
      this.value = ko.observable( value );
      this.sortType = sortType;
   }

   this.addColumn = function( id, field, label, datatype, width ){
      var column = new Column( id, field, label, datatype, width );
      this.columns.push( column );
      createColumn( column );
      return column;
   };
   this.addRow = function( id, type, cellsXML ){
      var row = new Row( this, id, type );
      $(cellsXML).each( function() {
         var cell = new Cell( row,
                              $(this).attr('id'),
                              $(this).html(),
                              $(this).attr('sorttype')
                              );
         row.cells.push( cell );
      });

      this.rows.push( row );
      createRow( row );

      return row;
   };

   this.clear = function(){
      createScaffold( this.id );
   };

   function createScaffold( id ){
      jQ.html( '<table id="' + id + '"><thead><tr></tr></thead><tbody></tbody></table>' );
   }
   function createColumn( column ){
      jQ.find('thead tr').append( '<td>' + column.label + '</td>' );
   }
   function createRow( row ){
      var html = '<tr id="' + row.id + '">';
      $.each( row.cells, function(){ html += '<td id="' + this.id + '"><span data-bind="text: ' + this.id + '.value"></span></td>'; } );
      html += '</tr>';
      jQ.find('tbody').append( html );
   }

}


/*
 *   Private Functions
 *
 */

function getFunctionFromDOMByName( name ){
	var fn = window[ name ];
	if( !fn ){ return function(){ console.log( 'Function: ' + name + ' has not been defined.' ); } }
	return fn;
}

function getAttrFnFromDOM( databindName, attributeName ){

   var fnName = '';
   $('[data-bind]').each( function() {
      if( $(this).attr('data-bind').indexOf( databindName ) != -1){ 
         fnName = $(this).attr( attributeName );
      }
   });

   return getFunctionFromDOMByName( fnName );
}


