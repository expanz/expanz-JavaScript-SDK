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

/*
 *   Session Functions
 *         These functions create, query, maintain, destroy user sessions
 */


function getSessionHandle() {
	return $.cookies.get( '_expanz.session.handle' );
}

function deleteSessionHandle() {

   $.cookies.set( '_expanz.session.handle' ) //, sessionHandle, { domain: document.domain } );
   return true;
}

function networkError( e ){
	console.log( e );
}


function onLogout( event ){

   var successFn = getAttrFnFromDOM( 'Logout', 'onSuccess' );
   var errorFn = getAttrFnFromDOM( 'Logout', 'onError' );

   SendRequest(   new CreateReleaseSessionRequest(),
                  parseReleaseSessionResponse( successFn, errorFn ),
                  networkError
                  );
}



/*
 *   On Ready (once the page loads, do: )
 *          :check the SessionHandle, then load all the Activities in the DOM
 */

$(document).ready( function() {

	if( !getSessionHandle() ){
		onLogout();
	}

	window.onbeforeunload = function () {
		onLogout();
	};

	$('.Activity').each( function(){
		LoadActivity( new Activity( $(this).attr('value') ) );
	});
	
});




function LoadActivity( activity ){

	SendRequest(	new CreateActivityRequest( activity ),
			         parseCreateActivityResponse( activity, setupBindings( activity ) ),
         			networkError
         			); 
}


/*
 *   Setup Bindings
 *        :use Knockout.js (ko) to connect local objects with DOM elements
 */

function setupBindings( activity ){
	return function apply( fields ){

		for( attr in fields ){ Bindings[attr] = fields[attr]; }

		setupObservers( activity, Bindings );

		Bindings.Method = callMethod( activity, Bindings );
      Bindings.Logout = onLogout;

		ko.applyBindings( Bindings );
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
							SendRequest(	new CreateDeltaRequest( activity, field.id, newValue ),
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



/*
 *    Response Parsers
 *         :used to parse XML results from server requests. Use these functions for the 'responseHandler' argument to 'SendRequest'
 */

function parseCreateActivityResponse( activity, callback ){
	return function apply( xml ){

		var execResults = $(xml).find("ExecXResult");
		var fields = {};

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
				var field = new Field(	$(this).attr('id'),
							               $(this).attr('label'),
               							$(this).attr('disabled'),
					               		$(this).attr('null'),
               							$(this).attr('value'),
               							$(this).attr('datatype'),
					               		$(this).attr('valid')
            							);  
				fields[ field.id ] = field;
			});
		}
      else{
         networkError( execResults );
      }

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
               if(  fields[ $(this).attr('id') ].value() != $(this).attr('value') ){
                  fields[ $(this).attr('id') ].serverUpdated = true;
	   				fields[ $(this).attr('id') ].value( $(this).attr('value') );
               }
				});
				$( execResults ).find( 'Message' ).each( function()	
				{
					if( $(this).attr('type') == 'Error' || $(this).attr('type') == 'Warning'  ){
						eval( error )( $(this).text() );
						errorOccurred = true;
					}
				});
			}

			if( !errorOccurred ){	eval( success )( execResults );	}
			return execResults;
	}
}

function parseReleaseSessionResponse( success, error ){
   return function apply( xml ){

      if( $(xml).find("ReleaseSessionResult").text() == 'true' ){
         if( deleteSessionHandle() ){
            return eval( success )();
         }
      }

      networkError( $(xml).find('errors').text() );
      return eval( error )();
   }
}   




/*
 *    Send Request
 *        :manage the sending of XML requests to the server, and dispatching of response handlers
 */

function SendRequest ( request, responseHandler, error ){

	$.ajax({
		type: "post",
		url: 'http://' + document.domain + _URLprefix + request.url,
		data: request.data,
		contentType: "text/xml",
		dataType: "string", //"xml",
		processData: false,	//keeps data: from being serialized
		complete: function( HTTPrequest ){

			if( HTTPrequest.status != 200 ){

				eval( error )( 'There was a problem with the last request.' );

			} else {

				var response = HTTPrequest.responseText;
				
				if( responseHandler ){
					eval( responseHandler )( response );
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
function CreateReleaseSessionRequest(){
   this.data = getCreateReleaseSessionRequestBody();
   this.url = 'ReleaseSession';
}


/*
 *   XML Message Contruction Functions
 *
 */

function getCreateActivityRequestBody( activity, style ){

   var body = '<ExecX xmlns="http://www.expanz.com/ESAService">' +
                  '<xml>' +
                     '<ESA>' +
                        '<CreateActivity name="' + activity.name + '" style="' + style + '"/>' +
                     '</ESA>' +
                  '</xml>' +
                  '<sessionHandle>' + getSessionHandle() + '</sessionHandle>' +
               '</ExecX>';

	return body;
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

var _URLprefix = '/ESADemoService/ESAService.svc/post/';
var Bindings = {};


/*
 *   Private Object Prototypes
 *
 */


function Activity( name ) {
	this.name = name;
	this.handle = "";
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


