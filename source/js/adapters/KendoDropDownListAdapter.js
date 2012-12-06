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

	/**
	 * define publishData which is called when list of data is ready, xml data is passed as argument after the event
	 */
	var publishData = function(event, xml) {
		var data = [];

		if (emptyItemLabel !== null) {
			data.push({
				text : emptyItemLabel,
				value: emptyItemValue
			});
		}

		_.each($(xml).find('Row'), function(row) {
			var rowId = $(row).attr('id');
			_.each($(row).find('Cell'), function(cell) {
				data.push({
					text : $(cell).text(),
					value : rowId === 0 ? $(cell).text() : rowId
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

    var onDisabledChanged = function(eventinfo, isDisabled) {
        list.enable(!isDisabled);
    };

    var onVisibilityChanged = function(eventinfo, isVisible) {
        // TODO
    };

	/* bind listenners */
	cb.bind("publishData", publishData);
	cb.bind("valueUpdated", onValueUpdated);
	cb.bind("disabledChanged", onDisabledChanged);
	cb.bind("visibilityChanged", onVisibilityChanged);
};
