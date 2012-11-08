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

	window.expanz.models.data.DataControl = expanz.Collection.extend({

		initialize : function(attrs) {
			expanz.Collection.prototype.initialize.call(this, attrs);
		},

		update : function(attrs) {

			expanz.Net.DeltaRequest(this.getAttr('dataId'), attrs.value, this.getAttr('parent'));
			return;
		},

		updateItemSelected : function(selectedId, callbacks) {
			// window.expanz.logToConsole("DataControl:updateItemSelected id:" + selectedId);

			/* anonymous activity case */
			if (this.getAttr('parent').isAnonymous()) {
				/* if we are in anonymous mode and the data control is a tree we need to call a method on selection change instead of a delta */
				if (this.getAttr('renderingType') == 'tree') {
					var anonymousFields = [
						{
							id : this.getAttr('dataId'),
							value : selectedId
						}
					];

					expanz.Net.MethodRequest(this.getAttr('selectionChangeAnonymousMethod'), [
						{
							name : "contextObject",
							value : this.getAttr('selectionChangeAnonymousContextObject')
						}
					], null, this.getAttr('parent'), anonymousFields,callbacks);
				}
				/* if we are in anonymous mode and the data control is a checkboxes control we need to store the value to send it later */
				else {
					var lastValues = this.getAttr('lastValues');
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

					this.setAttr({
						lastValues : lastValues
					});
				}
			}
			/* logged in case */
			else {
				/* exception for documents we have to send a MenuAction request */
				if (this.getAttr('id') == 'documents') {
					expanz.Net.CreateMenuActionRequest(this.getAttr('parent'), selectedId, "File", null, "1", callbacks);
				}
				/* normal case we send a delta request */
				else {
					expanz.Net.DeltaRequest(this.getAttr('fieldName'), selectedId, this.getAttr('parent'), callbacks);
				}
			}
		}
	});

});
