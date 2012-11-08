////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

	window.expanz = window.expanz || {};
	window.expanz.views = window.expanz.views || {};
    
	// Common Functions
    window.expanz.views.redirect = function (page) {
		window.location.href = getPageUrl(page);
	};

    window.expanz.views.requestLogin = function () {
		/* if redirection to login page store the last page to be able to redirect the user once logged in */
		window.expanz.Storage.setLastURL(document.URL);
		window.expanz.views.redirect(expanz.getLoginPage());
	};

    window.expanz.views.updateViewElement = function(view, elem, allAttrs, attr) {
        var datatype = allAttrs['datatype'];
        var id = allAttrs['id'];
        var label = allAttrs['label'];
        var value1 = allAttrs['value'];

        if (datatype && datatype.toLowerCase() === 'blob' && attr && attr === 'value') {
            var width = allAttrs['width'];
            var imgElem = '<img src="' + window.config._URLblobs + allAttrs['value'] + '"';
            imgElem += width ? ' width="' + width + '"' : 'width="100%"';
            imgElem += '/>';
            $(elem).html(imgElem);
            return;
        }

        var value;
        if ($(elem).attr("showTextValue") == "true") {
            value = allAttrs["text"];
        } else {
            value = allAttrs[attr];
        }

        if (view.options['textTransformFunction'] && attr === 'value') {
            try {
                value = eval(view.options['textTransformFunction'])(value);
            } catch(err) {
                window.expanz.logToConsole("Value could not be transformed with function (check function exists) " + view.options['textTransformFunction']);
            }

        }

        /* multi choice field -> display as checkboxes */
        if (allAttrs.items !== undefined && allAttrs.items.length > 0 && attr === 'value') {
            var disabled = boolValue(elem.attr('editable')) ? "" : "disabled='disabled'";
            _.each(allAttrs.items, function(item) {
                var selected = boolValue($(item).attr('selected')) === true ? ' checked="checked" ' : '';
                var text = $(item).attr('text');
                var value = $(item).attr('value');
                $(elem).append("<div><input " + disabled + selected + "' value='" + value + "' name='checkbox' type='checkbox'></input><span>" + text + "</span></div>");
            });
        } else if ($(elem).is('div') && allAttrs.visualType !== undefined && allAttrs.visualType.length > 0 && attr === 'value') {
            //$(elem).html(allAttrs.visualType || '&nbsp;');
            //if (allAttrs.visualType == 'cb') {
            //	$(elem).html('cb' + (value || '&nbsp;'));
            //} else if (allAttrs.visualType == 'rb') {
            //	$(elem).html('rb' + (value || '&nbsp;'));
            //} else if (allAttrs.visualType == 'txt') {
            //	$(elem).html("<input value='" + value + "' name='text' type='text'></input>");
            //} else {
            //	$(elem).html(value || '&nbsp;');
            //}
        } else if ($(elem).is('input')) {
            // special behaviour for checkbox input
            if ($(elem).is(":checkbox") || $(elem).is(":radio")) {
                $(elem).addClass('checkbox');
                var checkedValue = $(elem).attr("checkedValue") ? $(elem).attr("checkedValue") : 1;
                if (value == checkedValue) {
                    $(elem).prop("checked", true);
                } else {
                    $(elem).prop("checked", false);
                }
            } else {
                $(elem).val(value);
            }
            $(elem).trigger("valueUpdated", value);

            // if the field is disable apply the disabled attribute and style
            if (allAttrs["disabled"] === true) {
                $(elem).attr('disabled', 'disabled');
                $(elem).addClass('readonlyInput');
            } else {
                $(elem).removeAttr('disabled');
                $(elem).removeClass('readonlyInput');
            }
        } else {
            /* if value is empty put an unbreakable space instead */
            $(elem).html(value || '&nbsp;');
        }

        return elem;
    };

});