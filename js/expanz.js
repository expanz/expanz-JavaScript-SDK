//
// SDK Functions
//

// WebService URL
// NOTE: this needs to be better abstracted (also, not currently applied because of cross domain request limitations on browser)
var wsURL = "https://test.expanz.com/ESADemoService/ESAService.asmx"

var soapHeader = '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:s="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><SOAP-ENV:Body>';

var soapFooter = '</SOAP-ENV:Body></SOAP-ENV:Envelope>';


function CreateRequest( type, username, password ){

	var body = "";

	if( type == 'CreateSession' ){

		body = '<tns:CreateSession xmlns:tns="http://tempuri.org/"><tns:inXml>&lt;ESA&gt; &lt;CreateSession user="demo" password="demo" appSite="ESADEMO" authenticationMode="Primary" clientVersion="Flex 1.0" schemaVersion="2.0"/&gt; &lt;/ESA&gt;</tns:inXml></tns:CreateSession>';

	}

	return soapHeader + body + soapFooter;

}



function SendRequest ( xmlrequest ){

	$.ajax({
		type: "post",
		url: "/ESADemoService", // /ESADemoService 
		data: xmlrequest,
		contentType: "text/xml",
		dataType: "xml",
		processData: false,	//keeps data: from being serialized
		success:
			function (message) {
				// do something with /message/
				$('#result').append( message );
			}
	});
}


