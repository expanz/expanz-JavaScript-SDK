//
// SDK Functions
//

// WebService URL
// NOTE: this needs to be better abstracted (also, not currently applied because of cross domain request limitations on browser)

var wsURL = 'https://test.expanz.com/ESADemoService/ESAService.asmx';

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

var activityHandle = "";

function getActivityHandle(){

	return activityHandle;
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

function CreateActivityRequest( name, style ){

	var body = 	'<tns:Exec xmlns:tns="http://tempuri.org/">' +
			'<tns:inXML>&lt;ESA sessionHandle="' + getSessionHandle() + '"&gt;' +
			'&lt;CreateActivity name="' + name + '" style="' + style + '"/&gt;' + //name = Samples.Calc
			'&lt;/ESA&gt;</tns:inXML>' +
			'<tns:sessionHandle>' + getSessionHandle() + '</tns:sessionHandle>' +
			'</tns:Exec>';

	return soapHeader + body + soapFooter;
}


function CreateDeltaRequest( id, value ){

	var body = '<tns:Exec xmlns:tns="http://tempuri.org/">' +
		'<tns:inXML>&lt;ESA sessionHandle="' + getSessionHandle() + '"&gt;' +
		'&lt;Activity activityHandle="' + activityHandle + '"&gt;' +
		'&lt;Delta id="' + id + '" value="' + value + '"/&gt;' +
		'&lt;/Activity&gt;' +
		'&lt;/ESA&gt;</tns:inXML>' +
		'<tns:sessionHandle>' + getSessionHandle() + '</tns:sessionHandle>' +
		'</tns:Exec>';

	return soapHeader + body + soapFooter;

}

function CreateMethodRequest( name ){


	var body = '<tns:Exec xmlns:tns="http://tempuri.org/">' +
		'<tns:inXML>&lt;ESA sessionHandle="' + getSessionHandle() + '"&gt;' +
		'&lt;Activity activityHandle="' + activityHandle + '"&gt;' +
		'&lt;Method name="' + name + '"/&gt;' +
		'&lt;/Activity&gt;' +
		'&lt;/ESA&gt;</tns:inXML>' +
		'<tns:sessionHandle>' + getSessionHandle() + '</tns:sessionHandle>' +
		'</tns:Exec>';

	return soapHeader + body + soapFooter;

}

function parseXML( xml ){

	xml.replace("&lt;", "<");
	xml.replace("&gt;", ">");

	if( $(xml).find( 'CreateSessionResult' ) ) {
		setSessionHandle( new String( $(xml).find('CreateSessionResult').text() ) );
	}

	if( !getSessionHandle() || getSessionHandle.length > 0 ){

		var result = "";
		var errorString = $(xml).find( 'errorMessage' ).each( function ()
		{
			result = $(this).text();
		});
		return result;
	}

	var execResults = $(xml).find("ExecResult").text();
	var results = "";

	if( execResults ){

		$( execResults ).find( 'Activity' ).each( function ()
		{
			activityHandle = $(this).attr('activityHandle');
		});

		$( execResults ).find( 'Field' ).each( function() 
		{ 
			if( $(this).attr('id') == "Result" ){ 
				results = $(this).attr('value');
			} 
		});
	}
	
	return results;
}


function SendRequest ( xmlrequest, callback, error ){

	$.ajax({
		type: "post",
		url: "/ESADemoService", // /ESADemoService 
		data: xmlrequest,
		contentType: "text/xml",
		dataType: "string", //"xml",
		processData: false,	//keeps data: from being serialized
		//success: parseXML
		complete: function( request ){

			if( request.status != 200 ){

				alert( 'There was a problem with the last request.' );

			} else {

				var response = request.response;
				var result = parseXML( response );

				if( callback ){
					eval( callback )( result );
				}
			}
		}
	});
}


