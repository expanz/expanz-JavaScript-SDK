function useKendo() {
	useKendoPopups();
	if ($('#ExpanzMenu > ul'))
		$('#ExpanzMenu > ul').kendoMenu();

	/* context menu overriding creation method */
	window.expanz.Views.ContextMenuView.prototype.createContextMenu = function() {
		this.contextMenuEl.find("ul").kendoMenu({
			orientation : 'vertical'
		});
		this.contextMenuEl.show();
	}
}