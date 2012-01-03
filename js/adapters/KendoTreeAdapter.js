$.fn.KendoTreeAdapter = function() {

	var treeView = $(this);

	/**
	 * define publishData which is called when list of data is ready
	 */
	var publishData = function(event, xml, view) {
		window.expanz.logToConsole("KendoTreeAdapter publishData");
		var xmlData = xml;
		var data = new Array();

		_.each($(xml).find('Folder'), function(folderxml) {
			var folderId = $(folderxml).attr('id');
			var folder = new Object();
			folder.text = $(folderxml).attr('title');

			var items = new Array();
			_.each($(folderxml).find('File'), function(filexml) {
				items.push({
					text : $(filexml).attr('title'),
					value : $(filexml).attr('id')
				});
			});

			folder.items = items;
			data.push(folder);

		});

		treeView.kendoTreeView({
			dataSource : data
		});

		treeView.data("kendoTreeView").bind("select", function(event) {
			/* unfortunately we cannot attach any data/id to the tree items
			 * -> we need to do a lookup based on the file title in the xml datasource to retrieve the file id */
			var elem = $(xmlData).find('[title="' + event.node.textContent + '"]');
			if (elem.is("file")) {
				view.itemSelected(elem.attr('id'), "File");
			} else {
				// ignore folders
			}
		});
	};

	/* bind listenners */
	$(this).bind("publishData", publishData);

}
