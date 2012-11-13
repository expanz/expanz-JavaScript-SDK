// TODO reduce name length because store in cookies as json string and take bandwiths (limitation on cookie size can be reached as well)
function ProcessArea(id, title) {
    this.id = id;
    this.title = title;
    this.activities = [];
    this.pa = []; /* sub process area */
}