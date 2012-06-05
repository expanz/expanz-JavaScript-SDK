function pop(ary, map) { // , name, key ) {

	for ( var i = 0; i < ary.length; i++) {
		if (_.reduce(map, function(memo, key) {
			return memo && (map.key === ary[i].key);
		}, true)) {
			var found = ary[i];
			ary.remove(i);
			return found;
		}
	}
	return null;
}

//function isVisibleOnScreen(elem) {
//   var $window = $(window)
//   var viewport_top = $window.scrollTop()
//   var viewport_height = $window.height()
//   var viewport_bottom = viewport_top + viewport_height
//   var $elem = $(elem)
//   var top = $elem.offset().top
//   var height = $elem.height()
//   var bottom = top + height
//
//   return (top >= viewport_top && top < viewport_bottom) ||
//          (bottom > viewport_top && bottom <= viewport_bottom) ||
//          (height > viewport_height && top <= viewport_top && bottom >= viewport_bottom)
// }


function escapeBadCharForURL(data){
	if(!data) return "";
	var escapedStr = data.replace(/\//g,' ');
	escapedStr = escapedStr.replace(/\+/g,' ');
	escapedStr = escapedStr.replace(/#/g,' ');
	escapedStr = escapedStr.replace(/%/g,' ');
	return escapedStr;
}

function getObjectSortAscendingFunction(attribute) {
	return function(a, b) {
		var nameA = a[attribute].toLowerCase();
		var nameB = b[attribute].toLowerCase();
		if (nameA < nameB) // sort string ascending
			return -1
		if (nameA > nameB)
			return 1
		return 0 // default return value (no sorting)
	};
}

function addPlaceHolderCapabilities() {
	if (!Modernizr.input.placeholder) {

		$('[placeholder]').focus(function() {
			var i = $(this);
			if (i.val() == i.attr('placeholder')) {
				i.val('').removeClass('placeholder');
				if (i.hasClass('password')) {
					i.removeClass('password');
					if (!$.browser.msie || ($.browser.msie && $.browser.version.substr(0, 1) > 8)) {
						this.type = 'password';
					}
				}
			}
		}).blur(function() {
			var i = $(this);
			if (i.val() === '' || i.val() == i.attr('placeholder')) {
				if (this.type == 'password') {
					i.addClass('password');
					if (!$.browser.msie || ($.browser.msie && $.browser.version.substr(0, 1) > 8)) {
						this.type = 'text';
					}
				}
				i.addClass('placeholder').val(i.attr('placeholder'));
			}
		}).blur().parents('form').submit(function() {
			$(this).find('[placeholder]').each(function() {
				var i = $(this);
				if (i.val() == i.attr('placeholder'))
					i.val('');
			});
		});

	}
}

function eliminateDuplicates(arr) {
	var i, len = arr.length, out = [], obj = {};
	for (i = 0; i < len; i++) {
		obj[arr[i]] = 0;
	}
	for (i in obj) {
		out.push(i);
	}
	return out;
}

String.prototype.splice = function( idx, rem, s ) {
   return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};


// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

Array.prototype.clone = function() {
	return JSON.parse(JSON.stringify(this));
};

if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(elt /* , from */) {
		var len = this.length;

		var from = Number(arguments[1]) || 0;
		from = (from < 0) ? Math.ceil(from) : Math.floor(from);
		if (from < 0)
			from += len;

		for (; from < len; from++) {
			if (from in this && this[from] === elt)
				return from;
		}
		return -1;
	};
}

String.prototype.endsWith = function(suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

XMLDocumentsToXMLString = function(xmlDoc) {
	if (window.ActiveXObject) {
		var str = xmlDoc.xml;
		return str;
	}
	// code for Mozilla, Firefox, Opera, etc.
	else {
		var str = (new XMLSerializer()).serializeToString(xmlDoc);
		return str;
	}
};

boolValue = function(val) {
	if (val === null || val === undefined || val.length === 0)
		return false;
	val = val.toUpperCase();
	if (val == "1" || val == "TRUE" || val == "Y" || val == "YES" || val == "ON" || val == "1.00" || val == "ENABLED")
		return true;
	return false;
};

boolString = function(val) {
	if (val)
		return "1";
	else
		return "0";
};

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

isImageValid = function(imagePath) {
	if (!imagePath)
		return false;

	imagePath = imagePath.replace(/\\/, '/');
	var idx = imagePath.lastIndexOf(".");
	if (idx >= 0) {
		imagePath = imagePath.substring(idx);
		if (imagePath.indexOf("/") > 0)
			return false;
		return true;
	}

	return false;
};

Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key))
			size++;
	}
	return size;
};

function getQueryParameterByName(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.search);
	if (results === null)
		return "";
	else
		return decodeURIComponent(results[1].replace(/\+/g, " "));
}

function loadjscssfile(filename, filetype) {
	if (filetype == "js") { // if filename is a external JavaScript file
		var fileref = document.createElement('script');
		fileref.setAttribute("type", "text/javascript");
		fileref.setAttribute("src", filename);
	}
	else if (filetype == "css") { // if filename is an external CSS file
		var fileref = document.createElement("link");
		fileref.setAttribute("rel", "stylesheet");
		fileref.setAttribute("type", "text/css");
		fileref.setAttribute("href", filename);
	}
	if (typeof fileref != "undefined")
		document.getElementsByTagName("head")[0].appendChild(fileref);
}

/**
 * Center a element with jQuery
 */
jQuery.fn.center = function(params) {

	var options = {

		vertical : true,
		horizontal : true

	};
	op = jQuery.extend(options, params);

	return this.each(function() {

		// initializing variables
		var $self = jQuery(this);
		// get the dimensions using dimensions plugin
		var width = $self.width();
		var height = $self.height();
		// get the paddings
		var paddingTop = parseInt($self.css("padding-top"));
		var paddingBottom = parseInt($self.css("padding-bottom"));
		// get the borders
		var borderTop = parseInt($self.css("border-top-width"));
		var borderBottom = parseInt($self.css("border-bottom-width"));
		// get the media of padding and borders
		var mediaBorder = (borderTop + borderBottom) / 2;
		var mediaPadding = (paddingTop + paddingBottom) / 2;
		// get the type of positioning
		var positionType = $self.parent().css("position");
		// get the half minus of width and height
		var halfWidth = (width / 2) * (-1);
		var halfHeight = ((height / 2) * (-1)) - mediaPadding - mediaBorder;
		// initializing the css properties
		var cssProp = {
			position : 'absolute'
		};

		if (op.vertical) {
			cssProp.height = height;
			cssProp.top = '50%';
			cssProp.marginTop = halfHeight;
		}
		if (op.horizontal) {
			cssProp.width = width;
			cssProp.left = '50%';
			cssProp.marginLeft = halfWidth;
		}
		// check the current position
		if (positionType == 'static') {
			$self.parent().css("position", "relative");
		}
		// aplying the css
		$self.css(cssProp);

	});

};

var keyStr = "ABCDEFGHIJKLMNOP" +
             "QRSTUVWXYZabcdef" +
             "ghijklmnopqrstuv" +
             "wxyz0123456789+/" +
             "=";

function encode64(input) {
   var output = "";
   var chr1, chr2, chr3 = "";
   var enc1, enc2, enc3, enc4 = "";
   var i = 0;

   do {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
         enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
         enc4 = 64;
      }

      output = output +
         keyStr.charAt(enc1) +
         keyStr.charAt(enc2) +
         keyStr.charAt(enc3) +
         keyStr.charAt(enc4);
      chr1 = chr2 = chr3 = "";
      enc1 = enc2 = enc3 = enc4 = "";
   } while (i < input.length);

   return output;
}

function decode64(input) {
   var output = "";
   var chr1, chr2, chr3 = "";
   var enc1, enc2, enc3, enc4 = "";
   var i = 0;

   // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
   var base64test = /[^A-Za-z0-9\+\/\=]/g;
   if (base64test.exec(input)) {
      alert("There were invalid base64 characters in the input text.\n" +
            "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
            "Expect errors in decoding.");
   }
   input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

   do {
      enc1 = keyStr.indexOf(input.charAt(i++));
      enc2 = keyStr.indexOf(input.charAt(i++));
      enc3 = keyStr.indexOf(input.charAt(i++));
      enc4 = keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);

      if (enc3 != 64) {
         output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
         output = output + String.fromCharCode(chr3);
      }

      chr1 = chr2 = chr3 = "";
      enc1 = enc2 = enc3 = enc4 = "";

   } while (i < input.length);

   return unescape(output);
}



(function($) {
	$.fn.getAttributes = function() {
		var attributes = {};

		if (!this.length)
			return this;

		$.each(this[0].attributes, function(index, attr) {
			attributes[attr.name] = attr.value;
		});

		return attributes;
	};

	$.fn.vAlign = function(myDefaultHeight) {
		return this.each(function(i) {
			var ah = $(this).height() || myDefaultHeight;
			var ph = $(this).parent().height();
			var mh = Math.ceil((ph - ah) / 2);
			$(this).css('margin-top', mh);
		});
	};
})(jQuery);

/* Adding placeHolder capabilities if not available */
$(function() {

	addPlaceHolderCapabilities();

});
