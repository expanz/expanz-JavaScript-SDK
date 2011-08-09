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

	return $.cookie( '_us' );
}

function setSessionHandle( sessionHandle ){

	//NOTE: will need to add {domain: '.test.expanz.com',} at some point. Now it makes cookies impossible to read.
	$.cookie( '_us', sessionHandle ); //, {  path: '/', expires: 1 } ); 
	return true;
}

function endSession() {

	$.cookie( '_us', "" ); //, {  path: '/', expires: 1 } );
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

		SendRequest(	CreateSessionRequest( fields['Username'].value, fields['Password'].value ),
				parseCreateSessionResponse( getSessionData( success, error ), error ),
				error
				);
		return false;
	}
}


function getSessionData( success, error ) {
	// apply: gets called when parseCreateSessionResponse has succeed (see 'login', where the SendRequest call is made)
	return function apply( str ){ 

		SendRequest(	CreateGetSessionDataRequest(),
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

		if( $(xml).find( 'CreateSessionResult' ).length > 0 ) {
			setSessionHandle( $(xml).find('CreateSessionResult').text() );
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

function SendRequest ( xmlrequest, responseHandler, error ){

	$.ajax({
		type: "post",
		url: wsURL, //"/ESADemoService",
		data: xmlrequest,
		contentType: "text/xml",
		dataType: "string", //"xml",
		processData: false,	//keeps data: from being serialized
		complete: function( request ){

			if( request.status != 200 ){

				eval( error )( 'There was a problem with the last request.' );

			} else {

				var response = request.responseText;
				
				if( responseHandler ){
					eval( responseHandler )( response );
				} 
			}
		}
	});
}



/*
 *   SOAP Message Contruction Functions
 *
 */

var soapHeader = 	'<SOAP-ENV:Envelope ' +
				'xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" ' +
				'xmlns:s="http://www.w3.org/2001/XMLSchema" ' +
				'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
			'>' +
			'<SOAP-ENV:Body>';

var soapFooter = 	'</SOAP-ENV:Body>' +
			'</SOAP-ENV:Envelope>';

function CreateSessionRequest( username, password ){

	var body = 	'<i0:CreateSession xmlns:i0="http://www.expanz.com/ESAService">' +
			'<i0:inXml>' +
				'&lt;ESA&gt; &lt;CreateSession user="' + username + '" ' +
				'password="' + password + '" ' +
				'appSite="SALESAPP" ' +
				'authenticationMode="Primary" ' +
				'clientVersion="Flex 1.0" ' +
				'schemaVersion="2.0"/&gt; &lt;/ESA&gt;' +
			'</i0:inXml></i0:CreateSession>';

	return soapHeader + body + soapFooter;
}

function CreateGetSessionDataRequest(){

	var body = 	'<i0:Exec xmlns:i0="http://www.expanz.com/ESAService">' +
			'<i0:inXML>&lt;ESA&gt;' +
			'&lt;GetSessionData/&gt;' +
			'&lt;/ESA&gt;</i0:inXML>' +
			'<i0:sessionHandle>' + getSessionHandle() + '</i0:sessionHandle>' +
			'</i0:Exec>';

	return soapHeader + body + soapFooter;
}



/*
 *   Private Variables
 *
 */

var wsURL = '/ESADemoService/ESAService.asmx';

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

