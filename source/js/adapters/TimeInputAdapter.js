$(function() {
    $("body").find("[renderingType=timeinput]").each(function() {
        var timeInputAdapter = new TimeInputAdapter(this);
    });

    function TimeInputAdapter(inputElement) {
        var $inputElement = $(inputElement);

        var onValueUpdatedFromServer = function(event, newValue, model) {
            // Time fields should render their value using the corresponding 12hr/24hr value provided by the model, the
            // choice of which is specified as a configuration property
            var value = null;

            if (newValue !== null) {
                var timeFormat = $inputElement.attr('timeFormat') !== undefined ? $inputElement.attr('timeFormat') : window.config._timeFormat;

                if (timeFormat === undefined)
                    timeFormat = 12;

                value = (timeFormat == 12 ? model.attributes["timeAMPM"] : model.attributes["time24"]);
            }

            if ($inputElement.is('input')) {
                $inputElement.val(value);
            } else {
                $inputElement.text(value || ""); // Support for non-input elements, like labels
            }

            return value;
        };

        // Register event handlers
        $inputElement.bind("valueUpdated", onValueUpdatedFromServer);
    };
});