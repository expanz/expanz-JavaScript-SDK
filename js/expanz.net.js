

$(function(){
   
   window.expanz = window.expanz || {};

   window.expanz.Net = {

      // Request Objects -> to be passed to SendRequest
   
      CreateSessionRequest:
         function( username, password, responseHandler ){
            SendRequest( 
               CreateSessionRequestObject( username, password ),
               parseCreateSessionResponse( responseHandler )
            );
         },

      GetSessionDataRequest:
         function (sessionHandle ) {
            this.data = getCreateGetSessionDataRequestBody(sessionHandle);
            this.url = 'ExecX';
         },



   };


   // Request Objects  (used when passed to SendRequest( ... )

   var CreateSessionRequestObject = function (username, password ) {
      return {
         data: getCreateSessionRequestBody(username, password),
         url: 'CreateSessionX'
      };
   };

   // XML Message Contruction Functions

   var getCreateSessionRequestBody = function(username, password ) {

      var body = '<CreateSessionX xmlns="http://www.expanz.com/ESAService">' +
                  '<xml>' +
                     '<ESA>' +
                        '<CreateSession user="' + username + '" password="' + password + '" appSite="SALES" authenticationMode="Primary" clientVersion="Flex 1.0" schemaVersion="2.0"/>' +
                     '</ESA>' +
                   '</xml>' +
               '</CreateSessionX>';

      return body;
   };

   var getCreateGetSessionDataRequestBody = function( sessionHandle ) {

      var body = '<ExecX xmlns="http://www.expanz.com/ESAService">' +
                  '<xml>' +
                     '<ESA>' +
                        '<GetSessionData/>' +
                     '</ESA>' +
                  '</xml>' +
                  '<sessionHandle>' + sessionHandle + '</sessionHandle>' +
               '</ExecX>';

      return body;
   };

   // XML Message Response Parsers

  var parseCreateSessionResponse = function( callback ) {
	return function apply( xml ) {

		xml.replace('&lt;', '<');
		xml.replace('&gt;', '>');

		if ($(xml).find('CreateSessionXResult').length > 0) {
			expanz.Storage.setSessionHandle($(xml).find('CreateSessionXResult').text());
		}

		if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle.length > 0) {

			var errorString = '';

			$(xml).find('errorMessage').each(function()
			{
				errorString = $(this).text();
			});

			if (errorString.length > 0) {
				eval( callback )( errorString );
				return false;
			}
		}

		return eval( callback )();
	};
   };

   /*
   *    Send Request
   *        :manage the sending of XML requests to the server, and dispatching of response handlers
   */

         var SendRequest = function(request, responseHandler ) {
            $.ajax({
               type: 'POST',
               url: _URLproxy,
	       data: { url: _URLprefix + request.url, data: request.data },
	       dataType: 'string',
	       processData: true,
	       complete: function(HTTPrequest ) {
	          if (HTTPrequest.status != 200) {
                     eval( responseHandler )('There was a problem with the last request.');
                  } else {
	             var response = HTTPrequest.responseText;
	                if (responseHandler) {
                           var xml = response.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
		           eval(responseHandler)(xml);
		        }
	          }
	       }
            });
         };

   var _URLproxy = '../../expanz-Proxy/proxy.php';
   var _URLprefix = 'http://expanzdemo.cloudapp.net:8080/esaservice.svc/restish/';  //'http://test.expanz.com/ESADemoService/ESAService.svc/restish/';
   var _URLprefixSSL = 'https://test.expanz.com/ESADemoService/ESAService.svc/restishssl/';

});



