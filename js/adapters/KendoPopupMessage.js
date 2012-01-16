/* Author: Kim	Damevin

 */
function useKendoPopups() {
	/* must be overriden depending on the pluggin used */
	window.expanz.Views.PopupView.prototype.createWindowObject = function() {
		this.el.kendoWindow({
			visible : false,
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