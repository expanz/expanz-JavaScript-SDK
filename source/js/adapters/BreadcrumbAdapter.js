$(function () {
    $("body").find("[renderingType=breadcrumb]").each(function () {
        var breadcrumbAdapter = new BreadcrumbAdapter(this);
    });

    function BreadcrumbAdapter(inputElement) {
        var $inputElement = $(inputElement);

        var onPublishData = function (event, newValue, view) {
            $inputElement.html("<span></span>");
            
            $(newValue).find("Rows").find("Row").each(function (index, row) {
                var $row = $(row);

                if (index > 0)
                    $inputElement.append("&nbsp;&gt;&nbsp;");

                $inputElement.append("<a href='#" + $row.attr("id") + "' id='" + $row.attr("id") + "' type='" + $row.attr("Type") + "'>" + $row.find("Cell").text() + "</a>");
            });
            
            /* handle drilldown hyperlink click event */
            var onDrillDownClick = function (event) {
                var $anchor = $(this);
                view.model.drillDown($anchor.attr('id'), $anchor.attr('type'), null);
            };

            $inputElement.find("a").click(this, onDrillDownClick);
        };

        // Register event handlers
        $inputElement.bind("publishData", onPublishData);
    };
});