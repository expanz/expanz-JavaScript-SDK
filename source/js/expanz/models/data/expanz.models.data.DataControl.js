////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////

$(function() {

	window.expanz = window.expanz || {};
	window.expanz.models = window.expanz.models || {};
	window.expanz.models.data = window.expanz.models.data || {};

	window.expanz.models.data.DataControl = Backbone.Model.extend({

	    initialize: function () {
	        this.rows = new expanz.models.data.RowCollection();
		},

		update : function(attrs) {

			expanz.net.DeltaRequest(this.get('dataId'), attrs.value, this.get('parent'));
			return;
		},

		updateItemSelected : function(selectedId, callbacks) {
			// window.expanz.logToConsole("DataControl:updateItemSelected id:" + selectedId);

			/* anonymous activity case */
			if (this.get('parent').isAnonymous()) {
				/* if we are in anonymous mode and the data control is a tree we need to call a method on selection change instead of a delta */
				if (this.get('renderingType') == 'tree') {
					var anonymousFields = [
						{
							id : this.get('dataId'),
							value : selectedId
						}
					];

					expanz.net.MethodRequest(this.get('selectionChangeAnonymousMethod'), [
						{
							name : "contextObject",
							value : this.get('selectionChangeAnonymousContextObject')
						}
					], null, this.get('parent'), anonymousFields,callbacks);
				}
				/* if we are in anonymous mode and the data control is a checkboxes control we need to store the value to send it later */
				else {
					var lastValues = this.get('lastValues');
					if (!lastValues) {
						lastValues = "";
					}

					/* unticked */
					if (selectedId < 0) {
						var re = new RegExp("(" + (-selectedId) + ";)|(;?" + (-selectedId) + "$)", "g");
						lastValues = lastValues.replace(re, "");
					}
					/* ticked */
					else {
						if (lastValues.length > 0)
							lastValues += ";";
						lastValues += selectedId;
					}

					this.set({
						lastValues : lastValues
					});
				}
			}
			/* logged in case */
			else {
				/* exception for documents we have to send a MenuAction request */
				if (this.get('id') == 'documents') {
					expanz.net.CreateMenuActionRequest(this.get('parent'), selectedId, null, "File", null, "1", callbacks);
				}
				/* normal case we send a delta request */
				else {
					expanz.net.DeltaRequest(this.get('fieldName'), selectedId, this.get('parent'), callbacks);
				}
			}
		}
	});
});
