$.fn.KendoTreeAdapter = function() {

	/**
	 * define publishData which is called when list of data is ready
	 */
	var publishData = function(event, data) {
		console.log(data);
	};

	/* bind listenners */
	$(this).bind("publishData", publishData);

}
