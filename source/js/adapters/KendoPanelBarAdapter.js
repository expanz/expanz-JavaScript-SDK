$.fn.KendoPanelBarAdapter = function(options) {

	var panelView = $(this);

	var parentSelectable = true;
	var labelAttribute = 'title';
	var idAttribute = 'id';
	var expandedOnLoad = true;
	var staticElements = {};

	/* function called after the delta has been sent and the response has been handle by the client */
	/* format is selectionCallback = { success : function(){ <doing some actions> } } */
	var selectionCallback = null;

	var runAfterPublish = null;

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
		if (options['expandedOnLoad'] !== undefined)
			expandedOnLoad = options['expandedOnLoad'];
		if (options['runAfterPublish'] !== undefined)
			runAfterPublish = options['runAfterPublish'];			
		if (options['staticElements'] !== undefined)
			staticElements = options['staticElements'];
	}

	/**
	 * define publishData which is called when list of data is ready
	 */
	var publishData = function(event, xml, view) {
		window.expanz.logToConsole("KendoPanelBarAdapter publishData");
		var xmlData = xml;
		var data = [];

		var childTag = '';

		/* if xml contains rows tag, this is where starts the real data for the panel bar */
		if ($(xml).find("Rows").length > 0) {
			xml = $(xml).find("Rows");
		}

		_.each($(xml).children(), function(parentXml) {
			var parentId = $(parentXml).attr(idAttribute);
			var parentObj = {};
			parentObj.text = $(parentXml).attr(labelAttribute);
			parentObj.expanded = expandedOnLoad;
			parentObj.allAttributes = $(parentXml).getAttributes();

			var items = [];
			_.each($(parentXml).children(), function(childXml) {
				childTag = childXml.tagName;
				items.push({
					text : $(childXml).attr(labelAttribute),
					value : $(childXml).attr(idAttribute),
					allAttributes : $(childXml)
				});
			});

			if (items.length > 0) {
				/* sort subdata */
				items.sort(getObjectSortAscendingFunction('text'));
				parentObj.items = items;
			}
			data.push(parentObj);

		});

		/* sort data */
		data.sort(getObjectSortAscendingFunction('text'));

		/* add static element at the position asked */
		_.each(staticElements, function(elem) {
			if (elem.position != undefined && elem.position == 'end') {
				data.push({
					text : $(elem).attr('label')
				});
			}
			else {
				data.unshift({
					text : $(elem).attr('label')
				});
			}
		});

		panelView.kendoPanelBar({
			dataSource : data
		});

		/* add css class for level 1 / level 2 */
		/* add css class level 1 */
		panelView.children("li").addClass("level1");
		/* add css class level 2 */
		panelView.children("li").find("ul").children("li").addClass("level2");

		/* bind the selection of panel bar item */
		panelView.data("kendoPanelBar").bind("select", function(event) {
			/*
			 * unfortunately we cannot attach any data/id to the panel bar items -> we need to do a lookup based on the child label in the xml datasource to retrieve the child id
			 */
			var selectedText = event.item.firstChild.textContent || event.item.firstChild.innerText;

			/* check if it is a static element */
			var isStatic = false;
			if (staticElements.length > 0) {
				_.each(staticElements, function(elem) {
					if (selectedText === elem.label) {
						isStatic = true;
						/* call the method associated */
						expanz.Net.MethodRequest(elem.method, [
							{
								name : "contextObject",
								value : elem.contextObject
							}
						], null, view.model.getAttr('parent'));
					}
				});

			}

			if (!isStatic) {

				var elem = undefined;
				$(xmlData).find("[" + labelAttribute + "]").each(function() {
					if (selectedText === $(this).attr(labelAttribute)) {
						elem = $(this);
					}
				});

				if (onSelection) {
					onSelection(view, elem.attr('id'), elem.is(childTag));
				}
			}
		});

		/* calling runAfterPublish if defined */
		if (runAfterPublish) {
			runAfterPublish(xmlData);
		}
		
		$(this).trigger('dataPublished');

	};

	/* bind listenner */
	$(this).bind("publishData", publishData);

};
