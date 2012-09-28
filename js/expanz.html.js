////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function() {

	window.expanz = window.expanz || {};
	
	/*
	 * static html rendering functions
	 */
	window.expanz.html = window.expanz.html || {};

	window.expanz.html.startDiv = function(className) {
		if (!className)
			className = '';
		return '<div class="' + className + '" >';
	};

	window.expanz.html.endDiv = function() {
		return '</div>';
	};

	window.expanz.html.clearBoth = function() {
		return '<div style="clear:both"></div>';
	};

	window.expanz.html.renderHeaderGridField = function(label, width) {
		var className = 'gridHeader';
		if (!label)
			label = '';
		if (label != '') {
			className += ' gridHeader' + label;
		}
		
		if (!width)
			width = 100;
		return '<div class="' + className + '" style="width:' + width + 'px;float:left">' + label + '</div>';
	};

	window.expanz.html.renderGridTemplateField = function(fieldName, width) {
		if (!width)
			width = 100;
		return '<div class="' + fieldName + '" style="width:' + width + 'px;float:left"><%= data.' + fieldName + ' %>&nbsp;</div>';
	};

	window.expanz.html.renderField = function(fieldName, showLabel, placeHolderText, anonymousBoundMethod, showError) {
		if (!showError)
			showError = 'false';
		var field = '';
		field += '<div showError="' + showError + '" id="' + fieldName + '"  bind="field" name="' + fieldName + '" class="field ' + fieldName + '" anonymousBoundMethod=' + anonymousBoundMethod + '>';
		if (showLabel === true)
			field += '<label attribute="label"></label>';
		field += '<input type="text" attribute="value"  class="k-textbox" placeholder="' + placeHolderText + '"/>';
		field += '</div>';
		return field;
	};

	window.expanz.html.renderReadOnlyField = function(fieldName, showLabel, sameLine, width) {
		var field = '';
		var style = sameLine ? 'float:left;' : '';
		style += width ? 'width:' + width + 'px' : '';
		field += '<div style="' + style + '" id="' + fieldName + '"  bind="field" name="' + fieldName + '" class="readonlyField ' + fieldName + '">';
		if (showLabel === true)
			field += '<div class="fieldLabel" style="float:left"><label attribute="label"></label></div> ';
		field += '<div class="fieldValue"><label attribute="value"></label></div><div style="clear:both" ></div>';
		field += '</div>';
		return field;
	};

	window.expanz.html.renderMethod = function(methodName, buttonLabel, contextObject, hidden) {
		var method = '';
		var ctx = contextObject ? ' contextObject = "' + contextObject + '" ' : '';
		var visible = hidden ? ' style="display:none" ' : '';
		method += '<span bind="method" id="' + methodName + '" name="' + methodName + '" ' + ctx + visible + ' class="method" >';
		method += '<button type="button" attribute="submit" >' + buttonLabel + '</button>';
		method += '</span>';
		return method;
	};
	 
	window.expanz.html.addNameToImageURL = function(currentUrl, name) {
		if (!currentUrl || !name)
			return "";
		var lastSlashPos = currentUrl.replace(/\\/g, "/").lastIndexOf("/");
		if (lastSlashPos >= 0) {
			return currentUrl.splice(lastSlashPos + 1, 0, escapeBadCharForURL(name) + "-");
		}
		return "";
	};

	window.expanz.html.isEmpty = function(value) {
		if (value === undefined)
			return true;
		return value == "";
	};
});
