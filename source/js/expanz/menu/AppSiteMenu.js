$(function() {

    window.expanz = window.expanz || {};
    window.expanz.menu = window.expanz.menu || {};

    window.expanz.menu.AppSiteMenu = function() {
        this.processAreas = [];

        this.load = function(el, level, parentSubProcesses) {
            el.html("");
            if (el.attr('type') == 'icon') {
                if (level > 0) {
                    el.append('<div id="backOneLevel" class="icon"><img src="assets/images/home.png">Back</div>');
                    el.find("#backOneLevel").click(function() {
                        var menu = new expanz.Storage.AppSiteMenu();
                        menu.processAreas = parentSubProcesses;
                        menu.load(el.closest("[bind=menu]"), level - 1);
                    });
                }
                var that = this;
                _.each(this.processAreas, function(pA) {
                    pA.load(el, 0, true, that.processAreas);
                });
            } else {
                // clear the DOM menu

                var url = window.location.href;
                var currentPage = url.substring(url.lastIndexOf('/') + 1);
                if (window.config.homePage && currentPage.length == 0) {
                    currentPage = getPageUrl(window.config.homePage);
                }

                // load process areas into DOM menu
                el.append('<ul id="menuUL" class="menu"></ul>');

                var homeLabel = el.attr('homeLabel') || 'Home';
                var logoutLabel = el.attr('logoutLabel') || 'Logout';
                var backLabel = el.attr('backLabel') || 'Back';

                // add back button if defined
                if (window.config.backButton === true) {
                    el.find("#menuUL").before('<a href="javascript:void(0);" onclick="history.go(-1);return true;" class="backbutton">' + backLabel + '</a>');
                }

                // add home page if defined
                if (window.config.homePage) {
                    var homeClass = "";

                    url = getPageUrl($(this).attr('form'));
                    var urlHome = getPageUrl(window.config.homePage);
                    if (urlHome == currentPage) {
                        homeClass = "selected selectedNew ";
                    }
                    el.find("#menuUL").append('<li class="' + homeClass + ' processarea menuitem" id="home"><a href="' + urlHome + '" class="home menuTitle">' + homeLabel + '</a></li>');
                }

                _.each(this.processAreas, function(pA) {
                    var menuItemClass = "";
                    if (pA.title.indexOf("[CR]") != -1) {
                        menuItemClass = "small";
                    }
                    pA.title = pA.title.replace("[CR]", "<br />");
                    el.find("#menuUL").append('<li class="processarea menuitem ' + menuItemClass + '" id="' + pA.id + '"><a class="menuTitle" href="#">' + pA.title + '</a></li>');
                    pA.load(el.find('#' + pA.id + '.processarea.menuitem'), 0, false);
                });
                // add html and click handler to DOM
                el.append('<ul class="right logoutContainer"><li class="processarea" id="logout"><a class="logout menuTitle">' + logoutLabel + '</a></li></ul>');
                el.append('<div style="clear:both"></div>');

                $(el.find('#logout')[0]).click(function(e) {
                    expanz.security.logout();
                });
            }
        };
    };
});
