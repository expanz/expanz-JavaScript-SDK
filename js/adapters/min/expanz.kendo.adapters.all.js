/*
 * JavaScript file created by Rockstarapps Concatenation
*/

/*
 * START OF FILE - /expanz-JavaScript-SDK/js/adapters/KendoAdapter.js
 */
function useKendo() {

	expanz.UIplugin = 'kendo';

	renderKendoComponents();

	/* using kendo windows */
	useKendoPopups();

	/* context menu overriding creation method */
	window.expanz.Views.ContextMenuView.prototype.createContextMenu = function() {
		this.contextMenuEl.find("ul").kendoMenu({
			orientation : 'vertical'
		});
		this.contextMenuEl.show();
	}

}

function renderKendoComponents(el) {

	if (el == null)
		el = $("body");

	/* rendering combo boxes and dropdown */
	if (el.find("[renderingType=combobox]").length > 0)
		el.find("[renderingType=combobox]").KendoComboBoxAdapter();

	if (el.find("[renderingType=dropdownlist]").length > 0)
		el.find("[renderingType=dropdownlist]").KendoDropDownListAdapter();

	/* bind menus to kendo ui menu */
	if (el.find('[bind=menu] > ul').length > 0)
		el.find('[bind=menu] > ul').kendoMenu();
}

function useKendoMobile() {

	expanz.UIplugin = 'kendoMobile';

}

/*
 * END OF FILE - /expanz-JavaScript-SDK/js/adapters/KendoAdapter.js
 */

/*
 * START OF FILE - /expanz-JavaScript-SDK/js/adapters/KendoComboBoxAdapter.js
 */
$.fn.KendoComboBoxAdapter = function() {

	/* instantiate Kendo Control */
	var cb = $(this).kendoComboBox();
	var list = cb.data("kendoComboBox");

	/**
	 * define publishData which is called when list of data is ready, array of data is passed as argument after the event
	 */
	var publishData = function(event, xml) {
		var data = new Array();

		_.each($(xml).find('Row'), function(row) {
			var rowId = $(row).attr('id');
			_.each($(row).find('Cell'), function(cell) {
				data.push({
					text : $(cell).html(),
					value : rowId
				});
			});
		});

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

	};

	/* when the field gets a new value from the server, update the combobox element */
	var onValueUpdated = function(event, newValue) {
		list.value(newValue);
	};

	cb.bind("valueUpdated", onValueUpdated);
	cb.bind("publishData", publishData);
}

/*
 * END OF FILE - /expanz-JavaScript-SDK/js/adapters/KendoComboBoxAdapter.js
 */

/*
 * START OF FILE - /expanz-JavaScript-SDK/js/adapters/KendoDropDownListAdapter.js
 */
$.fn.KendoDropDownListAdapter = function() {

	/* instantiate Kendo Control */
	var cb = $(this).kendoDropDownList();
	var list = cb.data("kendoDropDownList");

	/**
	 * define publishData which is called when list of data is ready, xml data is passed as argument after the event
	 */
	var publishData = function(event, xml) {
		var data = new Array();

		_.each($(xml).find('Row'), function(row) {
			var rowId = $(row).attr('id');
			_.each($(row).find('Cell'), function(cell) {
				data.push({
					text : $(cell).html(),
					value : rowId
				});
			});
		});

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

	};

	/* when the field gets a new value from the server, update the combobox element */
	var onValueUpdated = function(event, newValue) {
		list.value(newValue);
	};

	/* bind listenners */
	cb.bind("publishData", publishData);
	cb.bind("valueUpdated", onValueUpdated);

}

/*
 * END OF FILE - /expanz-JavaScript-SDK/js/adapters/KendoDropDownListAdapter.js
 */

/*
 * START OF FILE - /expanz-JavaScript-SDK/js/adapters/KendoPopupMessage.js
 */
/* Author: Kim	Damevin

 */
function useKendoPopups() {
	/* must be overriden depending on the pluggin used */
	window.expanz.Views.PopupView.prototype.createWindowObject = function() {
		this.el.kendoWindow({
			visible : true,
			title : this.model.getAttr('title') ? this.model.getAttr('title') : "",
			modal : true,
			width : this.width
		});
	},

	/* must be overriden depending on the pluggin used */
	window.expanz.Views.PopupView.prototype.close = function() {
		this.el.data("kendoWindow").destroy();
	},

	/* may be redifined depending on the pluggin used */
	window.expanz.Views.PopupView.prototype.center = function() {
		this.el.data("kendoWindow").center();
		this.el.data("kendoWindow").open();
	}
};
/*
 * END OF FILE - /expanz-JavaScript-SDK/js/adapters/KendoPopupMessage.js
 */

/*
 * START OF FILE - /expanz-JavaScript-SDK/js/adapters/KendoTabStripAdapter.js
 */
function createActivityWithKendoTabs(tabElement, ajaxTabContents, callbacks) {
	/* array updated each time a tab is loaded */
	var tabLoaded = new Array();

	var nbDynamicTabs = ajaxTabContents.length;

	/* once a tab is loaded we check if it was the last on, if so we create the activity */
	var onContentLoad = function(e) {
		var itemName = (e.item.innerText || e.item.textContent);
		tabLoaded[itemName] = true;
		if (Object.size(tabLoaded) == nbDynamicTabs) {
			
			tabLoaded = new Array();
			expanz.CreateActivity($(e.item).parents('[bind=activity]'), callbacks);
		}
	};

	/* create kendo ui tab element specifying the url and a callback function when the content is loaded */
	$(tabElement).kendoTabStrip({
		contentUrls : ajaxTabContents,
		contentLoad : onContentLoad
	});

	/* force load of all unloaded tabs */
	_.each(tabElement.data("kendoTabStrip").tabGroup.children().not('[class*=k-state-active]').not('[class*=k-tab-on-top]'), function(child) {
		tabElement.data("kendoTabStrip").reload($(child));
	});

};
/*
 * END OF FILE - /expanz-JavaScript-SDK/js/adapters/KendoTabStripAdapter.js
 */

/*
 * START OF FILE - /expanz-JavaScript-SDK/js/adapters/KendoTreeAdapter.js
 */
$.fn.KendoTreeAdapter = function(options) {

	var treeView = $(this);

	var parentSelectable = true;
	var childType = 'File';
	var labelAttribute = 'title';
	var idAttribute = 'id';
	var expandedOnLoad = true;
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
			var elem = $(xmlData).find('[' + labelAttribute + '="' + (event.node.firstChild.textContent || event.node.firstChild.innerText ) + '"]');

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

/*
 * END OF FILE - /expanz-JavaScript-SDK/js/adapters/KendoTreeAdapter.js
 */

/*
 * START OF FILE - /expanz-JavaScript-SDK/js/adapters/KendoMobileListAdapter.js
 */
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
					id : $(childXml).attr(idAttribute)
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
				 	window.expanz.logToConsole(e.dataItem.id);
		    }

		});



	};

	/* bind listenner */
	$(this).bind("publishData", publishData);

}

/*
 * END OF FILE - /expanz-JavaScript-SDK/js/adapters/KendoMobileListAdapter.js
 */

/*
 * JavaScript file created by Rockstarapps Concatenation
*/
