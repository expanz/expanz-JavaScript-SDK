function GridViewInfo(id) {
    this.id = id;
    this.columns = [];

    this.addColumn = function (field, width) {
        this.columns.push(new ColumnInfo(field, width));
    };

    function ColumnInfo(field, width) {
        this.field = field;
        this.width = width;
    }
}