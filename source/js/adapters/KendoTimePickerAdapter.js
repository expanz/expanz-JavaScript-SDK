$.fn.KendoTimePickerAdapter = function() {

    /* instantiate Kendo Control */
    var timeFormat = this.attr('timeFormat') !== undefined ? this.attr('timeFormat') : window.config.timeFormat;
    
    if (timeFormat === undefined)
        timeFormat = 12;
    
    var control = $(this).kendoTimePicker({
        format: timeFormat == 12 ? "h:mm tt" : "H:mm"
    });
};
