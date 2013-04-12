$(function() {

    window.expanz = window.expanz || {};
    window.expanz.menu = window.expanz.menu || {};

    window.expanz.menu.AppSiteMenu = function() {
        this.render = function ($el, processAreas, level, parentSubProcesses) {
            $el.html(""); // Clear the contents of the menu host element
            
            if ($el.attr('type') == 'icon') {
                if (level > 0) {
                    $el.append('<div id="backOneLevel" class="icon"><img src="assets/images/home.png">Back</div>');
                    
                    $el.find("#backOneLevel").click(function() {
                        var menu = new expanz.Storage.AppSiteMenu();
                        menu.render($el.closest("[bind=menu]"), parentSubProcesses, level - 1);
                    });
                }
                
                _.each(processAreas, function(processArea) {
                    processArea.render($el, 0, true, processAreas);
                });
            } else {
                var url = window.location.href;
                var currentPage = url.substring(url.lastIndexOf('/') + 1);
                
                if (window.config.homePage && currentPage.length == 0) {
                    currentPage = getPageUrl(window.config.homePage);
                }

                // load process areas into DOM menu
                $el.append('<ul id="menuUL" class="menu"></ul>');

                var homeLabel = $el.attr('homeLabel') || 'Home';
                var logoutLabel = $el.attr('logoutLabel') || 'Logout';
                var backLabel = $el.attr('backLabel') || 'Back';

                // add back button if defined
                if (window.config.backButton === true) {
                    $el.find("#menuUL").before('<a href="javascript:void(0);" onclick="history.go(-1);return true;" class="backbutton">' + backLabel + '</a>');
                }

                // add home page if defined
                if (window.config.homePage) {
                    var homeClass = "";

                    url = getPageUrl($(this).attr('form'));
                    var urlHome = getPageUrl(window.config.homePage);
                    
                    if (urlHome == currentPage) {
                        homeClass = "selected selectedNew ";
                    }
                    
                    $el.find("#menuUL").append('<li class="' + homeClass + ' processarea menuitem" id="home"><a href="' + urlHome + '" class="home menuTitle">' + homeLabel + '</a></li>');
                }

                _.each(processAreas, function(processArea) {
                    var menuItemClass = "";
                    
                    if (processArea.title.indexOf("[CR]") != -1) {
                        menuItemClass = "small";
                    }
                    
                    processArea.title = processArea.title.replace("[CR]", "<br />");
                    
                    $el.find("#menuUL").append('<li class="processarea menuitem ' + menuItemClass + '" id="' + processArea.id + '"><a class="menuTitle" href="#">' + processArea.title + '</a></li>');

                    processArea.render($el.find('#' + processArea.id + '.processarea.menuitem'), 0, false);
                });
                
                // Add html and click handler to DOM
                $el.append('<ul class="right logoutContainer"><li class="processarea" id="logout"><a class="logout menuTitle">' + logoutLabel + '</a></li></ul>');
                $el.append('<div style="clear:both"></div>');

                $($el.find('#logout')[0]).click(function(e) {
                    expanz.security.logout();
                });
            }
        };
    };
});
