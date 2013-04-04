$.fn.KendoComboBoxAdapter = function() {

	/* instantiate Kendo Control */
	var cb = $(this).kendoComboBox({
		dataTextField : "text",
		dataValueField : "value"
	});
    
	var list = cb.data("kendoComboBox");

    /* publishData is called when data is ready to be assigned to the control, in the form of a expanz.models.DataPublication model */
	var publishData = function (event, dataPublicationModel) {
	    var data = [];

	    if (emptyItemLabel !== null) {
	        data.push({
	            text: emptyItemLabel,
	            value: emptyItemValue
	        });
	    }

	    dataPublicationModel.rows.each(function (row) {
	        var rowId = row.get("id");

	        row.cells.each(function (cell) {
	            data.push({
	                text: cell.get("value"),
	                value: rowId === 0 ? cell.get("value") : rowId
	            });
	        });
	    });

	    var ds = new kendo.data.DataSource({
	        data: data
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
	var onValueUpdated = function(event, newValue) {
		list.value(newValue);
	};

	cb.bind("valueUpdated", onValueUpdated);
	cb.bind("publishData", publishData);
};
