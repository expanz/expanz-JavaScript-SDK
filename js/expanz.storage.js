/* Author: Adam Tait

*/

$(function () {

   window.expanz = window.expanz || {};

   window.expanz.Storage = {

      // functions

      getSessionHandle: function () {
         return $.cookies.get('_expanz.session.handle');
      },

      setSessionHandle: function (sessionHandle) {
         $.cookies.set('_expanz.session.handle', sessionHandle);
         setLoginURL(document.location.pathname);
         return true;
      },

      getProcessAreaList: function () {
         return $.cookies.get('_expanz.processarea.list');
      },

      setProcessAreaList: function (list) {
         $.cookies.set('_expanz.processarea.list', JSON.stringify(list));
         return true;
      },

      getLoginURL: function () {
         return $.cookies.get('_expanz.login.url');
      },

      endSession: function () {
         $.cookies.del('_expanz.session.handle');
         return true;
      },

      // objects

      AppSiteMenu: function () {
         this.processAreas = [];

         this.load = function (el) {
            // clear the DOM menu
            el.html("");
            // load process areas into DOM menu
            _.each(this.processAreas, function (pA) {
               el.append('<div id="' + pA.id + '" class="processarea menuitem">' + '<a>' + pA.title + '</a>' + '</div>');
               pA.load(el.find('#' + pA.id + '.processarea.menuitem'));
            });
            // add html and click handler to DOM
            el.append('<div id="logout" class="processarea menuitem"><a>logout</a></div>');
            $(el.find('#logout')[0]).click(function(e){ expanz.Logout(); });
         }
      },

      ProcessAreaMenu: function (id, title) {
         this.id = id;
         this.title = title;
         this.activities = [];

         this.load = function (el) {
            el.append('<ul id="' + this.id + '"></ul>');
            _.each(this.activities, function (activity) {
               activity.load(el.find('ul'));
            });
         };
      },

      ActivityMenu: function (name, title, url) {
         this.name = name;
         this.title = title;
         this.url = url;

         this.load = function (el) {
            el.append('<li class="activity">' + '<a href=\'' + this.url + '\'>' + this.title + '</a>' + '</li>');
         };
      }

   };

   var setLoginURL = function (url) {
         $.cookies.set('_expanz.login.url', url);
         return true;
      };

});


