/* Author: Kim	Damevin

 */
function useKendoPopups() {
	/* must be overridden depending on the plug-in used */
	window.expanz.views.PopupView.prototype.createWindowObject = function() {
		var that = this;
		this.$el.kendoWindow({
			visible : true,
			title : this.model.getAttr('title') ? this.model.getAttr('title') : "",
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