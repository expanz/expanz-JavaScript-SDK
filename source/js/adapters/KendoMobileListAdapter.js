$.fn.KendoMobileListAdapter = function(options) {

	var listView = $(this);

	var parentSelectable = true;
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
		if (options['labelAttribute'] !== undefined)
			labelAttribute = options['labelAttribute'];
		if (options['idAttribute'] !== undefined)
			idAttribute = options['idAttribute'];
		if (options['selectionCallback'] !== undefined)
			selectionCallback = options['selectionCallback'];
		if (options['onSelection'] !== undefined)
			onSelection = options['onSelection'];
		if (options['parentSelectable'] !== undefined)
			parentSelectable = options['parentSelectable'];
	}

	/**
	 * define publishData which is called when list of data is ready
	 */
	var publishData = function(event, xml, view) {
		window.expanz.logToConsole("KendoMobileListAdapter publishData");
		//var childTag = '';

		// Create template from the server if it doesn't exist
		if (!$("head").find("#${name}")) {
			var columnsXml;
			var gridDataTemplate;
			
			if ($(xml).find("Columns").length > 0) {
				columnsXml = $(xml).find("Columns");
			}
			// TODO Need to cater for isHTMLTable?? = false, width, style, type, etc...
			if (columnsXml !== undefined) {
				gridDataTemplate = "<script type='text/template' id='${name}'><tr class='item listDisplay'";
				var columnCounter = 0;
				_.each($(columnsXml).children(), function (columnXml) {
					columnCounter++;
					if ($(columnXml).attr("width") > 0) {
						gridDataTemplate += "<td><%=data[" + columnCounter + "]%></td>"; 
					}
				});
				gridDataTemplate += "</tr></script>";
				$('head').append(gridDataTemplate);
			}
		}
		
		/* if xml contains rows tag, this is where starts the real data for the tree */
		var dataXml;
		var dataRows = [];//new Array();
		if ($(xml).find("Rows").length > 0) {
			dataXml = $(xml).find("Rows");
		}
        //turn xml rows into js array
		_.each($(dataXml).children(), function(rowXml) {
			var items = [];//new Array();
			_.each($(rowXml).children(), function(cellXml) {
				dataRows.push({
					name : $(cellXml).attr(labelAttribute),
					category : $(rowXml).attr(labelAttribute),
					id : $(cellXml).attr(idAttribute)
				});
			});

		});

		listView.kendoMobileListView({
			dataSource : kendo.data.DataSource.create({
				data : dataRows,
				group : "category"
			}),
			 template: "${name}",
			 
			 click: function(e) {
				 	window.expanz.logToConsole(e.dataItem.id);
		    }

		});
	};

	/* bind listenner */
	$(this).bind("publishData", publishData);

}
