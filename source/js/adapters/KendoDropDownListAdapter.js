$.fn.KendoDropDownListAdapter = function() {

    /* instantiate Kendo Control */
    var $this = $(this);
    
	var cb = $this.kendoDropDownList({
		dataTextField : "text",
		dataValueField : "value"
	});
    
	var list = cb.data("kendoDropDownList");

	var emptyItemLabel = null;
	var emptyItemValue = '';

	if ($this.attr('emptyItemLabel') !== undefined)
		emptyItemLabel = $this.attr('emptyItemLabel');

	if ($this.attr('emptyItemValue') !== undefined)
	    emptyItemValue = $this.attr('emptyItemValue');

	/* publishData is called when data is ready to be assigned to the control, in the form of a expanz.models.DataPublication model */
	var publishData = function(event, dataPublicationModel) {
		var data = [];

		if (emptyItemLabel !== null) {
			data.push({
				text : emptyItemLabel,
				value: emptyItemValue
			});
		}

	    dataPublicationModel.rows.each(function(row) {
	        var rowId = row.get("id");

	        row.cells.each(function(cell) {
	            data.push({
	                text: cell.get("value"),
	                value: rowId === 0 ? cell.get("value") : rowId
	            });
	        });
	    });

		var ds = new kendo.data.DataSource({
			data : data
		});

		list.dataSource = ds;
		ds.read();
		list.refresh();
	    
		/* set initial value if existing */
		if (cb.val() !== undefined) {
			list.value(cb.val());
		}
	};

	/* when the field gets a new value from the server, update the combobox element */
	var onValueUpdated = function (event, newValue) {
	    if (newValue === null || newValue === undefined)
	        newValue = emptyItemValue; // Select the "empty" item
	    
		list.value(newValue);
	};

    var onErrorChanged = function(eventinfo, errorMessage) {
        if (errorMessage !== undefined && errorMessage !== null && errorMessage !== "") {
            list._focused.addClass("kendoErrorField");
        } else {
            list._focused.removeClass("kendoErrorField");
        }
        
        eventinfo.preventBubble = true;
    };

    var onDisabledChanged = function(eventinfo, isDisabled) {
        list.enable(!isDisabled);
    };

    var onVisibilityChanged = function(eventinfo, isVisible) {
        // TODO
    };

	/* bind event handlers */
	cb.bind("publishData", publishData);
	cb.bind("valueUpdated", onValueUpdated);
	cb.bind("disabledChanged", onDisabledChanged);
	cb.bind("visibilityChanged", onVisibilityChanged);
	cb.bind("errorChanged", onErrorChanged);
};
