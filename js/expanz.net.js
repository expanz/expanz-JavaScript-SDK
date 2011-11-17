

$(function(){
   
   window.expanz = window.expanz || {};

   window.expanz.Net = {

      // Request Objects -> to be passed to SendRequest
   
      CreateSessionRequest:
         function (username, password ) {
            this.data = getCreateSessionRequestBody(username, password);
            this.url = 'CreateSessionX';
         },

      GetSessionDataRequest:
         function (sessionHandle ) {
            this.data = getCreateGetSessionDataRequestBody(sessionHandle);
            this.url = 'ExecX';
         },
   };


   // XML Message Contruction Functions

   function getCreateSessionRequestBody(username, password ) {

      var body = '<CreateSessionX xmlns="http://www.expanz.com/ESAService">' +
                  '<xml>' +
                     '<ESA>' +
                        '<CreateSession user="' + username + '" password="' + password + '" appSite="SALES" authenticationMode="Primary" clientVersion="Flex 1.0" schemaVersion="2.0"/>' +
                     '</ESA>' +
                   '</xml>' +
               '</CreateSessionX>';

      return body;
   }

   function getCreateGetSessionDataRequestBody(sessionHandle ) {

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
});



