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
	window.expanz.html.busyIndicator = function () {
	};
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

	/**
	 * renderHeaderGridField
	 */
	window.expanz.html.renderHeaderGridField = function(label, width) {
		var className = 'gridHeader';
		if (!label)
			label = '';
		if (label !== '') {
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

	/*window.expanz.html.renderVariantPanel = function(xml) {
		var html = '';
		var _subType;
		textBox : null,
		checkBox : null,
		radioButtons : null,
		if (xml.attr('visualType'))
			_subType = xml.attr('visualType'); // 'rb', 'txt', 'cb'
		else
			return '';
		
		
		return _subType;
	}*/
	
	window.expanz.html.renderMethod = function(methodName, methodLabel, cssClass, contextObject, hidden) {
		var thisCssClass = cssClass ? cssClass : 'methodButton';
		var ctx = contextObject ? ' contextObject = "' + contextObject + '" ' : '';
		var visible = hidden ? ' style="display:none" ' : '';
		var html = '';
		html += '<div bind="method" id="' + methodName + '" name="' + methodName + '" ' + ctx + visible + ' class="'+cssClass+'">';
		switch (cssClass)
		{
			default:
				html += '<a attribute="submit"><span>' + methodLabel + '</span></button>';
		}
		html += '</div>';
		return html;
	};


	window.expanz.html.renderHeader = function(siteName, siteUrl) {
		var html = '';
		if (!siteName)
			siteName = '';
		if (!siteUrl)
			siteUrl = getSiteUrl();

		html += '<div id="headBackground">';
		html += '<div class="centerLogoArea">';
		html += '<div id="siteName">' + siteName + '</div>';
		if (siteUrl !== '')
			html += '<a href="' + siteUrl + '"><div id="logo"></div></a>';
		html += '</div>';
		html += '</div>';
		return html;
	};
	
	/*window.expanz.html.renderMainMenu = function() {
		var html = '';
		
		html += '<div id="menuMainContainer">';
		html += '<div id="menuContainer" bind="menu" homeLabel=" " logoutLabel="Log Out" backLabel=" " ></div>';
		html += '</div>';
		return html;
	};
	
	window.expanz.html.renderNotification = function() {
		var html = '';
		
		html += '<div class="spacer30">';
		html += '<div class="notificationOuter">';
		html += '<ul class="notificationArea">';
		html += '<li bind="message" type="error" class="error"><span attribute="value"></span></li>';
		html += '<li bind="message" type="warning" class="warning"><span attribute="value"></span></li>';
		html += '<li bind="message" type="info" class="info"><span attribute="value"></span></li>';
		html += '</ul>';
		html += '</div>';
		html += '</div>';
		return html;
	};*/
	
	window.expanz.html.renderFooter = function(copyrightText, footerLinks) {
		var html = '';
		html += '<div class="footer">';
		html += '<div class="footerContainer">';
		html += '<div class="left footerCopyright">';
		if (!copyrightText)
			copyrightText = '';
		if (copyrightText !== '')
			html += '<div>' + copyrightText + '</div>';
		html += '<div class="footerLinks">';
		if (!footerLinks)
			footerLinks = '';
		if (footerLinks !== '')
			html += footerLinks;//'<a href="">Contact Us</a> <a href="">Feedback</a>';
		html += '</div>';
		html += '</div>';
		html += '<div class="right topContainer">';
		html += '<a class="top" href="javascript:void(0);"> Top&nbsp;&nbsp;&nbsp; </a>';
		html += '</div>';
		html += '</div>';
		html += '</div>';
		return html;
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
		return value === "";
	};
	
	window.expanz.html.findComponentModuleElement = function(component, module) {
		var el = component + "\\:" + module;
		if ($(el).length > 0) {
			return $(el);
		}
		/* search for class (old browsers support) */
		el = "." + component + "-" + module;
		if ($(el).length > 0) {
			return $(el);
		}
		return undefined;
	};
});
