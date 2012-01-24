$.fn.KendoTreeAdapter = function(options) {

	var treeView = $(this);

	var parentSelectable = true;
	var childType = 'File';
	var labelAttribute = 'title';
	var idAttribute = 'id';
	var expandedOnLoad = false;
	var filteringInput = []; /* array of input element */

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
		if (options['filteringInput'] != undefined)
			filteringInput = options['filteringInput'];
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

		/* bind the selection of tree item */
		treeView.data("kendoTreeView").bind("select", function(event) {
			/*
			 * unfortunately we cannot attach any data/id to the tree items -> we need to do a lookup based on the child label in the xml datasource to retrieve the child id
			 */
			var elem = $(xmlData).find('[' + labelAttribute + '="' + event.node.firstChild.textContent + '"]');

			if (onSelection) {
				onSelection(view, elem.attr('id'), elem.is(childTag));
			}
		});

		/* if there is a filtering input field or button we bind the on change/click event to and filter the tree */
		if (filteringInput && filteringInput.length > 0) {
			/* for input we take the value set by the user */
			var filterInputs = function(event) {
				filterData(event, $(this).val(), data);
			}

			/* for button we look for a filter attribute in the button */
			var filterButtons = function(event) {
				filterData(event, $(this).attr('filter'), data);
			}

			_.each(filteringInput, function(el) {
				if ($(el).is("input")) {
					$(el).val("");
					$(el).bind("change", filterInputs);
				}
				else if ($(el).is("button")) {
					$(el).bind("click", filterButtons);
				}
			});

		}

	};

	/* filter data */
	var filterData = function(event, filter, originalData) {
		var newData;

		if (filter instanceof Array) {
			filter = str.join("|");
		}

		if (filter == null || filter == '') {
			newData = originalData;
		}
		else {
			/* creating a filtered array of data */
			var regExp = new RegExp(filter, "i");
			var newData = new Array();
			_.each(originalData, function(subData) {
				var parentObj = new Object();
				parentObj.text = subData.text;
				parentObj.expanded = subData.expanded;
				var items = new Array();
				_.each(subData.items, function(subItem) {
					if (subItem.text.match(regExp)) {
						items.push(subItem);
					}
				});
				if (items.length > 0) {
					parentObj.items = items;
					newData.push(parentObj);
				}
			});
		}
		/* cleaning the treeview and removing kendo classes and then create a new treeview */
		treeView.html("");
		treeView.removeClass("k-widget k-treeview k-reset");
		treeView.kendoTreeView({
			dataSource : newData
		});
	}

	/* bind listenner */
	$(this).bind("publishData", publishData);
	(this).bind("filterData", filterData);

}
