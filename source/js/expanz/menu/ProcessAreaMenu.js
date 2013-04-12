$(function() {

    window.expanz = window.expanz || {};
    window.expanz.menu = window.expanz.menu || {};

    window.expanz.menu.ProcessAreaMenu = function(id, title) {
        this.id = id;
        this.title = title;
        this.activities = [];
        this.processArea = []; /* sub process area */

        this.render = function (el, level, displayAsIcons, parentSubProcesses) {
            var url = window.location.href;
            var currentPage = url.substring(url.lastIndexOf('/') + 1);

            if (displayAsIcons === true) {
                _.each(this.activities, function(activity) {
                    activity.render(el, true);
                });

                if (this.processArea && this.processArea.length > 0) {
                    var i = 0;
                    var j = new Date().getTime();
                    
                    _.each(this.processArea, function (subprocess) {
                        var subId = 'subprocess' + j + "_" + i++;
                        el.append('<div id="' + subId + '" class="icon"><img src="' + subprocess.img + '"/><br/> ' + subprocess.title + '</div>');

                        el.find("#" + subId).click(function() {
                            var menu = new expanz.Storage.AppSiteMenu();
                            menu.render(el.closest("[bind=menu]"), subprocess, level + 1, parentSubProcesses);
                        });
                    });
                }
            } else {
                var ulId = this.id + '_' + level;
                
                if (this.activities.length > 0) {
                    /* replace the link of the parent if only one activity in the menu */
                    if (this.activities.length == 1) {
                        url = this.activities[0].url;
                        el.find("[class='menuTitle']").attr('href', url);
                        
                        /* workaround for kendo issue : bind touchend */
                        el.find("[class='menuTitle']").bind("touchend", function(e) {
                            window.location.href = url;
                        });

                        /* add selected class if current */
                        if (url == currentPage) {
                            el.addClass("selected selectedNew");
                        }
                    } else {
                        el.append('<ul style="display:none" id="' + ulId + '"></ul>');
                        
                        el.click(function() {
                            // el.find("#" + ulId).toggle();
                        });
                        
                        _.each(this.activities, function(activity) {
                            activity.render(el.find("#" + ulId), false);
                        });
                    }
                }

                if (this.processArea && this.processArea.length > 0) {
                    if (el.find("#" + ulId).length === 0) {
                        el.append('<ul style="display:none" id="' + ulId + '"></ul>');
                    }
                    
                    var i = 0;
                    
                    _.each(this.processArea, function (subprocess) {
                        var liID = ulId + '_li_' + i++;
                        
                        if (subprocess.id === undefined)
                            subprocess.id = liID;
                        
                        el.find("#" + ulId).append('<li class="processarea menuitem" id="' + liID + '"><a class="menuTitle" href="#">' + subprocess.title + '</a></li>');

                        subprocess.render(el.find('#' + liID + '.processarea.menuitem'), level + 1);
                    });
                }
            }
        };
    };
});
