$.fn.KendoMobileListAdapter = function(options) {

	var listView = $(this);

	var parentSelectable = true;
	var childType = 'File';
	var labelAttribute = 'title';
	var idAttribute = 'id';

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
	}

	/**
	 * define publishData which is called when list of data is ready
	 */
	var publishData = function(event, xml, view) {
		window.expanz.logToConsole("KendoMobileListAdapter publishData");
		var xmlData = xml;
		var data = new Array();

		var childTag = '';

		/* if xml contains rows tag, this is where starts the real data for the tree */
		if ($(xml).find("Rows").length > 0) {
			xml = $(xml).find("Rows");
		}

		_.each($(xml).children(), function(parentXml) {
			var items = new Array();
			_.each($(parentXml).children(), function(childXml) {
				data.push({
					name : $(childXml).attr(labelAttribute),
					category : $(parentXml).attr(labelAttribute),
					id : $(childXml).attr(idAttribute),
				});
			});

		});

		listView.kendoMobileListView({
			dataSource : kendo.data.DataSource.create({
				data : data,
				group : "category"
			}),
			 template: "${name}",
			 
			 click: function(e) {
		         console.log(e.dataItem.id);
		    }

		});



	};

	/* bind listenner */
	$(this).bind("publishData", publishData);

}
