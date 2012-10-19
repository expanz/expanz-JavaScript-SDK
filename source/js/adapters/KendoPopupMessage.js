/* Author: Kim	Damevin

 */
function useKendoPopups() {
	/* must be overriden depending on the pluggin used */
	window.expanz.Views.PopupView.prototype.createWindowObject = function() {
		var title = this.model.getAttr('title');
		var that = this;
		this.el.kendoWindow({
			visible : true,
			title : this.model.getAttr('title') ? this.model.getAttr('title') : "",
			modal : true,
			width : this.width,
			close : function() {
				that.trigger('popupClosed');
				if (that.postCloseActions)
					that.postCloseActions(title);
			}
		});
		/* interpret the title as html to allow <span> or any html tags to be rendered */
		var thatEl = this.el;
		this.el.data("kendoWindow").bind("open", function() {
			$(thatEl).parent().find(".k-window-title").html($(thatEl).parent().find(".k-window-title").text());
		});

	};

	/* must be overriden depending on the pluggin used */
	window.expanz.Views.PopupView.prototype.close = function() {
		if (this.el.data("kendoWindow"))
			this.el.data("kendoWindow").destroy();
	};

	/* may be redifined depending on the pluggin used */
	window.expanz.Views.PopupView.prototype.center = function() {
		this.el.data("kendoWindow").center();
		this.el.data("kendoWindow").open();
	};
}