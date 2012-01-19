function useKendo() {
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