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

function setSessionHandle( sessionHandle ){

	$.cookies.set( '_expanz.session.handle', sessionHandle ); //, { domain: document.domain } );
	return true;
}

function endSession() {

	$.cookies.del( '_expanz.session.handle' ) //, { domain: document.domain } );
	return true;
}



/*
 *   On Ready (once the page loads, do: )
 *          :setup the bindings (using Knockout.js) that connection Username/Password/Login to the DOM elements
 */

$(document).ready( function() {
	
	var Bindings = {
		Username: new Field( 'Username', 'Username', '0', '0', '', 'string', '1' ),
		Password: new Field( 'Password', 'Password', '0', '0', '', 'string', '1' ),
	};
	Bindings.Login = login( Bindings );

	ko.applyBindings( Bindings );

});



/*
 *   Actions
 *         :top-level functions issued by user input or server request
 */

function login( fields ){
	// apply: gets called when 'Login' is invoked (you click 'Login')
	return function apply( event ){

		var success = 	getFunctionFromDOMByName( $(event.currentTarget).attr('onSuccess') );
		var error = 	getFunctionFromDOMByName( $(event.currentTarget).attr('onError') );

		SendRequest(	new CreateSessionRequest( fields['Username'].value, fields['Password'].value ),
         				parseCreateSessionResponse( getSessionData( success, error ), error ),
			         	error
         				);
		return false;
	}
}


function getSessionData( success, error ) {
	// apply: gets called when parseCreateSessionResponse has succeed (see 'login', where the SendRequest call is made)
	return function apply( str ){ 

		SendRequest(	new GetSessionDataRequest( getSessionHandle() ),
      				   parseGetSessionDataResponse( success, error ),
         				error
         				);
	};
}



/*
 *    Response Parsers
 *         :used to parse XML results from server requests. Use these functions for the 'responseHandler' argument to 'SendRequest'
 */

function parseCreateSessionResponse( success, error ) {
	return function apply ( xml ) {

		xml.replace("&lt;", "<");
		xml.replace("&gt;", ">");

		if( $(xml).find( 'CreateSessionXResult' ).length > 0 ) {
			setSessionHandle( $(xml).find('CreateSessionXResult').text() );
		}

		if( !getSessionHandle() || getSessionHandle.length > 0 ){

			var errorString = '';

			$(xml).find( 'errorMessage' ).each( function ()
			{
				errorString = $(this).text();
			});

			if( errorString.length > 0 ){
				eval( error )( errorString );
				return false;
			}
		}

		return eval( success )();
	};
}

function parseGetSessionDataResponse( success, error ){
	return function apply ( xml ) {
			eval( success )( xml );
	};
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

function CreateSessionRequest( username, password ){
   this.data = getCreateSessionRequestBody( username, password );
   this.url = 'CreateSessionX';
}

function GetSessionDataRequest( sessionHandle ){
   this.data = getCreateGetSessionDataRequestBody( sessionHandle );
   this.url = 'ExecX';
}


/*
 *   SOAP Message Contruction Functions
 *
 */

function getCreateSessionRequestBody( username, password ){

   var body = '<CreateSessionX xmlns="http://www.expanz.com/ESAService">' +
                  '<xml>' +
                     '<ESA>' +
                        '<CreateSession user="' + username + '" password="' + password + '" appSite="SALESAPP" authenticationMode="Primary" clientVersion="Flex 1.0" schemaVersion="2.0"/>' +
                     '</ESA>' +
                   '</xml>' +
               '</CreateSessionX>';

	return body;
}

function getCreateGetSessionDataRequestBody( sessionHandle ){

   var body = '<ExecX xmlns="http://www.expanz.com/ESAService">' +
                  '<xml>' +
                     '<ESA>' +
                        '<GetSessionData/>' +
                     '</ESA>' +
                  '</xml>' +
                  '<sessionHandle>' + sessionHandle + '</sessionHandle>' +
               '</ExecX>';

	return body;
}

/*
 *   Private Variables
 *
 */

var _URLprefix = '/ESADemoService/ESAService.svc/restish/';

/*
 *   Private Object Prototypes
 *
 */

function Field( id, label, disabled, isnull, value, datatype, valid ){
	this.id = id;
	this.label = label;
	this.isnull = isnull;
	this.value = value;
	this.datatype = datatype;
	this.valid = valid;
}



/*
 *   Private Helper Functions
 *
 */


function getFunctionFromDOMByName( name ){
	var fn = window[ name ];
	if( !fn ){ return function(){ console.log( 'Function: ' + name + ' has not been defined.' ); } }
	return fn;
}

