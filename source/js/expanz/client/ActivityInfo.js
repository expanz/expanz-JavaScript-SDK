function ActivityInfo(name, title, url, style, image) {
    this.name = name;
    this.title = title;
    this.url = url;
    this.style = style || "";
    /* if the image if not defined we look for the activity name + style .png instead */
    if (image !== undefined) {
        this.img = image;
    }
    else {
        this.img = "assets/images/" + name + style + ".png";
    }
    this.gridviews = [];
}