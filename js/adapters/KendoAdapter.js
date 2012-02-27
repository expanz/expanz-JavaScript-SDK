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
	if (el.find('[bind=menu] > ul.menu').length > 0)
		el.find('[bind=menu] > ul.menu').kendoMenu();
}

function useKendoMobile() {

	expanz.UIplugin = 'kendoMobile';

}
