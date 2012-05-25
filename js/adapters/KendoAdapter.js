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
	};

}

function renderKendoComponents(el) {

	if (el === undefined)
		el = $("body");

	/* rendering combo boxes and dropdown */
	if (el.find("[renderingType=combobox]").length > 0)
		el.find("[renderingType=combobox]").KendoComboBoxAdapter();

	if (el.find("[renderingType=dropdownlist]").length > 0)
		el.find("[renderingType=dropdownlist]").KendoDropDownListAdapter();

	/* bind menus to kendo ui menu */
	if (el.find('[bind=menu] > ul.menu').length > 0)
		el.find('[bind=menu] > ul.menu').kendoMenu();

	/* bind numeric stepper */
	if (el.find("[renderingType=numerictextbox]").length > 0)
		el.find("[renderingType=numerictextbox]").kendoNumericTextBox({
			min : 1,
			max : 99,
			step : 1,
			format : "n0"
		});
}

function useKendoMobile() {

	expanz.UIplugin = 'kendoMobile';

}
