$.fn.KendoTreeAdapter = function(options) {

	var treeView = $(this);

	var parentSelectable = true;
	var childType = 'File';
	var labelAttribute = 'title';
	var idAttribute = 'id';
	var expandedOnLoad = false;

	/* function called after the delta has been sent and the response has been handle by the client */
	/* format is selectionCallback = { success : function(){ <doing some actions> } } */
	var selectionCallback = null;

	var onSelection = function(view, id, isChild) {
		if (!parentSelectable && !isChild)
			return;
		view.itemSelected(id, selectionCallback);
	};

	/* handle options */
	if (options) {
		if (options['labelAttribute'] != undefined)
			labelAttribute = options['labelAttribute'];
		if (options['idAttribute'] != undefined)
			idAttribute = options['idAttribute'];
		if (options['selectionCallback'] != undefined)
			selectionCallback = options['selectionCallback'];
		if (options['onSelection'] != undefined)
			onSelection = options['onSelection'];
		if (options['parentSelectable'] != undefined)
			parentSelectable = options['parentSelectable'];
		if (options['expandedOnLoad'] != undefined)
			expandedOnLoad = options['expandedOnLoad'];		
	}

	/**
	 * define publishData which is called when list of data is ready
	 */
	var publishData = function(event, xml, view) {
		window.expanz.logToConsole("KendoTreeAdapter publishData");
		var xmlData = xml;
		var data = new Array();

		var childTag = '';

		/* if xml contains rows tag, this is where starts the real data for the tree */
		if ($(xml).find("Rows").length > 0) {
			xml = $(xml).find("Rows");
		}

		_.each($(xml).children(), function(parentXml) {
			var parentId = $(parentXml).attr(idAttribute);
			var parentObj = new Object();
			parentObj.text = $(parentXml).attr(labelAttribute);
			parentObj.expanded = expandedOnLoad;

			var items = new Array();
			_.each($(parentXml).children(), function(childXml) {
				childTag = childXml.tagName;
				items.push({
					text : $(childXml).attr(labelAttribute),
					value : $(childXml).attr(idAttribute)
				});
			});

			if (items.length > 0) {
				parentObj.items = items;
			}
			data.push(parentObj);

		});

		treeView.kendoTreeView({
			dataSource : data
		});

		treeView.data("kendoTreeView").bind("select", function(event) {
			/*
			 * unfortunately we cannot attach any data/id to the tree items -> we need to do a lookup based on the child label in the xml datasource to retrieve the child id
			 */
			var elem = $(xmlData).find('[' + labelAttribute + '="' + event.node.firstChild.textContent + '"]');

			if (onSelection) {
				onSelection(view, elem.attr('id'), elem.is(childTag));
			}
		});
	};

	/* bind listenners */
	$(this).bind("publishData", publishData);

}
