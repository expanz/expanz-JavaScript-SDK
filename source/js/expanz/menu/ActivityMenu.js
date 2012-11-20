$(function() {

    window.expanz = window.expanz || {};
    window.expanz.menu = window.expanz.menu || {};

    window.expanz.menu.ActivityMenu = function(name, style, title, url, img) {
        this.name = name;
        this.style = style;
        this.title = title;
        this.url = url;
        this.img = img;

        this.load = function(el, displayAsIcons) {
            this.title = this.title.replace("[CR]", "<br />");
            if (displayAsIcons === true) {
                el.append('<li><div class="icon navContainer"><a class="nav-' + this.name.replace(/\./g, "-") + "-" + this.style.replace(/\./g, "-") + ' navItem" href="' + this.url + '"></a><a class="navText" href="' + this.url + '">' + this.title + '</a></div></li>');
            } else {
                el.append('<li class="activity">' + '<a href=\'' + this.url + '\'>' + this.title + '</a>' + '</li>');
            }
        };
    };
});
