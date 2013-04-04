///#source 1 1 /source/js/adapters/KendoAdapter.js
/**
 * useKendo
 */
function useKendo() {

	expanz.UIplugin = 'kendo';

	renderKendoComponents();

	/* using kendo windows */
	useKendoPopups();

	/* context menu overriding creation method */
	window.expanz.views.ContextMenuView.prototype.createContextMenu = function() {
		this.contextMenuEl.find("ul").kendoMenu({
			orientation : 'vertical'
		});
		this.contextMenuEl.show();
	};

}

function renderKendoComponents(el) {

	if (el === undefined)
		el = $("body");

	/* rendering combo boxes and dropdown */
	if (el.find("[renderingType=combobox]").length > 0)
		el.find("[renderingType=combobox]").each(function() {
			$(this).KendoComboBoxAdapter();
		});

	if (el.find("[renderingType=dropdownlist]").length > 0) {
		el.find("[renderingType=dropdownlist]").each(function() {
			$(this).KendoDropDownListAdapter();
		});
	}

    // Date/time pickers
	if (el.find("[renderingType=datepicker]").length > 0) {
	    el.find("[renderingType=datepicker]").each(function () {
			$(this).KendoDatePickerAdapter();
		});
	}

	if (el.find("[renderingType=timepicker]").length > 0) {
	    el.find("[renderingType=timepicker]").each(function () {
			$(this).KendoTimePickerAdapter();
		});
	}

	/* bind menus to kendo ui menu */
	if (el.find('[bind=menu] > ul.menu').length > 0)
		el.find('[bind=menu] > ul.menu').each(function() {
			$(this).kendoMenu();
		});

	/* bind numeric stepper */
	if (el.find("[renderingType=numerictextbox]").length > 0)
		el.find("[renderingType=numerictextbox]").each(function() {
			$(this).kendoNumericTextBox({
				min : 1,
				max : 99,
				step : 1,
				format : "n0"
			});
		});
}

function useKendoMobile() {

	expanz.UIplugin = 'kendoMobile';

}

///#source 1 1 /source/js/adapters/KendoComboBoxAdapter.js
$.fn.KendoComboBoxAdapter = function() {

	/* instantiate Kendo Control */
	var cb = $(this).kendoComboBox({
		dataTextField : "text",
		dataValueField : "value"
	});
    
	var list = cb.data("kendoComboBox");

    /* publishData is called when data is ready to be assigned to the control, in the form of a expanz.models.DataPublication model */
	var publishData = function (event, dataPublicationModel) {
	    var data = [];

	    if (emptyItemLabel !== null) {
	        data.push({
	            text: emptyItemLabel,
	            value: emptyItemValue
	        });
	    }

	    dataPublicationModel.rows.each(function (row) {
	        var rowId = row.get("id");

	        row.cells.each(function (cell) {
	            data.push({
	                text: cell.get("value"),
	                value: rowId === 0 ? cell.get("value") : rowId
	            });
	        });
	    });

	    var ds = new kendo.data.DataSource({
	        data: data
	    });

	    list.dataSource = ds;
	    ds.read();
	    list.refresh();
	    
	    /* set initial value if existing */
	    if (cb.val() !== undefined) {
	        list.value(cb.val());
	    }
	};

	/* when the field gets a new value from the server, update the combobox element */
	var onValueUpdated = function(event, newValue) {
		list.value(newValue);
	};

	cb.bind("valueUpdated", onValueUpdated);
	cb.bind("publishData", publishData);
};

///#source 1 1 /source/js/adapters/KendoDatePickerAdapter.js
$.fn.KendoDatePickerAdapter = function() {

	/* instantiate Kendo Control */
    var control = $(this).kendoDatePicker({
        // display month and year in the input
        format: "dd/MM/yyyy"
	});
};

///#source 1 1 /source/js/adapters/KendoDropDownListAdapter.js
$.fn.KendoDropDownListAdapter = function() {

    /* instantiate Kendo Control */
    var $this = $(this);
    
	var cb = $this.kendoDropDownList({
		dataTextField : "text",
		dataValueField : "value"
	});
    
	var list = cb.data("kendoDropDownList");

	var emptyItemLabel = null;
	var emptyItemValue = '';

	if ($this.attr('emptyItemLabel') !== undefined)
		emptyItemLabel = $this.attr('emptyItemLabel');

	if ($this.attr('emptyItemValue') !== undefined)
	    emptyItemValue = $this.attr('emptyItemValue');

	/* publishData is called when data is ready to be assigned to the control, in the form of a expanz.models.DataPublication model */
	var publishData = function(event, dataPublicationModel) {
		var data = [];

		if (emptyItemLabel !== null) {
			data.push({
				text : emptyItemLabel,
				value: emptyItemValue
			});
		}

	    dataPublicationModel.rows.each(function(row) {
	        var rowId = row.get("id");

	        row.cells.each(function(cell) {
	            data.push({
	                text: cell.get("value"),
	                value: rowId === 0 ? cell.get("value") : rowId
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
		if (cb.val() !== undefined) {
			list.value(cb.val());
		}
	};

	/* when the field gets a new value from the server, update the combobox element */
	var onValueUpdated = function (event, newValue) {
	    if (newValue === null || newValue === undefined)
	        newValue = emptyItemValue; // Select the "empty" item
	    
		list.value(newValue);
	};

    var onErrorChanged = function(eventinfo, errorMessage) {
        if (errorMessage !== undefined && errorMessage !== null && errorMessage !== "") {
            list._focused.addClass("kendoErrorField");
        } else {
            list._focused.removeClass("kendoErrorField");
        }
        
        eventinfo.preventBubble = true;
    };

    var onDisabledChanged = function(eventinfo, isDisabled) {
        list.enable(!isDisabled);
    };

    var onVisibilityChanged = function(eventinfo, isVisible) {
        // TODO
    };

	/* bind event handlers */
	cb.bind("publishData", publishData);
	cb.bind("valueUpdated", onValueUpdated);
	cb.bind("disabledChanged", onDisabledChanged);
	cb.bind("visibilityChanged", onVisibilityChanged);
	cb.bind("errorChanged", onErrorChanged);
};

///#source 1 1 /source/js/adapters/KendoMobileListAdapter.js
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

};

///#source 1 1 /source/js/adapters/KendoPanelBarAdapter.js
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
			if (elem.position !== undefined && elem.position == 'end') {
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
						expanz.net.MethodRequest(elem.method, [
							{
								name : "contextObject",
								value : elem.contextObject
							}
						], null, view.model.get('parent'));
					}
				});

			}

			if (!isStatic) {

				var elem;
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

///#source 1 1 /source/js/adapters/KendoPopupMessage.js
/* Author: Kim	Damevin

 */
function useKendoPopups() {
	/* must be overridden depending on the plug-in used */
	window.expanz.views.PopupView.prototype.createWindowObject = function() {
		var that = this;
		this.$el.kendoWindow({
			visible : true,
			title : this.model.get('title') ? this.model.get('title') : "",
			modal : true,
			width : this.width,
			close : function() {
			    that.close();
			}
		});
	    
		/* interpret the title as html to allow <span> or any html tags to be rendered */
		var $thatEl = this.$el;
	    
		this.$el.data("kendoWindow").bind("open", function() {
			$thatEl.parent().find(".k-window-title").html($thatEl.parent().find(".k-window-title").text());
		});
	};

	/* must be overriden depending on the plug-in used */
	window.expanz.views.PopupView.prototype.close = function() {
		if (this.$el.data("kendoWindow"))
		    this.$el.data("kendoWindow").destroy();

		this.onCloseWindow();
	};

	/* may be redifined depending on the plug-in used */
	window.expanz.views.PopupView.prototype.center = function() {
		this.$el.data("kendoWindow").center();
		this.$el.data("kendoWindow").open();
	};
}
///#source 1 1 /source/js/adapters/KendoTabStripAdapter.js
function createActivityWithKendoTabs(tabElement, ajaxTabContents, callbacks) {
	/* array updated each time a tab is loaded */
	var tabLoaded = [];

	var nbDynamicTabs = ajaxTabContents.length;
	for(var i=0; i<nbDynamicTabs;i++ )
	{  
		ajaxTabContents[i] = getPageUrl(ajaxTabContents[i]);
	}
	
	/* once a tab is loaded we check if it was the last on, if so we create the activity */
	var onContentLoad = function(e) {
		var itemName = (e.item.innerText || e.item.textContent);
		tabLoaded[itemName] = true;
		if (Object.size(tabLoaded) == nbDynamicTabs) {
			//ie bug fix
			addPlaceHolderCapabilities();

			tabLoaded = [];
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
}
///#source 1 1 /source/js/adapters/KendoTimePickerAdapter.js
$.fn.KendoTimePickerAdapter = function() {

    /* instantiate Kendo Control */
    var timeFormat = this.attr('timeFormat') !== undefined ? this.attr('timeFormat') : window.config.timeFormat;
    
    if (timeFormat === undefined)
        timeFormat = 12;
    
    var control = $(this).kendoTimePicker({
        format: timeFormat == 12 ? "h:mm tt" : "H:mm"
    });
};

///#source 1 1 /source/js/adapters/KendoTreeAdapter.js
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
			newData = [];
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
                text: $(childXml).attr(labelAttribute),
                value: $(childXml).attr(idAttribute),
                allAttributes: $(childXml).getAttributes(),
                expanded: expandedOnLoad
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
    };

    var parseRow = function(parentXml) {
        //var parentId = $(parentXml).attr(idAttribute);
        
        var parentObj = {
            text: $(parentXml).attr(labelAttribute),
            expanded: expandedOnLoad,
            allAttributes: $(parentXml).getAttributes()
        };
        
        var items = parseChildrenRows(parentXml);
        
        if (items.length > 0) {
            parentObj.items = items;
        }
        
        return parentObj;
    };

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
			if (elem.position !== undefined && elem.position == 'end') {
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
						expanz.net.MethodRequest(elem.method, [
							{
								name : "contextObject",
								value : elem.contextObject
							}
						], null, view.model.get('parent'));

						$(treeView).trigger("TreeSelectionChanged", {
							id : 'static',
							text : selectedText
						});

					}
				});

			}

			if (!isStatic) {

				var elem;
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

