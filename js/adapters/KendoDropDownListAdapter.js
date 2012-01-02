$.fn.KendoDropDownListAdapter = function() {

	/* instantiate Kendo Control */
	var cb = $(this).kendoDropDownList();
	var list = cb.data("kendoDropDownList");

	/**
	 * define publishData which is called when list of data is ready, array of data is passed as argument after the event
	 */
	var publishData = function(event) {
		if (arguments.length > 1) {
			var data = Array.prototype.slice.call(arguments, 0);
			data.remove(0);

			var ds = new kendo.data.DataSource({
				data : data
			});

			list.dataSource = ds;
			ds.read();
			list.refresh();
			/* set initial value if existing */
			if (cb.val() != undefined) {
				list.value(cb.val());
			}
		}

	};

	/* when the field gets a new value from the server, update the combobox element */
	var onValueUpdated = function(event, newValue) {
		list.value(newValue);
	};

	/* bind listenners */
	cb.bind("publishData", publishData);
	cb.bind("valueUpdated", onValueUpdated);

}
