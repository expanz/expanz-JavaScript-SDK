//
// SDK Functions
//


function MakeRequest ( xmlrequest ){

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


