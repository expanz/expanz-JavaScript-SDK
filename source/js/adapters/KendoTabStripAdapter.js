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