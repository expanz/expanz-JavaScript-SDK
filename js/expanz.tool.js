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

	$.cookies.set( '_expanz.session.handle', sessionHandle );
   setLoginURL( document.location.pathname );
	return true;
}

function setLoginURL( url ){

   $.cookies.set( '_expanz.login.url', url ); 
	return true;
}

function setProcessAreaList( list ){

   $.cookies.set( '_expanz.processarea.list', JSON.stringify(list) );
   return true;
}

function endSession() {

	$.cookies.del( '_expanz.session.handle' ) 
	return true;
}



/*
 *   On Ready (once the page loads, do: )
 *          :setup the bindings (using Knockout.js) that connection Username/Password/Login to the DOM elements
 */

var Bindings = {}

$(document).ready( function() {
	
	Bindings = {
                Endpoint: new Field( 'Endpoint', 'Endpoint', '0', '0', '', 'string', '1' ),
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

		SendRequest(	new CreateSessionRequest( fields['Username'].value, fields['Password'].value, fields['Endpoint'].value ),
         				parseCreateSessionResponse( getSessionData( success, error ), error ),
			         	error
         				);
		return false;
	}
}


function getSessionData( success, error ) {
	// apply: gets called when parseCreateSessionResponse has succeed (see 'login', where the SendRequest call is made)
	return function apply( str ){ 

		SendRequest(	new GetSessionDataRequest( getSessionHandle(), Bindings.Endpoint.value ),
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

         $('#container').html("");

         $(xml).find('processarea').each( function(){
            var processareaId = $(this).attr('id');

            $( '#container' ).append( '<div class=\'processarea\' id=\'' + processareaId + '\'>' );

            var id_counter = 0;
            $(this).find('activity').each( function() {
               $( '#' + processareaId + '.processarea' ).append(  '<div class=\'activity\' id=\'' + id_counter + '\'>' + 
                                          '<span class=\'title\'>' + 'Title: ' + $(this).attr('title') + '</span>' +
                                          '<span class=\'name\'>' + 'Name: ' + $(this).attr('name') + '</span>' +
                                          '<span class=\'style\'>' + 'Style: ' + $(this).attr('style') + '</span>' +
                                          '</div>' );

               SendRequest(	new CreateActivityRequest(  new ActivityInfo(
                                                                        $(this).attr('name'),
                                                                        $(this).attr('title'),
                                                                        'none'
                                                                        ),
                                                            '',
                                                            Bindings.Endpoint.value
                                                            ),
			         parseCreateActivityResponse( $( '#' + id_counter++ + '.activity' ) )
         			); 
               
            });

            $( '#container' ).append( '</div>' );
         });

         
	};
}

function parseCreateActivityResponse( jqObj ){
	return function apply( xml ){

            var execResults = $(xml).find("ExecXResult");
	    var fields = {};

	    if( execResults ){

               $(execResults).find( 'Message' ).each( function ()
               {
                  if( $(this).attr('type') == 'Error' ){
                     // print error here
                  }
               });

	       $( execResults ).find( 'Field' ).each( function() 
	       { 
                  jqObj.append(  '<div class=\'field\' id=\'' + $(this).attr('id') + '\'>' + 
                                 '<span class=\'rowtext\' id=\'id\'>' + 'Identifier: ' + $(this).attr('id') + '</span>' +
                                 '<span class=\'rowtext\' id=\'label\'>' + 'Label: ' + $(this).attr('label') + '</span>' +
                                 '<span class=\'rowtext\' id=\'disabled\'>' + 'Disabled?: ' + $(this).attr('disabled') + '</span>' +
                                 '<span class=\'rowtext\' id=\'null\'>' + 'Null value: ' + $(this).attr('null') + '</span>' +
                                 '<span class=\'rowtext\' id=\'value\'>' + 'Value: ' + $(this).attr('value') + '</span>' +
                                 '<span class=\'rowtext\' id=\'valid\'>' + 'Valid: ' + $(this).attr('valid') + '</span>' +
                                 '<span class=\'rowtext\' id=\'datatype\'>' + 'Datatype: ' + $(this).attr('datatype') + '</span>' +
                                 '</div>'
                                 );
	       });
	    }
            else{
               // error here
            }
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
		data: request, 
		dataType: "string",
		processData: true,
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

function CreateSessionRequest( username, password, url ){
   this.data = getCreateSessionRequestBody( username, password );
   this.url = url + 'CreateSessionX';
}

function GetSessionDataRequest( sessionHandle, url ){
   this.data = getCreateGetSessionDataRequestBody( sessionHandle );
   this.url = url + 'ExecX';
}

function CreateActivityRequest( activity, style, url ){
   this.data = getCreateActivityRequestBody( activity, style );
   this.url = url + 'ExecX';
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


/*
 *   Private Variables
 *
 */

var _URLprefix = '/ESADemoService/ESAService.svc/restish/';
var _URLprefixSSL = '/ESADemoService/ESAService.svc/restishssl/';
var _URLproxy = '../proxy/proxy.php';

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

function ProcessArea( id, title ){
   this.id = id;
   this.title = title;
   this.activities = [];
   this.print = function() {
      var result = '<span class=\'title\'>' + this.title + '</span>';
      for( i in this.activities ) result += this.activities[i].print();
      return result;
   }
}

function ActivityInfo( name, title, url ){
   this.name = name;
   this.title = title;
   this.url = url;
   this.print = function() {
      return '<span class=\'title small\'>' + this.title + '</span>' + 
               '<span class=\'text\'>' + this.url + '</span>';
   }
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

