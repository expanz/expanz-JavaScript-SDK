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


function CreateRequest( type, username, password ){

	var body = '';

	if( type == 'CreateSession' ){

		body = 	'<tns:CreateSession xmlns:tns="http://tempuri.org/">' +
			'<tns:inXml>' +
				'&lt;ESA&gt; &lt;CreateSession user="' + username + '" ' +
				'password="' + password + '" ' +
				'appSite="ESADEMO" ' +
				'authenticationMode="Primary" ' +
				'clientVersion="Flex 1.0" ' +
				'schemaVersion="2.0"/&gt; &lt;/ESA&gt;' +
			'</tns:inXml></tns:CreateSession>';

	}

	return soapHeader + body + soapFooter;

}

function CreateRequestSimple( type, username, password ){

	var body = '';

	if( type == 'CreateSession' ){

		body = 	'<ESA xmlns="http://ns.expanz.com/ep/2008">' +
			'<CreateSession ' +
				'user="' + username + '" ' +
				'password="' + password + '" ' +
				'appSite="ESA.BANKING" ' +
				'authDomain="Mattdone-PC" ' +
				'station="MATTDONE-PC" ' +
				'clientType="Win32" ' +
				'clientVersion="2.1" ' +
				'schemaVersion="2.0" ' +
				'authenticationMode="Primary" ' +
				'TimeZone=""/>' +
				'</ESA>';
	}

	return soapHeader + body + soapFooter;
}

function parseXML( xml ){

	$(xml).find( 'CreateSessionResponse' ).each( function ()
	{
		//$(this).each( $('#result').append( $(this).text ) );
		$('#result').append( '<div>' + $(this).find('CreateSessionResult').text() + '</div>' );
		$('#result').append( $(this).find('errorMessage').text() );

	});
}

function SendRequest ( xmlrequest, callback ){

	$.ajax({
		type: "post",
		url: "/ESADemoService", // /ESADemoService 
		data: xmlrequest,
		contentType: "text/xml",
		dataType: "xml",
		processData: false,	//keeps data: from being serialized
		success: parseXML
	});
}


