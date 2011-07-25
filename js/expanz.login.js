//
// SDK Functions
//

// WebService URL
// NOTE: this needs to be better abstracted (also, not currently applied because of cross domain request limitations on browser)

var wsURL = '/ESADemoService/ESAService.asmx';

var soapHeader = 	'<SOAP-ENV:Envelope ' +
				'xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" ' +
				'xmlns:s="http://www.w3.org/2001/XMLSchema" ' +
				'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
			'>' +
			'<SOAP-ENV:Body>';

var soapFooter = 	'</SOAP-ENV:Body>' +
			'</SOAP-ENV:Envelope>';


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


function CreateSessionRequest( username, password ){

	var body = 	'<tns:CreateSession xmlns:tns="http://tempuri.org/">' +
			'<tns:inXml>' +
				'&lt;ESA&gt; &lt;CreateSession user="' + username + '" ' +
				'password="' + password + '" ' +
				'appSite="ESADEMO" ' +
				'authenticationMode="Primary" ' +
				'clientVersion="Flex 1.0" ' +
				'schemaVersion="2.0"/&gt; &lt;/ESA&gt;' +
			'</tns:inXml></tns:CreateSession>';

	return soapHeader + body + soapFooter;
}

function CreateGetSessionDataRequest(){

	var body = 	'<tns:Exec xmlns:tns="http://tempuri.org/">' +
			'<tns:inXML>&lt;ESA&gt;' +
			'&lt;GetSessionData/&gt;' +
			'&lt;/ESA&gt;</tns:inXML>' +
			'<tns:sessionHandle>' + getSessionHandle() + '</tns:sessionHandle>' +
			'</tns:Exec>';

	return soapHeader + body + soapFooter;
}

function parseCreateSessionResponse( success, error ) {
	return function apply ( xml ) {

		xml.replace("&lt;", "<");
		xml.replace("&gt;", ">");

		if( $(xml).find( 'CreateSessionResult' ).length > 0 ) {
			setSessionHandle( $(xml).find('CreateSessionResult').text() );
		}

		if( !getSessionHandle() || getSessionHandle.length > 0 ){

			var error = '';
			var errorString = $(xml).find( 'errorMessage' ).each( function ()
			{
				error = $(this).text();
			});
			if( error.length > 0 ){
				eval( error )( $(this).text() );
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


function SendRequest ( xmlrequest, error, parser ){

	$.ajax({
		type: "post",
		url: wsURL,  // "/ESADemoService", 
		data: xmlrequest,
		contentType: "text/xml",
		dataType: "string", //"xml",
		processData: false,	//keeps data: from being serialized
		complete: function( request ){

			if( request.status != 200 ){

				error( 'There was a problem with the last request.' );

			} else {

				var response = request.responseText;
				
				if( parser ){
					eval( parser )( response );
				} 
			}
		}
	});
}





/*
/*   Automatic binding to View objects
/*
/*
/*/


function Field( id, label, disabled, isnull, value, datatype, valid ){
	this.id = id;
	this.label = label;
	this.isnull = isnull;
	this.value = value;
	this.datatype = datatype;
	this.valid = valid;
}

var viewModel = {
	Username: new Field( 'Username', 'Username', '0', '0', '', 'string', '1' ),
	Password: new Field( 'Password', 'Password', '0', '0', '', 'string', '1' )
};

function getSessionData( success, error ) {
	return function apply( str ){ 

		if( !str ){
			SendRequest(	CreateGetSessionDataRequest(),
					error,
					parseGetSessionDataResponse( success, error )
					);
		} else {
			eval( error )( str );
		}
	};
}


$(document).ready( function() {

	ko.applyBindings(viewModel);

	$('#submit').click( function () {
			var request = CreateSessionRequest( 	viewModel.Username.value,
								viewModel.Password.value
								);
			SendRequest(	request,
					error,
					parseCreateSessionResponse( getSessionData( success, error ), error ) 
					);

			return false;
		});

});




