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
		window.expanz.views.redirect(expanz.security.getLoginPage());
	};

    window.expanz.views.updateViewElement = function (view, elem, allAttrs, attr, model) {
        var $elem = $(elem);
        var datatype = allAttrs['datatype'];

        if (datatype && datatype.toLowerCase() === 'blob' && attr && attr === 'value') {
            var width = allAttrs['width'];
            var imgElem = '<img src="' + window.config._URLblobs + allAttrs['value'] + '"';
            imgElem += width ? ' width="' + width + '"' : 'width="100%"';
            imgElem += '/>';
            $elem.html(imgElem);
            return;
        }

        var value = allAttrs[attr];

        var valueTransformFunction = $elem.attr("valueTransformFunction");
        
        if (valueTransformFunction !== undefined) {
            try {
                value = eval(valueTransformFunction)(value);
            } catch(err) {
                window.expanz.logToConsole("Value could not be transformed with function (check function exists): " + valueTransformFunction);
            }
        }
        
        if (allAttrs["null"] === true) {
            value = null;
        }

        if (value !== undefined) {
            var event = jQuery.Event("valueUpdated");
            
            if (attr === "value")
                $elem.trigger(event, [value, model]); // Extensibility point for adapters

            if (event.result === undefined) { // Only if no adapter has handled setting the value itself, then we continue and set using default behaviour
                /* multi choice field -> display as checkboxes */
                // NOTE: The model doesn't currently populate the items property anymore, as it leads to an
                // endless loop in underscore.js in Chrome. As not required for now, commenting out.
                //if (allAttrs.items !== undefined && allAttrs.items.length > 0 && attr === 'value') {
                //    var disabled = boolValue($elem.attr('editable')) ? "" : "disabled='disabled'";
                //    _.each(allAttrs.items, function(item) {
                //        var selected = boolValue($(item).attr('selected')) === true ? ' checked="checked" ' : '';
                //        var text = $(item).attr('text');
                //        var value = $(item).attr('value');
                //        $elem.append("<div><input " + disabled + selected + "' value='" + value + "' name='checkbox' type='checkbox'></input><span>" + text + "</span></div>");
                //    });
                //} else
                if ($elem.is('input')) {
                    // special behaviour for checkbox input
                    if ($elem.is(":checkbox") || $elem.is(":radio")) {
                        $elem.addClass('checkbox');
                        var checkedValue = $elem.attr("checkedValue") ? $elem.attr("checkedValue") : 1;

                        if (value == checkedValue) {
                            $elem.prop("checked", true);
                        } else {
                            $elem.prop("checked", false);
                        }
                    } else {
                        $elem.val(value);
                    }

                    // if the field is disabled apply the disabled attribute and style
                    if (allAttrs["disabled"] === true) {
                        $elem.attr('disabled', true);
                        $elem.addClass('readonlyInput');
                    } else {
                        $elem.removeAttr('disabled');
                        $elem.removeClass('readonlyInput');
                    }
                } else if ($elem.is('textarea')) {
                    $elem.val(value);
                } else {
                    /* if value is empty put an unbreakable space instead */
                    $elem.html(value || '&nbsp;');
                }
            }
        }

        return elem;
    };
});
