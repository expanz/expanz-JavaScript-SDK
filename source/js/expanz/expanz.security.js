////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function() {

    window.expanz = window.expanz || {};
    window.expanz.security = window.expanz.security || {};

    window.expanz.security.getLoginPage = function () {
        //var loginUrl = getPageUrl(window.config._loginpage);
        /* if login url is null try to guess it by removing the filename */
        //if (loginUrl === undefined) {
        //	loginUrl = document.location.href.substring(0, document.location.href.lastIndexOf("/"));
        /* if empty mean we are at the root of the website */
        //	if (loginUrl === "")
        //		loginUrl = "/";
        //}
        // window.expanz.logToConsole("getLoginURL : " + loginUrl);
        return window.config._loginpage ? window.config._loginpage : 'login';
    };

    window.expanz.security.createLogin = function (DOMObject, callbacks) {

        DOMObject || (DOMObject = $('body'));

        var login = createLogin(DOMObject, callbacks);
        return;
    };

    window.expanz.security.logout = function () {
        function redirect() {
            expanz.Storage.clearSession();
            expanz.views.redirect(expanz.security.getLoginPage());
        }
        expanz.net.ReleaseSessionRequest({
            success: redirect,
            error: redirect
        });
    };

    window.expanz.security.showLoginPopup = function () {
        var content = '';
        
        content = '<div class="loginMsg">Sorry, your session timed out, please log in again.</div>';

        content += '<form bind="login" type="popup" name="login" action="javascript:">';
        content += '  <div name="username" id="username">';
        content += '    <input class="loginInput"  attribute="value" type="text" placeholder="Username"/>';
        content += '  </div>';
        content += '  <div name="password" id="password">';
        content += '    <input class="loginInput" attribute="value" type="password" placeholder="Password"/>';
        content += '  </div>';
        content += '  <div name="login" id="login">';
        content += '    <button id="signinButton" type="submit" attribute="submit"></button>';
        content += '  </div>';
        content += '  <div bind="messageControl" class="error">';
        content += '  </div>';
        content += '</form>';

        var loginPopup = window.expanz.showManuallyClosedPopup(content, 'Login', 'ExpanzLoginPopup');

        /* set focus on username field */
        $("#username input").focus();

        createLogin(loginPopup.el.find('[bind=login]'));

        return;
    };

    function createLogin(dom, callbacks) {

        var loginView = null;
        
        if ($(dom).attr('bind') && ($(dom).attr('bind').toLowerCase() === 'login')) {
            loginView = expanz.Factory.createLoginView(dom);
        }

        return loginView;
    }
});