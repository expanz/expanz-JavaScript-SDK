$(function () {
    $("body").find("[renderingType=breadcrumb]").each(function () {
        var breadcrumbAdapter = new BreadcrumbAdapter(this);
    });

    function BreadcrumbAdapter(inputElement) {
        var $inputElement = $(inputElement);

        var onRender = function (event, dataPublicationModel, view, args) {
            view.$el.html("");
            
            dataPublicationModel.rows.each(function (row, index) {
                if (index > 0)
                    view.$el.append("&nbsp;&gt;&nbsp;");

                view.$el.append("<a href='#" + row.get("id") + "' id='" + row.get("id") + "' type='" + row.get("type") + "'>" + row.cells.first().get("value") + "</a>");
            });
            
            /* handle drilldown hyperlink click event */
            var onDrillDownClick = function (event) {
                var $anchor = $(this);
                view.model.drillDown($anchor.attr('id'), $anchor.attr('type'), null);
                
                view.$el.trigger("datapublication:rowDrillDown", [
				    dataPublicationModel, view
                ]);
            };

            view.$el.find("a").click(this, onDrillDownClick);

            args.handled = true; // Indicates that the rendering of the data publication has been handled
        };

        // Register event handlers
        $inputElement.bind("datapublication:rendering", onRender);
    };
});