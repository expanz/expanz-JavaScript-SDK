function createActivityWithKendoTabs(tabElement, ajaxTabContents,callbacks) {
	var tabLoaded = new Array();

	var nbDynamicTabs = ajaxTabContents.length;

	var onContentLoad = function(e) {
		tabLoaded[e.item.textContent] = true;
		console.log(e.item.textContent + " loaded");
		if (Object.size(tabLoaded) == nbDynamicTabs) {
			tabLoaded = new Array();
			console.log("load the activity");
			expanz.CreateActivity($(e.item).parents('[bind=activity]'),callbacks);
		}
	};

	$(tabElement).kendoTabStrip({
	contentUrls : ajaxTabContents,
	contentLoad : onContentLoad
	});

	/* load all unloaded tabs */
	_.each(tabElement.data("kendoTabStrip").tabGroup.children().not(
			'[class*=k-state-active]').not('[class*=k-tab-on-top]'),
			function(child) {
				tabElement.data("kendoTabStrip").reload($(child));
			});

};

Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key))
			size++;
	}
	return size;
};
