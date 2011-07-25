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

function endSession() {

	$.cookie( '_us', "" ); //, {  path: '/', expires: 1 } );
	return true;
}

var activityHandle = "";
function getActivityHandle(){

	return activityHandle;
}



/*
 *   Create Activity
 */


function CreateActivityRequest( name, style ){

	var body = 	'<tns:Exec xmlns:tns="http://tempuri.org/">' +
			'<tns:inXML>&lt;ESA sessionHandle="' + getSessionHandle() + '"&gt;' +
			'&lt;CreateActivity name="' + name + '" style="' + style + '"/&gt;' + //name = Samples.Calc
			'&lt;/ESA&gt;</tns:inXML>' +
			'<tns:sessionHandle>' + getSessionHandle() + '</tns:sessionHandle>' +
			'</tns:Exec>';

	return soapHeader + body + soapFooter;
}

function parseCreateActivityResponse( success, error ){
	return function apply( xml ){

		xml.replace("&lt;", "<");
		xml.replace("&gt;", ">");

		var execResults = $(xml).find("ExecResult").text();
		var results = "";

		if( execResults ){

			$( execResults ).find( 'Activity' ).each( function ()
			{
				activityHandle = $(this).attr('activityHandle');
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
				//ActivityFields.push( field );
				ActivityFields[ field.id() ] = field;
			});
		}

		return eval( success )( success, error );
	}
}



/*
 * Delta
 */

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

function parseUpdateResponse( fields, success, error ){
	return function apply ( xml ){

			xml.replace("&lt;", "<");
			xml.replace("&gt;", ">");

			var execResults = $(xml).find("ExecResult").text();
			var results = "";

			if( execResults ){

				$( execResults ).find( 'Field' ).each( function() 
				{ 
					fields[ $(this).attr('id') ].value( $(this).attr('value') );

				});
			}
			return true;	// this might need to be moved up into the .each (above)
	}
}



/*
 * Method
 */


function callMethod( error ){
	return function apply( event ){

		var name = $(event.currentTarget).attr('method-name');
		SendRequest( 	CreateMethodRequest( name ),
				error,
				parseUpdateResponse( ActivityFields, error )
				);

		return true;
	}
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



/*
 *     Send Request
 *		harness for HTTP requests to the server
 *
 */


function SendRequest ( xmlrequest, error, parser ){

	$.ajax({
		type: "post",
		url: wsURL, //"/ESADemoService",
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
	this.id = ko.observable(id);
	this.label = ko.observable(label);
	this.isnull = ko.observable(isnull);
	this.value = ko.observable( value );
	this.datatype = ko.observable(datatype);
	this.valid = ko.observable(valid);
}


var ActivityName = "";
var ActivityFields = {};	//ko.observableArray( [] );

function setupObservers( fields, success, error ){

	for( var id in fields ){

		if( fields[id] instanceof Field ){
			fields[id].value.subscribe( 
				function( fields, id, success, error ){
					return function( newValue ){
						SendRequest(	CreateDeltaRequest( id, newValue ),
								error,
								parseUpdateResponse( fields, success, error )
								);
					}
				} ( fields, fields[id].id(), success, error )
			);
		}
	}

}

function setupBindings( success, error ){
	return function apply(){

		ActivityFields.callMethod = callMethod( error );

		ko.applyBindings( ActivityFields );
		setupObservers( ActivityFields, success, error );
		return true;
	}
}


$(document).ready( function() {


	ActivityName = $('#Activity').attr('value');
	
	SendRequest(	CreateActivityRequest( ActivityName ),
			error,
			parseCreateActivityResponse(  setupBindings( success, error ), error )
			); 

	
});




