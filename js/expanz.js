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

function Activity( name ) {
	this.name = name;
	this.handle = "";
}
var Activities = [];

function Field( id, label, disabled, nullvalue, value, datatype, valid ){
	this.id = id;
	this.label = label;
	this.disabled = ko.observable(disabled);
	this.nullvalue = nullvalue;
	this.value = ko.observable( value );
	this.datatype = datatype;
	this.valid = valid;
	this.error = ko.observable( "" );
}


// TODO: question? Can I do ko.applyBindings( fields ) multiple times? will that work?
var Bindings = {};




function getFunctionFromDOMByName( name ){
	var fn = window[ name ];
	if( !fn ){ return function(){ console.log( 'Function: ' + name + ' has not been defined.' ); } }
	return fn;
}

function networkError( e ){
	console.log( e );
}

/*
 *   Create Activity
 */

function LoadActivity( activity ){

	SendRequest(	CreateActivityRequest( activity ),
			parseCreateActivityResponse( activity, setupBindings( activity ) ),
			networkError
			); 
}


function CreateActivityRequest( activity, style ){

	var body = 	'<tns:Exec xmlns:tns="http://tempuri.org/">' +
			'<tns:inXML>&lt;ESA sessionHandle="' + getSessionHandle() + '"&gt;' +
			'&lt;CreateActivity name="' + activity.name + '" style="' + style + '"/&gt;' + //name = Samples.Calc
			'&lt;/ESA&gt;</tns:inXML>' +
			'<tns:sessionHandle>' + getSessionHandle() + '</tns:sessionHandle>' +
			'</tns:Exec>';

	return soapHeader + body + soapFooter;
}

function parseCreateActivityResponse( activity, callback ){
	return function apply( xml ){

		xml.replace("&lt;", "<");
		xml.replace("&gt;", ">");

		var execResults = $(xml).find("ExecResult").text();
		var fields = {};

		if( execResults ){

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

		return eval( callback )( fields );
	}
}



/*
 * Delta
 */

function CreateDeltaRequest( activity, id, value ){

	var body = '<tns:Exec xmlns:tns="http://tempuri.org/">' +
		'<tns:inXML>&lt;ESA sessionHandle="' + getSessionHandle() + '"&gt;' +
		'&lt;Activity activityHandle="' + activity.handle + '"&gt;' +
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
			var errorOccurred = false;

			if( execResults ){
				$( execResults ).find( 'Field' ).each( function() 
				{ 
					fields[ $(this).attr('id') ].value( $(this).attr('value') );
				});
				$( execResults ).find( 'Message' ).each( function ()	
				{
					if( $(this).attr('type') == 'Error' ){
						eval( error )( $(this).text() );
						errorOccurred = true;
					}
				});
			}

			if( !errorOccurred ){	eval( success )( execResults );	}
			return execResults;
	}
}



/*
 * Method
 */


function callMethod( activity, fields ){
	return function apply( event ){

		var name = $(event.currentTarget).attr('method-name');
		var successFn = getFunctionFromDOMByName( $(event.currentTarget).attr('onSuccess') );
		var errorFn = getFunctionFromDOMByName( $(event.currentTarget).attr('onError') );

		SendRequest( 	CreateMethodRequest( activity, name ),
				parseUpdateResponse( fields, successFn, errorFn ),
				errorFn
				);

		return true;
	}
}


function CreateMethodRequest( activity, methodName ){


	var body = '<tns:Exec xmlns:tns="http://tempuri.org/">' +
		'<tns:inXML>&lt;ESA sessionHandle="' + getSessionHandle() + '"&gt;' +
		'&lt;Activity activityHandle="' + activity.handle + '"&gt;' +
		'&lt;Method name="' + methodName + '"/&gt;' +
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


function SendRequest ( xmlrequest, parser, error ){

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
							//field.error = string;
						};

						if( field.disabled() != 1 ){
							SendRequest(	CreateDeltaRequest( activity, field.id, newValue ),
									parseUpdateResponse( allFields, success, error ),
									networkError
									);
						}
					}
				} ( fields[id], fields )
			);
		}
	}

}

function setupBindings( activity ){
	return function apply( fields ){

		for( attr in fields ){ Bindings[attr] = fields[attr]; }

		setupObservers( activity, Bindings );
		Bindings.Method = callMethod( activity, Bindings );
		ko.applyBindings( Bindings );
		return true;
	}
}


$(document).ready( function() {


	$('.Activity').each( function(){
		var newActivity = new Activity( $(this).attr('value') );
		LoadActivity( newActivity );
		Activities.push( newActivity );
	});
	
});


