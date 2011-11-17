

$(function(){
   
   window.expanz = window.expanz || {};

   window.expanz.Storage = {

      getSessionHandle:
         function() {
            return $.cookies.get('_expanz.session.handle');
         },

      setSessionHandle:
         function(sessionHandle ) {
            $.cookies.set('_expanz.session.handle', sessionHandle);
            setLoginURL(document.location.pathname);
	    return true;
         },

      setProcessAreaList:
         function(list ) {
            $.cookies.set('_expanz.processarea.list', JSON.stringify(list));
            return true;
      },

      endSession:
         function() {
            $.cookies.del('_expanz.session.handle');
	    return true;
         } 

   }; 

   var setLoginURL = function(url ) {
      $.cookies.set('_expanz.login.url', url);
      return true;
   };

});



