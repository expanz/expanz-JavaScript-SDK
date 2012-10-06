$.fn.KendoTreeAdapter = function(options) {

	var treeView = $(this);

	var parentSelectable = true;
	var labelAttribute = 'title';
	var idAttribute = 'id';
	var expandedOnLoad = true;
	var filteringInput = []; /* array of input element */
	var displayLoading = true;
	var staticElements = {};

	/* function called after the delta has been sent and the response has been handle by the client */
	/* format is selectionCallback = function(){ <doing some actions> } */
	var selectionCallback = null;

	var callback = {
		success : function() {
			// treeView.data('kendoTreeView').enable(".k-item",true);
			if (displayLoading) {
				treeView.removeClass('treeSelectionLoading');
				var loadingId = "LoadingTree_" + treeView.attr('id');
				var loadingEL = $(treeView).find("#" + loadingId);
				if (loadingEL)
					loadingEL.hide();
			}

			if (selectionCallback)
				selectionCallback.call();
		}
	};

	var runAfterPublish = null;

	var onSelection = function(view, id, isChild) {
		if (!parentSelectable && !isChild)
			return;
		view.itemSelected(id, callback);
		// treeView.data('kendoTreeView').enable(".k-item",false);
		if (displayLoading) {
			var loadingId = "LoadingTree_" + treeView.attr('id');
			var loadingEL = $(view.el).find("#" + loadingId);
			if (loadingEL.length === 0) {
				$(view.el).append('<div class="loading" id="' + loadingId + '"><span> </span></div>');
				loadingEL = $(view.el).find("#" + loadingId);
			}

			loadingEL.css("position", "absolute");
			loadingEL.css('width', '100%');
			loadingEL.css('height', '100%');
			loadingEL.css('margin', '0');
			loadingEL.css('padding', '0');
			loadingEL.css('top', '0px');
			loadingEL.css('left', '0px');
			loadingEL.css('z-index', '999');
			loadingEL.css('overflow', 'hidden');
			loadingEL.css('background', 'url(data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==) center');
			loadingEL.show();
			treeView.addClass('treeSelectionLoading');
		}
	};

	/* filter data */
	var filterData = function(event, filter, originalData) {
		var newData;

		if (filter instanceof Array) {
			filter = str.join("|");
		}

		if (filter === null || filter === '') {
			newData = originalData;
		}
		else {
			// TODO: Handle more than 2 levels with filtering
			/* creating a filtered array of data */
			var regExp = new RegExp(filter, "i");
			var newData = [];
			_.each(originalData, function(subData) {
				var parentObj = {};
				parentObj.text = subData.text;
				parentObj.expanded = subData.expanded;
				var items = [];
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
		if (options['filteringInput'] !== undefined)
			filteringInput = options['filteringInput'];
		if (options['runAfterPublish'] !== undefined)
			runAfterPublish = options['runAfterPublish'];
		if (options['filterData'] !== undefined)
			filterData = options['filterData'];
		if (options['displayLoading'] !== undefined)
			displayLoading = options['displayLoading'];
		if (options['staticElements'] !== undefined)
			staticElements = options['staticElements'];
	}

	var parseChildrenRows = function(parentXml) {
		var items = [];
		_.each($(parentXml).children(), function(childXml) {
			var child = {
				text : $(childXml).attr(labelAttribute),
				value : $(childXml).attr(idAttribute),
				allAttributes : $(childXml),
				expanded : expandedOnLoad
			};

			if ($(childXml).attr('Type') == 'parent') {
				var itemsChildren = parseChildrenRows(childXml);
				if (itemsChildren.length > 0) {
					child.items = itemsChildren;
				}
			}
			items.push(child);
		});
		return items;
	}

	var parseRow = function(parentXml) {
		var parentId = $(parentXml).attr(idAttribute);
		var parentObj = {};
		parentObj.text = $(parentXml).attr(labelAttribute);
		parentObj.expanded = expandedOnLoad;
		parentObj.allAttributes = $(parentXml).getAttributes();

		var items = parseChildrenRows(parentXml);
		if (items.length > 0) {
			parentObj.items = items;
		}
		return parentObj;
	}

	/**
	 * define publishData which is called when list of data is ready
	 */
	var publishData = function(event, xml, view) {
		window.expanz.logToConsole("KendoTreeAdapter publishData");
		var xmlData = xml;
		var data = [];

		var parentTag = '';

		/* if xml contains rows tag, this is where starts the real data for the tree */
		if ($(xml).find("Rows").length > 0) {
			xml = $(xml).find("Rows");
		}

		_.each($(xml).children(), function(parentXml) {
			var parentObj = parseRow(parentXml);
			parentTag = parentXml.tagName;
			data.push(parentObj);
		});

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

		treeView.kendoTreeView({
			dataSource : data
		});

		/* bind the selection of tree item */
		treeView.data("kendoTreeView").bind("select", function(event) {
			/*
			 * unfortunately we cannot attach any data/id to the tree items -> we need to do a lookup based on the child label in the xml datasource to retrieve the child id
			 */
			var selectedText = event.node.firstChild.textContent || event.node.firstChild.innerText;

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

						$(treeView).trigger("TreeSelectionChanged", {
							id : 'static',
							text : selectedText
						});

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
					onSelection(view, elem.attr('id'), !elem.is(parentTag));
				}

				$(treeView).trigger("TreeSelectionChanged", {
					id : elem.attr('id'),
					text : selectedText,
					parentId : elem.parent().attr('id'),
					parentText : elem.parent().attr(labelAttribute)
				});
			}
		});

		/* if there is a filtering input field or button we bind the on change/click event to and filter the tree */
		if (filteringInput && filteringInput.length > 0) {
			/* for input we take the value set by the user */
			var filterInputs = function(event) {
				filterData(event, $(this).val(), data);
			};

			/* for button we look for a filter attribute in the button */
			var filterButtons = function(event) {
				filterData(event, $(this).attr('filter'), data);
			};

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

		/* calling runAfterPublish if defined */
		if (runAfterPublish) {
			runAfterPublish(xmlData);
		}

	};

	/* bind listenner */
	$(this).bind("publishData", publishData);
	$(this).bind("filterData", filterData);

};
