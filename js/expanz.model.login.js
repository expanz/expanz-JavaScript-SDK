/* Author: Adam Tait

*/
$(function () {

   window.expanz = window.expanz || {};
   window.expanz.Model.Login = _.extend(expanz.Model, {

      Activity: expanz.Model.Activity.extend({
      	
         validate: function () {
            if (!this.get('username').get('error') && !this.get('password').get('error')) {
               return true;
            } else {
               return false;
            }
         },

         login: function () {
            if (this.validate()) {
               expanz.Net.CreateSessionRequest(this.get('username').get('value'), this.get('password').get('value'), {
                  success: loginCallback,
                  error: expanz._error
               });
            };
         }
      })
   });


   var loginCallback = function (error) {
         if (error && error.length > 0) {
            this.get('error').set({
               value: error
            });
         } else {
            expanz.Net.GetSessionDataRequest({
               success: getSessionCallback
            });
         }
      };
   var getSessionCallback = function (url) {
         // redirect to default activity
         expanz.Views.redirect(url);
      };

});

