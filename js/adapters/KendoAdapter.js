function useKendo() {

	expanz.UIplugin = 'kendo';

	renderKendoComponents();

	/* using kendo windows */
	useKendoPopups();

	/* bind menus to kendo ui menu */
	if ($('[bind=menu] > ul'))
		$('[bind=menu] > ul').kendoMenu();

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
	el.find("[renderingType=combobox]").KendoComboBoxAdapter();
	el.find("[renderingType='dropdownlist']").KendoDropDownListAdapter();

	/* bind menus to kendo ui menu */
	if (el.find('[bind=menu] > ul'))
		el.find('[bind=menu] > ul').kendoMenu();
}