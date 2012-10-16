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
		var dataRows = new Array();
		var columns = null;
		var template = null;
		var childTag = '';

		/* if xml contains rows tag, this is where starts the real data for the tree */
		if ($(xml).find("Rows").length > 0) {
		    columns = $(xml).find("Columns");
			xml = $(xml).find("Rows");
		}
	    //create a template from the columns
		if (columns != null) {
		    template = "<script type='text/template' id='${name}'><tr class='item listDisplay'";
		    var counter = 0;
		    _.each($(columns).children(), function (columnXml) {
		        counter++;
		        if ($(columnXml).attr("width") > 0) {
		            template += "<td><%=data[" + counter + "]%></td>";
		        }
		    });
		    template += "</tr></script>";
		    $('body').append(template);
		}
        //turn xml rows into js array
		_.each($(xml).children(), function(parentXml) {
			var items = new Array();
			_.each($(parentXml).children(), function(childXml) {
				dataRows.push({
					name : $(childXml).attr(labelAttribute),
					category : $(parentXml).attr(labelAttribute),
					id : $(childXml).attr(idAttribute)
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
