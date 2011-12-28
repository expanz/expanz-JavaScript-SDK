///
///  Expanz JavaScript SDK
///   js/expanz-login-min.js
///  usage: please refer to http://docs.expanz.com
///

// -- ./js/jquery-1.7.1.js --
/*!
 * jQuery JavaScript Library v1.7.1
 * http://jquery.com/
 *
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Mon Nov 21 21:11:03 2011 -0500
 */
(function(window, undefined) {
	var document = window.document, navigator = window.navigator, location = window.location;
	var jQuery = (function() {
		var jQuery = function(selector, context) {
			return new jQuery.fn.init(selector, context, rootjQuery)
		}, _jQuery = window.jQuery, _$ = window.$, rootjQuery, quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/, rnotwhite = /\S/, trimLeft = /^\s+/, trimRight = /\s+$/, rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/, rvalidchars = /^[\],:{}\s]*$/, rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g, rwebkit = /(webkit)[ \/]([\w.]+)/, ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/, rmsie = /(msie) ([\w.]+)/, rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/, rdashAlpha = /-([a-z]|[0-9])/ig, rmsPrefix = /^-ms-/, fcamelCase = function(all, letter) {
			return (letter + "").toUpperCase()
		}, userAgent = navigator.userAgent, browserMatch, readyList, DOMContentLoaded, toString = Object.prototype.toString, hasOwn = Object.prototype.hasOwnProperty, push = Array.prototype.push, slice = Array.prototype.slice, trim = String.prototype.trim, indexOf = Array.prototype.indexOf, class2type = {};
		jQuery.fn = jQuery.prototype = {
			constructor : jQuery,
			init : function(selector, context, rootjQuery) {
				var match, elem, ret, doc;
				if (!selector) {
					return this
				}
				if (selector.nodeType) {
					this.context = this[0] = selector;
					this.length = 1;
					return this
				}
				if (selector === "body" && !context && document.body) {
					this.context = document;
					this[0] = document.body;
					this.selector = selector;
					this.length = 1;
					return this
				}
				if (typeof selector === "string") {
					if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">" && selector.length >= 3) {
						match = [
							null, selector, null
						]
					} else {
						match = quickExpr.exec(selector)
					}
					if (match && (match[1] || !context)) {
						if (match[1]) {
							context = context instanceof jQuery ? context[0] : context;
							doc = (context ? context.ownerDocument || context : document);
							ret = rsingleTag.exec(selector);
							if (ret) {
								if (jQuery.isPlainObject(context)) {
									selector = [
										document.createElement(ret[1])
									];
									jQuery.fn.attr.call(selector, context, true)
								} else {
									selector = [
										doc.createElement(ret[1])
									]
								}
							} else {
								ret = jQuery.buildFragment([
									match[1]
								], [
									doc
								]);
								selector = (ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment).childNodes
							}
							return jQuery.merge(this, selector)
						} else {
							elem = document.getElementById(match[2]);
							if (elem && elem.parentNode) {
								if (elem.id !== match[2]) {
									return rootjQuery.find(selector)
								}
								this.length = 1;
								this[0] = elem
							}
							this.context = document;
							this.selector = selector;
							return this
						}
					} else {
						if (!context || context.jquery) {
							return (context || rootjQuery).find(selector)
						} else {
							return this.constructor(context).find(selector)
						}
					}
				} else {
					if (jQuery.isFunction(selector)) {
						return rootjQuery.ready(selector)
					}
				}
				if (selector.selector !== undefined) {
					this.selector = selector.selector;
					this.context = selector.context
				}
				return jQuery.makeArray(selector, this)
			},
			selector : "",
			jquery : "1.7.1",
			length : 0,
			size : function() {
				return this.length
			},
			toArray : function() {
				return slice.call(this, 0)
			},
			get : function(num) {
				return num == null ? this.toArray() : (num < 0 ? this[this.length + num] : this[num])
			},
			pushStack : function(elems, name, selector) {
				var ret = this.constructor();
				if (jQuery.isArray(elems)) {
					push.apply(ret, elems)
				} else {
					jQuery.merge(ret, elems)
				}
				ret.prevObject = this;
				ret.context = this.context;
				if (name === "find") {
					ret.selector = this.selector + (this.selector ? " " : "") + selector
				} else {
					if (name) {
						ret.selector = this.selector + "." + name + "(" + selector + ")"
					}
				}
				return ret
			},
			each : function(callback, args) {
				return jQuery.each(this, callback, args)
			},
			ready : function(fn) {
				jQuery.bindReady();
				readyList.add(fn);
				return this
			},
			eq : function(i) {
				i = +i;
				return i === -1 ? this.slice(i) : this.slice(i, i + 1)
			},
			first : function() {
				return this.eq(0)
			},
			last : function() {
				return this.eq(-1)
			},
			slice : function() {
				return this.pushStack(slice.apply(this, arguments), "slice", slice.call(arguments).join(","))
			},
			map : function(callback) {
				return this.pushStack(jQuery.map(this, function(elem, i) {
					return callback.call(elem, i, elem)
				}))
			},
			end : function() {
				return this.prevObject || this.constructor(null)
			},
			push : push,
			sort : [].sort,
			splice : [].splice
		};
		jQuery.fn.init.prototype = jQuery.fn;
		jQuery.extend = jQuery.fn.extend = function() {
			var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
			if (typeof target === "boolean") {
				deep = target;
				target = arguments[1] || {};
				i = 2
			}
			if (typeof target !== "object" && !jQuery.isFunction(target)) {
				target = {}
			}
			if (length === i) {
				target = this;
				--i
			}
			for (; i < length; i++) {
				if ((options = arguments[i]) != null) {
					for (name in options) {
						src = target[name];
						copy = options[name];
						if (target === copy) {
							continue
						}
						if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
							if (copyIsArray) {
								copyIsArray = false;
								clone = src && jQuery.isArray(src) ? src : []
							} else {
								clone = src && jQuery.isPlainObject(src) ? src : {}
							}
							target[name] = jQuery.extend(deep, clone, copy)
						} else {
							if (copy !== undefined) {
								target[name] = copy
							}
						}
					}
				}
			}
			return target
		};
		jQuery.extend({
			noConflict : function(deep) {
				if (window.$ === jQuery) {
					window.$ = _$
				}
				if (deep && window.jQuery === jQuery) {
					window.jQuery = _jQuery
				}
				return jQuery
			},
			isReady : false,
			readyWait : 1,
			holdReady : function(hold) {
				if (hold) {
					jQuery.readyWait++
				} else {
					jQuery.ready(true)
				}
			},
			ready : function(wait) {
				if ((wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady)) {
					if (!document.body) {
						return setTimeout(jQuery.ready, 1)
					}
					jQuery.isReady = true;
					if (wait !== true && --jQuery.readyWait > 0) {
						return
					}
					readyList.fireWith(document, [
						jQuery
					]);
					if (jQuery.fn.trigger) {
						jQuery(document).trigger("ready").off("ready")
					}
				}
			},
			bindReady : function() {
				if (readyList) {
					return
				}
				readyList = jQuery.Callbacks("once memory");
				if (document.readyState === "complete") {
					return setTimeout(jQuery.ready, 1)
				}
				if (document.addEventListener) {
					document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
					window.addEventListener("load", jQuery.ready, false)
				} else {
					if (document.attachEvent) {
						document.attachEvent("onreadystatechange", DOMContentLoaded);
						window.attachEvent("onload", jQuery.ready);
						var toplevel = false;
						try {
							toplevel = window.frameElement == null
						} catch (e) {
						}
						if (document.documentElement.doScroll && toplevel) {
							doScrollCheck()
						}
					}
				}
			},
			isFunction : function(obj) {
				return jQuery.type(obj) === "function"
			},
			isArray : Array.isArray || function(obj) {
				return jQuery.type(obj) === "array"
			},
			isWindow : function(obj) {
				return obj && typeof obj === "object" && "setInterval" in obj
			},
			isNumeric : function(obj) {
				return !isNaN(parseFloat(obj)) && isFinite(obj)
			},
			type : function(obj) {
				return obj == null ? String(obj) : class2type[toString.call(obj)] || "object"
			},
			isPlainObject : function(obj) {
				if (!obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow(obj)) {
					return false
				}
				try {
					if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
						return false
					}
				} catch (e) {
					return false
				}
				var key;
				for (key in obj) {
				}
				return key === undefined || hasOwn.call(obj, key)
			},
			isEmptyObject : function(obj) {
				for ( var name in obj) {
					return false
				}
				return true
			},
			error : function(msg) {
				throw new Error(msg)
			},
			parseJSON : function(data) {
				if (typeof data !== "string" || !data) {
					return null
				}
				data = jQuery.trim(data);
				if (window.JSON && window.JSON.parse) {
					return window.JSON.parse(data)
				}
				if (rvalidchars.test(data.replace(rvalidescape, "@").replace(rvalidtokens, "]").replace(rvalidbraces, ""))) {
					return (new Function("return " + data))()
				}
				jQuery.error("Invalid JSON: " + data)
			},
			parseXML : function(data) {
				var xml, tmp;
				try {
					if (window.DOMParser) {
						tmp = new DOMParser();
						xml = tmp.parseFromString(data, "text/xml")
					} else {
						xml = new ActiveXObject("Microsoft.XMLDOM");
						xml.async = "false";
						xml.loadXML(data)
					}
				} catch (e) {
					xml = undefined
				}
				if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
					jQuery.error("Invalid XML: " + data)
				}
				return xml
			},
			noop : function() {
			},
			globalEval : function(data) {
				if (data && rnotwhite.test(data)) {
					(window.execScript || function(data) {
						window["eval"].call(window, data)
					})(data)
				}
			},
			camelCase : function(string) {
				return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase)
			},
			nodeName : function(elem, name) {
				return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase()
			},
			each : function(object, callback, args) {
				var name, i = 0, length = object.length, isObj = length === undefined || jQuery.isFunction(object);
				if (args) {
					if (isObj) {
						for (name in object) {
							if (callback.apply(object[name], args) === false) {
								break
							}
						}
					} else {
						for (; i < length;) {
							if (callback.apply(object[i++], args) === false) {
								break
							}
						}
					}
				} else {
					if (isObj) {
						for (name in object) {
							if (callback.call(object[name], name, object[name]) === false) {
								break
							}
						}
					} else {
						for (; i < length;) {
							if (callback.call(object[i], i, object[i++]) === false) {
								break
							}
						}
					}
				}
				return object
			},
			trim : trim ? function(text) {
				return text == null ? "" : trim.call(text)
			} : function(text) {
				return text == null ? "" : text.toString().replace(trimLeft, "").replace(trimRight, "")
			},
			makeArray : function(array, results) {
				var ret = results || [];
				if (array != null) {
					var type = jQuery.type(array);
					if (array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow(array)) {
						push.call(ret, array)
					} else {
						jQuery.merge(ret, array)
					}
				}
				return ret
			},
			inArray : function(elem, array, i) {
				var len;
				if (array) {
					if (indexOf) {
						return indexOf.call(array, elem, i)
					}
					len = array.length;
					i = i ? i < 0 ? Math.max(0, len + i) : i : 0;
					for (; i < len; i++) {
						if (i in array && array[i] === elem) {
							return i
						}
					}
				}
				return -1
			},
			merge : function(first, second) {
				var i = first.length, j = 0;
				if (typeof second.length === "number") {
					for ( var l = second.length; j < l; j++) {
						first[i++] = second[j]
					}
				} else {
					while (second[j] !== undefined) {
						first[i++] = second[j++]
					}
				}
				first.length = i;
				return first
			},
			grep : function(elems, callback, inv) {
				var ret = [], retVal;
				inv = !!inv;
				for ( var i = 0, length = elems.length; i < length; i++) {
					retVal = !!callback(elems[i], i);
					if (inv !== retVal) {
						ret.push(elems[i])
					}
				}
				return ret
			},
			map : function(elems, callback, arg) {
				var value, key, ret = [], i = 0, length = elems.length, isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ((length > 0 && elems[0] && elems[length - 1]) || length === 0 || jQuery.isArray(elems));
				if (isArray) {
					for (; i < length; i++) {
						value = callback(elems[i], i, arg);
						if (value != null) {
							ret[ret.length] = value
						}
					}
				} else {
					for (key in elems) {
						value = callback(elems[key], key, arg);
						if (value != null) {
							ret[ret.length] = value
						}
					}
				}
				return ret.concat.apply([], ret)
			},
			guid : 1,
			proxy : function(fn, context) {
				if (typeof context === "string") {
					var tmp = fn[context];
					context = fn;
					fn = tmp
				}
				if (!jQuery.isFunction(fn)) {
					return undefined
				}
				var args = slice.call(arguments, 2), proxy = function() {
					return fn.apply(context, args.concat(slice.call(arguments)))
				};
				proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;
				return proxy
			},
			access : function(elems, key, value, exec, fn, pass) {
				var length = elems.length;
				if (typeof key === "object") {
					for ( var k in key) {
						jQuery.access(elems, k, key[k], exec, fn, value)
					}
					return elems
				}
				if (value !== undefined) {
					exec = !pass && exec && jQuery.isFunction(value);
					for ( var i = 0; i < length; i++) {
						fn(elems[i], key, exec ? value.call(elems[i], i, fn(elems[i], key)) : value, pass)
					}
					return elems
				}
				return length ? fn(elems[0], key) : undefined
			},
			now : function() {
				return (new Date()).getTime()
			},
			uaMatch : function(ua) {
				ua = ua.toLowerCase();
				var match = rwebkit.exec(ua) || ropera.exec(ua) || rmsie.exec(ua) || ua.indexOf("compatible") < 0 && rmozilla.exec(ua) || [];
				return {
					browser : match[1] || "",
					version : match[2] || "0"
				}
			},
			sub : function() {
				function jQuerySub(selector, context) {
					return new jQuerySub.fn.init(selector, context)
				}
				jQuery.extend(true, jQuerySub, this);
				jQuerySub.superclass = this;
				jQuerySub.fn = jQuerySub.prototype = this();
				jQuerySub.fn.constructor = jQuerySub;
				jQuerySub.sub = this.sub;
				jQuerySub.fn.init = function init(selector, context) {
					if (context && context instanceof jQuery && !(context instanceof jQuerySub)) {
						context = jQuerySub(context)
					}
					return jQuery.fn.init.call(this, selector, context, rootjQuerySub)
				};
				jQuerySub.fn.init.prototype = jQuerySub.fn;
				var rootjQuerySub = jQuerySub(document);
				return jQuerySub
			},
			browser : {}
		});
		jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
			class2type["[object " + name + "]"] = name.toLowerCase()
		});
		browserMatch = jQuery.uaMatch(userAgent);
		if (browserMatch.browser) {
			jQuery.browser[browserMatch.browser] = true;
			jQuery.browser.version = browserMatch.version
		}
		if (jQuery.browser.webkit) {
			jQuery.browser.safari = true
		}
		if (rnotwhite.test("\xA0")) {
			trimLeft = /^[\s\xA0]+/;
			trimRight = /[\s\xA0]+$/
		}
		rootjQuery = jQuery(document);
		if (document.addEventListener) {
			DOMContentLoaded = function() {
				document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
				jQuery.ready()
			}
		} else {
			if (document.attachEvent) {
				DOMContentLoaded = function() {
					if (document.readyState === "complete") {
						document.detachEvent("onreadystatechange", DOMContentLoaded);
						jQuery.ready()
					}
				}
			}
		}
		function doScrollCheck() {
			if (jQuery.isReady) {
				return
			}
			try {
				document.documentElement.doScroll("left")
			} catch (e) {
				setTimeout(doScrollCheck, 1);
				return
			}
			jQuery.ready()
		}
		return jQuery
	})();
	var flagsCache = {};
	function createFlags(flags) {
		var object = flagsCache[flags] = {}, i, length;
		flags = flags.split(/\s+/);
		for (i = 0, length = flags.length; i < length; i++) {
			object[flags[i]] = true
		}
		return object
	}
	jQuery.Callbacks = function(flags) {
		flags = flags ? (flagsCache[flags] || createFlags(flags)) : {};
		var list = [], stack = [], memory, firing, firingStart, firingLength, firingIndex, add = function(args) {
			var i, length, elem, type, actual;
			for (i = 0, length = args.length; i < length; i++) {
				elem = args[i];
				type = jQuery.type(elem);
				if (type === "array") {
					add(elem)
				} else {
					if (type === "function") {
						if (!flags.unique || !self.has(elem)) {
							list.push(elem)
						}
					}
				}
			}
		}, fire = function(context, args) {
			args = args || [];
			memory = !flags.memory || [
				context, args
			];
			firing = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			for (; list && firingIndex < firingLength; firingIndex++) {
				if (list[firingIndex].apply(context, args) === false && flags.stopOnFalse) {
					memory = true;
					break
				}
			}
			firing = false;
			if (list) {
				if (!flags.once) {
					if (stack && stack.length) {
						memory = stack.shift();
						self.fireWith(memory[0], memory[1])
					}
				} else {
					if (memory === true) {
						self.disable()
					} else {
						list = []
					}
				}
			}
		}, self = {
			add : function() {
				if (list) {
					var length = list.length;
					add(arguments);
					if (firing) {
						firingLength = list.length
					} else {
						if (memory && memory !== true) {
							firingStart = length;
							fire(memory[0], memory[1])
						}
					}
				}
				return this
			},
			remove : function() {
				if (list) {
					var args = arguments, argIndex = 0, argLength = args.length;
					for (; argIndex < argLength; argIndex++) {
						for ( var i = 0; i < list.length; i++) {
							if (args[argIndex] === list[i]) {
								if (firing) {
									if (i <= firingLength) {
										firingLength--;
										if (i <= firingIndex) {
											firingIndex--
										}
									}
								}
								list.splice(i--, 1);
								if (flags.unique) {
									break
								}
							}
						}
					}
				}
				return this
			},
			has : function(fn) {
				if (list) {
					var i = 0, length = list.length;
					for (; i < length; i++) {
						if (fn === list[i]) {
							return true
						}
					}
				}
				return false
			},
			empty : function() {
				list = [];
				return this
			},
			disable : function() {
				list = stack = memory = undefined;
				return this
			},
			disabled : function() {
				return !list
			},
			lock : function() {
				stack = undefined;
				if (!memory || memory === true) {
					self.disable()
				}
				return this
			},
			locked : function() {
				return !stack
			},
			fireWith : function(context, args) {
				if (stack) {
					if (firing) {
						if (!flags.once) {
							stack.push([
								context, args
							])
						}
					} else {
						if (!(flags.once && memory)) {
							fire(context, args)
						}
					}
				}
				return this
			},
			fire : function() {
				self.fireWith(this, arguments);
				return this
			},
			fired : function() {
				return !!memory
			}
		};
		return self
	};
	var sliceDeferred = [].slice;
	jQuery.extend({
		Deferred : function(func) {
			var doneList = jQuery.Callbacks("once memory"), failList = jQuery.Callbacks("once memory"), progressList = jQuery.Callbacks("memory"), state = "pending", lists = {
				resolve : doneList,
				reject : failList,
				notify : progressList
			}, promise = {
				done : doneList.add,
				fail : failList.add,
				progress : progressList.add,
				state : function() {
					return state
				},
				isResolved : doneList.fired,
				isRejected : failList.fired,
				then : function(doneCallbacks, failCallbacks, progressCallbacks) {
					deferred.done(doneCallbacks).fail(failCallbacks).progress(progressCallbacks);
					return this
				},
				always : function() {
					deferred.done.apply(deferred, arguments).fail.apply(deferred, arguments);
					return this
				},
				pipe : function(fnDone, fnFail, fnProgress) {
					return jQuery.Deferred(function(newDefer) {
						jQuery.each({
							done : [
								fnDone, "resolve"
							],
							fail : [
								fnFail, "reject"
							],
							progress : [
								fnProgress, "notify"
							]
						}, function(handler, data) {
							var fn = data[0], action = data[1], returned;
							if (jQuery.isFunction(fn)) {
								deferred[handler](function() {
									returned = fn.apply(this, arguments);
									if (returned && jQuery.isFunction(returned.promise)) {
										returned.promise().then(newDefer.resolve, newDefer.reject, newDefer.notify)
									} else {
										newDefer[action + "With"](this === deferred ? newDefer : this, [
											returned
										])
									}
								})
							} else {
								deferred[handler](newDefer[action])
							}
						})
					}).promise()
				},
				promise : function(obj) {
					if (obj == null) {
						obj = promise
					} else {
						for ( var key in promise) {
							obj[key] = promise[key]
						}
					}
					return obj
				}
			}, deferred = promise.promise({}), key;
			for (key in lists) {
				deferred[key] = lists[key].fire;
				deferred[key + "With"] = lists[key].fireWith
			}
			deferred.done(function() {
				state = "resolved"
			}, failList.disable, progressList.lock).fail(function() {
				state = "rejected"
			}, doneList.disable, progressList.lock);
			if (func) {
				func.call(deferred, deferred)
			}
			return deferred
		},
		when : function(firstParam) {
			var args = sliceDeferred.call(arguments, 0), i = 0, length = args.length, pValues = new Array(length), count = length, pCount = length, deferred = length <= 1 && firstParam && jQuery.isFunction(firstParam.promise) ? firstParam : jQuery.Deferred(), promise = deferred.promise();
			function resolveFunc(i) {
				return function(value) {
					args[i] = arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value;
					if (!(--count)) {
						deferred.resolveWith(deferred, args)
					}
				}
			}
			function progressFunc(i) {
				return function(value) {
					pValues[i] = arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value;
					deferred.notifyWith(promise, pValues)
				}
			}
			if (length > 1) {
				for (; i < length; i++) {
					if (args[i] && args[i].promise && jQuery.isFunction(args[i].promise)) {
						args[i].promise().then(resolveFunc(i), deferred.reject, progressFunc(i))
					} else {
						--count
					}
				}
				if (!count) {
					deferred.resolveWith(deferred, args)
				}
			} else {
				if (deferred !== firstParam) {
					deferred.resolveWith(deferred, length ? [
						firstParam
					] : [])
				}
			}
			return promise
		}
	});
	jQuery.support = (function() {
		var support, all, a, select, opt, input, marginDiv, fragment, tds, events, eventName, i, isSupported, div = document.createElement("div"), documentElement = document.documentElement;
		div.setAttribute("className", "t");
		div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
		all = div.getElementsByTagName("*");
		a = div.getElementsByTagName("a")[0];
		if (!all || !all.length || !a) {
			return {}
		}
		select = document.createElement("select");
		opt = select.appendChild(document.createElement("option"));
		input = div.getElementsByTagName("input")[0];
		support = {
			leadingWhitespace : (div.firstChild.nodeType === 3),
			tbody : !div.getElementsByTagName("tbody").length,
			htmlSerialize : !!div.getElementsByTagName("link").length,
			style : /top/.test(a.getAttribute("style")),
			hrefNormalized : (a.getAttribute("href") === "/a"),
			opacity : /^0.55/.test(a.style.opacity),
			cssFloat : !!a.style.cssFloat,
			checkOn : (input.value === "on"),
			optSelected : opt.selected,
			getSetAttribute : div.className !== "t",
			enctype : !!document.createElement("form").enctype,
			html5Clone : document.createElement("nav").cloneNode(true).outerHTML !== "<:nav></:nav>",
			submitBubbles : true,
			changeBubbles : true,
			focusinBubbles : false,
			deleteExpando : true,
			noCloneEvent : true,
			inlineBlockNeedsLayout : false,
			shrinkWrapBlocks : false,
			reliableMarginRight : true
		};
		input.checked = true;
		support.noCloneChecked = input.cloneNode(true).checked;
		select.disabled = true;
		support.optDisabled = !opt.disabled;
		try {
			delete div.test
		} catch (e) {
			support.deleteExpando = false
		}
		if (!div.addEventListener && div.attachEvent && div.fireEvent) {
			div.attachEvent("onclick", function() {
				support.noCloneEvent = false
			});
			div.cloneNode(true).fireEvent("onclick")
		}
		input = document.createElement("input");
		input.value = "t";
		input.setAttribute("type", "radio");
		support.radioValue = input.value === "t";
		input.setAttribute("checked", "checked");
		div.appendChild(input);
		fragment = document.createDocumentFragment();
		fragment.appendChild(div.lastChild);
		support.checkClone = fragment.cloneNode(true).cloneNode(true).lastChild.checked;
		support.appendChecked = input.checked;
		fragment.removeChild(input);
		fragment.appendChild(div);
		div.innerHTML = "";
		if (window.getComputedStyle) {
			marginDiv = document.createElement("div");
			marginDiv.style.width = "0";
			marginDiv.style.marginRight = "0";
			div.style.width = "2px";
			div.appendChild(marginDiv);
			support.reliableMarginRight = (parseInt((window.getComputedStyle(marginDiv, null) || {
				marginRight : 0
			}).marginRight, 10) || 0) === 0
		}
		if (div.attachEvent) {
			for (i in {
				submit : 1,
				change : 1,
				focusin : 1
			}) {
				eventName = "on" + i;
				isSupported = (eventName in div);
				if (!isSupported) {
					div.setAttribute(eventName, "return;");
					isSupported = (typeof div[eventName] === "function")
				}
				support[i + "Bubbles"] = isSupported
			}
		}
		fragment.removeChild(div);
		fragment = select = opt = marginDiv = div = input = null;
		jQuery(function() {
			var container, outer, inner, table, td, offsetSupport, conMarginTop, ptlm, vb, style, html, body = document.getElementsByTagName("body")[0];
			if (!body) {
				return
			}
			conMarginTop = 1;
			ptlm = "position:absolute;top:0;left:0;width:1px;height:1px;margin:0;";
			vb = "visibility:hidden;border:0;";
			style = "style='" + ptlm + "border:5px solid #000;padding:0;'";
			html = "<div " + style + "><div></div></div><table " + style + " cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";
			container = document.createElement("div");
			container.style.cssText = vb + "width:0;height:0;position:static;top:0;margin-top:" + conMarginTop + "px";
			body.insertBefore(container, body.firstChild);
			div = document.createElement("div");
			container.appendChild(div);
			div.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
			tds = div.getElementsByTagName("td");
			isSupported = (tds[0].offsetHeight === 0);
			tds[0].style.display = "";
			tds[1].style.display = "none";
			support.reliableHiddenOffsets = isSupported && (tds[0].offsetHeight === 0);
			div.innerHTML = "";
			div.style.width = div.style.paddingLeft = "1px";
			jQuery.boxModel = support.boxModel = div.offsetWidth === 2;
			if (typeof div.style.zoom !== "undefined") {
				div.style.display = "inline";
				div.style.zoom = 1;
				support.inlineBlockNeedsLayout = (div.offsetWidth === 2);
				div.style.display = "";
				div.innerHTML = "<div style='width:4px;'></div>";
				support.shrinkWrapBlocks = (div.offsetWidth !== 2)
			}
			div.style.cssText = ptlm + vb;
			div.innerHTML = html;
			outer = div.firstChild;
			inner = outer.firstChild;
			td = outer.nextSibling.firstChild.firstChild;
			offsetSupport = {
				doesNotAddBorder : (inner.offsetTop !== 5),
				doesAddBorderForTableAndCells : (td.offsetTop === 5)
			};
			inner.style.position = "fixed";
			inner.style.top = "20px";
			offsetSupport.fixedPosition = (inner.offsetTop === 20 || inner.offsetTop === 15);
			inner.style.position = inner.style.top = "";
			outer.style.overflow = "hidden";
			outer.style.position = "relative";
			offsetSupport.subtractsBorderForOverflowNotVisible = (inner.offsetTop === -5);
			offsetSupport.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== conMarginTop);
			body.removeChild(container);
			div = container = null;
			jQuery.extend(support, offsetSupport)
		});
		return support
	})();
	var rbrace = /^(?:\{.*\}|\[.*\])$/, rmultiDash = /([A-Z])/g;
	jQuery.extend({
		cache : {},
		uuid : 0,
		expando : "jQuery" + (jQuery.fn.jquery + Math.random()).replace(/\D/g, ""),
		noData : {
			embed : true,
			object : "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
			applet : true
		},
		hasData : function(elem) {
			elem = elem.nodeType ? jQuery.cache[elem[jQuery.expando]] : elem[jQuery.expando];
			return !!elem && !isEmptyDataObject(elem)
		},
		data : function(elem, name, data, pvt) {
			if (!jQuery.acceptData(elem)) {
				return
			}
			var privateCache, thisCache, ret, internalKey = jQuery.expando, getByName = typeof name === "string", isNode = elem.nodeType, cache = isNode ? jQuery.cache : elem, id = isNode ? elem[internalKey] : elem[internalKey] && internalKey, isEvents = name === "events";
			if ((!id || !cache[id] || (!isEvents && !pvt && !cache[id].data)) && getByName && data === undefined) {
				return
			}
			if (!id) {
				if (isNode) {
					elem[internalKey] = id = ++jQuery.uuid
				} else {
					id = internalKey
				}
			}
			if (!cache[id]) {
				cache[id] = {};
				if (!isNode) {
					cache[id].toJSON = jQuery.noop
				}
			}
			if (typeof name === "object" || typeof name === "function") {
				if (pvt) {
					cache[id] = jQuery.extend(cache[id], name)
				} else {
					cache[id].data = jQuery.extend(cache[id].data, name)
				}
			}
			privateCache = thisCache = cache[id];
			if (!pvt) {
				if (!thisCache.data) {
					thisCache.data = {}
				}
				thisCache = thisCache.data
			}
			if (data !== undefined) {
				thisCache[jQuery.camelCase(name)] = data
			}
			if (isEvents && !thisCache[name]) {
				return privateCache.events
			}
			if (getByName) {
				ret = thisCache[name];
				if (ret == null) {
					ret = thisCache[jQuery.camelCase(name)]
				}
			} else {
				ret = thisCache
			}
			return ret
		},
		removeData : function(elem, name, pvt) {
			if (!jQuery.acceptData(elem)) {
				return
			}
			var thisCache, i, l, internalKey = jQuery.expando, isNode = elem.nodeType, cache = isNode ? jQuery.cache : elem, id = isNode ? elem[internalKey] : internalKey;
			if (!cache[id]) {
				return
			}
			if (name) {
				thisCache = pvt ? cache[id] : cache[id].data;
				if (thisCache) {
					if (!jQuery.isArray(name)) {
						if (name in thisCache) {
							name = [
								name
							]
						} else {
							name = jQuery.camelCase(name);
							if (name in thisCache) {
								name = [
									name
								]
							} else {
								name = name.split(" ")
							}
						}
					}
					for (i = 0, l = name.length; i < l; i++) {
						delete thisCache[name[i]]
					}
					if (!(pvt ? isEmptyDataObject : jQuery.isEmptyObject)(thisCache)) {
						return
					}
				}
			}
			if (!pvt) {
				delete cache[id].data;
				if (!isEmptyDataObject(cache[id])) {
					return
				}
			}
			if (jQuery.support.deleteExpando || !cache.setInterval) {
				delete cache[id]
			} else {
				cache[id] = null
			}
			if (isNode) {
				if (jQuery.support.deleteExpando) {
					delete elem[internalKey]
				} else {
					if (elem.removeAttribute) {
						elem.removeAttribute(internalKey)
					} else {
						elem[internalKey] = null
					}
				}
			}
		},
		_data : function(elem, name, data) {
			return jQuery.data(elem, name, data, true)
		},
		acceptData : function(elem) {
			if (elem.nodeName) {
				var match = jQuery.noData[elem.nodeName.toLowerCase()];
				if (match) {
					return !(match === true || elem.getAttribute("classid") !== match)
				}
			}
			return true
		}
	});
	jQuery.fn.extend({
		data : function(key, value) {
			var parts, attr, name, data = null;
			if (typeof key === "undefined") {
				if (this.length) {
					data = jQuery.data(this[0]);
					if (this[0].nodeType === 1 && !jQuery._data(this[0], "parsedAttrs")) {
						attr = this[0].attributes;
						for ( var i = 0, l = attr.length; i < l; i++) {
							name = attr[i].name;
							if (name.indexOf("data-") === 0) {
								name = jQuery.camelCase(name.substring(5));
								dataAttr(this[0], name, data[name])
							}
						}
						jQuery._data(this[0], "parsedAttrs", true)
					}
				}
				return data
			} else {
				if (typeof key === "object") {
					return this.each(function() {
						jQuery.data(this, key)
					})
				}
			}
			parts = key.split(".");
			parts[1] = parts[1] ? "." + parts[1] : "";
			if (value === undefined) {
				data = this.triggerHandler("getData" + parts[1] + "!", [
					parts[0]
				]);
				if (data === undefined && this.length) {
					data = jQuery.data(this[0], key);
					data = dataAttr(this[0], key, data)
				}
				return data === undefined && parts[1] ? this.data(parts[0]) : data
			} else {
				return this.each(function() {
					var self = jQuery(this), args = [
						parts[0], value
					];
					self.triggerHandler("setData" + parts[1] + "!", args);
					jQuery.data(this, key, value);
					self.triggerHandler("changeData" + parts[1] + "!", args)
				})
			}
		},
		removeData : function(key) {
			return this.each(function() {
				jQuery.removeData(this, key)
			})
		}
	});
	function dataAttr(elem, key, data) {
		if (data === undefined && elem.nodeType === 1) {
			var name = "data-" + key.replace(rmultiDash, "-$1").toLowerCase();
			data = elem.getAttribute(name);
			if (typeof data === "string") {
				try {
					data = data === "true" ? true : data === "false" ? false : data === "null" ? null : jQuery.isNumeric(data) ? parseFloat(data) : rbrace.test(data) ? jQuery.parseJSON(data) : data
				} catch (e) {
				}
				jQuery.data(elem, key, data)
			} else {
				data = undefined
			}
		}
		return data
	}
	function isEmptyDataObject(obj) {
		for ( var name in obj) {
			if (name === "data" && jQuery.isEmptyObject(obj[name])) {
				continue
			}
			if (name !== "toJSON") {
				return false
			}
		}
		return true
	}
	function handleQueueMarkDefer(elem, type, src) {
		var deferDataKey = type + "defer", queueDataKey = type + "queue", markDataKey = type + "mark", defer = jQuery._data(elem, deferDataKey);
		if (defer && (src === "queue" || !jQuery._data(elem, queueDataKey)) && (src === "mark" || !jQuery._data(elem, markDataKey))) {
			setTimeout(function() {
				if (!jQuery._data(elem, queueDataKey) && !jQuery._data(elem, markDataKey)) {
					jQuery.removeData(elem, deferDataKey, true);
					defer.fire()
				}
			}, 0)
		}
	}
	jQuery.extend({
		_mark : function(elem, type) {
			if (elem) {
				type = (type || "fx") + "mark";
				jQuery._data(elem, type, (jQuery._data(elem, type) || 0) + 1)
			}
		},
		_unmark : function(force, elem, type) {
			if (force !== true) {
				type = elem;
				elem = force;
				force = false
			}
			if (elem) {
				type = type || "fx";
				var key = type + "mark", count = force ? 0 : ((jQuery._data(elem, key) || 1) - 1);
				if (count) {
					jQuery._data(elem, key, count)
				} else {
					jQuery.removeData(elem, key, true);
					handleQueueMarkDefer(elem, type, "mark")
				}
			}
		},
		queue : function(elem, type, data) {
			var q;
			if (elem) {
				type = (type || "fx") + "queue";
				q = jQuery._data(elem, type);
				if (data) {
					if (!q || jQuery.isArray(data)) {
						q = jQuery._data(elem, type, jQuery.makeArray(data))
					} else {
						q.push(data)
					}
				}
				return q || []
			}
		},
		dequeue : function(elem, type) {
			type = type || "fx";
			var queue = jQuery.queue(elem, type), fn = queue.shift(), hooks = {};
			if (fn === "inprogress") {
				fn = queue.shift()
			}
			if (fn) {
				if (type === "fx") {
					queue.unshift("inprogress")
				}
				jQuery._data(elem, type + ".run", hooks);
				fn.call(elem, function() {
					jQuery.dequeue(elem, type)
				}, hooks)
			}
			if (!queue.length) {
				jQuery.removeData(elem, type + "queue " + type + ".run", true);
				handleQueueMarkDefer(elem, type, "queue")
			}
		}
	});
	jQuery.fn.extend({
		queue : function(type, data) {
			if (typeof type !== "string") {
				data = type;
				type = "fx"
			}
			if (data === undefined) {
				return jQuery.queue(this[0], type)
			}
			return this.each(function() {
				var queue = jQuery.queue(this, type, data);
				if (type === "fx" && queue[0] !== "inprogress") {
					jQuery.dequeue(this, type)
				}
			})
		},
		dequeue : function(type) {
			return this.each(function() {
				jQuery.dequeue(this, type)
			})
		},
		delay : function(time, type) {
			time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
			type = type || "fx";
			return this.queue(type, function(next, hooks) {
				var timeout = setTimeout(next, time);
				hooks.stop = function() {
					clearTimeout(timeout)
				}
			})
		},
		clearQueue : function(type) {
			return this.queue(type || "fx", [])
		},
		promise : function(type, object) {
			if (typeof type !== "string") {
				object = type;
				type = undefined
			}
			type = type || "fx";
			var defer = jQuery.Deferred(), elements = this, i = elements.length, count = 1, deferDataKey = type + "defer", queueDataKey = type + "queue", markDataKey = type + "mark", tmp;
			function resolve() {
				if (!(--count)) {
					defer.resolveWith(elements, [
						elements
					])
				}
			}
			while (i--) {
				if ((tmp = jQuery.data(elements[i], deferDataKey, undefined, true) || (jQuery.data(elements[i], queueDataKey, undefined, true) || jQuery.data(elements[i], markDataKey, undefined, true)) && jQuery.data(elements[i], deferDataKey, jQuery.Callbacks("once memory"), true))) {
					count++;
					tmp.add(resolve)
				}
			}
			resolve();
			return defer.promise()
		}
	});
	var rclass = /[\n\t\r]/g, rspace = /\s+/, rreturn = /\r/g, rtype = /^(?:button|input)$/i, rfocusable = /^(?:button|input|object|select|textarea)$/i, rclickable = /^a(?:rea)?$/i, rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i, getSetAttribute = jQuery.support.getSetAttribute, nodeHook, boolHook, fixSpecified;
	jQuery.fn.extend({
		attr : function(name, value) {
			return jQuery.access(this, name, value, true, jQuery.attr)
		},
		removeAttr : function(name) {
			return this.each(function() {
				jQuery.removeAttr(this, name)
			})
		},
		prop : function(name, value) {
			return jQuery.access(this, name, value, true, jQuery.prop)
		},
		removeProp : function(name) {
			name = jQuery.propFix[name] || name;
			return this.each(function() {
				try {
					this[name] = undefined;
					delete this[name]
				} catch (e) {
				}
			})
		},
		addClass : function(value) {
			var classNames, i, l, elem, setClass, c, cl;
			if (jQuery.isFunction(value)) {
				return this.each(function(j) {
					jQuery(this).addClass(value.call(this, j, this.className))
				})
			}
			if (value && typeof value === "string") {
				classNames = value.split(rspace);
				for (i = 0, l = this.length; i < l; i++) {
					elem = this[i];
					if (elem.nodeType === 1) {
						if (!elem.className && classNames.length === 1) {
							elem.className = value
						} else {
							setClass = " " + elem.className + " ";
							for (c = 0, cl = classNames.length; c < cl; c++) {
								if (!~setClass.indexOf(" " + classNames[c] + " ")) {
									setClass += classNames[c] + " "
								}
							}
							elem.className = jQuery.trim(setClass)
						}
					}
				}
			}
			return this
		},
		removeClass : function(value) {
			var classNames, i, l, elem, className, c, cl;
			if (jQuery.isFunction(value)) {
				return this.each(function(j) {
					jQuery(this).removeClass(value.call(this, j, this.className))
				})
			}
			if ((value && typeof value === "string") || value === undefined) {
				classNames = (value || "").split(rspace);
				for (i = 0, l = this.length; i < l; i++) {
					elem = this[i];
					if (elem.nodeType === 1 && elem.className) {
						if (value) {
							className = (" " + elem.className + " ").replace(rclass, " ");
							for (c = 0, cl = classNames.length; c < cl; c++) {
								className = className.replace(" " + classNames[c] + " ", " ")
							}
							elem.className = jQuery.trim(className)
						} else {
							elem.className = ""
						}
					}
				}
			}
			return this
		},
		toggleClass : function(value, stateVal) {
			var type = typeof value, isBool = typeof stateVal === "boolean";
			if (jQuery.isFunction(value)) {
				return this.each(function(i) {
					jQuery(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal)
				})
			}
			return this.each(function() {
				if (type === "string") {
					var className, i = 0, self = jQuery(this), state = stateVal, classNames = value.split(rspace);
					while ((className = classNames[i++])) {
						state = isBool ? state : !self.hasClass(className);
						self[state ? "addClass" : "removeClass"](className)
					}
				} else {
					if (type === "undefined" || type === "boolean") {
						if (this.className) {
							jQuery._data(this, "__className__", this.className)
						}
						this.className = this.className || value === false ? "" : jQuery._data(this, "__className__") || ""
					}
				}
			})
		},
		hasClass : function(selector) {
			var className = " " + selector + " ", i = 0, l = this.length;
			for (; i < l; i++) {
				if (this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf(className) > -1) {
					return true
				}
			}
			return false
		},
		val : function(value) {
			var hooks, ret, isFunction, elem = this[0];
			if (!arguments.length) {
				if (elem) {
					hooks = jQuery.valHooks[elem.nodeName.toLowerCase()] || jQuery.valHooks[elem.type];
					if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== undefined) {
						return ret
					}
					ret = elem.value;
					return typeof ret === "string" ? ret.replace(rreturn, "") : ret == null ? "" : ret
				}
				return
			}
			isFunction = jQuery.isFunction(value);
			return this.each(function(i) {
				var self = jQuery(this), val;
				if (this.nodeType !== 1) {
					return
				}
				if (isFunction) {
					val = value.call(this, i, self.val())
				} else {
					val = value
				}
				if (val == null) {
					val = ""
				} else {
					if (typeof val === "number") {
						val += ""
					} else {
						if (jQuery.isArray(val)) {
							val = jQuery.map(val, function(value) {
								return value == null ? "" : value + ""
							})
						}
					}
				}
				hooks = jQuery.valHooks[this.nodeName.toLowerCase()] || jQuery.valHooks[this.type];
				if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === undefined) {
					this.value = val
				}
			})
		}
	});
	jQuery.extend({
		valHooks : {
			option : {
				get : function(elem) {
					var val = elem.attributes.value;
					return !val || val.specified ? elem.value : elem.text
				}
			},
			select : {
				get : function(elem) {
					var value, i, max, option, index = elem.selectedIndex, values = [], options = elem.options, one = elem.type === "select-one";
					if (index < 0) {
						return null
					}
					i = one ? index : 0;
					max = one ? index + 1 : options.length;
					for (; i < max; i++) {
						option = options[i];
						if (option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) && (!option.parentNode.disabled || !jQuery.nodeName(option.parentNode, "optgroup"))) {
							value = jQuery(option).val();
							if (one) {
								return value
							}
							values.push(value)
						}
					}
					if (one && !values.length && options.length) {
						return jQuery(options[index]).val()
					}
					return values
				},
				set : function(elem, value) {
					var values = jQuery.makeArray(value);
					jQuery(elem).find("option").each(function() {
						this.selected = jQuery.inArray(jQuery(this).val(), values) >= 0
					});
					if (!values.length) {
						elem.selectedIndex = -1
					}
					return values
				}
			}
		},
		attrFn : {
			val : true,
			css : true,
			html : true,
			text : true,
			data : true,
			width : true,
			height : true,
			offset : true
		},
		attr : function(elem, name, value, pass) {
			var ret, hooks, notxml, nType = elem.nodeType;
			if (!elem || nType === 3 || nType === 8 || nType === 2) {
				return
			}
			if (pass && name in jQuery.attrFn) {
				return jQuery(elem)[name](value)
			}
			if (typeof elem.getAttribute === "undefined") {
				return jQuery.prop(elem, name, value)
			}
			notxml = nType !== 1 || !jQuery.isXMLDoc(elem);
			if (notxml) {
				name = name.toLowerCase();
				hooks = jQuery.attrHooks[name] || (rboolean.test(name) ? boolHook : nodeHook)
			}
			if (value !== undefined) {
				if (value === null) {
					jQuery.removeAttr(elem, name);
					return
				} else {
					if (hooks && "set" in hooks && notxml && (ret = hooks.set(elem, value, name)) !== undefined) {
						return ret
					} else {
						elem.setAttribute(name, "" + value);
						return value
					}
				}
			} else {
				if (hooks && "get" in hooks && notxml && (ret = hooks.get(elem, name)) !== null) {
					return ret
				} else {
					ret = elem.getAttribute(name);
					return ret === null ? undefined : ret
				}
			}
		},
		removeAttr : function(elem, value) {
			var propName, attrNames, name, l, i = 0;
			if (value && elem.nodeType === 1) {
				attrNames = value.toLowerCase().split(rspace);
				l = attrNames.length;
				for (; i < l; i++) {
					name = attrNames[i];
					if (name) {
						propName = jQuery.propFix[name] || name;
						jQuery.attr(elem, name, "");
						elem.removeAttribute(getSetAttribute ? name : propName);
						if (rboolean.test(name) && propName in elem) {
							elem[propName] = false
						}
					}
				}
			}
		},
		attrHooks : {
			type : {
				set : function(elem, value) {
					if (rtype.test(elem.nodeName) && elem.parentNode) {
						jQuery.error("type property can't be changed")
					} else {
						if (!jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input")) {
							var val = elem.value;
							elem.setAttribute("type", value);
							if (val) {
								elem.value = val
							}
							return value
						}
					}
				}
			},
			value : {
				get : function(elem, name) {
					if (nodeHook && jQuery.nodeName(elem, "button")) {
						return nodeHook.get(elem, name)
					}
					return name in elem ? elem.value : null
				},
				set : function(elem, value, name) {
					if (nodeHook && jQuery.nodeName(elem, "button")) {
						return nodeHook.set(elem, value, name)
					}
					elem.value = value
				}
			}
		},
		propFix : {
			tabindex : "tabIndex",
			readonly : "readOnly",
			"for" : "htmlFor",
			"class" : "className",
			maxlength : "maxLength",
			cellspacing : "cellSpacing",
			cellpadding : "cellPadding",
			rowspan : "rowSpan",
			colspan : "colSpan",
			usemap : "useMap",
			frameborder : "frameBorder",
			contenteditable : "contentEditable"
		},
		prop : function(elem, name, value) {
			var ret, hooks, notxml, nType = elem.nodeType;
			if (!elem || nType === 3 || nType === 8 || nType === 2) {
				return
			}
			notxml = nType !== 1 || !jQuery.isXMLDoc(elem);
			if (notxml) {
				name = jQuery.propFix[name] || name;
				hooks = jQuery.propHooks[name]
			}
			if (value !== undefined) {
				if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
					return ret
				} else {
					return (elem[name] = value)
				}
			} else {
				if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
					return ret
				} else {
					return elem[name]
				}
			}
		},
		propHooks : {
			tabIndex : {
				get : function(elem) {
					var attributeNode = elem.getAttributeNode("tabindex");
					return attributeNode && attributeNode.specified ? parseInt(attributeNode.value, 10) : rfocusable.test(elem.nodeName) || rclickable.test(elem.nodeName) && elem.href ? 0 : undefined
				}
			}
		}
	});
	jQuery.attrHooks.tabindex = jQuery.propHooks.tabIndex;
	boolHook = {
		get : function(elem, name) {
			var attrNode, property = jQuery.prop(elem, name);
			return property === true || typeof property !== "boolean" && (attrNode = elem.getAttributeNode(name)) && attrNode.nodeValue !== false ? name.toLowerCase() : undefined
		},
		set : function(elem, value, name) {
			var propName;
			if (value === false) {
				jQuery.removeAttr(elem, name)
			} else {
				propName = jQuery.propFix[name] || name;
				if (propName in elem) {
					elem[propName] = true
				}
				elem.setAttribute(name, name.toLowerCase())
			}
			return name
		}
	};
	if (!getSetAttribute) {
		fixSpecified = {
			name : true,
			id : true
		};
		nodeHook = jQuery.valHooks.button = {
			get : function(elem, name) {
				var ret;
				ret = elem.getAttributeNode(name);
				return ret && (fixSpecified[name] ? ret.nodeValue !== "" : ret.specified) ? ret.nodeValue : undefined
			},
			set : function(elem, value, name) {
				var ret = elem.getAttributeNode(name);
				if (!ret) {
					ret = document.createAttribute(name);
					elem.setAttributeNode(ret)
				}
				return (ret.nodeValue = value + "")
			}
		};
		jQuery.attrHooks.tabindex.set = nodeHook.set;
		jQuery.each([
			"width", "height"
		], function(i, name) {
			jQuery.attrHooks[name] = jQuery.extend(jQuery.attrHooks[name], {
				set : function(elem, value) {
					if (value === "") {
						elem.setAttribute(name, "auto");
						return value
					}
				}
			})
		});
		jQuery.attrHooks.contenteditable = {
			get : nodeHook.get,
			set : function(elem, value, name) {
				if (value === "") {
					value = "false"
				}
				nodeHook.set(elem, value, name)
			}
		}
	}
	if (!jQuery.support.hrefNormalized) {
		jQuery.each([
			"href", "src", "width", "height"
		], function(i, name) {
			jQuery.attrHooks[name] = jQuery.extend(jQuery.attrHooks[name], {
				get : function(elem) {
					var ret = elem.getAttribute(name, 2);
					return ret === null ? undefined : ret
				}
			})
		})
	}
	if (!jQuery.support.style) {
		jQuery.attrHooks.style = {
			get : function(elem) {
				return elem.style.cssText.toLowerCase() || undefined
			},
			set : function(elem, value) {
				return (elem.style.cssText = "" + value)
			}
		}
	}
	if (!jQuery.support.optSelected) {
		jQuery.propHooks.selected = jQuery.extend(jQuery.propHooks.selected, {
			get : function(elem) {
				var parent = elem.parentNode;
				if (parent) {
					parent.selectedIndex;
					if (parent.parentNode) {
						parent.parentNode.selectedIndex
					}
				}
				return null
			}
		})
	}
	if (!jQuery.support.enctype) {
		jQuery.propFix.enctype = "encoding"
	}
	if (!jQuery.support.checkOn) {
		jQuery.each([
			"radio", "checkbox"
		], function() {
			jQuery.valHooks[this] = {
				get : function(elem) {
					return elem.getAttribute("value") === null ? "on" : elem.value
				}
			}
		})
	}
	jQuery.each([
		"radio", "checkbox"
	], function() {
		jQuery.valHooks[this] = jQuery.extend(jQuery.valHooks[this], {
			set : function(elem, value) {
				if (jQuery.isArray(value)) {
					return (elem.checked = jQuery.inArray(jQuery(elem).val(), value) >= 0)
				}
			}
		})
	});
	var rformElems = /^(?:textarea|input|select)$/i, rtypenamespace = /^([^\.]*)?(?:\.(.+))?$/, rhoverHack = /\bhover(\.\S+)?\b/, rkeyEvent = /^key/, rmouseEvent = /^(?:mouse|contextmenu)|click/, rfocusMorph = /^(?:focusinfocus|focusoutblur)$/, rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/, quickParse = function(selector) {
		var quick = rquickIs.exec(selector);
		if (quick) {
			quick[1] = (quick[1] || "").toLowerCase();
			quick[3] = quick[3] && new RegExp("(?:^|\\s)" + quick[3] + "(?:\\s|$)")
		}
		return quick
	}, quickIs = function(elem, m) {
		var attrs = elem.attributes || {};
		return ((!m[1] || elem.nodeName.toLowerCase() === m[1]) && (!m[2] || (attrs.id || {}).value === m[2]) && (!m[3] || m[3].test((attrs["class"] || {}).value)))
	}, hoverHack = function(events) {
		return jQuery.event.special.hover ? events : events.replace(rhoverHack, "mouseenter$1 mouseleave$1")
	};
	jQuery.event = {
		add : function(elem, types, handler, data, selector) {
			var elemData, eventHandle, events, t, tns, type, namespaces, handleObj, handleObjIn, quick, handlers, special;
			if (elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data(elem))) {
				return
			}
			if (handler.handler) {
				handleObjIn = handler;
				handler = handleObjIn.handler
			}
			if (!handler.guid) {
				handler.guid = jQuery.guid++
			}
			events = elemData.events;
			if (!events) {
				elemData.events = events = {}
			}
			eventHandle = elemData.handle;
			if (!eventHandle) {
				elemData.handle = eventHandle = function(e) {
					return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ? jQuery.event.dispatch.apply(eventHandle.elem, arguments) : undefined
				};
				eventHandle.elem = elem
			}
			types = jQuery.trim(hoverHack(types)).split(" ");
			for (t = 0; t < types.length; t++) {
				tns = rtypenamespace.exec(types[t]) || [];
				type = tns[1];
				namespaces = (tns[2] || "").split(".").sort();
				special = jQuery.event.special[type] || {};
				type = (selector ? special.delegateType : special.bindType) || type;
				special = jQuery.event.special[type] || {};
				handleObj = jQuery.extend({
					type : type,
					origType : tns[1],
					data : data,
					handler : handler,
					guid : handler.guid,
					selector : selector,
					quick : quickParse(selector),
					namespace : namespaces.join(".")
				}, handleObjIn);
				handlers = events[type];
				if (!handlers) {
					handlers = events[type] = [];
					handlers.delegateCount = 0;
					if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
						if (elem.addEventListener) {
							elem.addEventListener(type, eventHandle, false)
						} else {
							if (elem.attachEvent) {
								elem.attachEvent("on" + type, eventHandle)
							}
						}
					}
				}
				if (special.add) {
					special.add.call(elem, handleObj);
					if (!handleObj.handler.guid) {
						handleObj.handler.guid = handler.guid
					}
				}
				if (selector) {
					handlers.splice(handlers.delegateCount++, 0, handleObj)
				} else {
					handlers.push(handleObj)
				}
				jQuery.event.global[type] = true
			}
			elem = null
		},
		global : {},
		remove : function(elem, types, handler, selector, mappedTypes) {
			var elemData = jQuery.hasData(elem) && jQuery._data(elem), t, tns, type, origType, namespaces, origCount, j, events, special, handle, eventType, handleObj;
			if (!elemData || !(events = elemData.events)) {
				return
			}
			types = jQuery.trim(hoverHack(types || "")).split(" ");
			for (t = 0; t < types.length; t++) {
				tns = rtypenamespace.exec(types[t]) || [];
				type = origType = tns[1];
				namespaces = tns[2];
				if (!type) {
					for (type in events) {
						jQuery.event.remove(elem, type + types[t], handler, selector, true)
					}
					continue
				}
				special = jQuery.event.special[type] || {};
				type = (selector ? special.delegateType : special.bindType) || type;
				eventType = events[type] || [];
				origCount = eventType.length;
				namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
				for (j = 0; j < eventType.length; j++) {
					handleObj = eventType[j];
					if ((mappedTypes || origType === handleObj.origType) && (!handler || handler.guid === handleObj.guid) && (!namespaces || namespaces.test(handleObj.namespace)) && (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
						eventType.splice(j--, 1);
						if (handleObj.selector) {
							eventType.delegateCount--
						}
						if (special.remove) {
							special.remove.call(elem, handleObj)
						}
					}
				}
				if (eventType.length === 0 && origCount !== eventType.length) {
					if (!special.teardown || special.teardown.call(elem, namespaces) === false) {
						jQuery.removeEvent(elem, type, elemData.handle)
					}
					delete events[type]
				}
			}
			if (jQuery.isEmptyObject(events)) {
				handle = elemData.handle;
				if (handle) {
					handle.elem = null
				}
				jQuery.removeData(elem, [
					"events", "handle"
				], true)
			}
		},
		customEvent : {
			getData : true,
			setData : true,
			changeData : true
		},
		trigger : function(event, data, elem, onlyHandlers) {
			if (elem && (elem.nodeType === 3 || elem.nodeType === 8)) {
				return
			}
			var type = event.type || event, namespaces = [], cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType;
			if (rfocusMorph.test(type + jQuery.event.triggered)) {
				return
			}
			if (type.indexOf("!") >= 0) {
				type = type.slice(0, -1);
				exclusive = true
			}
			if (type.indexOf(".") >= 0) {
				namespaces = type.split(".");
				type = namespaces.shift();
				namespaces.sort()
			}
			if ((!elem || jQuery.event.customEvent[type]) && !jQuery.event.global[type]) {
				return
			}
			event = typeof event === "object" ? event[jQuery.expando] ? event : new jQuery.Event(type, event) : new jQuery.Event(type);
			event.type = type;
			event.isTrigger = true;
			event.exclusive = exclusive;
			event.namespace = namespaces.join(".");
			event.namespace_re = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
			ontype = type.indexOf(":") < 0 ? "on" + type : "";
			if (!elem) {
				cache = jQuery.cache;
				for (i in cache) {
					if (cache[i].events && cache[i].events[type]) {
						jQuery.event.trigger(event, data, cache[i].handle.elem, true)
					}
				}
				return
			}
			event.result = undefined;
			if (!event.target) {
				event.target = elem
			}
			data = data != null ? jQuery.makeArray(data) : [];
			data.unshift(event);
			special = jQuery.event.special[type] || {};
			if (special.trigger && special.trigger.apply(elem, data) === false) {
				return
			}
			eventPath = [
				[
					elem, special.bindType || type
				]
			];
			if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {
				bubbleType = special.delegateType || type;
				cur = rfocusMorph.test(bubbleType + type) ? elem : elem.parentNode;
				old = null;
				for (; cur; cur = cur.parentNode) {
					eventPath.push([
						cur, bubbleType
					]);
					old = cur
				}
				if (old && old === elem.ownerDocument) {
					eventPath.push([
						old.defaultView || old.parentWindow || window, bubbleType
					])
				}
			}
			for (i = 0; i < eventPath.length && !event.isPropagationStopped(); i++) {
				cur = eventPath[i][0];
				event.type = eventPath[i][1];
				handle = (jQuery._data(cur, "events") || {})[event.type] && jQuery._data(cur, "handle");
				if (handle) {
					handle.apply(cur, data)
				}
				handle = ontype && cur[ontype];
				if (handle && jQuery.acceptData(cur) && handle.apply(cur, data) === false) {
					event.preventDefault()
				}
			}
			event.type = type;
			if (!onlyHandlers && !event.isDefaultPrevented()) {
				if ((!special._default || special._default.apply(elem.ownerDocument, data) === false) && !(type === "click" && jQuery.nodeName(elem, "a")) && jQuery.acceptData(elem)) {
					if (ontype && elem[type] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !jQuery.isWindow(elem)) {
						old = elem[ontype];
						if (old) {
							elem[ontype] = null
						}
						jQuery.event.triggered = type;
						elem[type]();
						jQuery.event.triggered = undefined;
						if (old) {
							elem[ontype] = old
						}
					}
				}
			}
			return event.result
		},
		dispatch : function(event) {
			event = jQuery.event.fix(event || window.event);
			var handlers = ((jQuery._data(this, "events") || {})[event.type] || []), delegateCount = handlers.delegateCount, args = [].slice.call(arguments, 0), run_all = !event.exclusive && !event.namespace, handlerQueue = [], i, j, cur, jqcur, ret, selMatch, matched, matches, handleObj, sel, related;
			args[0] = event;
			event.delegateTarget = this;
			if (delegateCount && !event.target.disabled && !(event.button && event.type === "click")) {
				jqcur = jQuery(this);
				jqcur.context = this.ownerDocument || this;
				for (cur = event.target; cur != this; cur = cur.parentNode || this) {
					selMatch = {};
					matches = [];
					jqcur[0] = cur;
					for (i = 0; i < delegateCount; i++) {
						handleObj = handlers[i];
						sel = handleObj.selector;
						if (selMatch[sel] === undefined) {
							selMatch[sel] = (handleObj.quick ? quickIs(cur, handleObj.quick) : jqcur.is(sel))
						}
						if (selMatch[sel]) {
							matches.push(handleObj)
						}
					}
					if (matches.length) {
						handlerQueue.push({
							elem : cur,
							matches : matches
						})
					}
				}
			}
			if (handlers.length > delegateCount) {
				handlerQueue.push({
					elem : this,
					matches : handlers.slice(delegateCount)
				})
			}
			for (i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++) {
				matched = handlerQueue[i];
				event.currentTarget = matched.elem;
				for (j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++) {
					handleObj = matched.matches[j];
					if (run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test(handleObj.namespace)) {
						event.data = handleObj.data;
						event.handleObj = handleObj;
						ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args);
						if (ret !== undefined) {
							event.result = ret;
							if (ret === false) {
								event.preventDefault();
								event.stopPropagation()
							}
						}
					}
				}
			}
			return event.result
		},
		props : "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
		fixHooks : {},
		keyHooks : {
			props : "char charCode key keyCode".split(" "),
			filter : function(event, original) {
				if (event.which == null) {
					event.which = original.charCode != null ? original.charCode : original.keyCode
				}
				return event
			}
		},
		mouseHooks : {
			props : "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
			filter : function(event, original) {
				var eventDoc, doc, body, button = original.button, fromElement = original.fromElement;
				if (event.pageX == null && original.clientX != null) {
					eventDoc = event.target.ownerDocument || document;
					doc = eventDoc.documentElement;
					body = eventDoc.body;
					event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
					event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0)
				}
				if (!event.relatedTarget && fromElement) {
					event.relatedTarget = fromElement === event.target ? original.toElement : fromElement
				}
				if (!event.which && button !== undefined) {
					event.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)))
				}
				return event
			}
		},
		fix : function(event) {
			if (event[jQuery.expando]) {
				return event
			}
			var i, prop, originalEvent = event, fixHook = jQuery.event.fixHooks[event.type] || {}, copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;
			event = jQuery.Event(originalEvent);
			for (i = copy.length; i;) {
				prop = copy[--i];
				event[prop] = originalEvent[prop]
			}
			if (!event.target) {
				event.target = originalEvent.srcElement || document
			}
			if (event.target.nodeType === 3) {
				event.target = event.target.parentNode
			}
			if (event.metaKey === undefined) {
				event.metaKey = event.ctrlKey
			}
			return fixHook.filter ? fixHook.filter(event, originalEvent) : event
		},
		special : {
			ready : {
				setup : jQuery.bindReady
			},
			load : {
				noBubble : true
			},
			focus : {
				delegateType : "focusin"
			},
			blur : {
				delegateType : "focusout"
			},
			beforeunload : {
				setup : function(data, namespaces, eventHandle) {
					if (jQuery.isWindow(this)) {
						this.onbeforeunload = eventHandle
					}
				},
				teardown : function(namespaces, eventHandle) {
					if (this.onbeforeunload === eventHandle) {
						this.onbeforeunload = null
					}
				}
			}
		},
		simulate : function(type, elem, event, bubble) {
			var e = jQuery.extend(new jQuery.Event(), event, {
				type : type,
				isSimulated : true,
				originalEvent : {}
			});
			if (bubble) {
				jQuery.event.trigger(e, null, elem)
			} else {
				jQuery.event.dispatch.call(elem, e)
			}
			if (e.isDefaultPrevented()) {
				event.preventDefault()
			}
		}
	};
	jQuery.event.handle = jQuery.event.dispatch;
	jQuery.removeEvent = document.removeEventListener ? function(elem, type, handle) {
		if (elem.removeEventListener) {
			elem.removeEventListener(type, handle, false)
		}
	} : function(elem, type, handle) {
		if (elem.detachEvent) {
			elem.detachEvent("on" + type, handle)
		}
	};
	jQuery.Event = function(src, props) {
		if (!(this instanceof jQuery.Event)) {
			return new jQuery.Event(src, props)
		}
		if (src && src.type) {
			this.originalEvent = src;
			this.type = src.type;
			this.isDefaultPrevented = (src.defaultPrevented || src.returnValue === false || src.getPreventDefault && src.getPreventDefault()) ? returnTrue : returnFalse
		} else {
			this.type = src
		}
		if (props) {
			jQuery.extend(this, props)
		}
		this.timeStamp = src && src.timeStamp || jQuery.now();
		this[jQuery.expando] = true
	};
	function returnFalse() {
		return false
	}
	function returnTrue() {
		return true
	}
	jQuery.Event.prototype = {
		preventDefault : function() {
			this.isDefaultPrevented = returnTrue;
			var e = this.originalEvent;
			if (!e) {
				return
			}
			if (e.preventDefault) {
				e.preventDefault()
			} else {
				e.returnValue = false
			}
		},
		stopPropagation : function() {
			this.isPropagationStopped = returnTrue;
			var e = this.originalEvent;
			if (!e) {
				return
			}
			if (e.stopPropagation) {
				e.stopPropagation()
			}
			e.cancelBubble = true
		},
		stopImmediatePropagation : function() {
			this.isImmediatePropagationStopped = returnTrue;
			this.stopPropagation()
		},
		isDefaultPrevented : returnFalse,
		isPropagationStopped : returnFalse,
		isImmediatePropagationStopped : returnFalse
	};
	jQuery.each({
		mouseenter : "mouseover",
		mouseleave : "mouseout"
	}, function(orig, fix) {
		jQuery.event.special[orig] = {
			delegateType : fix,
			bindType : fix,
			handle : function(event) {
				var target = this, related = event.relatedTarget, handleObj = event.handleObj, selector = handleObj.selector, ret;
				if (!related || (related !== target && !jQuery.contains(target, related))) {
					event.type = handleObj.origType;
					ret = handleObj.handler.apply(this, arguments);
					event.type = fix
				}
				return ret
			}
		}
	});
	if (!jQuery.support.submitBubbles) {
		jQuery.event.special.submit = {
			setup : function() {
				if (jQuery.nodeName(this, "form")) {
					return false
				}
				jQuery.event.add(this, "click._submit keypress._submit", function(e) {
					var elem = e.target, form = jQuery.nodeName(elem, "input") || jQuery.nodeName(elem, "button") ? elem.form : undefined;
					if (form && !form._submit_attached) {
						jQuery.event.add(form, "submit._submit", function(event) {
							if (this.parentNode && !event.isTrigger) {
								jQuery.event.simulate("submit", this.parentNode, event, true)
							}
						});
						form._submit_attached = true
					}
				})
			},
			teardown : function() {
				if (jQuery.nodeName(this, "form")) {
					return false
				}
				jQuery.event.remove(this, "._submit")
			}
		}
	}
	if (!jQuery.support.changeBubbles) {
		jQuery.event.special.change = {
			setup : function() {
				if (rformElems.test(this.nodeName)) {
					if (this.type === "checkbox" || this.type === "radio") {
						jQuery.event.add(this, "propertychange._change", function(event) {
							if (event.originalEvent.propertyName === "checked") {
								this._just_changed = true
							}
						});
						jQuery.event.add(this, "click._change", function(event) {
							if (this._just_changed && !event.isTrigger) {
								this._just_changed = false;
								jQuery.event.simulate("change", this, event, true)
							}
						})
					}
					return false
				}
				jQuery.event.add(this, "beforeactivate._change", function(e) {
					var elem = e.target;
					if (rformElems.test(elem.nodeName) && !elem._change_attached) {
						jQuery.event.add(elem, "change._change", function(event) {
							if (this.parentNode && !event.isSimulated && !event.isTrigger) {
								jQuery.event.simulate("change", this.parentNode, event, true)
							}
						});
						elem._change_attached = true
					}
				})
			},
			handle : function(event) {
				var elem = event.target;
				if (this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox")) {
					return event.handleObj.handler.apply(this, arguments)
				}
			},
			teardown : function() {
				jQuery.event.remove(this, "._change");
				return rformElems.test(this.nodeName)
			}
		}
	}
	if (!jQuery.support.focusinBubbles) {
		jQuery.each({
			focus : "focusin",
			blur : "focusout"
		}, function(orig, fix) {
			var attaches = 0, handler = function(event) {
				jQuery.event.simulate(fix, event.target, jQuery.event.fix(event), true)
			};
			jQuery.event.special[fix] = {
				setup : function() {
					if (attaches++ === 0) {
						document.addEventListener(orig, handler, true)
					}
				},
				teardown : function() {
					if (--attaches === 0) {
						document.removeEventListener(orig, handler, true)
					}
				}
			}
		})
	}
	jQuery.fn.extend({
		on : function(types, selector, data, fn, one) {
			var origFn, type;
			if (typeof types === "object") {
				if (typeof selector !== "string") {
					data = selector;
					selector = undefined
				}
				for (type in types) {
					this.on(type, selector, data, types[type], one)
				}
				return this
			}
			if (data == null && fn == null) {
				fn = selector;
				data = selector = undefined
			} else {
				if (fn == null) {
					if (typeof selector === "string") {
						fn = data;
						data = undefined
					} else {
						fn = data;
						data = selector;
						selector = undefined
					}
				}
			}
			if (fn === false) {
				fn = returnFalse
			} else {
				if (!fn) {
					return this
				}
			}
			if (one === 1) {
				origFn = fn;
				fn = function(event) {
					jQuery().off(event);
					return origFn.apply(this, arguments)
				};
				fn.guid = origFn.guid || (origFn.guid = jQuery.guid++)
			}
			return this.each(function() {
				jQuery.event.add(this, types, fn, data, selector)
			})
		},
		one : function(types, selector, data, fn) {
			return this.on.call(this, types, selector, data, fn, 1)
		},
		off : function(types, selector, fn) {
			if (types && types.preventDefault && types.handleObj) {
				var handleObj = types.handleObj;
				jQuery(types.delegateTarget).off(handleObj.namespace ? handleObj.type + "." + handleObj.namespace : handleObj.type, handleObj.selector, handleObj.handler);
				return this
			}
			if (typeof types === "object") {
				for ( var type in types) {
					this.off(type, selector, types[type])
				}
				return this
			}
			if (selector === false || typeof selector === "function") {
				fn = selector;
				selector = undefined
			}
			if (fn === false) {
				fn = returnFalse
			}
			return this.each(function() {
				jQuery.event.remove(this, types, fn, selector)
			})
		},
		bind : function(types, data, fn) {
			return this.on(types, null, data, fn)
		},
		unbind : function(types, fn) {
			return this.off(types, null, fn)
		},
		live : function(types, data, fn) {
			jQuery(this.context).on(types, this.selector, data, fn);
			return this
		},
		die : function(types, fn) {
			jQuery(this.context).off(types, this.selector || "**", fn);
			return this
		},
		delegate : function(selector, types, data, fn) {
			return this.on(types, selector, data, fn)
		},
		undelegate : function(selector, types, fn) {
			return arguments.length == 1 ? this.off(selector, "**") : this.off(types, selector, fn)
		},
		trigger : function(type, data) {
			return this.each(function() {
				jQuery.event.trigger(type, data, this)
			})
		},
		triggerHandler : function(type, data) {
			if (this[0]) {
				return jQuery.event.trigger(type, data, this[0], true)
			}
		},
		toggle : function(fn) {
			var args = arguments, guid = fn.guid || jQuery.guid++, i = 0, toggler = function(event) {
				var lastToggle = (jQuery._data(this, "lastToggle" + fn.guid) || 0) % i;
				jQuery._data(this, "lastToggle" + fn.guid, lastToggle + 1);
				event.preventDefault();
				return args[lastToggle].apply(this, arguments) || false
			};
			toggler.guid = guid;
			while (i < args.length) {
				args[i++].guid = guid
			}
			return this.click(toggler)
		},
		hover : function(fnOver, fnOut) {
			return this.mouseenter(fnOver).mouseleave(fnOut || fnOver)
		}
	});
	jQuery.each(("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu").split(" "), function(i, name) {
		jQuery.fn[name] = function(data, fn) {
			if (fn == null) {
				fn = data;
				data = null
			}
			return arguments.length > 0 ? this.on(name, null, data, fn) : this.trigger(name)
		};
		if (jQuery.attrFn) {
			jQuery.attrFn[name] = true
		}
		if (rkeyEvent.test(name)) {
			jQuery.event.fixHooks[name] = jQuery.event.keyHooks
		}
		if (rmouseEvent.test(name)) {
			jQuery.event.fixHooks[name] = jQuery.event.mouseHooks
		}
	});
	/*
	 * ! Sizzle CSS Selector Engine Copyright 2011, The Dojo Foundation Released under the MIT, BSD, and GPL Licenses. More information: http://sizzlejs.com/
	 */
	(function() {
		var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g, expando = "sizcache" + (Math.random() + "").replace(".", ""), done = 0, toString = Object.prototype.toString, hasDuplicate = false, baseHasDuplicate = true, rBackslash = /\\/g, rReturn = /\r\n/g, rNonWord = /\W/;
		[
			0, 0
		].sort(function() {
			baseHasDuplicate = false;
			return 0
		});
		var Sizzle = function(selector, context, results, seed) {
			results = results || [];
			context = context || document;
			var origContext = context;
			if (context.nodeType !== 1 && context.nodeType !== 9) {
				return []
			}
			if (!selector || typeof selector !== "string") {
				return results
			}
			var m, set, checkSet, extra, ret, cur, pop, i, prune = true, contextXML = Sizzle.isXML(context), parts = [], soFar = selector;
			do {
				chunker.exec("");
				m = chunker.exec(soFar);
				if (m) {
					soFar = m[3];
					parts.push(m[1]);
					if (m[2]) {
						extra = m[3];
						break
					}
				}
			} while (m);
			if (parts.length > 1 && origPOS.exec(selector)) {
				if (parts.length === 2 && Expr.relative[parts[0]]) {
					set = posProcess(parts[0] + parts[1], context, seed)
				} else {
					set = Expr.relative[parts[0]] ? [
						context
					] : Sizzle(parts.shift(), context);
					while (parts.length) {
						selector = parts.shift();
						if (Expr.relative[selector]) {
							selector += parts.shift()
						}
						set = posProcess(selector, set, seed)
					}
				}
			} else {
				if (!seed && parts.length > 1 && context.nodeType === 9 && !contextXML && Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1])) {
					ret = Sizzle.find(parts.shift(), context, contextXML);
					context = ret.expr ? Sizzle.filter(ret.expr, ret.set)[0] : ret.set[0]
				}
				if (context) {
					ret = seed ? {
						expr : parts.pop(),
						set : makeArray(seed)
					} : Sizzle.find(parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML);
					set = ret.expr ? Sizzle.filter(ret.expr, ret.set) : ret.set;
					if (parts.length > 0) {
						checkSet = makeArray(set)
					} else {
						prune = false
					}
					while (parts.length) {
						cur = parts.pop();
						pop = cur;
						if (!Expr.relative[cur]) {
							cur = ""
						} else {
							pop = parts.pop()
						}
						if (pop == null) {
							pop = context
						}
						Expr.relative[cur](checkSet, pop, contextXML)
					}
				} else {
					checkSet = parts = []
				}
			}
			if (!checkSet) {
				checkSet = set
			}
			if (!checkSet) {
				Sizzle.error(cur || selector)
			}
			if (toString.call(checkSet) === "[object Array]") {
				if (!prune) {
					results.push.apply(results, checkSet)
				} else {
					if (context && context.nodeType === 1) {
						for (i = 0; checkSet[i] != null; i++) {
							if (checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i]))) {
								results.push(set[i])
							}
						}
					} else {
						for (i = 0; checkSet[i] != null; i++) {
							if (checkSet[i] && checkSet[i].nodeType === 1) {
								results.push(set[i])
							}
						}
					}
				}
			} else {
				makeArray(checkSet, results)
			}
			if (extra) {
				Sizzle(extra, origContext, results, seed);
				Sizzle.uniqueSort(results)
			}
			return results
		};
		Sizzle.uniqueSort = function(results) {
			if (sortOrder) {
				hasDuplicate = baseHasDuplicate;
				results.sort(sortOrder);
				if (hasDuplicate) {
					for ( var i = 1; i < results.length; i++) {
						if (results[i] === results[i - 1]) {
							results.splice(i--, 1)
						}
					}
				}
			}
			return results
		};
		Sizzle.matches = function(expr, set) {
			return Sizzle(expr, null, null, set)
		};
		Sizzle.matchesSelector = function(node, expr) {
			return Sizzle(expr, null, null, [
				node
			]).length > 0
		};
		Sizzle.find = function(expr, context, isXML) {
			var set, i, len, match, type, left;
			if (!expr) {
				return []
			}
			for (i = 0, len = Expr.order.length; i < len; i++) {
				type = Expr.order[i];
				if ((match = Expr.leftMatch[type].exec(expr))) {
					left = match[1];
					match.splice(1, 1);
					if (left.substr(left.length - 1) !== "\\") {
						match[1] = (match[1] || "").replace(rBackslash, "");
						set = Expr.find[type](match, context, isXML);
						if (set != null) {
							expr = expr.replace(Expr.match[type], "");
							break
						}
					}
				}
			}
			if (!set) {
				set = typeof context.getElementsByTagName !== "undefined" ? context.getElementsByTagName("*") : []
			}
			return {
				set : set,
				expr : expr
			}
		};
		Sizzle.filter = function(expr, set, inplace, not) {
			var match, anyFound, type, found, item, filter, left, i, pass, old = expr, result = [], curLoop = set, isXMLFilter = set && set[0] && Sizzle.isXML(set[0]);
			while (expr && set.length) {
				for (type in Expr.filter) {
					if ((match = Expr.leftMatch[type].exec(expr)) != null && match[2]) {
						filter = Expr.filter[type];
						left = match[1];
						anyFound = false;
						match.splice(1, 1);
						if (left.substr(left.length - 1) === "\\") {
							continue
						}
						if (curLoop === result) {
							result = []
						}
						if (Expr.preFilter[type]) {
							match = Expr.preFilter[type](match, curLoop, inplace, result, not, isXMLFilter);
							if (!match) {
								anyFound = found = true
							} else {
								if (match === true) {
									continue
								}
							}
						}
						if (match) {
							for (i = 0; (item = curLoop[i]) != null; i++) {
								if (item) {
									found = filter(item, match, i, curLoop);
									pass = not ^ found;
									if (inplace && found != null) {
										if (pass) {
											anyFound = true
										} else {
											curLoop[i] = false
										}
									} else {
										if (pass) {
											result.push(item);
											anyFound = true
										}
									}
								}
							}
						}
						if (found !== undefined) {
							if (!inplace) {
								curLoop = result
							}
							expr = expr.replace(Expr.match[type], "");
							if (!anyFound) {
								return []
							}
							break
						}
					}
				}
				if (expr === old) {
					if (anyFound == null) {
						Sizzle.error(expr)
					} else {
						break
					}
				}
				old = expr
			}
			return curLoop
		};
		Sizzle.error = function(msg) {
			throw new Error("Syntax error, unrecognized expression: " + msg)
		};
		var getText = Sizzle.getText = function(elem) {
			var i, node, nodeType = elem.nodeType, ret = "";
			if (nodeType) {
				if (nodeType === 1 || nodeType === 9) {
					if (typeof elem.textContent === "string") {
						return elem.textContent
					} else {
						if (typeof elem.innerText === "string") {
							return elem.innerText.replace(rReturn, "")
						} else {
							for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
								ret += getText(elem)
							}
						}
					}
				} else {
					if (nodeType === 3 || nodeType === 4) {
						return elem.nodeValue
					}
				}
			} else {
				for (i = 0; (node = elem[i]); i++) {
					if (node.nodeType !== 8) {
						ret += getText(node)
					}
				}
			}
			return ret
		};
		var Expr = Sizzle.selectors = {
			order : [
				"ID", "NAME", "TAG"
			],
			match : {
				ID : /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
				CLASS : /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
				NAME : /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
				ATTR : /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
				TAG : /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
				CHILD : /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
				POS : /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
				PSEUDO : /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
			},
			leftMatch : {},
			attrMap : {
				"class" : "className",
				"for" : "htmlFor"
			},
			attrHandle : {
				href : function(elem) {
					return elem.getAttribute("href")
				},
				type : function(elem) {
					return elem.getAttribute("type")
				}
			},
			relative : {
				"+" : function(checkSet, part) {
					var isPartStr = typeof part === "string", isTag = isPartStr && !rNonWord.test(part), isPartStrNotTag = isPartStr && !isTag;
					if (isTag) {
						part = part.toLowerCase()
					}
					for ( var i = 0, l = checkSet.length, elem; i < l; i++) {
						if ((elem = checkSet[i])) {
							while ((elem = elem.previousSibling) && elem.nodeType !== 1) {
							}
							checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ? elem || false : elem === part
						}
					}
					if (isPartStrNotTag) {
						Sizzle.filter(part, checkSet, true)
					}
				},
				">" : function(checkSet, part) {
					var elem, isPartStr = typeof part === "string", i = 0, l = checkSet.length;
					if (isPartStr && !rNonWord.test(part)) {
						part = part.toLowerCase();
						for (; i < l; i++) {
							elem = checkSet[i];
							if (elem) {
								var parent = elem.parentNode;
								checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false
							}
						}
					} else {
						for (; i < l; i++) {
							elem = checkSet[i];
							if (elem) {
								checkSet[i] = isPartStr ? elem.parentNode : elem.parentNode === part
							}
						}
						if (isPartStr) {
							Sizzle.filter(part, checkSet, true)
						}
					}
				},
				"" : function(checkSet, part, isXML) {
					var nodeCheck, doneName = done++, checkFn = dirCheck;
					if (typeof part === "string" && !rNonWord.test(part)) {
						part = part.toLowerCase();
						nodeCheck = part;
						checkFn = dirNodeCheck
					}
					checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML)
				},
				"~" : function(checkSet, part, isXML) {
					var nodeCheck, doneName = done++, checkFn = dirCheck;
					if (typeof part === "string" && !rNonWord.test(part)) {
						part = part.toLowerCase();
						nodeCheck = part;
						checkFn = dirNodeCheck
					}
					checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML)
				}
			},
			find : {
				ID : function(match, context, isXML) {
					if (typeof context.getElementById !== "undefined" && !isXML) {
						var m = context.getElementById(match[1]);
						return m && m.parentNode ? [
							m
						] : []
					}
				},
				NAME : function(match, context) {
					if (typeof context.getElementsByName !== "undefined") {
						var ret = [], results = context.getElementsByName(match[1]);
						for ( var i = 0, l = results.length; i < l; i++) {
							if (results[i].getAttribute("name") === match[1]) {
								ret.push(results[i])
							}
						}
						return ret.length === 0 ? null : ret
					}
				},
				TAG : function(match, context) {
					if (typeof context.getElementsByTagName !== "undefined") {
						return context.getElementsByTagName(match[1])
					}
				}
			},
			preFilter : {
				CLASS : function(match, curLoop, inplace, result, not, isXML) {
					match = " " + match[1].replace(rBackslash, "") + " ";
					if (isXML) {
						return match
					}
					for ( var i = 0, elem; (elem = curLoop[i]) != null; i++) {
						if (elem) {
							if (not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0)) {
								if (!inplace) {
									result.push(elem)
								}
							} else {
								if (inplace) {
									curLoop[i] = false
								}
							}
						}
					}
					return false
				},
				ID : function(match) {
					return match[1].replace(rBackslash, "")
				},
				TAG : function(match, curLoop) {
					return match[1].replace(rBackslash, "").toLowerCase()
				},
				CHILD : function(match) {
					if (match[1] === "nth") {
						if (!match[2]) {
							Sizzle.error(match[0])
						}
						match[2] = match[2].replace(/^\+|\s*/g, "");
						var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" || !/\D/.test(match[2]) && "0n+" + match[2] || match[2]);
						match[2] = (test[1] + (test[2] || 1)) - 0;
						match[3] = test[3] - 0
					} else {
						if (match[2]) {
							Sizzle.error(match[0])
						}
					}
					match[0] = done++;
					return match
				},
				ATTR : function(match, curLoop, inplace, result, not, isXML) {
					var name = match[1] = match[1].replace(rBackslash, "");
					if (!isXML && Expr.attrMap[name]) {
						match[1] = Expr.attrMap[name]
					}
					match[4] = (match[4] || match[5] || "").replace(rBackslash, "");
					if (match[2] === "~=") {
						match[4] = " " + match[4] + " "
					}
					return match
				},
				PSEUDO : function(match, curLoop, inplace, result, not) {
					if (match[1] === "not") {
						if ((chunker.exec(match[3]) || "").length > 1 || /^\w/.test(match[3])) {
							match[3] = Sizzle(match[3], null, null, curLoop)
						} else {
							var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
							if (!inplace) {
								result.push.apply(result, ret)
							}
							return false
						}
					} else {
						if (Expr.match.POS.test(match[0]) || Expr.match.CHILD.test(match[0])) {
							return true
						}
					}
					return match
				},
				POS : function(match) {
					match.unshift(true);
					return match
				}
			},
			filters : {
				enabled : function(elem) {
					return elem.disabled === false && elem.type !== "hidden"
				},
				disabled : function(elem) {
					return elem.disabled === true
				},
				checked : function(elem) {
					return elem.checked === true
				},
				selected : function(elem) {
					if (elem.parentNode) {
						elem.parentNode.selectedIndex
					}
					return elem.selected === true
				},
				parent : function(elem) {
					return !!elem.firstChild
				},
				empty : function(elem) {
					return !elem.firstChild
				},
				has : function(elem, i, match) {
					return !!Sizzle(match[3], elem).length
				},
				header : function(elem) {
					return (/h\d/i).test(elem.nodeName)
				},
				text : function(elem) {
					var attr = elem.getAttribute("type"), type = elem.type;
					return elem.nodeName.toLowerCase() === "input" && "text" === type && (attr === type || attr === null)
				},
				radio : function(elem) {
					return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type
				},
				checkbox : function(elem) {
					return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type
				},
				file : function(elem) {
					return elem.nodeName.toLowerCase() === "input" && "file" === elem.type
				},
				password : function(elem) {
					return elem.nodeName.toLowerCase() === "input" && "password" === elem.type
				},
				submit : function(elem) {
					var name = elem.nodeName.toLowerCase();
					return (name === "input" || name === "button") && "submit" === elem.type
				},
				image : function(elem) {
					return elem.nodeName.toLowerCase() === "input" && "image" === elem.type
				},
				reset : function(elem) {
					var name = elem.nodeName.toLowerCase();
					return (name === "input" || name === "button") && "reset" === elem.type
				},
				button : function(elem) {
					var name = elem.nodeName.toLowerCase();
					return name === "input" && "button" === elem.type || name === "button"
				},
				input : function(elem) {
					return (/input|select|textarea|button/i).test(elem.nodeName)
				},
				focus : function(elem) {
					return elem === elem.ownerDocument.activeElement
				}
			},
			setFilters : {
				first : function(elem, i) {
					return i === 0
				},
				last : function(elem, i, match, array) {
					return i === array.length - 1
				},
				even : function(elem, i) {
					return i % 2 === 0
				},
				odd : function(elem, i) {
					return i % 2 === 1
				},
				lt : function(elem, i, match) {
					return i < match[3] - 0
				},
				gt : function(elem, i, match) {
					return i > match[3] - 0
				},
				nth : function(elem, i, match) {
					return match[3] - 0 === i
				},
				eq : function(elem, i, match) {
					return match[3] - 0 === i
				}
			},
			filter : {
				PSEUDO : function(elem, match, i, array) {
					var name = match[1], filter = Expr.filters[name];
					if (filter) {
						return filter(elem, i, match, array)
					} else {
						if (name === "contains") {
							return (elem.textContent || elem.innerText || getText([
								elem
							]) || "").indexOf(match[3]) >= 0
						} else {
							if (name === "not") {
								var not = match[3];
								for ( var j = 0, l = not.length; j < l; j++) {
									if (not[j] === elem) {
										return false
									}
								}
								return true
							} else {
								Sizzle.error(name)
							}
						}
					}
				},
				CHILD : function(elem, match) {
					var first, last, doneName, parent, cache, count, diff, type = match[1], node = elem;
					switch (type) {
						case "only":
						case "first":
							while ((node = node.previousSibling)) {
								if (node.nodeType === 1) {
									return false
								}
							}
							if (type === "first") {
								return true
							}
							node = elem;
						case "last":
							while ((node = node.nextSibling)) {
								if (node.nodeType === 1) {
									return false
								}
							}
							return true;
						case "nth":
							first = match[2];
							last = match[3];
							if (first === 1 && last === 0) {
								return true
							}
							doneName = match[0];
							parent = elem.parentNode;
							if (parent && (parent[expando] !== doneName || !elem.nodeIndex)) {
								count = 0;
								for (node = parent.firstChild; node; node = node.nextSibling) {
									if (node.nodeType === 1) {
										node.nodeIndex = ++count
									}
								}
								parent[expando] = doneName
							}
							diff = elem.nodeIndex - last;
							if (first === 0) {
								return diff === 0
							} else {
								return (diff % first === 0 && diff / first >= 0)
							}
					}
				},
				ID : function(elem, match) {
					return elem.nodeType === 1 && elem.getAttribute("id") === match
				},
				TAG : function(elem, match) {
					return (match === "*" && elem.nodeType === 1) || !!elem.nodeName && elem.nodeName.toLowerCase() === match
				},
				CLASS : function(elem, match) {
					return (" " + (elem.className || elem.getAttribute("class")) + " ").indexOf(match) > -1
				},
				ATTR : function(elem, match) {
					var name = match[1], result = Sizzle.attr ? Sizzle.attr(elem, name) : Expr.attrHandle[name] ? Expr.attrHandle[name](elem) : elem[name] != null ? elem[name] : elem.getAttribute(name), value = result + "", type = match[2], check = match[4];
					return result == null ? type === "!=" : !type && Sizzle.attr ? result != null : type === "=" ? value === check : type === "*=" ? value.indexOf(check) >= 0 : type === "~=" ? (" " + value + " ").indexOf(check) >= 0 : !check ? value && result !== false : type === "!=" ? value !== check : type === "^=" ? value
						.indexOf(check) === 0 : type === "$=" ? value.substr(value.length - check.length) === check : type === "|=" ? value === check || value.substr(0, check.length + 1) === check + "-" : false
				},
				POS : function(elem, match, i, array) {
					var name = match[2], filter = Expr.setFilters[name];
					if (filter) {
						return filter(elem, i, match, array)
					}
				}
			}
		};
		var origPOS = Expr.match.POS, fescape = function(all, num) {
			return "\\" + (num - 0 + 1)
		};
		for ( var type in Expr.match) {
			Expr.match[type] = new RegExp(Expr.match[type].source + (/(?![^\[]*\])(?![^\(]*\))/.source));
			Expr.leftMatch[type] = new RegExp(/(^(?:.|\r|\n)*?)/.source + Expr.match[type].source.replace(/\\(\d+)/g, fescape))
		}
		var makeArray = function(array, results) {
			array = Array.prototype.slice.call(array, 0);
			if (results) {
				results.push.apply(results, array);
				return results
			}
			return array
		};
		try {
			Array.prototype.slice.call(document.documentElement.childNodes, 0)[0].nodeType
		} catch (e) {
			makeArray = function(array, results) {
				var i = 0, ret = results || [];
				if (toString.call(array) === "[object Array]") {
					Array.prototype.push.apply(ret, array)
				} else {
					if (typeof array.length === "number") {
						for ( var l = array.length; i < l; i++) {
							ret.push(array[i])
						}
					} else {
						for (; array[i]; i++) {
							ret.push(array[i])
						}
					}
				}
				return ret
			}
		}
		var sortOrder, siblingCheck;
		if (document.documentElement.compareDocumentPosition) {
			sortOrder = function(a, b) {
				if (a === b) {
					hasDuplicate = true;
					return 0
				}
				if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
					return a.compareDocumentPosition ? -1 : 1
				}
				return a.compareDocumentPosition(b) & 4 ? -1 : 1
			}
		} else {
			sortOrder = function(a, b) {
				if (a === b) {
					hasDuplicate = true;
					return 0
				} else {
					if (a.sourceIndex && b.sourceIndex) {
						return a.sourceIndex - b.sourceIndex
					}
				}
				var al, bl, ap = [], bp = [], aup = a.parentNode, bup = b.parentNode, cur = aup;
				if (aup === bup) {
					return siblingCheck(a, b)
				} else {
					if (!aup) {
						return -1
					} else {
						if (!bup) {
							return 1
						}
					}
				}
				while (cur) {
					ap.unshift(cur);
					cur = cur.parentNode
				}
				cur = bup;
				while (cur) {
					bp.unshift(cur);
					cur = cur.parentNode
				}
				al = ap.length;
				bl = bp.length;
				for ( var i = 0; i < al && i < bl; i++) {
					if (ap[i] !== bp[i]) {
						return siblingCheck(ap[i], bp[i])
					}
				}
				return i === al ? siblingCheck(a, bp[i], -1) : siblingCheck(ap[i], b, 1)
			};
			siblingCheck = function(a, b, ret) {
				if (a === b) {
					return ret
				}
				var cur = a.nextSibling;
				while (cur) {
					if (cur === b) {
						return -1
					}
					cur = cur.nextSibling
				}
				return 1
			}
		}
		(function() {
			var form = document.createElement("div"), id = "script" + (new Date()).getTime(), root = document.documentElement;
			form.innerHTML = "<a name='" + id + "'/>";
			root.insertBefore(form, root.firstChild);
			if (document.getElementById(id)) {
				Expr.find.ID = function(match, context, isXML) {
					if (typeof context.getElementById !== "undefined" && !isXML) {
						var m = context.getElementById(match[1]);
						return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [
							m
						] : undefined : []
					}
				};
				Expr.filter.ID = function(elem, match) {
					var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
					return elem.nodeType === 1 && node && node.nodeValue === match
				}
			}
			root.removeChild(form);
			root = form = null
		})();
		(function() {
			var div = document.createElement("div");
			div.appendChild(document.createComment(""));
			if (div.getElementsByTagName("*").length > 0) {
				Expr.find.TAG = function(match, context) {
					var results = context.getElementsByTagName(match[1]);
					if (match[1] === "*") {
						var tmp = [];
						for ( var i = 0; results[i]; i++) {
							if (results[i].nodeType === 1) {
								tmp.push(results[i])
							}
						}
						results = tmp
					}
					return results
				}
			}
			div.innerHTML = "<a href='#'></a>";
			if (div.firstChild && typeof div.firstChild.getAttribute !== "undefined" && div.firstChild.getAttribute("href") !== "#") {
				Expr.attrHandle.href = function(elem) {
					return elem.getAttribute("href", 2)
				}
			}
			div = null
		})();
		if (document.querySelectorAll) {
			(function() {
				var oldSizzle = Sizzle, div = document.createElement("div"), id = "__sizzle__";
				div.innerHTML = "<p class='TEST'></p>";
				if (div.querySelectorAll && div.querySelectorAll(".TEST").length === 0) {
					return
				}
				Sizzle = function(query, context, extra, seed) {
					context = context || document;
					if (!seed && !Sizzle.isXML(context)) {
						var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(query);
						if (match && (context.nodeType === 1 || context.nodeType === 9)) {
							if (match[1]) {
								return makeArray(context.getElementsByTagName(query), extra)
							} else {
								if (match[2] && Expr.find.CLASS && context.getElementsByClassName) {
									return makeArray(context.getElementsByClassName(match[2]), extra)
								}
							}
						}
						if (context.nodeType === 9) {
							if (query === "body" && context.body) {
								return makeArray([
									context.body
								], extra)
							} else {
								if (match && match[3]) {
									var elem = context.getElementById(match[3]);
									if (elem && elem.parentNode) {
										if (elem.id === match[3]) {
											return makeArray([
												elem
											], extra)
										}
									} else {
										return makeArray([], extra)
									}
								}
							}
							try {
								return makeArray(context.querySelectorAll(query), extra)
							} catch (qsaError) {
							}
						} else {
							if (context.nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
								var oldContext = context, old = context.getAttribute("id"), nid = old || id, hasParent = context.parentNode, relativeHierarchySelector = /^\s*[+~]/.test(query);
								if (!old) {
									context.setAttribute("id", nid)
								} else {
									nid = nid.replace(/'/g, "\\$&")
								}
								if (relativeHierarchySelector && hasParent) {
									context = context.parentNode
								}
								try {
									if (!relativeHierarchySelector || hasParent) {
										return makeArray(context.querySelectorAll("[id='" + nid + "'] " + query), extra)
									}
								} catch (pseudoError) {
								} finally {
									if (!old) {
										oldContext.removeAttribute("id")
									}
								}
							}
						}
					}
					return oldSizzle(query, context, extra, seed)
				};
				for ( var prop in oldSizzle) {
					Sizzle[prop] = oldSizzle[prop]
				}
				div = null
			})()
		}
		(function() {
			var html = document.documentElement, matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;
			if (matches) {
				var disconnectedMatch = !matches.call(document.createElement("div"), "div"), pseudoWorks = false;
				try {
					matches.call(document.documentElement, "[test!='']:sizzle")
				} catch (pseudoError) {
					pseudoWorks = true
				}
				Sizzle.matchesSelector = function(node, expr) {
					expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");
					if (!Sizzle.isXML(node)) {
						try {
							if (pseudoWorks || !Expr.match.PSEUDO.test(expr) && !/!=/.test(expr)) {
								var ret = matches.call(node, expr);
								if (ret || !disconnectedMatch || node.document && node.document.nodeType !== 11) {
									return ret
								}
							}
						} catch (e) {
						}
					}
					return Sizzle(expr, null, null, [
						node
					]).length > 0
				}
			}
		})();
		(function() {
			var div = document.createElement("div");
			div.innerHTML = "<div class='test e'></div><div class='test'></div>";
			if (!div.getElementsByClassName || div.getElementsByClassName("e").length === 0) {
				return
			}
			div.lastChild.className = "e";
			if (div.getElementsByClassName("e").length === 1) {
				return
			}
			Expr.order.splice(1, 0, "CLASS");
			Expr.find.CLASS = function(match, context, isXML) {
				if (typeof context.getElementsByClassName !== "undefined" && !isXML) {
					return context.getElementsByClassName(match[1])
				}
			};
			div = null
		})();
		function dirNodeCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
			for ( var i = 0, l = checkSet.length; i < l; i++) {
				var elem = checkSet[i];
				if (elem) {
					var match = false;
					elem = elem[dir];
					while (elem) {
						if (elem[expando] === doneName) {
							match = checkSet[elem.sizset];
							break
						}
						if (elem.nodeType === 1 && !isXML) {
							elem[expando] = doneName;
							elem.sizset = i
						}
						if (elem.nodeName.toLowerCase() === cur) {
							match = elem;
							break
						}
						elem = elem[dir]
					}
					checkSet[i] = match
				}
			}
		}
		function dirCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
			for ( var i = 0, l = checkSet.length; i < l; i++) {
				var elem = checkSet[i];
				if (elem) {
					var match = false;
					elem = elem[dir];
					while (elem) {
						if (elem[expando] === doneName) {
							match = checkSet[elem.sizset];
							break
						}
						if (elem.nodeType === 1) {
							if (!isXML) {
								elem[expando] = doneName;
								elem.sizset = i
							}
							if (typeof cur !== "string") {
								if (elem === cur) {
									match = true;
									break
								}
							} else {
								if (Sizzle.filter(cur, [
									elem
								]).length > 0) {
									match = elem;
									break
								}
							}
						}
						elem = elem[dir]
					}
					checkSet[i] = match
				}
			}
		}
		if (document.documentElement.contains) {
			Sizzle.contains = function(a, b) {
				return a !== b && (a.contains ? a.contains(b) : true)
			}
		} else {
			if (document.documentElement.compareDocumentPosition) {
				Sizzle.contains = function(a, b) {
					return !!(a.compareDocumentPosition(b) & 16)
				}
			} else {
				Sizzle.contains = function() {
					return false
				}
			}
		}
		Sizzle.isXML = function(elem) {
			var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
			return documentElement ? documentElement.nodeName !== "HTML" : false
		};
		var posProcess = function(selector, context, seed) {
			var match, tmpSet = [], later = "", root = context.nodeType ? [
				context
			] : context;
			while ((match = Expr.match.PSEUDO.exec(selector))) {
				later += match[0];
				selector = selector.replace(Expr.match.PSEUDO, "")
			}
			selector = Expr.relative[selector] ? selector + "*" : selector;
			for ( var i = 0, l = root.length; i < l; i++) {
				Sizzle(selector, root[i], tmpSet, seed)
			}
			return Sizzle.filter(later, tmpSet)
		};
		Sizzle.attr = jQuery.attr;
		Sizzle.selectors.attrMap = {};
		jQuery.find = Sizzle;
		jQuery.expr = Sizzle.selectors;
		jQuery.expr[":"] = jQuery.expr.filters;
		jQuery.unique = Sizzle.uniqueSort;
		jQuery.text = Sizzle.getText;
		jQuery.isXMLDoc = Sizzle.isXML;
		jQuery.contains = Sizzle.contains
	})();
	var runtil = /Until$/, rparentsprev = /^(?:parents|prevUntil|prevAll)/, rmultiselector = /,/, isSimple = /^.[^:#\[\.,]*$/, slice = Array.prototype.slice, POS = jQuery.expr.match.POS, guaranteedUnique = {
		children : true,
		contents : true,
		next : true,
		prev : true
	};
	jQuery.fn.extend({
		find : function(selector) {
			var self = this, i, l;
			if (typeof selector !== "string") {
				return jQuery(selector).filter(function() {
					for (i = 0, l = self.length; i < l; i++) {
						if (jQuery.contains(self[i], this)) {
							return true
						}
					}
				})
			}
			var ret = this.pushStack("", "find", selector), length, n, r;
			for (i = 0, l = this.length; i < l; i++) {
				length = ret.length;
				jQuery.find(selector, this[i], ret);
				if (i > 0) {
					for (n = length; n < ret.length; n++) {
						for (r = 0; r < length; r++) {
							if (ret[r] === ret[n]) {
								ret.splice(n--, 1);
								break
							}
						}
					}
				}
			}
			return ret
		},
		has : function(target) {
			var targets = jQuery(target);
			return this.filter(function() {
				for ( var i = 0, l = targets.length; i < l; i++) {
					if (jQuery.contains(this, targets[i])) {
						return true
					}
				}
			})
		},
		not : function(selector) {
			return this.pushStack(winnow(this, selector, false), "not", selector)
		},
		filter : function(selector) {
			return this.pushStack(winnow(this, selector, true), "filter", selector)
		},
		is : function(selector) {
			return !!selector && (typeof selector === "string" ? POS.test(selector) ? jQuery(selector, this.context).index(this[0]) >= 0 : jQuery.filter(selector, this).length > 0 : this.filter(selector).length > 0)
		},
		closest : function(selectors, context) {
			var ret = [], i, l, cur = this[0];
			if (jQuery.isArray(selectors)) {
				var level = 1;
				while (cur && cur.ownerDocument && cur !== context) {
					for (i = 0; i < selectors.length; i++) {
						if (jQuery(cur).is(selectors[i])) {
							ret.push({
								selector : selectors[i],
								elem : cur,
								level : level
							})
						}
					}
					cur = cur.parentNode;
					level++
				}
				return ret
			}
			var pos = POS.test(selectors) || typeof selectors !== "string" ? jQuery(selectors, context || this.context) : 0;
			for (i = 0, l = this.length; i < l; i++) {
				cur = this[i];
				while (cur) {
					if (pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors)) {
						ret.push(cur);
						break
					} else {
						cur = cur.parentNode;
						if (!cur || !cur.ownerDocument || cur === context || cur.nodeType === 11) {
							break
						}
					}
				}
			}
			ret = ret.length > 1 ? jQuery.unique(ret) : ret;
			return this.pushStack(ret, "closest", selectors)
		},
		index : function(elem) {
			if (!elem) {
				return (this[0] && this[0].parentNode) ? this.prevAll().length : -1
			}
			if (typeof elem === "string") {
				return jQuery.inArray(this[0], jQuery(elem))
			}
			return jQuery.inArray(elem.jquery ? elem[0] : elem, this)
		},
		add : function(selector, context) {
			var set = typeof selector === "string" ? jQuery(selector, context) : jQuery.makeArray(selector && selector.nodeType ? [
				selector
			] : selector), all = jQuery.merge(this.get(), set);
			return this.pushStack(isDisconnected(set[0]) || isDisconnected(all[0]) ? all : jQuery.unique(all))
		},
		andSelf : function() {
			return this.add(this.prevObject)
		}
	});
	function isDisconnected(node) {
		return !node || !node.parentNode || node.parentNode.nodeType === 11
	}
	jQuery.each({
		parent : function(elem) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null
		},
		parents : function(elem) {
			return jQuery.dir(elem, "parentNode")
		},
		parentsUntil : function(elem, i, until) {
			return jQuery.dir(elem, "parentNode", until)
		},
		next : function(elem) {
			return jQuery.nth(elem, 2, "nextSibling")
		},
		prev : function(elem) {
			return jQuery.nth(elem, 2, "previousSibling")
		},
		nextAll : function(elem) {
			return jQuery.dir(elem, "nextSibling")
		},
		prevAll : function(elem) {
			return jQuery.dir(elem, "previousSibling")
		},
		nextUntil : function(elem, i, until) {
			return jQuery.dir(elem, "nextSibling", until)
		},
		prevUntil : function(elem, i, until) {
			return jQuery.dir(elem, "previousSibling", until)
		},
		siblings : function(elem) {
			return jQuery.sibling(elem.parentNode.firstChild, elem)
		},
		children : function(elem) {
			return jQuery.sibling(elem.firstChild)
		},
		contents : function(elem) {
			return jQuery.nodeName(elem, "iframe") ? elem.contentDocument || elem.contentWindow.document : jQuery.makeArray(elem.childNodes)
		}
	}, function(name, fn) {
		jQuery.fn[name] = function(until, selector) {
			var ret = jQuery.map(this, fn, until);
			if (!runtil.test(name)) {
				selector = until
			}
			if (selector && typeof selector === "string") {
				ret = jQuery.filter(selector, ret)
			}
			ret = this.length > 1 && !guaranteedUnique[name] ? jQuery.unique(ret) : ret;
			if ((this.length > 1 || rmultiselector.test(selector)) && rparentsprev.test(name)) {
				ret = ret.reverse()
			}
			return this.pushStack(ret, name, slice.call(arguments).join(","))
		}
	});
	jQuery.extend({
		filter : function(expr, elems, not) {
			if (not) {
				expr = ":not(" + expr + ")"
			}
			return elems.length === 1 ? jQuery.find.matchesSelector(elems[0], expr) ? [
				elems[0]
			] : [] : jQuery.find.matches(expr, elems)
		},
		dir : function(elem, dir, until) {
			var matched = [], cur = elem[dir];
			while (cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery(cur).is(until))) {
				if (cur.nodeType === 1) {
					matched.push(cur)
				}
				cur = cur[dir]
			}
			return matched
		},
		nth : function(cur, result, dir, elem) {
			result = result || 1;
			var num = 0;
			for (; cur; cur = cur[dir]) {
				if (cur.nodeType === 1 && ++num === result) {
					break
				}
			}
			return cur
		},
		sibling : function(n, elem) {
			var r = [];
			for (; n; n = n.nextSibling) {
				if (n.nodeType === 1 && n !== elem) {
					r.push(n)
				}
			}
			return r
		}
	});
	function winnow(elements, qualifier, keep) {
		qualifier = qualifier || 0;
		if (jQuery.isFunction(qualifier)) {
			return jQuery.grep(elements, function(elem, i) {
				var retVal = !!qualifier.call(elem, i, elem);
				return retVal === keep
			})
		} else {
			if (qualifier.nodeType) {
				return jQuery.grep(elements, function(elem, i) {
					return (elem === qualifier) === keep
				})
			} else {
				if (typeof qualifier === "string") {
					var filtered = jQuery.grep(elements, function(elem) {
						return elem.nodeType === 1
					});
					if (isSimple.test(qualifier)) {
						return jQuery.filter(qualifier, filtered, !keep)
					} else {
						qualifier = jQuery.filter(qualifier, filtered)
					}
				}
			}
		}
		return jQuery.grep(elements, function(elem, i) {
			return (jQuery.inArray(elem, qualifier) >= 0) === keep
		})
	}
	function createSafeFragment(document) {
		var list = nodeNames.split("|"), safeFrag = document.createDocumentFragment();
		if (safeFrag.createElement) {
			while (list.length) {
				safeFrag.createElement(list.pop())
			}
		}
		return safeFrag
	}
	var nodeNames = "abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video", rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g, rleadingWhitespace = /^\s+/, rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig, rtagName = /<([\w:]+)/, rtbody = /<tbody/i, rhtml = /<|&#?\w+;/, rnoInnerhtml = /<(?:script|style)/i, rnocache = /<(?:script|object|embed|option|style)/i, rnoshimcache = new RegExp(
		"<(?:" + nodeNames + ")", "i"), rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i, rscriptType = /\/(java|ecma)script/i, rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)/, wrapMap = {
		option : [
			1, "<select multiple='multiple'>", "</select>"
		],
		legend : [
			1, "<fieldset>", "</fieldset>"
		],
		thead : [
			1, "<table>", "</table>"
		],
		tr : [
			2, "<table><tbody>", "</tbody></table>"
		],
		td : [
			3, "<table><tbody><tr>", "</tr></tbody></table>"
		],
		col : [
			2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"
		],
		area : [
			1, "<map>", "</map>"
		],
		_default : [
			0, "", ""
		]
	}, safeFragment = createSafeFragment(document);
	wrapMap.optgroup = wrapMap.option;
	wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	wrapMap.th = wrapMap.td;
	if (!jQuery.support.htmlSerialize) {
		wrapMap._default = [
			1, "div<div>", "</div>"
		]
	}
	jQuery.fn.extend({
		text : function(text) {
			if (jQuery.isFunction(text)) {
				return this.each(function(i) {
					var self = jQuery(this);
					self.text(text.call(this, i, self.text()))
				})
			}
			if (typeof text !== "object" && text !== undefined) {
				return this.empty().append((this[0] && this[0].ownerDocument || document).createTextNode(text))
			}
			return jQuery.text(this)
		},
		wrapAll : function(html) {
			if (jQuery.isFunction(html)) {
				return this.each(function(i) {
					jQuery(this).wrapAll(html.call(this, i))
				})
			}
			if (this[0]) {
				var wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);
				if (this[0].parentNode) {
					wrap.insertBefore(this[0])
				}
				wrap.map(function() {
					var elem = this;
					while (elem.firstChild && elem.firstChild.nodeType === 1) {
						elem = elem.firstChild
					}
					return elem
				}).append(this)
			}
			return this
		},
		wrapInner : function(html) {
			if (jQuery.isFunction(html)) {
				return this.each(function(i) {
					jQuery(this).wrapInner(html.call(this, i))
				})
			}
			return this.each(function() {
				var self = jQuery(this), contents = self.contents();
				if (contents.length) {
					contents.wrapAll(html)
				} else {
					self.append(html)
				}
			})
		},
		wrap : function(html) {
			var isFunction = jQuery.isFunction(html);
			return this.each(function(i) {
				jQuery(this).wrapAll(isFunction ? html.call(this, i) : html)
			})
		},
		unwrap : function() {
			return this.parent().each(function() {
				if (!jQuery.nodeName(this, "body")) {
					jQuery(this).replaceWith(this.childNodes)
				}
			}).end()
		},
		append : function() {
			return this.domManip(arguments, true, function(elem) {
				if (this.nodeType === 1) {
					this.appendChild(elem)
				}
			})
		},
		prepend : function() {
			return this.domManip(arguments, true, function(elem) {
				if (this.nodeType === 1) {
					this.insertBefore(elem, this.firstChild)
				}
			})
		},
		before : function() {
			if (this[0] && this[0].parentNode) {
				return this.domManip(arguments, false, function(elem) {
					this.parentNode.insertBefore(elem, this)
				})
			} else {
				if (arguments.length) {
					var set = jQuery.clean(arguments);
					set.push.apply(set, this.toArray());
					return this.pushStack(set, "before", arguments)
				}
			}
		},
		after : function() {
			if (this[0] && this[0].parentNode) {
				return this.domManip(arguments, false, function(elem) {
					this.parentNode.insertBefore(elem, this.nextSibling)
				})
			} else {
				if (arguments.length) {
					var set = this.pushStack(this, "after", arguments);
					set.push.apply(set, jQuery.clean(arguments));
					return set
				}
			}
		},
		remove : function(selector, keepData) {
			for ( var i = 0, elem; (elem = this[i]) != null; i++) {
				if (!selector || jQuery.filter(selector, [
					elem
				]).length) {
					if (!keepData && elem.nodeType === 1) {
						jQuery.cleanData(elem.getElementsByTagName("*"));
						jQuery.cleanData([
							elem
						])
					}
					if (elem.parentNode) {
						elem.parentNode.removeChild(elem)
					}
				}
			}
			return this
		},
		empty : function() {
			for ( var i = 0, elem; (elem = this[i]) != null; i++) {
				if (elem.nodeType === 1) {
					jQuery.cleanData(elem.getElementsByTagName("*"))
				}
				while (elem.firstChild) {
					elem.removeChild(elem.firstChild)
				}
			}
			return this
		},
		clone : function(dataAndEvents, deepDataAndEvents) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
			return this.map(function() {
				return jQuery.clone(this, dataAndEvents, deepDataAndEvents)
			})
		},
		html : function(value) {
			if (value === undefined) {
				return this[0] && this[0].nodeType === 1 ? this[0].innerHTML.replace(rinlinejQuery, "") : null
			} else {
				if (typeof value === "string" && !rnoInnerhtml.test(value) && (jQuery.support.leadingWhitespace || !rleadingWhitespace.test(value)) && !wrapMap[(rtagName.exec(value) || [
					"", ""
				])[1].toLowerCase()]) {
					value = value.replace(rxhtmlTag, "<$1></$2>");
					try {
						for ( var i = 0, l = this.length; i < l; i++) {
							if (this[i].nodeType === 1) {
								jQuery.cleanData(this[i].getElementsByTagName("*"));
								this[i].innerHTML = value
							}
						}
					} catch (e) {
						this.empty().append(value)
					}
				} else {
					if (jQuery.isFunction(value)) {
						this.each(function(i) {
							var self = jQuery(this);
							self.html(value.call(this, i, self.html()))
						})
					} else {
						this.empty().append(value)
					}
				}
			}
			return this
		},
		replaceWith : function(value) {
			if (this[0] && this[0].parentNode) {
				if (jQuery.isFunction(value)) {
					return this.each(function(i) {
						var self = jQuery(this), old = self.html();
						self.replaceWith(value.call(this, i, old))
					})
				}
				if (typeof value !== "string") {
					value = jQuery(value).detach()
				}
				return this.each(function() {
					var next = this.nextSibling, parent = this.parentNode;
					jQuery(this).remove();
					if (next) {
						jQuery(next).before(value)
					} else {
						jQuery(parent).append(value)
					}
				})
			} else {
				return this.length ? this.pushStack(jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value) : this
			}
		},
		detach : function(selector) {
			return this.remove(selector, true)
		},
		domManip : function(args, table, callback) {
			var results, first, fragment, parent, value = args[0], scripts = [];
			if (!jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test(value)) {
				return this.each(function() {
					jQuery(this).domManip(args, table, callback, true)
				})
			}
			if (jQuery.isFunction(value)) {
				return this.each(function(i) {
					var self = jQuery(this);
					args[0] = value.call(this, i, table ? self.html() : undefined);
					self.domManip(args, table, callback)
				})
			}
			if (this[0]) {
				parent = value && value.parentNode;
				if (jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length) {
					results = {
						fragment : parent
					}
				} else {
					results = jQuery.buildFragment(args, this, scripts)
				}
				fragment = results.fragment;
				if (fragment.childNodes.length === 1) {
					first = fragment = fragment.firstChild
				} else {
					first = fragment.firstChild
				}
				if (first) {
					table = table && jQuery.nodeName(first, "tr");
					for ( var i = 0, l = this.length, lastIndex = l - 1; i < l; i++) {
						callback.call(table ? root(this[i], first) : this[i], results.cacheable || (l > 1 && i < lastIndex) ? jQuery.clone(fragment, true, true) : fragment)
					}
				}
				if (scripts.length) {
					jQuery.each(scripts, evalScript)
				}
			}
			return this
		}
	});
	function root(elem, cur) {
		return jQuery.nodeName(elem, "table") ? (elem.getElementsByTagName("tbody")[0] || elem.appendChild(elem.ownerDocument.createElement("tbody"))) : elem
	}
	function cloneCopyEvent(src, dest) {
		if (dest.nodeType !== 1 || !jQuery.hasData(src)) {
			return
		}
		var type, i, l, oldData = jQuery._data(src), curData = jQuery._data(dest, oldData), events = oldData.events;
		if (events) {
			delete curData.handle;
			curData.events = {};
			for (type in events) {
				for (i = 0, l = events[type].length; i < l; i++) {
					jQuery.event.add(dest, type + (events[type][i].namespace ? "." : "") + events[type][i].namespace, events[type][i], events[type][i].data)
				}
			}
		}
		if (curData.data) {
			curData.data = jQuery.extend({}, curData.data)
		}
	}
	function cloneFixAttributes(src, dest) {
		var nodeName;
		if (dest.nodeType !== 1) {
			return
		}
		if (dest.clearAttributes) {
			dest.clearAttributes()
		}
		if (dest.mergeAttributes) {
			dest.mergeAttributes(src)
		}
		nodeName = dest.nodeName.toLowerCase();
		if (nodeName === "object") {
			dest.outerHTML = src.outerHTML
		} else {
			if (nodeName === "input" && (src.type === "checkbox" || src.type === "radio")) {
				if (src.checked) {
					dest.defaultChecked = dest.checked = src.checked
				}
				if (dest.value !== src.value) {
					dest.value = src.value
				}
			} else {
				if (nodeName === "option") {
					dest.selected = src.defaultSelected
				} else {
					if (nodeName === "input" || nodeName === "textarea") {
						dest.defaultValue = src.defaultValue
					}
				}
			}
		}
		dest.removeAttribute(jQuery.expando)
	}
	jQuery.buildFragment = function(args, nodes, scripts) {
		var fragment, cacheable, cacheresults, doc, first = args[0];
		if (nodes && nodes[0]) {
			doc = nodes[0].ownerDocument || nodes[0]
		}
		if (!doc.createDocumentFragment) {
			doc = document
		}
		if (args.length === 1 && typeof first === "string" && first.length < 512 && doc === document && first.charAt(0) === "<" && !rnocache.test(first) && (jQuery.support.checkClone || !rchecked.test(first)) && (jQuery.support.html5Clone || !rnoshimcache.test(first))) {
			cacheable = true;
			cacheresults = jQuery.fragments[first];
			if (cacheresults && cacheresults !== 1) {
				fragment = cacheresults
			}
		}
		if (!fragment) {
			fragment = doc.createDocumentFragment();
			jQuery.clean(args, doc, fragment, scripts)
		}
		if (cacheable) {
			jQuery.fragments[first] = cacheresults ? fragment : 1
		}
		return {
			fragment : fragment,
			cacheable : cacheable
		}
	};
	jQuery.fragments = {};
	jQuery.each({
		appendTo : "append",
		prependTo : "prepend",
		insertBefore : "before",
		insertAfter : "after",
		replaceAll : "replaceWith"
	}, function(name, original) {
		jQuery.fn[name] = function(selector) {
			var ret = [], insert = jQuery(selector), parent = this.length === 1 && this[0].parentNode;
			if (parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1) {
				insert[original](this[0]);
				return this
			} else {
				for ( var i = 0, l = insert.length; i < l; i++) {
					var elems = (i > 0 ? this.clone(true) : this).get();
					jQuery(insert[i])[original](elems);
					ret = ret.concat(elems)
				}
				return this.pushStack(ret, name, insert.selector)
			}
		}
	});
	function getAll(elem) {
		if (typeof elem.getElementsByTagName !== "undefined") {
			return elem.getElementsByTagName("*")
		} else {
			if (typeof elem.querySelectorAll !== "undefined") {
				return elem.querySelectorAll("*")
			} else {
				return []
			}
		}
	}
	function fixDefaultChecked(elem) {
		if (elem.type === "checkbox" || elem.type === "radio") {
			elem.defaultChecked = elem.checked
		}
	}
	function findInputs(elem) {
		var nodeName = (elem.nodeName || "").toLowerCase();
		if (nodeName === "input") {
			fixDefaultChecked(elem)
		} else {
			if (nodeName !== "script" && typeof elem.getElementsByTagName !== "undefined") {
				jQuery.grep(elem.getElementsByTagName("input"), fixDefaultChecked)
			}
		}
	}
	function shimCloneNode(elem) {
		var div = document.createElement("div");
		safeFragment.appendChild(div);
		div.innerHTML = elem.outerHTML;
		return div.firstChild
	}
	jQuery.extend({
		clone : function(elem, dataAndEvents, deepDataAndEvents) {
			var srcElements, destElements, i, clone = jQuery.support.html5Clone || !rnoshimcache.test("<" + elem.nodeName) ? elem.cloneNode(true) : shimCloneNode(elem);
			if ((!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) && (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem)) {
				cloneFixAttributes(elem, clone);
				srcElements = getAll(elem);
				destElements = getAll(clone);
				for (i = 0; srcElements[i]; ++i) {
					if (destElements[i]) {
						cloneFixAttributes(srcElements[i], destElements[i])
					}
				}
			}
			if (dataAndEvents) {
				cloneCopyEvent(elem, clone);
				if (deepDataAndEvents) {
					srcElements = getAll(elem);
					destElements = getAll(clone);
					for (i = 0; srcElements[i]; ++i) {
						cloneCopyEvent(srcElements[i], destElements[i])
					}
				}
			}
			srcElements = destElements = null;
			return clone
		},
		clean : function(elems, context, fragment, scripts) {
			var checkScriptType;
			context = context || document;
			if (typeof context.createElement === "undefined") {
				context = context.ownerDocument || context[0] && context[0].ownerDocument || document
			}
			var ret = [], j;
			for ( var i = 0, elem; (elem = elems[i]) != null; i++) {
				if (typeof elem === "number") {
					elem += ""
				}
				if (!elem) {
					continue
				}
				if (typeof elem === "string") {
					if (!rhtml.test(elem)) {
						elem = context.createTextNode(elem)
					} else {
						elem = elem.replace(rxhtmlTag, "<$1></$2>");
						var tag = (rtagName.exec(elem) || [
							"", ""
						])[1].toLowerCase(), wrap = wrapMap[tag] || wrapMap._default, depth = wrap[0], div = context.createElement("div");
						if (context === document) {
							safeFragment.appendChild(div)
						} else {
							createSafeFragment(context).appendChild(div)
						}
						div.innerHTML = wrap[1] + elem + wrap[2];
						while (depth--) {
							div = div.lastChild
						}
						if (!jQuery.support.tbody) {
							var hasBody = rtbody.test(elem), tbody = tag === "table" && !hasBody ? div.firstChild && div.firstChild.childNodes : wrap[1] === "<table>" && !hasBody ? div.childNodes : [];
							for (j = tbody.length - 1; j >= 0; --j) {
								if (jQuery.nodeName(tbody[j], "tbody") && !tbody[j].childNodes.length) {
									tbody[j].parentNode.removeChild(tbody[j])
								}
							}
						}
						if (!jQuery.support.leadingWhitespace && rleadingWhitespace.test(elem)) {
							div.insertBefore(context.createTextNode(rleadingWhitespace.exec(elem)[0]), div.firstChild)
						}
						elem = div.childNodes
					}
				}
				var len;
				if (!jQuery.support.appendChecked) {
					if (elem[0] && typeof (len = elem.length) === "number") {
						for (j = 0; j < len; j++) {
							findInputs(elem[j])
						}
					} else {
						findInputs(elem)
					}
				}
				if (elem.nodeType) {
					ret.push(elem)
				} else {
					ret = jQuery.merge(ret, elem)
				}
			}
			if (fragment) {
				checkScriptType = function(elem) {
					return !elem.type || rscriptType.test(elem.type)
				};
				for (i = 0; ret[i]; i++) {
					if (scripts && jQuery.nodeName(ret[i], "script") && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript")) {
						scripts.push(ret[i].parentNode ? ret[i].parentNode.removeChild(ret[i]) : ret[i])
					} else {
						if (ret[i].nodeType === 1) {
							var jsTags = jQuery.grep(ret[i].getElementsByTagName("script"), checkScriptType);
							ret.splice.apply(ret, [
								i + 1, 0
							].concat(jsTags))
						}
						fragment.appendChild(ret[i])
					}
				}
			}
			return ret
		},
		cleanData : function(elems) {
			var data, id, cache = jQuery.cache, special = jQuery.event.special, deleteExpando = jQuery.support.deleteExpando;
			for ( var i = 0, elem; (elem = elems[i]) != null; i++) {
				if (elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()]) {
					continue
				}
				id = elem[jQuery.expando];
				if (id) {
					data = cache[id];
					if (data && data.events) {
						for ( var type in data.events) {
							if (special[type]) {
								jQuery.event.remove(elem, type)
							} else {
								jQuery.removeEvent(elem, type, data.handle)
							}
						}
						if (data.handle) {
							data.handle.elem = null
						}
					}
					if (deleteExpando) {
						delete elem[jQuery.expando]
					} else {
						if (elem.removeAttribute) {
							elem.removeAttribute(jQuery.expando)
						}
					}
					delete cache[id]
				}
			}
		}
	});
	function evalScript(i, elem) {
		if (elem.src) {
			jQuery.ajax({
				url : elem.src,
				async : false,
				dataType : "script"
			})
		} else {
			jQuery.globalEval((elem.text || elem.textContent || elem.innerHTML || "").replace(rcleanScript, "/*$0*/"))
		}
		if (elem.parentNode) {
			elem.parentNode.removeChild(elem)
		}
	}
	var ralpha = /alpha\([^)]*\)/i, ropacity = /opacity=([^)]*)/, rupper = /([A-Z]|^ms)/g, rnumpx = /^-?\d+(?:px)?$/i, rnum = /^-?\d/, rrelNum = /^([\-+])=([\-+.\de]+)/, cssShow = {
		position : "absolute",
		visibility : "hidden",
		display : "block"
	}, cssWidth = [
		"Left", "Right"
	], cssHeight = [
		"Top", "Bottom"
	], curCSS, getComputedStyle, currentStyle;
	jQuery.fn.css = function(name, value) {
		if (arguments.length === 2 && value === undefined) {
			return this
		}
		return jQuery.access(this, name, value, true, function(elem, name, value) {
			return value !== undefined ? jQuery.style(elem, name, value) : jQuery.css(elem, name)
		})
	};
	jQuery.extend({
		cssHooks : {
			opacity : {
				get : function(elem, computed) {
					if (computed) {
						var ret = curCSS(elem, "opacity", "opacity");
						return ret === "" ? "1" : ret
					} else {
						return elem.style.opacity
					}
				}
			}
		},
		cssNumber : {
			fillOpacity : true,
			fontWeight : true,
			lineHeight : true,
			opacity : true,
			orphans : true,
			widows : true,
			zIndex : true,
			zoom : true
		},
		cssProps : {
			"float" : jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
		},
		style : function(elem, name, value, extra) {
			if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
				return
			}
			var ret, type, origName = jQuery.camelCase(name), style = elem.style, hooks = jQuery.cssHooks[origName];
			name = jQuery.cssProps[origName] || origName;
			if (value !== undefined) {
				type = typeof value;
				if (type === "string" && (ret = rrelNum.exec(value))) {
					value = (+(ret[1] + 1) * +ret[2]) + parseFloat(jQuery.css(elem, name));
					type = "number"
				}
				if (value == null || type === "number" && isNaN(value)) {
					return
				}
				if (type === "number" && !jQuery.cssNumber[origName]) {
					value += "px"
				}
				if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value)) !== undefined) {
					try {
						style[name] = value
					} catch (e) {
					}
				}
			} else {
				if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) {
					return ret
				}
				return style[name]
			}
		},
		css : function(elem, name, extra) {
			var ret, hooks;
			name = jQuery.camelCase(name);
			hooks = jQuery.cssHooks[name];
			name = jQuery.cssProps[name] || name;
			if (name === "cssFloat") {
				name = "float"
			}
			if (hooks && "get" in hooks && (ret = hooks.get(elem, true, extra)) !== undefined) {
				return ret
			} else {
				if (curCSS) {
					return curCSS(elem, name)
				}
			}
		},
		swap : function(elem, options, callback) {
			var old = {};
			for ( var name in options) {
				old[name] = elem.style[name];
				elem.style[name] = options[name]
			}
			callback.call(elem);
			for (name in options) {
				elem.style[name] = old[name]
			}
		}
	});
	jQuery.curCSS = jQuery.css;
	jQuery.each([
		"height", "width"
	], function(i, name) {
		jQuery.cssHooks[name] = {
			get : function(elem, computed, extra) {
				var val;
				if (computed) {
					if (elem.offsetWidth !== 0) {
						return getWH(elem, name, extra)
					} else {
						jQuery.swap(elem, cssShow, function() {
							val = getWH(elem, name, extra)
						})
					}
					return val
				}
			},
			set : function(elem, value) {
				if (rnumpx.test(value)) {
					value = parseFloat(value);
					if (value >= 0) {
						return value + "px"
					}
				} else {
					return value
				}
			}
		}
	});
	if (!jQuery.support.opacity) {
		jQuery.cssHooks.opacity = {
			get : function(elem, computed) {
				return ropacity.test((computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "") ? (parseFloat(RegExp.$1) / 100) + "" : computed ? "1" : ""
			},
			set : function(elem, value) {
				var style = elem.style, currentStyle = elem.currentStyle, opacity = jQuery.isNumeric(value) ? "alpha(opacity=" + value * 100 + ")" : "", filter = currentStyle && currentStyle.filter || style.filter || "";
				style.zoom = 1;
				if (value >= 1 && jQuery.trim(filter.replace(ralpha, "")) === "") {
					style.removeAttribute("filter");
					if (currentStyle && !currentStyle.filter) {
						return
					}
				}
				style.filter = ralpha.test(filter) ? filter.replace(ralpha, opacity) : filter + " " + opacity
			}
		}
	}
	jQuery(function() {
		if (!jQuery.support.reliableMarginRight) {
			jQuery.cssHooks.marginRight = {
				get : function(elem, computed) {
					var ret;
					jQuery.swap(elem, {
						display : "inline-block"
					}, function() {
						if (computed) {
							ret = curCSS(elem, "margin-right", "marginRight")
						} else {
							ret = elem.style.marginRight
						}
					});
					return ret
				}
			}
		}
	});
	if (document.defaultView && document.defaultView.getComputedStyle) {
		getComputedStyle = function(elem, name) {
			var ret, defaultView, computedStyle;
			name = name.replace(rupper, "-$1").toLowerCase();
			if ((defaultView = elem.ownerDocument.defaultView) && (computedStyle = defaultView.getComputedStyle(elem, null))) {
				ret = computedStyle.getPropertyValue(name);
				if (ret === "" && !jQuery.contains(elem.ownerDocument.documentElement, elem)) {
					ret = jQuery.style(elem, name)
				}
			}
			return ret
		}
	}
	if (document.documentElement.currentStyle) {
		currentStyle = function(elem, name) {
			var left, rsLeft, uncomputed, ret = elem.currentStyle && elem.currentStyle[name], style = elem.style;
			if (ret === null && style && (uncomputed = style[name])) {
				ret = uncomputed
			}
			if (!rnumpx.test(ret) && rnum.test(ret)) {
				left = style.left;
				rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;
				if (rsLeft) {
					elem.runtimeStyle.left = elem.currentStyle.left
				}
				style.left = name === "fontSize" ? "1em" : (ret || 0);
				ret = style.pixelLeft + "px";
				style.left = left;
				if (rsLeft) {
					elem.runtimeStyle.left = rsLeft
				}
			}
			return ret === "" ? "auto" : ret
		}
	}
	curCSS = getComputedStyle || currentStyle;
	function getWH(elem, name, extra) {
		var val = name === "width" ? elem.offsetWidth : elem.offsetHeight, which = name === "width" ? cssWidth : cssHeight, i = 0, len = which.length;
		if (val > 0) {
			if (extra !== "border") {
				for (; i < len; i++) {
					if (!extra) {
						val -= parseFloat(jQuery.css(elem, "padding" + which[i])) || 0
					}
					if (extra === "margin") {
						val += parseFloat(jQuery.css(elem, extra + which[i])) || 0
					} else {
						val -= parseFloat(jQuery.css(elem, "border" + which[i] + "Width")) || 0
					}
				}
			}
			return val + "px"
		}
		val = curCSS(elem, name, name);
		if (val < 0 || val == null) {
			val = elem.style[name] || 0
		}
		val = parseFloat(val) || 0;
		if (extra) {
			for (; i < len; i++) {
				val += parseFloat(jQuery.css(elem, "padding" + which[i])) || 0;
				if (extra !== "padding") {
					val += parseFloat(jQuery.css(elem, "border" + which[i] + "Width")) || 0
				}
				if (extra === "margin") {
					val += parseFloat(jQuery.css(elem, extra + which[i])) || 0
				}
			}
		}
		return val + "px"
	}
	if (jQuery.expr && jQuery.expr.filters) {
		jQuery.expr.filters.hidden = function(elem) {
			var width = elem.offsetWidth, height = elem.offsetHeight;
			return (width === 0 && height === 0) || (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css(elem, "display")) === "none")
		};
		jQuery.expr.filters.visible = function(elem) {
			return !jQuery.expr.filters.hidden(elem)
		}
	}
	var r20 = /%20/g, rbracket = /\[\]$/, rCRLF = /\r?\n/g, rhash = /#.*$/, rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i, rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/, rnoContent = /^(?:GET|HEAD)$/, rprotocol = /^\/\//, rquery = /\?/, rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, rselectTextarea = /^(?:select|textarea)/i, rspacesAjax = /\s+/, rts = /([?&])_=[^&]*/, rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/, _load = jQuery.fn.load, prefilters = {}, transports = {}, ajaxLocation, ajaxLocParts, allTypes = [
		"*/"
	] + [
		"*"
	];
	try {
		ajaxLocation = location.href
	} catch (e) {
		ajaxLocation = document.createElement("a");
		ajaxLocation.href = "";
		ajaxLocation = ajaxLocation.href
	}
	ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];
	function addToPrefiltersOrTransports(structure) {
		return function(dataTypeExpression, func) {
			if (typeof dataTypeExpression !== "string") {
				func = dataTypeExpression;
				dataTypeExpression = "*"
			}
			if (jQuery.isFunction(func)) {
				var dataTypes = dataTypeExpression.toLowerCase().split(rspacesAjax), i = 0, length = dataTypes.length, dataType, list, placeBefore;
				for (; i < length; i++) {
					dataType = dataTypes[i];
					placeBefore = /^\+/.test(dataType);
					if (placeBefore) {
						dataType = dataType.substr(1) || "*"
					}
					list = structure[dataType] = structure[dataType] || [];
					list[placeBefore ? "unshift" : "push"](func)
				}
			}
		}
	}
	function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR, dataType, inspected) {
		dataType = dataType || options.dataTypes[0];
		inspected = inspected || {};
		inspected[dataType] = true;
		var list = structure[dataType], i = 0, length = list ? list.length : 0, executeOnly = (structure === prefilters), selection;
		for (; i < length && (executeOnly || !selection); i++) {
			selection = list[i](options, originalOptions, jqXHR);
			if (typeof selection === "string") {
				if (!executeOnly || inspected[selection]) {
					selection = undefined
				} else {
					options.dataTypes.unshift(selection);
					selection = inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR, selection, inspected)
				}
			}
		}
		if ((executeOnly || !selection) && !inspected["*"]) {
			selection = inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR, "*", inspected)
		}
		return selection
	}
	function ajaxExtend(target, src) {
		var key, deep, flatOptions = jQuery.ajaxSettings.flatOptions || {};
		for (key in src) {
			if (src[key] !== undefined) {
				(flatOptions[key] ? target : (deep || (deep = {})))[key] = src[key]
			}
		}
		if (deep) {
			jQuery.extend(true, target, deep)
		}
	}
	jQuery.fn.extend({
		load : function(url, params, callback) {
			if (typeof url !== "string" && _load) {
				return _load.apply(this, arguments)
			} else {
				if (!this.length) {
					return this
				}
			}
			var off = url.indexOf(" ");
			if (off >= 0) {
				var selector = url.slice(off, url.length);
				url = url.slice(0, off)
			}
			var type = "GET";
			if (params) {
				if (jQuery.isFunction(params)) {
					callback = params;
					params = undefined
				} else {
					if (typeof params === "object") {
						params = jQuery.param(params, jQuery.ajaxSettings.traditional);
						type = "POST"
					}
				}
			}
			var self = this;
			jQuery.ajax({
				url : url,
				type : type,
				dataType : "html",
				data : params,
				complete : function(jqXHR, status, responseText) {
					responseText = jqXHR.responseText;
					if (jqXHR.isResolved()) {
						jqXHR.done(function(r) {
							responseText = r
						});
						self.html(selector ? jQuery("<div>").append(responseText.replace(rscript, "")).find(selector) : responseText)
					}
					if (callback) {
						self.each(callback, [
							responseText, status, jqXHR
						])
					}
				}
			});
			return this
		},
		serialize : function() {
			return jQuery.param(this.serializeArray())
		},
		serializeArray : function() {
			return this.map(function() {
				return this.elements ? jQuery.makeArray(this.elements) : this
			}).filter(function() {
				return this.name && !this.disabled && (this.checked || rselectTextarea.test(this.nodeName) || rinput.test(this.type))
			}).map(function(i, elem) {
				var val = jQuery(this).val();
				return val == null ? null : jQuery.isArray(val) ? jQuery.map(val, function(val, i) {
					return {
						name : elem.name,
						value : val.replace(rCRLF, "\r\n")
					}
				}) : {
					name : elem.name,
					value : val.replace(rCRLF, "\r\n")
				}
			}).get()
		}
	});
	jQuery.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), function(i, o) {
		jQuery.fn[o] = function(f) {
			return this.on(o, f)
		}
	});
	jQuery.each([
		"get", "post"
	], function(i, method) {
		jQuery[method] = function(url, data, callback, type) {
			if (jQuery.isFunction(data)) {
				type = type || callback;
				callback = data;
				data = undefined
			}
			return jQuery.ajax({
				type : method,
				url : url,
				data : data,
				success : callback,
				dataType : type
			})
		}
	});
	jQuery.extend({
		getScript : function(url, callback) {
			return jQuery.get(url, undefined, callback, "script")
		},
		getJSON : function(url, data, callback) {
			return jQuery.get(url, data, callback, "json")
		},
		ajaxSetup : function(target, settings) {
			if (settings) {
				ajaxExtend(target, jQuery.ajaxSettings)
			} else {
				settings = target;
				target = jQuery.ajaxSettings
			}
			ajaxExtend(target, settings);
			return target
		},
		ajaxSettings : {
			url : ajaxLocation,
			isLocal : rlocalProtocol.test(ajaxLocParts[1]),
			global : true,
			type : "GET",
			contentType : "application/x-www-form-urlencoded",
			processData : true,
			async : true,
			accepts : {
				xml : "application/xml, text/xml",
				html : "text/html",
				text : "text/plain",
				json : "application/json, text/javascript",
				"*" : allTypes
			},
			contents : {
				xml : /xml/,
				html : /html/,
				json : /json/
			},
			responseFields : {
				xml : "responseXML",
				text : "responseText"
			},
			converters : {
				"* text" : window.String,
				"text html" : true,
				"text json" : jQuery.parseJSON,
				"text xml" : jQuery.parseXML
			},
			flatOptions : {
				context : true,
				url : true
			}
		},
		ajaxPrefilter : addToPrefiltersOrTransports(prefilters),
		ajaxTransport : addToPrefiltersOrTransports(transports),
		ajax : function(url, options) {
			if (typeof url === "object") {
				options = url;
				url = undefined
			}
			options = options || {};
			var s = jQuery.ajaxSetup({}, options), callbackContext = s.context || s, globalEventContext = callbackContext !== s && (callbackContext.nodeType || callbackContext instanceof jQuery) ? jQuery(callbackContext) : jQuery.event, deferred = jQuery.Deferred(), completeDeferred = jQuery
				.Callbacks("once memory"), statusCode = s.statusCode || {}, ifModifiedKey, requestHeaders = {}, requestHeadersNames = {}, responseHeadersString, responseHeaders, transport, timeoutTimer, parts, state = 0, fireGlobals, i, jqXHR = {
				readyState : 0,
				setRequestHeader : function(name, value) {
					if (!state) {
						var lname = name.toLowerCase();
						name = requestHeadersNames[lname] = requestHeadersNames[lname] || name;
						requestHeaders[name] = value
					}
					return this
				},
				getAllResponseHeaders : function() {
					return state === 2 ? responseHeadersString : null
				},
				getResponseHeader : function(key) {
					var match;
					if (state === 2) {
						if (!responseHeaders) {
							responseHeaders = {};
							while ((match = rheaders.exec(responseHeadersString))) {
								responseHeaders[match[1].toLowerCase()] = match[2]
							}
						}
						match = responseHeaders[key.toLowerCase()]
					}
					return match === undefined ? null : match
				},
				overrideMimeType : function(type) {
					if (!state) {
						s.mimeType = type
					}
					return this
				},
				abort : function(statusText) {
					statusText = statusText || "abort";
					if (transport) {
						transport.abort(statusText)
					}
					done(0, statusText);
					return this
				}
			};
			function done(status, nativeStatusText, responses, headers) {
				if (state === 2) {
					return
				}
				state = 2;
				if (timeoutTimer) {
					clearTimeout(timeoutTimer)
				}
				transport = undefined;
				responseHeadersString = headers || "";
				jqXHR.readyState = status > 0 ? 4 : 0;
				var isSuccess, success, error, statusText = nativeStatusText, response = responses ? ajaxHandleResponses(s, jqXHR, responses) : undefined, lastModified, etag;
				if (status >= 200 && status < 300 || status === 304) {
					if (s.ifModified) {
						if ((lastModified = jqXHR.getResponseHeader("Last-Modified"))) {
							jQuery.lastModified[ifModifiedKey] = lastModified
						}
						if ((etag = jqXHR.getResponseHeader("Etag"))) {
							jQuery.etag[ifModifiedKey] = etag
						}
					}
					if (status === 304) {
						statusText = "notmodified";
						isSuccess = true
					} else {
						try {
							success = ajaxConvert(s, response);
							statusText = "success";
							isSuccess = true
						} catch (e) {
							statusText = "parsererror";
							error = e
						}
					}
				} else {
					error = statusText;
					if (!statusText || status) {
						statusText = "error";
						if (status < 0) {
							status = 0
						}
					}
				}
				jqXHR.status = status;
				jqXHR.statusText = "" + (nativeStatusText || statusText);
				if (isSuccess) {
					deferred.resolveWith(callbackContext, [
						success, statusText, jqXHR
					])
				} else {
					deferred.rejectWith(callbackContext, [
						jqXHR, statusText, error
					])
				}
				jqXHR.statusCode(statusCode);
				statusCode = undefined;
				if (fireGlobals) {
					globalEventContext.trigger("ajax" + (isSuccess ? "Success" : "Error"), [
						jqXHR, s, isSuccess ? success : error
					])
				}
				completeDeferred.fireWith(callbackContext, [
					jqXHR, statusText
				]);
				if (fireGlobals) {
					globalEventContext.trigger("ajaxComplete", [
						jqXHR, s
					]);
					if (!(--jQuery.active)) {
						jQuery.event.trigger("ajaxStop")
					}
				}
			}
			deferred.promise(jqXHR);
			jqXHR.success = jqXHR.done;
			jqXHR.error = jqXHR.fail;
			jqXHR.complete = completeDeferred.add;
			jqXHR.statusCode = function(map) {
				if (map) {
					var tmp;
					if (state < 2) {
						for (tmp in map) {
							statusCode[tmp] = [
								statusCode[tmp], map[tmp]
							]
						}
					} else {
						tmp = map[jqXHR.status];
						jqXHR.then(tmp, tmp)
					}
				}
				return this
			};
			s.url = ((url || s.url) + "").replace(rhash, "").replace(rprotocol, ajaxLocParts[1] + "//");
			s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().split(rspacesAjax);
			if (s.crossDomain == null) {
				parts = rurl.exec(s.url.toLowerCase());
				s.crossDomain = !!(parts && (parts[1] != ajaxLocParts[1] || parts[2] != ajaxLocParts[2] || (parts[3] || (parts[1] === "http:" ? 80 : 443)) != (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443))))
			}
			if (s.data && s.processData && typeof s.data !== "string") {
				s.data = jQuery.param(s.data, s.traditional)
			}
			inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);
			if (state === 2) {
				return false
			}
			fireGlobals = s.global;
			s.type = s.type.toUpperCase();
			s.hasContent = !rnoContent.test(s.type);
			if (fireGlobals && jQuery.active++ === 0) {
				jQuery.event.trigger("ajaxStart")
			}
			if (!s.hasContent) {
				if (s.data) {
					s.url += (rquery.test(s.url) ? "&" : "?") + s.data;
					delete s.data
				}
				ifModifiedKey = s.url;
				if (s.cache === false) {
					var ts = jQuery.now(), ret = s.url.replace(rts, "$1_=" + ts);
					s.url = ret + ((ret === s.url) ? (rquery.test(s.url) ? "&" : "?") + "_=" + ts : "")
				}
			}
			if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
				jqXHR.setRequestHeader("Content-Type", s.contentType)
			}
			if (s.ifModified) {
				ifModifiedKey = ifModifiedKey || s.url;
				if (jQuery.lastModified[ifModifiedKey]) {
					jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[ifModifiedKey])
				}
				if (jQuery.etag[ifModifiedKey]) {
					jqXHR.setRequestHeader("If-None-Match", jQuery.etag[ifModifiedKey])
				}
			}
			jqXHR.setRequestHeader("Accept", s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") : s.accepts["*"]);
			for (i in s.headers) {
				jqXHR.setRequestHeader(i, s.headers[i])
			}
			if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || state === 2)) {
				jqXHR.abort();
				return false
			}
			for (i in {
				success : 1,
				error : 1,
				complete : 1
			}) {
				jqXHR[i](s[i])
			}
			transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);
			if (!transport) {
				done(-1, "No Transport")
			} else {
				jqXHR.readyState = 1;
				if (fireGlobals) {
					globalEventContext.trigger("ajaxSend", [
						jqXHR, s
					])
				}
				if (s.async && s.timeout > 0) {
					timeoutTimer = setTimeout(function() {
						jqXHR.abort("timeout")
					}, s.timeout)
				}
				try {
					state = 1;
					transport.send(requestHeaders, done)
				} catch (e) {
					if (state < 2) {
						done(-1, e)
					} else {
						throw e
					}
				}
			}
			return jqXHR
		},
		param : function(a, traditional) {
			var s = [], add = function(key, value) {
				value = jQuery.isFunction(value) ? value() : value;
				s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value)
			};
			if (traditional === undefined) {
				traditional = jQuery.ajaxSettings.traditional
			}
			if (jQuery.isArray(a) || (a.jquery && !jQuery.isPlainObject(a))) {
				jQuery.each(a, function() {
					add(this.name, this.value)
				})
			} else {
				for ( var prefix in a) {
					buildParams(prefix, a[prefix], traditional, add)
				}
			}
			return s.join("&").replace(r20, "+")
		}
	});
	function buildParams(prefix, obj, traditional, add) {
		if (jQuery.isArray(obj)) {
			jQuery.each(obj, function(i, v) {
				if (traditional || rbracket.test(prefix)) {
					add(prefix, v)
				} else {
					buildParams(prefix + "[" + (typeof v === "object" || jQuery.isArray(v) ? i : "") + "]", v, traditional, add)
				}
			})
		} else {
			if (!traditional && obj != null && typeof obj === "object") {
				for ( var name in obj) {
					buildParams(prefix + "[" + name + "]", obj[name], traditional, add)
				}
			} else {
				add(prefix, obj)
			}
		}
	}
	jQuery.extend({
		active : 0,
		lastModified : {},
		etag : {}
	});
	function ajaxHandleResponses(s, jqXHR, responses) {
		var contents = s.contents, dataTypes = s.dataTypes, responseFields = s.responseFields, ct, type, finalDataType, firstDataType;
		for (type in responseFields) {
			if (type in responses) {
				jqXHR[responseFields[type]] = responses[type]
			}
		}
		while (dataTypes[0] === "*") {
			dataTypes.shift();
			if (ct === undefined) {
				ct = s.mimeType || jqXHR.getResponseHeader("content-type")
			}
		}
		if (ct) {
			for (type in contents) {
				if (contents[type] && contents[type].test(ct)) {
					dataTypes.unshift(type);
					break
				}
			}
		}
		if (dataTypes[0] in responses) {
			finalDataType = dataTypes[0]
		} else {
			for (type in responses) {
				if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
					finalDataType = type;
					break
				}
				if (!firstDataType) {
					firstDataType = type
				}
			}
			finalDataType = finalDataType || firstDataType
		}
		if (finalDataType) {
			if (finalDataType !== dataTypes[0]) {
				dataTypes.unshift(finalDataType)
			}
			return responses[finalDataType]
		}
	}
	function ajaxConvert(s, response) {
		if (s.dataFilter) {
			response = s.dataFilter(response, s.dataType)
		}
		var dataTypes = s.dataTypes, converters = {}, i, key, length = dataTypes.length, tmp, current = dataTypes[0], prev, conversion, conv, conv1, conv2;
		for (i = 1; i < length; i++) {
			if (i === 1) {
				for (key in s.converters) {
					if (typeof key === "string") {
						converters[key.toLowerCase()] = s.converters[key]
					}
				}
			}
			prev = current;
			current = dataTypes[i];
			if (current === "*") {
				current = prev
			} else {
				if (prev !== "*" && prev !== current) {
					conversion = prev + " " + current;
					conv = converters[conversion] || converters["* " + current];
					if (!conv) {
						conv2 = undefined;
						for (conv1 in converters) {
							tmp = conv1.split(" ");
							if (tmp[0] === prev || tmp[0] === "*") {
								conv2 = converters[tmp[1] + " " + current];
								if (conv2) {
									conv1 = converters[conv1];
									if (conv1 === true) {
										conv = conv2
									} else {
										if (conv2 === true) {
											conv = conv1
										}
									}
									break
								}
							}
						}
					}
					if (!(conv || conv2)) {
						jQuery.error("No conversion from " + conversion.replace(" ", " to "))
					}
					if (conv !== true) {
						response = conv ? conv(response) : conv2(conv1(response))
					}
				}
			}
		}
		return response
	}
	var jsc = jQuery.now(), jsre = /(\=)\?(&|$)|\?\?/i;
	jQuery.ajaxSetup({
		jsonp : "callback",
		jsonpCallback : function() {
			return jQuery.expando + "_" + (jsc++)
		}
	});
	jQuery.ajaxPrefilter("json jsonp", function(s, originalSettings, jqXHR) {
		var inspectData = s.contentType === "application/x-www-form-urlencoded" && (typeof s.data === "string");
		if (s.dataTypes[0] === "jsonp" || s.jsonp !== false && (jsre.test(s.url) || inspectData && jsre.test(s.data))) {
			var responseContainer, jsonpCallback = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback, previous = window[jsonpCallback], url = s.url, data = s.data, replace = "$1" + jsonpCallback + "$2";
			if (s.jsonp !== false) {
				url = url.replace(jsre, replace);
				if (s.url === url) {
					if (inspectData) {
						data = data.replace(jsre, replace)
					}
					if (s.data === data) {
						url += (/\?/.test(url) ? "&" : "?") + s.jsonp + "=" + jsonpCallback
					}
				}
			}
			s.url = url;
			s.data = data;
			window[jsonpCallback] = function(response) {
				responseContainer = [
					response
				]
			};
			jqXHR.always(function() {
				window[jsonpCallback] = previous;
				if (responseContainer && jQuery.isFunction(previous)) {
					window[jsonpCallback](responseContainer[0])
				}
			});
			s.converters["script json"] = function() {
				if (!responseContainer) {
					jQuery.error(jsonpCallback + " was not called")
				}
				return responseContainer[0]
			};
			s.dataTypes[0] = "json";
			return "script"
		}
	});
	jQuery.ajaxSetup({
		accepts : {
			script : "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
		},
		contents : {
			script : /javascript|ecmascript/
		},
		converters : {
			"text script" : function(text) {
				jQuery.globalEval(text);
				return text
			}
		}
	});
	jQuery.ajaxPrefilter("script", function(s) {
		if (s.cache === undefined) {
			s.cache = false
		}
		if (s.crossDomain) {
			s.type = "GET";
			s.global = false
		}
	});
	jQuery.ajaxTransport("script", function(s) {
		if (s.crossDomain) {
			var script, head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
			return {
				send : function(_, callback) {
					script = document.createElement("script");
					script.async = "async";
					if (s.scriptCharset) {
						script.charset = s.scriptCharset
					}
					script.src = s.url;
					script.onload = script.onreadystatechange = function(_, isAbort) {
						if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
							script.onload = script.onreadystatechange = null;
							if (head && script.parentNode) {
								head.removeChild(script)
							}
							script = undefined;
							if (!isAbort) {
								callback(200, "success")
							}
						}
					};
					head.insertBefore(script, head.firstChild)
				},
				abort : function() {
					if (script) {
						script.onload(0, 1)
					}
				}
			}
		}
	});
	var xhrOnUnloadAbort = window.ActiveXObject ? function() {
		for ( var key in xhrCallbacks) {
			xhrCallbacks[key](0, 1)
		}
	} : false, xhrId = 0, xhrCallbacks;
	function createStandardXHR() {
		try {
			return new window.XMLHttpRequest()
		} catch (e) {
		}
	}
	function createActiveXHR() {
		try {
			return new window.ActiveXObject("Microsoft.XMLHTTP")
		} catch (e) {
		}
	}
	jQuery.ajaxSettings.xhr = window.ActiveXObject ? function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR()
	} : createStandardXHR;
	(function(xhr) {
		jQuery.extend(jQuery.support, {
			ajax : !!xhr,
			cors : !!xhr && ("withCredentials" in xhr)
		})
	})(jQuery.ajaxSettings.xhr());
	if (jQuery.support.ajax) {
		jQuery.ajaxTransport(function(s) {
			if (!s.crossDomain || jQuery.support.cors) {
				var callback;
				return {
					send : function(headers, complete) {
						var xhr = s.xhr(), handle, i;
						if (s.username) {
							xhr.open(s.type, s.url, s.async, s.username, s.password)
						} else {
							xhr.open(s.type, s.url, s.async)
						}
						if (s.xhrFields) {
							for (i in s.xhrFields) {
								xhr[i] = s.xhrFields[i]
							}
						}
						if (s.mimeType && xhr.overrideMimeType) {
							xhr.overrideMimeType(s.mimeType)
						}
						if (!s.crossDomain && !headers["X-Requested-With"]) {
							headers["X-Requested-With"] = "XMLHttpRequest"
						}
						try {
							for (i in headers) {
								xhr.setRequestHeader(i, headers[i])
							}
						} catch (_) {
						}
						xhr.send((s.hasContent && s.data) || null);
						callback = function(_, isAbort) {
							var status, statusText, responseHeaders, responses, xml;
							try {
								if (callback && (isAbort || xhr.readyState === 4)) {
									callback = undefined;
									if (handle) {
										xhr.onreadystatechange = jQuery.noop;
										if (xhrOnUnloadAbort) {
											delete xhrCallbacks[handle]
										}
									}
									if (isAbort) {
										if (xhr.readyState !== 4) {
											xhr.abort()
										}
									} else {
										status = xhr.status;
										responseHeaders = xhr.getAllResponseHeaders();
										responses = {};
										xml = xhr.responseXML;
										if (xml && xml.documentElement) {
											responses.xml = xml
										}
										responses.text = xhr.responseText;
										try {
											statusText = xhr.statusText
										} catch (e) {
											statusText = ""
										}
										if (!status && s.isLocal && !s.crossDomain) {
											status = responses.text ? 200 : 404
										} else {
											if (status === 1223) {
												status = 204
											}
										}
									}
								}
							} catch (firefoxAccessException) {
								if (!isAbort) {
									complete(-1, firefoxAccessException)
								}
							}
							if (responses) {
								complete(status, statusText, responses, responseHeaders)
							}
						};
						if (!s.async || xhr.readyState === 4) {
							callback()
						} else {
							handle = ++xhrId;
							if (xhrOnUnloadAbort) {
								if (!xhrCallbacks) {
									xhrCallbacks = {};
									jQuery(window).unload(xhrOnUnloadAbort)
								}
								xhrCallbacks[handle] = callback
							}
							xhr.onreadystatechange = callback
						}
					},
					abort : function() {
						if (callback) {
							callback(0, 1)
						}
					}
				}
			}
		})
	}
	var elemdisplay = {}, iframe, iframeDoc, rfxtypes = /^(?:toggle|show|hide)$/, rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i, timerId, fxAttrs = [
		[
			"height", "marginTop", "marginBottom", "paddingTop", "paddingBottom"
		], [
			"width", "marginLeft", "marginRight", "paddingLeft", "paddingRight"
		], [
			"opacity"
		]
	], fxNow;
	jQuery.fn.extend({
		show : function(speed, easing, callback) {
			var elem, display;
			if (speed || speed === 0) {
				return this.animate(genFx("show", 3), speed, easing, callback)
			} else {
				for ( var i = 0, j = this.length; i < j; i++) {
					elem = this[i];
					if (elem.style) {
						display = elem.style.display;
						if (!jQuery._data(elem, "olddisplay") && display === "none") {
							display = elem.style.display = ""
						}
						if (display === "" && jQuery.css(elem, "display") === "none") {
							jQuery._data(elem, "olddisplay", defaultDisplay(elem.nodeName))
						}
					}
				}
				for (i = 0; i < j; i++) {
					elem = this[i];
					if (elem.style) {
						display = elem.style.display;
						if (display === "" || display === "none") {
							elem.style.display = jQuery._data(elem, "olddisplay") || ""
						}
					}
				}
				return this
			}
		},
		hide : function(speed, easing, callback) {
			if (speed || speed === 0) {
				return this.animate(genFx("hide", 3), speed, easing, callback)
			} else {
				var elem, display, i = 0, j = this.length;
				for (; i < j; i++) {
					elem = this[i];
					if (elem.style) {
						display = jQuery.css(elem, "display");
						if (display !== "none" && !jQuery._data(elem, "olddisplay")) {
							jQuery._data(elem, "olddisplay", display)
						}
					}
				}
				for (i = 0; i < j; i++) {
					if (this[i].style) {
						this[i].style.display = "none"
					}
				}
				return this
			}
		},
		_toggle : jQuery.fn.toggle,
		toggle : function(fn, fn2, callback) {
			var bool = typeof fn === "boolean";
			if (jQuery.isFunction(fn) && jQuery.isFunction(fn2)) {
				this._toggle.apply(this, arguments)
			} else {
				if (fn == null || bool) {
					this.each(function() {
						var state = bool ? fn : jQuery(this).is(":hidden");
						jQuery(this)[state ? "show" : "hide"]()
					})
				} else {
					this.animate(genFx("toggle", 3), fn, fn2, callback)
				}
			}
			return this
		},
		fadeTo : function(speed, to, easing, callback) {
			return this.filter(":hidden").css("opacity", 0).show().end().animate({
				opacity : to
			}, speed, easing, callback)
		},
		animate : function(prop, speed, easing, callback) {
			var optall = jQuery.speed(speed, easing, callback);
			if (jQuery.isEmptyObject(prop)) {
				return this.each(optall.complete, [
					false
				])
			}
			prop = jQuery.extend({}, prop);
			function doAnimation() {
				if (optall.queue === false) {
					jQuery._mark(this)
				}
				var opt = jQuery.extend({}, optall), isElement = this.nodeType === 1, hidden = isElement && jQuery(this).is(":hidden"), name, val, p, e, parts, start, end, unit, method;
				opt.animatedProperties = {};
				for (p in prop) {
					name = jQuery.camelCase(p);
					if (p !== name) {
						prop[name] = prop[p];
						delete prop[p]
					}
					val = prop[name];
					if (jQuery.isArray(val)) {
						opt.animatedProperties[name] = val[1];
						val = prop[name] = val[0]
					} else {
						opt.animatedProperties[name] = opt.specialEasing && opt.specialEasing[name] || opt.easing || "swing"
					}
					if (val === "hide" && hidden || val === "show" && !hidden) {
						return opt.complete.call(this)
					}
					if (isElement && (name === "height" || name === "width")) {
						opt.overflow = [
							this.style.overflow, this.style.overflowX, this.style.overflowY
						];
						if (jQuery.css(this, "display") === "inline" && jQuery.css(this, "float") === "none") {
							if (!jQuery.support.inlineBlockNeedsLayout || defaultDisplay(this.nodeName) === "inline") {
								this.style.display = "inline-block"
							} else {
								this.style.zoom = 1
							}
						}
					}
				}
				if (opt.overflow != null) {
					this.style.overflow = "hidden"
				}
				for (p in prop) {
					e = new jQuery.fx(this, opt, p);
					val = prop[p];
					if (rfxtypes.test(val)) {
						method = jQuery._data(this, "toggle" + p) || (val === "toggle" ? hidden ? "show" : "hide" : 0);
						if (method) {
							jQuery._data(this, "toggle" + p, method === "show" ? "hide" : "show");
							e[method]()
						} else {
							e[val]()
						}
					} else {
						parts = rfxnum.exec(val);
						start = e.cur();
						if (parts) {
							end = parseFloat(parts[2]);
							unit = parts[3] || (jQuery.cssNumber[p] ? "" : "px");
							if (unit !== "px") {
								jQuery.style(this, p, (end || 1) + unit);
								start = ((end || 1) / e.cur()) * start;
								jQuery.style(this, p, start + unit)
							}
							if (parts[1]) {
								end = ((parts[1] === "-=" ? -1 : 1) * end) + start
							}
							e.custom(start, end, unit)
						} else {
							e.custom(start, val, "")
						}
					}
				}
				return true
			}
			return optall.queue === false ? this.each(doAnimation) : this.queue(optall.queue, doAnimation)
		},
		stop : function(type, clearQueue, gotoEnd) {
			if (typeof type !== "string") {
				gotoEnd = clearQueue;
				clearQueue = type;
				type = undefined
			}
			if (clearQueue && type !== false) {
				this.queue(type || "fx", [])
			}
			return this.each(function() {
				var index, hadTimers = false, timers = jQuery.timers, data = jQuery._data(this);
				if (!gotoEnd) {
					jQuery._unmark(true, this)
				}
				function stopQueue(elem, data, index) {
					var hooks = data[index];
					jQuery.removeData(elem, index, true);
					hooks.stop(gotoEnd)
				}
				if (type == null) {
					for (index in data) {
						if (data[index] && data[index].stop && index.indexOf(".run") === index.length - 4) {
							stopQueue(this, data, index)
						}
					}
				} else {
					if (data[index = type + ".run"] && data[index].stop) {
						stopQueue(this, data, index)
					}
				}
				for (index = timers.length; index--;) {
					if (timers[index].elem === this && (type == null || timers[index].queue === type)) {
						if (gotoEnd) {
							timers[index](true)
						} else {
							timers[index].saveState()
						}
						hadTimers = true;
						timers.splice(index, 1)
					}
				}
				if (!(gotoEnd && hadTimers)) {
					jQuery.dequeue(this, type)
				}
			})
		}
	});
	function createFxNow() {
		setTimeout(clearFxNow, 0);
		return (fxNow = jQuery.now())
	}
	function clearFxNow() {
		fxNow = undefined
	}
	function genFx(type, num) {
		var obj = {};
		jQuery.each(fxAttrs.concat.apply([], fxAttrs.slice(0, num)), function() {
			obj[this] = type
		});
		return obj
	}
	jQuery.each({
		slideDown : genFx("show", 1),
		slideUp : genFx("hide", 1),
		slideToggle : genFx("toggle", 1),
		fadeIn : {
			opacity : "show"
		},
		fadeOut : {
			opacity : "hide"
		},
		fadeToggle : {
			opacity : "toggle"
		}
	}, function(name, props) {
		jQuery.fn[name] = function(speed, easing, callback) {
			return this.animate(props, speed, easing, callback)
		}
	});
	jQuery.extend({
		speed : function(speed, easing, fn) {
			var opt = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
				complete : fn || !fn && easing || jQuery.isFunction(speed) && speed,
				duration : speed,
				easing : fn && easing || easing && !jQuery.isFunction(easing) && easing
			};
			opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration : opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;
			if (opt.queue == null || opt.queue === true) {
				opt.queue = "fx"
			}
			opt.old = opt.complete;
			opt.complete = function(noUnmark) {
				if (jQuery.isFunction(opt.old)) {
					opt.old.call(this)
				}
				if (opt.queue) {
					jQuery.dequeue(this, opt.queue)
				} else {
					if (noUnmark !== false) {
						jQuery._unmark(this)
					}
				}
			};
			return opt
		},
		easing : {
			linear : function(p, n, firstNum, diff) {
				return firstNum + diff * p
			},
			swing : function(p, n, firstNum, diff) {
				return ((-Math.cos(p * Math.PI) / 2) + 0.5) * diff + firstNum
			}
		},
		timers : [],
		fx : function(elem, options, prop) {
			this.options = options;
			this.elem = elem;
			this.prop = prop;
			options.orig = options.orig || {}
		}
	});
	jQuery.fx.prototype = {
		update : function() {
			if (this.options.step) {
				this.options.step.call(this.elem, this.now, this)
			}
			(jQuery.fx.step[this.prop] || jQuery.fx.step._default)(this)
		},
		cur : function() {
			if (this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null)) {
				return this.elem[this.prop]
			}
			var parsed, r = jQuery.css(this.elem, this.prop);
			return isNaN(parsed = parseFloat(r)) ? !r || r === "auto" ? 0 : r : parsed
		},
		custom : function(from, to, unit) {
			var self = this, fx = jQuery.fx;
			this.startTime = fxNow || createFxNow();
			this.end = to;
			this.now = this.start = from;
			this.pos = this.state = 0;
			this.unit = unit || this.unit || (jQuery.cssNumber[this.prop] ? "" : "px");
			function t(gotoEnd) {
				return self.step(gotoEnd)
			}
			t.queue = this.options.queue;
			t.elem = this.elem;
			t.saveState = function() {
				if (self.options.hide && jQuery._data(self.elem, "fxshow" + self.prop) === undefined) {
					jQuery._data(self.elem, "fxshow" + self.prop, self.start)
				}
			};
			if (t() && jQuery.timers.push(t) && !timerId) {
				timerId = setInterval(fx.tick, fx.interval)
			}
		},
		show : function() {
			var dataShow = jQuery._data(this.elem, "fxshow" + this.prop);
			this.options.orig[this.prop] = dataShow || jQuery.style(this.elem, this.prop);
			this.options.show = true;
			if (dataShow !== undefined) {
				this.custom(this.cur(), dataShow)
			} else {
				this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur())
			}
			jQuery(this.elem).show()
		},
		hide : function() {
			this.options.orig[this.prop] = jQuery._data(this.elem, "fxshow" + this.prop) || jQuery.style(this.elem, this.prop);
			this.options.hide = true;
			this.custom(this.cur(), 0)
		},
		step : function(gotoEnd) {
			var p, n, complete, t = fxNow || createFxNow(), done = true, elem = this.elem, options = this.options;
			if (gotoEnd || t >= options.duration + this.startTime) {
				this.now = this.end;
				this.pos = this.state = 1;
				this.update();
				options.animatedProperties[this.prop] = true;
				for (p in options.animatedProperties) {
					if (options.animatedProperties[p] !== true) {
						done = false
					}
				}
				if (done) {
					if (options.overflow != null && !jQuery.support.shrinkWrapBlocks) {
						jQuery.each([
							"", "X", "Y"
						], function(index, value) {
							elem.style["overflow" + value] = options.overflow[index]
						})
					}
					if (options.hide) {
						jQuery(elem).hide()
					}
					if (options.hide || options.show) {
						for (p in options.animatedProperties) {
							jQuery.style(elem, p, options.orig[p]);
							jQuery.removeData(elem, "fxshow" + p, true);
							jQuery.removeData(elem, "toggle" + p, true)
						}
					}
					complete = options.complete;
					if (complete) {
						options.complete = false;
						complete.call(elem)
					}
				}
				return false
			} else {
				if (options.duration == Infinity) {
					this.now = t
				} else {
					n = t - this.startTime;
					this.state = n / options.duration;
					this.pos = jQuery.easing[options.animatedProperties[this.prop]](this.state, n, 0, 1, options.duration);
					this.now = this.start + ((this.end - this.start) * this.pos)
				}
				this.update()
			}
			return true
		}
	};
	jQuery.extend(jQuery.fx, {
		tick : function() {
			var timer, timers = jQuery.timers, i = 0;
			for (; i < timers.length; i++) {
				timer = timers[i];
				if (!timer() && timers[i] === timer) {
					timers.splice(i--, 1)
				}
			}
			if (!timers.length) {
				jQuery.fx.stop()
			}
		},
		interval : 13,
		stop : function() {
			clearInterval(timerId);
			timerId = null
		},
		speeds : {
			slow : 600,
			fast : 200,
			_default : 400
		},
		step : {
			opacity : function(fx) {
				jQuery.style(fx.elem, "opacity", fx.now)
			},
			_default : function(fx) {
				if (fx.elem.style && fx.elem.style[fx.prop] != null) {
					fx.elem.style[fx.prop] = fx.now + fx.unit
				} else {
					fx.elem[fx.prop] = fx.now
				}
			}
		}
	});
	jQuery.each([
		"width", "height"
	], function(i, prop) {
		jQuery.fx.step[prop] = function(fx) {
			jQuery.style(fx.elem, prop, Math.max(0, fx.now) + fx.unit)
		}
	});
	if (jQuery.expr && jQuery.expr.filters) {
		jQuery.expr.filters.animated = function(elem) {
			return jQuery.grep(jQuery.timers, function(fn) {
				return elem === fn.elem
			}).length
		}
	}
	function defaultDisplay(nodeName) {
		if (!elemdisplay[nodeName]) {
			var body = document.body, elem = jQuery("<" + nodeName + ">").appendTo(body), display = elem.css("display");
			elem.remove();
			if (display === "none" || display === "") {
				if (!iframe) {
					iframe = document.createElement("iframe");
					iframe.frameBorder = iframe.width = iframe.height = 0
				}
				body.appendChild(iframe);
				if (!iframeDoc || !iframe.createElement) {
					iframeDoc = (iframe.contentWindow || iframe.contentDocument).document;
					iframeDoc.write((document.compatMode === "CSS1Compat" ? "<!doctype html>" : "") + "<html><body>");
					iframeDoc.close()
				}
				elem = iframeDoc.createElement(nodeName);
				iframeDoc.body.appendChild(elem);
				display = jQuery.css(elem, "display");
				body.removeChild(iframe)
			}
			elemdisplay[nodeName] = display
		}
		return elemdisplay[nodeName]
	}
	var rtable = /^t(?:able|d|h)$/i, rroot = /^(?:body|html)$/i;
	if ("getBoundingClientRect" in document.documentElement) {
		jQuery.fn.offset = function(options) {
			var elem = this[0], box;
			if (options) {
				return this.each(function(i) {
					jQuery.offset.setOffset(this, options, i)
				})
			}
			if (!elem || !elem.ownerDocument) {
				return null
			}
			if (elem === elem.ownerDocument.body) {
				return jQuery.offset.bodyOffset(elem)
			}
			try {
				box = elem.getBoundingClientRect()
			} catch (e) {
			}
			var doc = elem.ownerDocument, docElem = doc.documentElement;
			if (!box || !jQuery.contains(docElem, elem)) {
				return box ? {
					top : box.top,
					left : box.left
				} : {
					top : 0,
					left : 0
				}
			}
			var body = doc.body, win = getWindow(doc), clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0, scrollTop = win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop || body.scrollTop, scrollLeft = win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft, top = box.top + scrollTop - clientTop, left = box.left + scrollLeft - clientLeft;
			return {
				top : top,
				left : left
			}
		}
	} else {
		jQuery.fn.offset = function(options) {
			var elem = this[0];
			if (options) {
				return this.each(function(i) {
					jQuery.offset.setOffset(this, options, i)
				})
			}
			if (!elem || !elem.ownerDocument) {
				return null
			}
			if (elem === elem.ownerDocument.body) {
				return jQuery.offset.bodyOffset(elem)
			}
			var computedStyle, offsetParent = elem.offsetParent, prevOffsetParent = elem, doc = elem.ownerDocument, docElem = doc.documentElement, body = doc.body, defaultView = doc.defaultView, prevComputedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle, top = elem.offsetTop, left = elem.offsetLeft;
			while ((elem = elem.parentNode) && elem !== body && elem !== docElem) {
				if (jQuery.support.fixedPosition && prevComputedStyle.position === "fixed") {
					break
				}
				computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
				top -= elem.scrollTop;
				left -= elem.scrollLeft;
				if (elem === offsetParent) {
					top += elem.offsetTop;
					left += elem.offsetLeft;
					if (jQuery.support.doesNotAddBorder && !(jQuery.support.doesAddBorderForTableAndCells && rtable.test(elem.nodeName))) {
						top += parseFloat(computedStyle.borderTopWidth) || 0;
						left += parseFloat(computedStyle.borderLeftWidth) || 0
					}
					prevOffsetParent = offsetParent;
					offsetParent = elem.offsetParent
				}
				if (jQuery.support.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible") {
					top += parseFloat(computedStyle.borderTopWidth) || 0;
					left += parseFloat(computedStyle.borderLeftWidth) || 0
				}
				prevComputedStyle = computedStyle
			}
			if (prevComputedStyle.position === "relative" || prevComputedStyle.position === "static") {
				top += body.offsetTop;
				left += body.offsetLeft
			}
			if (jQuery.support.fixedPosition && prevComputedStyle.position === "fixed") {
				top += Math.max(docElem.scrollTop, body.scrollTop);
				left += Math.max(docElem.scrollLeft, body.scrollLeft)
			}
			return {
				top : top,
				left : left
			}
		}
	}
	jQuery.offset = {
		bodyOffset : function(body) {
			var top = body.offsetTop, left = body.offsetLeft;
			if (jQuery.support.doesNotIncludeMarginInBodyOffset) {
				top += parseFloat(jQuery.css(body, "marginTop")) || 0;
				left += parseFloat(jQuery.css(body, "marginLeft")) || 0
			}
			return {
				top : top,
				left : left
			}
		},
		setOffset : function(elem, options, i) {
			var position = jQuery.css(elem, "position");
			if (position === "static") {
				elem.style.position = "relative"
			}
			var curElem = jQuery(elem), curOffset = curElem.offset(), curCSSTop = jQuery.css(elem, "top"), curCSSLeft = jQuery.css(elem, "left"), calculatePosition = (position === "absolute" || position === "fixed") && jQuery.inArray("auto", [
				curCSSTop, curCSSLeft
			]) > -1, props = {}, curPosition = {}, curTop, curLeft;
			if (calculatePosition) {
				curPosition = curElem.position();
				curTop = curPosition.top;
				curLeft = curPosition.left
			} else {
				curTop = parseFloat(curCSSTop) || 0;
				curLeft = parseFloat(curCSSLeft) || 0
			}
			if (jQuery.isFunction(options)) {
				options = options.call(elem, i, curOffset)
			}
			if (options.top != null) {
				props.top = (options.top - curOffset.top) + curTop
			}
			if (options.left != null) {
				props.left = (options.left - curOffset.left) + curLeft
			}
			if ("using" in options) {
				options.using.call(elem, props)
			} else {
				curElem.css(props)
			}
		}
	};
	jQuery.fn.extend({
		position : function() {
			if (!this[0]) {
				return null
			}
			var elem = this[0], offsetParent = this.offsetParent(), offset = this.offset(), parentOffset = rroot.test(offsetParent[0].nodeName) ? {
				top : 0,
				left : 0
			} : offsetParent.offset();
			offset.top -= parseFloat(jQuery.css(elem, "marginTop")) || 0;
			offset.left -= parseFloat(jQuery.css(elem, "marginLeft")) || 0;
			parentOffset.top += parseFloat(jQuery.css(offsetParent[0], "borderTopWidth")) || 0;
			parentOffset.left += parseFloat(jQuery.css(offsetParent[0], "borderLeftWidth")) || 0;
			return {
				top : offset.top - parentOffset.top,
				left : offset.left - parentOffset.left
			}
		},
		offsetParent : function() {
			return this.map(function() {
				var offsetParent = this.offsetParent || document.body;
				while (offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static")) {
					offsetParent = offsetParent.offsetParent
				}
				return offsetParent
			})
		}
	});
	jQuery.each([
		"Left", "Top"
	], function(i, name) {
		var method = "scroll" + name;
		jQuery.fn[method] = function(val) {
			var elem, win;
			if (val === undefined) {
				elem = this[0];
				if (!elem) {
					return null
				}
				win = getWindow(elem);
				return win ? ("pageXOffset" in win) ? win[i ? "pageYOffset" : "pageXOffset"] : jQuery.support.boxModel && win.document.documentElement[method] || win.document.body[method] : elem[method]
			}
			return this.each(function() {
				win = getWindow(this);
				if (win) {
					win.scrollTo(!i ? val : jQuery(win).scrollLeft(), i ? val : jQuery(win).scrollTop())
				} else {
					this[method] = val
				}
			})
		}
	});
	function getWindow(elem) {
		return jQuery.isWindow(elem) ? elem : elem.nodeType === 9 ? elem.defaultView || elem.parentWindow : false
	}
	jQuery.each([
		"Height", "Width"
	], function(i, name) {
		var type = name.toLowerCase();
		jQuery.fn["inner" + name] = function() {
			var elem = this[0];
			return elem ? elem.style ? parseFloat(jQuery.css(elem, type, "padding")) : this[type]() : null
		};
		jQuery.fn["outer" + name] = function(margin) {
			var elem = this[0];
			return elem ? elem.style ? parseFloat(jQuery.css(elem, type, margin ? "margin" : "border")) : this[type]() : null
		};
		jQuery.fn[type] = function(size) {
			var elem = this[0];
			if (!elem) {
				return size == null ? null : this
			}
			if (jQuery.isFunction(size)) {
				return this.each(function(i) {
					var self = jQuery(this);
					self[type](size.call(this, i, self[type]()))
				})
			}
			if (jQuery.isWindow(elem)) {
				var docElemProp = elem.document.documentElement["client" + name], body = elem.document.body;
				return elem.document.compatMode === "CSS1Compat" && docElemProp || body && body["client" + name] || docElemProp
			} else {
				if (elem.nodeType === 9) {
					return Math.max(elem.documentElement["client" + name], elem.body["scroll" + name], elem.documentElement["scroll" + name], elem.body["offset" + name], elem.documentElement["offset" + name])
				} else {
					if (size === undefined) {
						var orig = jQuery.css(elem, type), ret = parseFloat(orig);
						return jQuery.isNumeric(ret) ? ret : orig
					} else {
						return this.css(type, typeof size === "string" ? size : size + "px")
					}
				}
			}
		}
	});
	window.jQuery = window.$ = jQuery;
	if (typeof define === "function" && define.amd && define.amd.jQuery) {
		define("jquery", [], function() {
			return jQuery
		})
	}
})(window);

// -- ./js/modernizr-2.0.6.js --
/*
 * ! Modernizr v2.0.6 http://www.modernizr.com Copyright (c) 2009-2011 Faruk Ates, Paul Irish, Alex Sexton Dual-licensed under the BSD or MIT licenses: www.modernizr.com/license/
 */
window.Modernizr = (function(window, document, undefined) {
	var version = "2.0.6", Modernizr = {}, enableClasses = true, docElement = document.documentElement, docHead = document.head || document.getElementsByTagName("head")[0], mod = "modernizr", modElem = document.createElement(mod), mStyle = modElem.style, inputElem = document.createElement("input"), smile = ":)", toString = Object.prototype.toString, prefixes = " -webkit- -moz- -o- -ms- -khtml- "
		.split(" "), domPrefixes = "Webkit Moz O ms Khtml".split(" "), ns = {
		svg : "http://www.w3.org/2000/svg"
	}, tests = {}, inputs = {}, attrs = {}, classes = [], featureName, injectElementWithStyles = function(rule, callback, nodes, testnames) {
		var style, ret, node, div = document.createElement("div");
		if (parseInt(nodes, 10)) {
			while (nodes--) {
				node = document.createElement("div");
				node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
				div.appendChild(node)
			}
		}
		style = [
			"&shy;", "<style>", rule, "</style>"
		].join("");
		div.id = mod;
		div.innerHTML += style;
		docElement.appendChild(div);
		ret = callback(div, rule);
		div.parentNode.removeChild(div);
		return !!ret
	}, testMediaQuery = function(mq) {
		if (window.matchMedia) {
			return matchMedia(mq).matches
		}
		var bool;
		injectElementWithStyles("@media " + mq + " { #" + mod + " { position: absolute; } }", function(node) {
			bool = (window.getComputedStyle ? getComputedStyle(node, null) : node.currentStyle)["position"] == "absolute"
		});
		return bool
	}, isEventSupported = (function() {
		var TAGNAMES = {
			select : "input",
			change : "input",
			submit : "form",
			reset : "form",
			error : "img",
			load : "img",
			abort : "img"
		};
		function isEventSupported(eventName, element) {
			element = element || document.createElement(TAGNAMES[eventName] || "div");
			eventName = "on" + eventName;
			var isSupported = eventName in element;
			if (!isSupported) {
				if (!element.setAttribute) {
					element = document.createElement("div")
				}
				if (element.setAttribute && element.removeAttribute) {
					element.setAttribute(eventName, "");
					isSupported = is(element[eventName], "function");
					if (!is(element[eventName], undefined)) {
						element[eventName] = undefined
					}
					element.removeAttribute(eventName)
				}
			}
			element = null;
			return isSupported
		}
		return isEventSupported
	})();
	var _hasOwnProperty = ({}).hasOwnProperty, hasOwnProperty;
	if (!is(_hasOwnProperty, undefined) && !is(_hasOwnProperty.call, undefined)) {
		hasOwnProperty = function(object, property) {
			return _hasOwnProperty.call(object, property)
		}
	} else {
		hasOwnProperty = function(object, property) {
			return ((property in object) && is(object.constructor.prototype[property], undefined))
		}
	}
	function setCss(str) {
		mStyle.cssText = str
	}
	function setCssAll(str1, str2) {
		return setCss(prefixes.join(str1 + ";") + (str2 || ""))
	}
	function is(obj, type) {
		return typeof obj === type
	}
	function contains(str, substr) {
		return !!~("" + str).indexOf(substr)
	}
	function testProps(props, prefixed) {
		for ( var i in props) {
			if (mStyle[props[i]] !== undefined) {
				return prefixed == "pfx" ? props[i] : true
			}
		}
		return false
	}
	function testPropsAll(prop, prefixed) {
		var ucProp = prop.charAt(0).toUpperCase() + prop.substr(1), props = (prop + " " + domPrefixes.join(ucProp + " ") + ucProp).split(" ");
		return testProps(props, prefixed)
	}
	var testBundle = (function(styles, tests) {
		var style = styles.join(""), len = tests.length;
		injectElementWithStyles(style, function(node, rule) {
			var style = document.styleSheets[document.styleSheets.length - 1], cssText = style.cssRules && style.cssRules[0] ? style.cssRules[0].cssText : style.cssText || "", children = node.childNodes, hash = {};
			while (len--) {
				hash[children[len].id] = children[len]
			}
			Modernizr.touch = ("ontouchstart" in window) || hash.touch.offsetTop === 9;
			Modernizr.csstransforms3d = hash.csstransforms3d.offsetLeft === 9;
			Modernizr.generatedcontent = hash.generatedcontent.offsetHeight >= 1;
			Modernizr.fontface = /src/i.test(cssText) && cssText.indexOf(rule.split(" ")[0]) === 0
		}, len, tests)
	})([
		'@font-face {font-family:"font";src:url("https://")}', [
			"@media (", prefixes.join("touch-enabled),("), mod, ")", "{#touch{top:9px;position:absolute}}"
		].join(""), [
			"@media (", prefixes.join("transform-3d),("), mod, ")", "{#csstransforms3d{left:9px;position:absolute}}"
		].join(""), [
			'#generatedcontent:after{content:"', smile, '";visibility:hidden}'
		].join("")
	], [
		"fontface", "touch", "csstransforms3d", "generatedcontent"
	]);
	tests.flexbox = function() {
		function setPrefixedValueCSS(element, property, value, extra) {
			property += ":";
			element.style.cssText = (property + prefixes.join(value + ";" + property)).slice(0, -property.length) + (extra || "")
		}
		function setPrefixedPropertyCSS(element, property, value, extra) {
			element.style.cssText = prefixes.join(property + ":" + value + ";") + (extra || "")
		}
		var c = document.createElement("div"), elem = document.createElement("div");
		setPrefixedValueCSS(c, "display", "box", "width:42px;padding:0;");
		setPrefixedPropertyCSS(elem, "box-flex", "1", "width:10px;");
		c.appendChild(elem);
		docElement.appendChild(c);
		var ret = elem.offsetWidth === 42;
		c.removeChild(elem);
		docElement.removeChild(c);
		return ret
	};
	tests.canvas = function() {
		var elem = document.createElement("canvas");
		return !!(elem.getContext && elem.getContext("2d"))
	};
	tests.canvastext = function() {
		return !!(Modernizr.canvas && is(document.createElement("canvas").getContext("2d").fillText, "function"))
	};
	tests.webgl = function() {
		return !!window.WebGLRenderingContext
	};
	tests.touch = function() {
		return Modernizr.touch
	};
	tests.geolocation = function() {
		return !!navigator.geolocation
	};
	tests.postmessage = function() {
		return !!window.postMessage
	};
	tests.websqldatabase = function() {
		var result = !!window.openDatabase;
		return result
	};
	tests.indexedDB = function() {
		for ( var i = -1, len = domPrefixes.length; ++i < len;) {
			if (window[domPrefixes[i].toLowerCase() + "IndexedDB"]) {
				return true
			}
		}
		return !!window.indexedDB
	};
	tests.hashchange = function() {
		return isEventSupported("hashchange", window) && (document.documentMode === undefined || document.documentMode > 7)
	};
	tests.history = function() {
		return !!(window.history && history.pushState)
	};
	tests.draganddrop = function() {
		return isEventSupported("dragstart") && isEventSupported("drop")
	};
	tests.websockets = function() {
		for ( var i = -1, len = domPrefixes.length; ++i < len;) {
			if (window[domPrefixes[i] + "WebSocket"]) {
				return true
			}
		}
		return "WebSocket" in window
	};
	tests.rgba = function() {
		setCss("background-color:rgba(150,255,150,.5)");
		return contains(mStyle.backgroundColor, "rgba")
	};
	tests.hsla = function() {
		setCss("background-color:hsla(120,40%,100%,.5)");
		return contains(mStyle.backgroundColor, "rgba") || contains(mStyle.backgroundColor, "hsla")
	};
	tests.multiplebgs = function() {
		setCss("background:url(https://),url(https://),red url(https://)");
		return /(url\s*\(.*?){3}/.test(mStyle.background)
	};
	tests.backgroundsize = function() {
		return testPropsAll("backgroundSize")
	};
	tests.borderimage = function() {
		return testPropsAll("borderImage")
	};
	tests.borderradius = function() {
		return testPropsAll("borderRadius")
	};
	tests.boxshadow = function() {
		return testPropsAll("boxShadow")
	};
	tests.textshadow = function() {
		return document.createElement("div").style.textShadow === ""
	};
	tests.opacity = function() {
		setCssAll("opacity:.55");
		return /^0.55$/.test(mStyle.opacity)
	};
	tests.cssanimations = function() {
		return testPropsAll("animationName")
	};
	tests.csscolumns = function() {
		return testPropsAll("columnCount")
	};
	tests.cssgradients = function() {
		var str1 = "background-image:", str2 = "gradient(linear,left top,right bottom,from(#9f9),to(white));", str3 = "linear-gradient(left top,#9f9, white);";
		setCss((str1 + prefixes.join(str2 + str1) + prefixes.join(str3 + str1)).slice(0, -str1.length));
		return contains(mStyle.backgroundImage, "gradient")
	};
	tests.cssreflections = function() {
		return testPropsAll("boxReflect")
	};
	tests.csstransforms = function() {
		return !!testProps([
			"transformProperty", "WebkitTransform", "MozTransform", "OTransform", "msTransform"
		])
	};
	tests.csstransforms3d = function() {
		var ret = !!testProps([
			"perspectiveProperty", "WebkitPerspective", "MozPerspective", "OPerspective", "msPerspective"
		]);
		if (ret && "webkitPerspective" in docElement.style) {
			ret = Modernizr.csstransforms3d
		}
		return ret
	};
	tests.csstransitions = function() {
		return testPropsAll("transitionProperty")
	};
	tests.fontface = function() {
		return Modernizr.fontface
	};
	tests.generatedcontent = function() {
		return Modernizr.generatedcontent
	};
	tests.video = function() {
		var elem = document.createElement("video"), bool = false;
		try {
			if (bool = !!elem.canPlayType) {
				bool = new Boolean(bool);
				bool.ogg = elem.canPlayType('video/ogg; codecs="theora"');
				var h264 = 'video/mp4; codecs="avc1.42E01E';
				bool.h264 = elem.canPlayType(h264 + '"') || elem.canPlayType(h264 + ', mp4a.40.2"');
				bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"')
			}
		} catch (e) {
		}
		return bool
	};
	tests.audio = function() {
		var elem = document.createElement("audio"), bool = false;
		try {
			if (bool = !!elem.canPlayType) {
				bool = new Boolean(bool);
				bool.ogg = elem.canPlayType('audio/ogg; codecs="vorbis"');
				bool.mp3 = elem.canPlayType("audio/mpeg;");
				bool.wav = elem.canPlayType('audio/wav; codecs="1"');
				bool.m4a = elem.canPlayType("audio/x-m4a;") || elem.canPlayType("audio/aac;")
			}
		} catch (e) {
		}
		return bool
	};
	tests.localstorage = function() {
		try {
			return !!localStorage.getItem
		} catch (e) {
			return false
		}
	};
	tests.sessionstorage = function() {
		try {
			return !!sessionStorage.getItem
		} catch (e) {
			return false
		}
	};
	tests.webworkers = function() {
		return !!window.Worker
	};
	tests.applicationcache = function() {
		return !!window.applicationCache
	};
	tests.svg = function() {
		return !!document.createElementNS && !!document.createElementNS(ns.svg, "svg").createSVGRect
	};
	tests.inlinesvg = function() {
		var div = document.createElement("div");
		div.innerHTML = "<svg/>";
		return (div.firstChild && div.firstChild.namespaceURI) == ns.svg
	};
	tests.smil = function() {
		return !!document.createElementNS && /SVG/.test(toString.call(document.createElementNS(ns.svg, "animate")))
	};
	tests.svgclippaths = function() {
		return !!document.createElementNS && /SVG/.test(toString.call(document.createElementNS(ns.svg, "clipPath")))
	};
	function webforms() {
		Modernizr.input = (function(props) {
			for ( var i = 0, len = props.length; i < len; i++) {
				attrs[props[i]] = !!(props[i] in inputElem)
			}
			return attrs
		})("autocomplete autofocus list placeholder max min multiple pattern required step".split(" "));
		Modernizr.inputtypes = (function(props) {
			for ( var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++) {
				inputElem.setAttribute("type", inputElemType = props[i]);
				bool = inputElem.type !== "text";
				if (bool) {
					inputElem.value = smile;
					inputElem.style.cssText = "position:absolute;visibility:hidden;";
					if (/^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined) {
						docElement.appendChild(inputElem);
						defaultView = document.defaultView;
						bool = defaultView.getComputedStyle && defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== "textfield" && (inputElem.offsetHeight !== 0);
						docElement.removeChild(inputElem)
					} else {
						if (/^(search|tel)$/.test(inputElemType)) {
						} else {
							if (/^(url|email)$/.test(inputElemType)) {
								bool = inputElem.checkValidity && inputElem.checkValidity() === false
							} else {
								if (/^color$/.test(inputElemType)) {
									docElement.appendChild(inputElem);
									docElement.offsetWidth;
									bool = inputElem.value != smile;
									docElement.removeChild(inputElem)
								} else {
									bool = inputElem.value != smile
								}
							}
						}
					}
				}
				inputs[props[i]] = !!bool
			}
			return inputs
		})("search tel url email datetime date month week time datetime-local number range color".split(" "))
	}
	for ( var feature in tests) {
		if (hasOwnProperty(tests, feature)) {
			featureName = feature.toLowerCase();
			Modernizr[featureName] = tests[feature]();
			classes.push((Modernizr[featureName] ? "" : "no-") + featureName)
		}
	}
	Modernizr.input || webforms();
	Modernizr.addTest = function(feature, test) {
		if (typeof feature == "object") {
			for ( var key in feature) {
				if (hasOwnProperty(feature, key)) {
					Modernizr.addTest(key, feature[key])
				}
			}
		} else {
			feature = feature.toLowerCase();
			if (Modernizr[feature] !== undefined) {
				return
			}
			test = typeof test == "boolean" ? test : !!test();
			docElement.className += " " + (test ? "" : "no-") + feature;
			Modernizr[feature] = test
		}
		return Modernizr
	};
	setCss("");
	modElem = inputElem = null;
	if (window.attachEvent && (function() {
		var elem = document.createElement("div");
		elem.innerHTML = "<elem></elem>";
		return elem.childNodes.length !== 1
	})()) {
		(function(win, doc) {
			win.iepp = win.iepp || {};
			var iepp = win.iepp, elems = iepp.html5elements || "abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video", elemsArr = elems.split("|"), elemsArrLen = elemsArr.length, elemRegExp = new RegExp(
				"(^|\\s)(" + elems + ")", "gi"), tagRegExp = new RegExp("<(/*)(" + elems + ")", "gi"), filterReg = /^\s*[\{\}]\s*$/, ruleRegExp = new RegExp("(^|[^\\n]*?\\s)(" + elems + ")([^\\n]*)({[\\n\\w\\W]*?})", "gi"), docFrag = doc.createDocumentFragment(), html = doc.documentElement, head = html.firstChild, bodyElem = doc
				.createElement("body"), styleElem = doc.createElement("style"), printMedias = /print|all/, body;
			function shim(doc) {
				var a = -1;
				while (++a < elemsArrLen) {
					doc.createElement(elemsArr[a])
				}
			}
			iepp.getCSS = function(styleSheetList, mediaType) {
				if (styleSheetList + "" === undefined) {
					return ""
				}
				var a = -1, len = styleSheetList.length, styleSheet, cssTextArr = [];
				while (++a < len) {
					styleSheet = styleSheetList[a];
					if (styleSheet.disabled) {
						continue
					}
					mediaType = styleSheet.media || mediaType;
					if (printMedias.test(mediaType)) {
						cssTextArr.push(iepp.getCSS(styleSheet.imports, mediaType), styleSheet.cssText)
					}
					mediaType = "all"
				}
				return cssTextArr.join("")
			};
			iepp.parseCSS = function(cssText) {
				var cssTextArr = [], rule;
				while ((rule = ruleRegExp.exec(cssText)) != null) {
					cssTextArr.push(((filterReg.exec(rule[1]) ? "\n" : rule[1]) + rule[2] + rule[3]).replace(elemRegExp, "$1.iepp_$2") + rule[4])
				}
				return cssTextArr.join("\n")
			};
			iepp.writeHTML = function() {
				var a = -1;
				body = body || doc.body;
				while (++a < elemsArrLen) {
					var nodeList = doc.getElementsByTagName(elemsArr[a]), nodeListLen = nodeList.length, b = -1;
					while (++b < nodeListLen) {
						if (nodeList[b].className.indexOf("iepp_") < 0) {
							nodeList[b].className += " iepp_" + elemsArr[a]
						}
					}
				}
				docFrag.appendChild(body);
				html.appendChild(bodyElem);
				bodyElem.className = body.className;
				bodyElem.id = body.id;
				bodyElem.innerHTML = body.innerHTML.replace(tagRegExp, "<$1font")
			};
			iepp._beforePrint = function() {
				styleElem.styleSheet.cssText = iepp.parseCSS(iepp.getCSS(doc.styleSheets, "all"));
				iepp.writeHTML()
			};
			iepp.restoreHTML = function() {
				bodyElem.innerHTML = "";
				html.removeChild(bodyElem);
				html.appendChild(body)
			};
			iepp._afterPrint = function() {
				iepp.restoreHTML();
				styleElem.styleSheet.cssText = ""
			};
			shim(doc);
			shim(docFrag);
			if (iepp.disablePP) {
				return
			}
			head.insertBefore(styleElem, head.firstChild);
			styleElem.media = "print";
			styleElem.className = "iepp-printshim";
			win.attachEvent("onbeforeprint", iepp._beforePrint);
			win.attachEvent("onafterprint", iepp._afterPrint)
		})(window, document)
	}
	Modernizr._version = version;
	Modernizr._prefixes = prefixes;
	Modernizr._domPrefixes = domPrefixes;
	Modernizr.mq = testMediaQuery;
	Modernizr.hasEvent = isEventSupported;
	Modernizr.testProp = function(prop) {
		return testProps([
			prop
		])
	};
	Modernizr.testAllProps = testPropsAll;
	Modernizr.testStyles = injectElementWithStyles;
	Modernizr.prefixed = function(prop) {
		return testPropsAll(prop, "pfx")
	};
	docElement.className = docElement.className.replace(/\bno-js\b/, "") + (enableClasses ? " js " + classes.join(" ") : "");
	return Modernizr
})(this, this.document);

// -- ./js/jquery.cookies.2.2.0.js --
var jaaulde = window.jaaulde || {};
jaaulde.utils = jaaulde.utils || {};
jaaulde.utils.cookies = (function() {
	var resolveOptions, assembleOptionsString, parseCookies, constructor, defaultOptions = {
		expiresAt : null,
		path : "/",
		domain : null,
		secure : false
	};
	resolveOptions = function(options) {
		var returnValue, expireDate;
		if (typeof options !== "object" || options === null) {
			returnValue = defaultOptions
		} else {
			returnValue = {
				expiresAt : defaultOptions.expiresAt,
				path : defaultOptions.path,
				domain : defaultOptions.domain,
				secure : defaultOptions.secure
			};
			if (typeof options.expiresAt === "object" && options.expiresAt instanceof Date) {
				returnValue.expiresAt = options.expiresAt
			} else {
				if (typeof options.hoursToLive === "number" && options.hoursToLive !== 0) {
					expireDate = new Date();
					expireDate.setTime(expireDate.getTime() + (options.hoursToLive * 60 * 60 * 1000));
					returnValue.expiresAt = expireDate
				}
			}
			if (typeof options.path === "string" && options.path !== "") {
				returnValue.path = options.path
			}
			if (typeof options.domain === "string" && options.domain !== "") {
				returnValue.domain = options.domain
			}
			if (options.secure === true) {
				returnValue.secure = options.secure
			}
		}
		return returnValue
	};
	assembleOptionsString = function(options) {
		options = resolveOptions(options);
		return ((typeof options.expiresAt === "object" && options.expiresAt instanceof Date ? "; expires=" + options.expiresAt.toGMTString() : "") + "; path=" + options.path + (typeof options.domain === "string" ? "; domain=" + options.domain : "") + (options.secure === true ? "; secure" : ""))
	};
	parseCookies = function() {
		var cookies = {}, i, pair, name, value, separated = document.cookie.split(";"), unparsedValue;
		for (i = 0; i < separated.length; i = i + 1) {
			pair = separated[i].split("=");
			name = pair[0].replace(/^\s*/, "").replace(/\s*$/, "");
			try {
				value = decodeURIComponent(pair[1])
			} catch (e1) {
				value = pair[1]
			}
			if (typeof JSON === "object" && JSON !== null && typeof JSON.parse === "function") {
				try {
					unparsedValue = value;
					value = JSON.parse(value)
				} catch (e2) {
					value = unparsedValue
				}
			}
			cookies[name] = value
		}
		return cookies
	};
	constructor = function() {
	};
	constructor.prototype.get = function(cookieName) {
		var returnValue, item, cookies = parseCookies();
		if (typeof cookieName === "string") {
			returnValue = (typeof cookies[cookieName] !== "undefined") ? cookies[cookieName] : null
		} else {
			if (typeof cookieName === "object" && cookieName !== null) {
				returnValue = {};
				for (item in cookieName) {
					if (typeof cookies[cookieName[item]] !== "undefined") {
						returnValue[cookieName[item]] = cookies[cookieName[item]]
					} else {
						returnValue[cookieName[item]] = null
					}
				}
			} else {
				returnValue = cookies
			}
		}
		return returnValue
	};
	constructor.prototype.filter = function(cookieNameRegExp) {
		var cookieName, returnValue = {}, cookies = parseCookies();
		if (typeof cookieNameRegExp === "string") {
			cookieNameRegExp = new RegExp(cookieNameRegExp)
		}
		for (cookieName in cookies) {
			if (cookieName.match(cookieNameRegExp)) {
				returnValue[cookieName] = cookies[cookieName]
			}
		}
		return returnValue
	};
	constructor.prototype.set = function(cookieName, value, options) {
		if (typeof options !== "object" || options === null) {
			options = {}
		}
		if (typeof value === "undefined" || value === null) {
			value = "";
			options.hoursToLive = -8760
		} else {
			if (typeof value !== "string") {
				if (typeof JSON === "object" && JSON !== null && typeof JSON.stringify === "function") {
					value = JSON.stringify(value)
				} else {
					throw new Error("cookies.set() received non-string value and could not serialize.")
				}
			}
		}
		var optionsString = assembleOptionsString(options);
		document.cookie = cookieName + "=" + encodeURIComponent(value) + optionsString
	};
	constructor.prototype.del = function(cookieName, options) {
		var allCookies = {}, name;
		if (typeof options !== "object" || options === null) {
			options = {}
		}
		if (typeof cookieName === "boolean" && cookieName === true) {
			allCookies = this.get()
		} else {
			if (typeof cookieName === "string") {
				allCookies[cookieName] = true
			}
		}
		for (name in allCookies) {
			if (typeof name === "string" && name !== "") {
				this.set(name, null, options)
			}
		}
	};
	constructor.prototype.test = function() {
		var returnValue = false, testName = "cT", testValue = "data";
		this.set(testName, testValue);
		if (this.get(testName) === testValue) {
			this.del(testName);
			returnValue = true
		}
		return returnValue
	};
	constructor.prototype.setOptions = function(options) {
		if (typeof options !== "object") {
			options = null
		}
		defaultOptions = resolveOptions(options)
	};
	return new constructor()
})();
(function() {
	if (window.jQuery) {
		(function($) {
			$.cookies = jaaulde.utils.cookies;
			var extensions = {
				cookify : function(options) {
					return this.each(function() {
						var i, nameAttrs = [
							"name", "id"
						], name, $this = $(this), value;
						for (i in nameAttrs) {
							if (!isNaN(i)) {
								name = $this.attr(nameAttrs[i]);
								if (typeof name === "string" && name !== "") {
									if ($this.is(":checkbox, :radio")) {
										if ($this.attr("checked")) {
											value = $this.val()
										}
									} else {
										if ($this.is(":input")) {
											value = $this.val()
										} else {
											value = $this.html()
										}
									}
									if (typeof value !== "string" || value === "") {
										value = null
									}
									$.cookies.set(name, value, options);
									break
								}
							}
						}
					})
				},
				cookieFill : function() {
					return this.each(function() {
						var n, getN, nameAttrs = [
							"name", "id"
						], name, $this = $(this), value;
						getN = function() {
							n = nameAttrs.pop();
							return !!n
						};
						while (getN()) {
							name = $this.attr(n);
							if (typeof name === "string" && name !== "") {
								value = $.cookies.get(name);
								if (value !== null) {
									if ($this.is(":checkbox, :radio")) {
										if ($this.val() === value) {
											$this.attr("checked", "checked")
										} else {
											$this.removeAttr("checked")
										}
									} else {
										if ($this.is(":input")) {
											$this.val(value)
										} else {
											$this.html(value)
										}
									}
								}
								break
							}
						}
					})
				},
				cookieBind : function(options) {
					return this.each(function() {
						var $this = $(this);
						$this.cookieFill().change(function() {
							$this.cookify(options)
						})
					})
				}
			};
			$.each(extensions, function(i) {
				$.fn[i] = this
			})
		})(window.jQuery)
	}
})();

// -- ./js/json2.js --
var JSON;
if (!JSON) {
	JSON = {}
}
(function() {
	function f(n) {
		return n < 10 ? "0" + n : n
	}
	if (typeof Date.prototype.toJSON !== "function") {
		Date.prototype.toJSON = function(key) {
			return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null
		};
		String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function(key) {
			return this.valueOf()
		}
	}
	var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, gap, indent, meta = {
		"\b" : "\\b",
		"\t" : "\\t",
		"\n" : "\\n",
		"\f" : "\\f",
		"\r" : "\\r",
		'"' : '\\"',
		"\\" : "\\\\"
	}, rep;
	function quote(string) {
		escapable.lastIndex = 0;
		return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
			var c = meta[a];
			return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
		}) + '"' : '"' + string + '"'
	}
	function str(key, holder) {
		var i, k, v, length, mind = gap, partial, value = holder[key];
		if (value && typeof value === "object" && typeof value.toJSON === "function") {
			value = value.toJSON(key)
		}
		if (typeof rep === "function") {
			value = rep.call(holder, key, value)
		}
		switch (typeof value) {
			case "string":
				return quote(value);
			case "number":
				return isFinite(value) ? String(value) : "null";
			case "boolean":
			case "null":
				return String(value);
			case "object":
				if (!value) {
					return "null"
				}
				gap += indent;
				partial = [];
				if (Object.prototype.toString.apply(value) === "[object Array]") {
					length = value.length;
					for (i = 0; i < length; i += 1) {
						partial[i] = str(i, value) || "null"
					}
					v = partial.length === 0 ? "[]" : gap ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" : "[" + partial.join(",") + "]";
					gap = mind;
					return v
				}
				if (rep && typeof rep === "object") {
					length = rep.length;
					for (i = 0; i < length; i += 1) {
						if (typeof rep[i] === "string") {
							k = rep[i];
							v = str(k, value);
							if (v) {
								partial.push(quote(k) + (gap ? ": " : ":") + v)
							}
						}
					}
				} else {
					for (k in value) {
						if (Object.prototype.hasOwnProperty.call(value, k)) {
							v = str(k, value);
							if (v) {
								partial.push(quote(k) + (gap ? ": " : ":") + v)
							}
						}
					}
				}
				v = partial.length === 0 ? "{}" : gap ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" : "{" + partial.join(",") + "}";
				gap = mind;
				return v
		}
	}
	if (typeof JSON.stringify !== "function") {
		JSON.stringify = function(value, replacer, space) {
			var i;
			gap = "";
			indent = "";
			if (typeof space === "number") {
				for (i = 0; i < space; i += 1) {
					indent += " "
				}
			} else {
				if (typeof space === "string") {
					indent = space
				}
			}
			rep = replacer;
			if (replacer && typeof replacer !== "function" && (typeof replacer !== "object" || typeof replacer.length !== "number")) {
				throw new Error("JSON.stringify")
			}
			return str("", {
				"" : value
			})
		}
	}
	if (typeof JSON.parse !== "function") {
		JSON.parse = function(text, reviver) {
			var j;
			function walk(holder, key) {
				var k, v, value = holder[key];
				if (value && typeof value === "object") {
					for (k in value) {
						if (Object.prototype.hasOwnProperty.call(value, k)) {
							v = walk(value, k);
							if (v !== undefined) {
								value[k] = v
							} else {
								delete value[k]
							}
						}
					}
				}
				return reviver.call(holder, key, value)
			}
			text = String(text);
			cx.lastIndex = 0;
			if (cx.test(text)) {
				text = text.replace(cx, function(a) {
					return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
				})
			}
			if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
				j = eval("(" + text + ")");
				return typeof reviver === "function" ? walk({
					"" : j
				}, "") : j
			}
			throw new SyntaxError("JSON.parse")
		}
	}
}());

// -- ./js/underscore.js --
(function() {
	var root = this;
	var previousUnderscore = root._;
	var breaker = {};
	var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
	var slice = ArrayProto.slice, unshift = ArrayProto.unshift, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty;
	var nativeForEach = ArrayProto.forEach, nativeMap = ArrayProto.map, nativeReduce = ArrayProto.reduce, nativeReduceRight = ArrayProto.reduceRight, nativeFilter = ArrayProto.filter, nativeEvery = ArrayProto.every, nativeSome = ArrayProto.some, nativeIndexOf = ArrayProto.indexOf, nativeLastIndexOf = ArrayProto.lastIndexOf, nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeBind = FuncProto.bind;
	var _ = function(obj) {
		return new wrapper(obj)
	};
	if (typeof exports !== "undefined") {
		if (typeof module !== "undefined" && module.exports) {
			exports = module.exports = _
		}
		exports._ = _
	} else {
		if (typeof define === "function" && define.amd) {
			define("underscore", function() {
				return _
			})
		} else {
			root._ = _
		}
	}
	_.VERSION = "1.2.2";
	var each = _.each = _.forEach = function(obj, iterator, context) {
		if (obj == null) {
			return
		}
		if (nativeForEach && obj.forEach === nativeForEach) {
			obj.forEach(iterator, context)
		} else {
			if (obj.length === +obj.length) {
				for ( var i = 0, l = obj.length; i < l; i++) {
					if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) {
						return
					}
				}
			} else {
				for ( var key in obj) {
					if (hasOwnProperty.call(obj, key)) {
						if (iterator.call(context, obj[key], key, obj) === breaker) {
							return
						}
					}
				}
			}
		}
	};
	_.map = function(obj, iterator, context) {
		var results = [];
		if (obj == null) {
			return results
		}
		if (nativeMap && obj.map === nativeMap) {
			return obj.map(iterator, context)
		}
		each(obj, function(value, index, list) {
			results[results.length] = iterator.call(context, value, index, list)
		});
		return results
	};
	_.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
		var initial = memo !== void 0;
		if (obj == null) {
			obj = []
		}
		if (nativeReduce && obj.reduce === nativeReduce) {
			if (context) {
				iterator = _.bind(iterator, context)
			}
			return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator)
		}
		each(obj, function(value, index, list) {
			if (!initial) {
				memo = value;
				initial = true
			} else {
				memo = iterator.call(context, memo, value, index, list)
			}
		});
		if (!initial) {
			throw new TypeError("Reduce of empty array with no initial value")
		}
		return memo
	};
	_.reduceRight = _.foldr = function(obj, iterator, memo, context) {
		if (obj == null) {
			obj = []
		}
		if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
			if (context) {
				iterator = _.bind(iterator, context)
			}
			return memo !== void 0 ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator)
		}
		var reversed = (_.isArray(obj) ? obj.slice() : _.toArray(obj)).reverse();
		return _.reduce(reversed, iterator, memo, context)
	};
	_.find = _.detect = function(obj, iterator, context) {
		var result;
		any(obj, function(value, index, list) {
			if (iterator.call(context, value, index, list)) {
				result = value;
				return true
			}
		});
		return result
	};
	_.filter = _.select = function(obj, iterator, context) {
		var results = [];
		if (obj == null) {
			return results
		}
		if (nativeFilter && obj.filter === nativeFilter) {
			return obj.filter(iterator, context)
		}
		each(obj, function(value, index, list) {
			if (iterator.call(context, value, index, list)) {
				results[results.length] = value
			}
		});
		return results
	};
	_.reject = function(obj, iterator, context) {
		var results = [];
		if (obj == null) {
			return results
		}
		each(obj, function(value, index, list) {
			if (!iterator.call(context, value, index, list)) {
				results[results.length] = value
			}
		});
		return results
	};
	_.every = _.all = function(obj, iterator, context) {
		var result = true;
		if (obj == null) {
			return result
		}
		if (nativeEvery && obj.every === nativeEvery) {
			return obj.every(iterator, context)
		}
		each(obj, function(value, index, list) {
			if (!(result = result && iterator.call(context, value, index, list))) {
				return breaker
			}
		});
		return result
	};
	var any = _.some = _.any = function(obj, iterator, context) {
		iterator = iterator || _.identity;
		var result = false;
		if (obj == null) {
			return result
		}
		if (nativeSome && obj.some === nativeSome) {
			return obj.some(iterator, context)
		}
		each(obj, function(value, index, list) {
			if (result || (result = iterator.call(context, value, index, list))) {
				return breaker
			}
		});
		return !!result
	};
	_.include = _.contains = function(obj, target) {
		var found = false;
		if (obj == null) {
			return found
		}
		if (nativeIndexOf && obj.indexOf === nativeIndexOf) {
			return obj.indexOf(target) != -1
		}
		found = any(obj, function(value) {
			return value === target
		});
		return found
	};
	_.invoke = function(obj, method) {
		var args = slice.call(arguments, 2);
		return _.map(obj, function(value) {
			return (method.call ? method || value : value[method]).apply(value, args)
		})
	};
	_.pluck = function(obj, key) {
		return _.map(obj, function(value) {
			return value[key]
		})
	};
	_.max = function(obj, iterator, context) {
		if (!iterator && _.isArray(obj)) {
			return Math.max.apply(Math, obj)
		}
		if (!iterator && _.isEmpty(obj)) {
			return -Infinity
		}
		var result = {
			computed : -Infinity
		};
		each(obj, function(value, index, list) {
			var computed = iterator ? iterator.call(context, value, index, list) : value;
			computed >= result.computed && (result = {
				value : value,
				computed : computed
			})
		});
		return result.value
	};
	_.min = function(obj, iterator, context) {
		if (!iterator && _.isArray(obj)) {
			return Math.min.apply(Math, obj)
		}
		if (!iterator && _.isEmpty(obj)) {
			return Infinity
		}
		var result = {
			computed : Infinity
		};
		each(obj, function(value, index, list) {
			var computed = iterator ? iterator.call(context, value, index, list) : value;
			computed < result.computed && (result = {
				value : value,
				computed : computed
			})
		});
		return result.value
	};
	_.shuffle = function(obj) {
		var shuffled = [], rand;
		each(obj, function(value, index, list) {
			if (index == 0) {
				shuffled[0] = value
			} else {
				rand = Math.floor(Math.random() * (index + 1));
				shuffled[index] = shuffled[rand];
				shuffled[rand] = value
			}
		});
		return shuffled
	};
	_.sortBy = function(obj, iterator, context) {
		return _.pluck(_.map(obj, function(value, index, list) {
			return {
				value : value,
				criteria : iterator.call(context, value, index, list)
			}
		}).sort(function(left, right) {
			var a = left.criteria, b = right.criteria;
			return a < b ? -1 : a > b ? 1 : 0
		}), "value")
	};
	_.groupBy = function(obj, val) {
		var result = {};
		var iterator = _.isFunction(val) ? val : function(obj) {
			return obj[val]
		};
		each(obj, function(value, index) {
			var key = iterator(value, index);
			(result[key] || (result[key] = [])).push(value)
		});
		return result
	};
	_.sortedIndex = function(array, obj, iterator) {
		iterator || (iterator = _.identity);
		var low = 0, high = array.length;
		while (low < high) {
			var mid = (low + high) >> 1;
			iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid
		}
		return low
	};
	_.toArray = function(iterable) {
		if (!iterable) {
			return []
		}
		if (iterable.toArray) {
			return iterable.toArray()
		}
		if (_.isArray(iterable)) {
			return slice.call(iterable)
		}
		if (_.isArguments(iterable)) {
			return slice.call(iterable)
		}
		return _.values(iterable)
	};
	_.size = function(obj) {
		return _.toArray(obj).length
	};
	_.first = _.head = function(array, n, guard) {
		return (n != null) && !guard ? slice.call(array, 0, n) : array[0]
	};
	_.initial = function(array, n, guard) {
		return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n))
	};
	_.last = function(array, n, guard) {
		if ((n != null) && !guard) {
			return slice.call(array, Math.max(array.length - n, 0))
		} else {
			return array[array.length - 1]
		}
	};
	_.rest = _.tail = function(array, index, guard) {
		return slice.call(array, (index == null) || guard ? 1 : index)
	};
	_.compact = function(array) {
		return _.filter(array, function(value) {
			return !!value
		})
	};
	_.flatten = function(array, shallow) {
		return _.reduce(array, function(memo, value) {
			if (_.isArray(value)) {
				return memo.concat(shallow ? value : _.flatten(value))
			}
			memo[memo.length] = value;
			return memo
		}, [])
	};
	_.without = function(array) {
		return _.difference(array, slice.call(arguments, 1))
	};
	_.uniq = _.unique = function(array, isSorted, iterator) {
		var initial = iterator ? _.map(array, iterator) : array;
		var result = [];
		_.reduce(initial, function(memo, el, i) {
			if (0 == i || (isSorted === true ? _.last(memo) != el : !_.include(memo, el))) {
				memo[memo.length] = el;
				result[result.length] = array[i]
			}
			return memo
		}, []);
		return result
	};
	_.union = function() {
		return _.uniq(_.flatten(arguments, true))
	};
	_.intersection = _.intersect = function(array) {
		var rest = slice.call(arguments, 1);
		return _.filter(_.uniq(array), function(item) {
			return _.every(rest, function(other) {
				return _.indexOf(other, item) >= 0
			})
		})
	};
	_.difference = function(array, other) {
		return _.filter(array, function(value) {
			return !_.include(other, value)
		})
	};
	_.zip = function() {
		var args = slice.call(arguments);
		var length = _.max(_.pluck(args, "length"));
		var results = new Array(length);
		for ( var i = 0; i < length; i++) {
			results[i] = _.pluck(args, "" + i)
		}
		return results
	};
	_.indexOf = function(array, item, isSorted) {
		if (array == null) {
			return -1
		}
		var i, l;
		if (isSorted) {
			i = _.sortedIndex(array, item);
			return array[i] === item ? i : -1
		}
		if (nativeIndexOf && array.indexOf === nativeIndexOf) {
			return array.indexOf(item)
		}
		for (i = 0, l = array.length; i < l; i++) {
			if (array[i] === item) {
				return i
			}
		}
		return -1
	};
	_.lastIndexOf = function(array, item) {
		if (array == null) {
			return -1
		}
		if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
			return array.lastIndexOf(item)
		}
		var i = array.length;
		while (i--) {
			if (array[i] === item) {
				return i
			}
		}
		return -1
	};
	_.range = function(start, stop, step) {
		if (arguments.length <= 1) {
			stop = start || 0;
			start = 0
		}
		step = arguments[2] || 1;
		var len = Math.max(Math.ceil((stop - start) / step), 0);
		var idx = 0;
		var range = new Array(len);
		while (idx < len) {
			range[idx++] = start;
			start += step
		}
		return range
	};
	var ctor = function() {
	};
	_.bind = function bind(func, context) {
		var bound, args;
		if (func.bind === nativeBind && nativeBind) {
			return nativeBind.apply(func, slice.call(arguments, 1))
		}
		if (!_.isFunction(func)) {
			throw new TypeError
		}
		args = slice.call(arguments, 2);
		return bound = function() {
			if (!(this instanceof bound)) {
				return func.apply(context, args.concat(slice.call(arguments)))
			}
			ctor.prototype = func.prototype;
			var self = new ctor;
			var result = func.apply(self, args.concat(slice.call(arguments)));
			if (Object(result) === result) {
				return result
			}
			return self
		}
	};
	_.bindAll = function(obj) {
		var funcs = slice.call(arguments, 1);
		if (funcs.length == 0) {
			funcs = _.functions(obj)
		}
		each(funcs, function(f) {
			obj[f] = _.bind(obj[f], obj)
		});
		return obj
	};
	_.memoize = function(func, hasher) {
		var memo = {};
		hasher || (hasher = _.identity);
		return function() {
			var key = hasher.apply(this, arguments);
			return hasOwnProperty.call(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments))
		}
	};
	_.delay = function(func, wait) {
		var args = slice.call(arguments, 2);
		return setTimeout(function() {
			return func.apply(func, args)
		}, wait)
	};
	_.defer = function(func) {
		return _.delay.apply(_, [
			func, 1
		].concat(slice.call(arguments, 1)))
	};
	_.throttle = function(func, wait) {
		var context, args, timeout, throttling, more;
		var whenDone = _.debounce(function() {
			more = throttling = false
		}, wait);
		return function() {
			context = this;
			args = arguments;
			var later = function() {
				timeout = null;
				if (more) {
					func.apply(context, args)
				}
				whenDone()
			};
			if (!timeout) {
				timeout = setTimeout(later, wait)
			}
			if (throttling) {
				more = true
			} else {
				func.apply(context, args)
			}
			whenDone();
			throttling = true
		}
	};
	_.debounce = function(func, wait) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				func.apply(context, args)
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait)
		}
	};
	_.once = function(func) {
		var ran = false, memo;
		return function() {
			if (ran) {
				return memo
			}
			ran = true;
			return memo = func.apply(this, arguments)
		}
	};
	_.wrap = function(func, wrapper) {
		return function() {
			var args = [
				func
			].concat(slice.call(arguments));
			return wrapper.apply(this, args)
		}
	};
	_.compose = function() {
		var funcs = slice.call(arguments);
		return function() {
			var args = slice.call(arguments);
			for ( var i = funcs.length - 1; i >= 0; i--) {
				args = [
					funcs[i].apply(this, args)
				]
			}
			return args[0]
		}
	};
	_.after = function(times, func) {
		if (times <= 0) {
			return func()
		}
		return function() {
			if (--times < 1) {
				return func.apply(this, arguments)
			}
		}
	};
	_.keys = nativeKeys || function(obj) {
		if (obj !== Object(obj)) {
			throw new TypeError("Invalid object")
		}
		var keys = [];
		for ( var key in obj) {
			if (hasOwnProperty.call(obj, key)) {
				keys[keys.length] = key
			}
		}
		return keys
	};
	_.values = function(obj) {
		return _.map(obj, _.identity)
	};
	_.functions = _.methods = function(obj) {
		var names = [];
		for ( var key in obj) {
			if (_.isFunction(obj[key])) {
				names.push(key)
			}
		}
		return names.sort()
	};
	_.extend = function(obj) {
		each(slice.call(arguments, 1), function(source) {
			for ( var prop in source) {
				if (source[prop] !== void 0) {
					obj[prop] = source[prop]
				}
			}
		});
		return obj
	};
	_.defaults = function(obj) {
		each(slice.call(arguments, 1), function(source) {
			for ( var prop in source) {
				if (obj[prop] == null) {
					obj[prop] = source[prop]
				}
			}
		});
		return obj
	};
	_.clone = function(obj) {
		if (!_.isObject(obj)) {
			return obj
		}
		return _.isArray(obj) ? obj.slice() : _.extend({}, obj)
	};
	_.tap = function(obj, interceptor) {
		interceptor(obj);
		return obj
	};
	function eq(a, b, stack) {
		if (a === b) {
			return a !== 0 || 1 / a == 1 / b
		}
		if (a == null || b == null) {
			return a === b
		}
		if (a._chain) {
			a = a._wrapped
		}
		if (b._chain) {
			b = b._wrapped
		}
		if (_.isFunction(a.isEqual)) {
			return a.isEqual(b)
		}
		if (_.isFunction(b.isEqual)) {
			return b.isEqual(a)
		}
		var className = toString.call(a);
		if (className != toString.call(b)) {
			return false
		}
		switch (className) {
			case "[object String]":
				return String(a) == String(b);
			case "[object Number]":
				a = +a;
				b = +b;
				return a != a ? b != b : (a == 0 ? 1 / a == 1 / b : a == b);
			case "[object Date]":
			case "[object Boolean]":
				return +a == +b;
			case "[object RegExp]":
				return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase
		}
		if (typeof a != "object" || typeof b != "object") {
			return false
		}
		var length = stack.length;
		while (length--) {
			if (stack[length] == a) {
				return true
			}
		}
		stack.push(a);
		var size = 0, result = true;
		if (className == "[object Array]") {
			size = a.length;
			result = size == b.length;
			if (result) {
				while (size--) {
					if (!(result = size in a == size in b && eq(a[size], b[size], stack))) {
						break
					}
				}
			}
		} else {
			if ("constructor" in a != "constructor" in b || a.constructor != b.constructor) {
				return false
			}
			for ( var key in a) {
				if (hasOwnProperty.call(a, key)) {
					size++;
					if (!(result = hasOwnProperty.call(b, key) && eq(a[key], b[key], stack))) {
						break
					}
				}
			}
			if (result) {
				for (key in b) {
					if (hasOwnProperty.call(b, key) && !(size--)) {
						break
					}
				}
				result = !size
			}
		}
		stack.pop();
		return result
	}
	_.isEqual = function(a, b) {
		return eq(a, b, [])
	};
	_.isEmpty = function(obj) {
		if (_.isArray(obj) || _.isString(obj)) {
			return obj.length === 0
		}
		for ( var key in obj) {
			if (hasOwnProperty.call(obj, key)) {
				return false
			}
		}
		return true
	};
	_.isElement = function(obj) {
		return !!(obj && obj.nodeType == 1)
	};
	_.isArray = nativeIsArray || function(obj) {
		return toString.call(obj) == "[object Array]"
	};
	_.isObject = function(obj) {
		return obj === Object(obj)
	};
	if (toString.call(arguments) == "[object Arguments]") {
		_.isArguments = function(obj) {
			return toString.call(obj) == "[object Arguments]"
		}
	} else {
		_.isArguments = function(obj) {
			return !!(obj && hasOwnProperty.call(obj, "callee"))
		}
	}
	_.isFunction = function(obj) {
		return toString.call(obj) == "[object Function]"
	};
	_.isString = function(obj) {
		return toString.call(obj) == "[object String]"
	};
	_.isNumber = function(obj) {
		return toString.call(obj) == "[object Number]"
	};
	_.isNaN = function(obj) {
		return obj !== obj
	};
	_.isBoolean = function(obj) {
		return obj === true || obj === false || toString.call(obj) == "[object Boolean]"
	};
	_.isDate = function(obj) {
		return toString.call(obj) == "[object Date]"
	};
	_.isRegExp = function(obj) {
		return toString.call(obj) == "[object RegExp]"
	};
	_.isNull = function(obj) {
		return obj === null
	};
	_.isUndefined = function(obj) {
		return obj === void 0
	};
	_.noConflict = function() {
		root._ = previousUnderscore;
		return this
	};
	_.identity = function(value) {
		return value
	};
	_.times = function(n, iterator, context) {
		for ( var i = 0; i < n; i++) {
			iterator.call(context, i)
		}
	};
	_.escape = function(string) {
		return ("" + string).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;")
	};
	_.mixin = function(obj) {
		each(_.functions(obj), function(name) {
			addToWrapper(name, _[name] = obj[name])
		})
	};
	var idCounter = 0;
	_.uniqueId = function(prefix) {
		var id = idCounter++;
		return prefix ? prefix + id : id
	};
	_.templateSettings = {
		evaluate : /<%([\s\S]+?)%>/g,
		interpolate : /<%=([\s\S]+?)%>/g,
		escape : /<%-([\s\S]+?)%>/g
	};
	_.template = function(str, data) {
		var c = _.templateSettings;
		var tmpl = "var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('" + str.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(c.escape, function(match, code) {
			return "',_.escape(" + code.replace(/\\'/g, "'") + "),'"
		}).replace(c.interpolate, function(match, code) {
			return "'," + code.replace(/\\'/g, "'") + ",'"
		}).replace(c.evaluate || null, function(match, code) {
			return "');" + code.replace(/\\'/g, "'").replace(/[\r\n\t]/g, " ") + ";__p.push('"
		}).replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t") + "');}return __p.join('');";
		var func = new Function("obj", "_", tmpl);
		return data ? func(data, _) : function(data) {
			return func(data, _)
		}
	};
	var wrapper = function(obj) {
		this._wrapped = obj
	};
	_.prototype = wrapper.prototype;
	var result = function(obj, chain) {
		return chain ? _(obj).chain() : obj
	};
	var addToWrapper = function(name, func) {
		wrapper.prototype[name] = function() {
			var args = slice.call(arguments);
			unshift.call(args, this._wrapped);
			return result(func.apply(_, args), this._chain)
		}
	};
	_.mixin(_);
	each([
		"pop", "push", "reverse", "shift", "sort", "splice", "unshift"
	], function(name) {
		var method = ArrayProto[name];
		wrapper.prototype[name] = function() {
			method.apply(this._wrapped, arguments);
			return result(this._wrapped, this._chain)
		}
	});
	each([
		"concat", "join", "slice"
	], function(name) {
		var method = ArrayProto[name];
		wrapper.prototype[name] = function() {
			return result(method.apply(this._wrapped, arguments), this._chain)
		}
	});
	wrapper.prototype.chain = function() {
		this._chain = true;
		return this
	};
	wrapper.prototype.value = function() {
		return this._wrapped
	}
}).call(this);

// -- ./js/backbone.js --
(function() {
	var root = this;
	var previousBackbone = root.Backbone;
	var Backbone;
	if (typeof exports !== "undefined") {
		Backbone = exports
	} else {
		Backbone = root.Backbone = {}
	}
	Backbone.VERSION = "0.5.3";
	var _ = root._;
	if (!_ && (typeof require !== "undefined")) {
		_ = require("underscore")._
	}
	var $ = root.jQuery || root.Zepto;
	Backbone.noConflict = function() {
		root.Backbone = previousBackbone;
		return this
	};
	Backbone.emulateHTTP = false;
	Backbone.emulateJSON = false;
	Backbone.Events = {
		bind : function(ev, callback, context) {
			var calls = this._callbacks || (this._callbacks = {});
			var list = calls[ev] || (calls[ev] = []);
			list.push([
				callback, context
			]);
			return this
		},
		unbind : function(ev, callback) {
			var calls;
			if (!ev) {
				this._callbacks = {}
			} else {
				if (calls = this._callbacks) {
					if (!callback) {
						calls[ev] = []
					} else {
						var list = calls[ev];
						if (!list) {
							return this
						}
						for ( var i = 0, l = list.length; i < l; i++) {
							if (list[i] && callback === list[i][0]) {
								list[i] = null;
								break
							}
						}
					}
				}
			}
			return this
		},
		trigger : function(eventName) {
			var list, calls, ev, callback, args;
			var both = 2;
			if (!(calls = this._callbacks)) {
				return this
			}
			while (both--) {
				ev = both ? eventName : "all";
				if (list = calls[ev]) {
					for ( var i = 0, l = list.length; i < l; i++) {
						if (!(callback = list[i])) {
							list.splice(i, 1);
							i--;
							l--
						} else {
							args = both ? Array.prototype.slice.call(arguments, 1) : arguments;
							callback[0].apply(callback[1] || this, args)
						}
					}
				}
			}
			return this
		}
	};
	Backbone.Model = function(attributes, options) {
		var defaults;
		attributes || (attributes = {});
		if (defaults = this.defaults) {
			if (_.isFunction(defaults)) {
				defaults = defaults.call(this)
			}
			attributes = _.extend({}, defaults, attributes)
		}
		this.attributes = {};
		this._escapedAttributes = {};
		this.cid = _.uniqueId("c");
		this.set(attributes, {
			silent : true
		});
		this._changed = false;
		this._previousAttributes = _.clone(this.attributes);
		if (options && options.collection) {
			this.collection = options.collection
		}
		this.initialize(attributes, options)
	};
	_.extend(Backbone.Model.prototype, Backbone.Events, {
		_previousAttributes : null,
		_changed : false,
		idAttribute : "id",
		initialize : function() {
		},
		toJSON : function() {
			return _.clone(this.attributes)
		},
		get : function(attr) {
			return this.attributes[attr]
		},
		escape : function(attr) {
			var html;
			if (html = this._escapedAttributes[attr]) {
				return html
			}
			var val = this.attributes[attr];
			return this._escapedAttributes[attr] = escapeHTML(val == null ? "" : "" + val)
		},
		has : function(attr) {
			return this.attributes[attr] != null
		},
		set : function(attrs, options) {
			options || (options = {});
			if (!attrs) {
				return this
			}
			if (attrs.attributes) {
				attrs = attrs.attributes
			}
			var now = this.attributes, escaped = this._escapedAttributes;
			if (!options.silent && this.validate && !this._performValidation(attrs, options)) {
				return false
			}
			if (this.idAttribute in attrs) {
				this.id = attrs[this.idAttribute]
			}
			var alreadyChanging = this._changing;
			this._changing = true;
			for ( var attr in attrs) {
				var val = attrs[attr];
				if (!_.isEqual(now[attr], val)) {
					now[attr] = val;
					delete escaped[attr];
					this._changed = true;
					if (!options.silent) {
						this.trigger("change:" + attr, this, val, options)
					}
				}
			}
			if (!alreadyChanging && !options.silent && this._changed) {
				this.change(options)
			}
			this._changing = false;
			return this
		},
		unset : function(attr, options) {
			if (!(attr in this.attributes)) {
				return this
			}
			options || (options = {});
			var value = this.attributes[attr];
			var validObj = {};
			validObj[attr] = void 0;
			if (!options.silent && this.validate && !this._performValidation(validObj, options)) {
				return false
			}
			delete this.attributes[attr];
			delete this._escapedAttributes[attr];
			if (attr == this.idAttribute) {
				delete this.id
			}
			this._changed = true;
			if (!options.silent) {
				this.trigger("change:" + attr, this, void 0, options);
				this.change(options)
			}
			return this
		},
		clear : function(options) {
			options || (options = {});
			var attr;
			var old = this.attributes;
			var validObj = {};
			for (attr in old) {
				validObj[attr] = void 0
			}
			if (!options.silent && this.validate && !this._performValidation(validObj, options)) {
				return false
			}
			this.attributes = {};
			this._escapedAttributes = {};
			this._changed = true;
			if (!options.silent) {
				for (attr in old) {
					this.trigger("change:" + attr, this, void 0, options)
				}
				this.change(options)
			}
			return this
		},
		fetch : function(options) {
			options || (options = {});
			var model = this;
			var success = options.success;
			options.success = function(resp, status, xhr) {
				if (!model.set(model.parse(resp, xhr), options)) {
					return false
				}
				if (success) {
					success(model, resp)
				}
			};
			options.error = wrapError(options.error, model, options);
			return (this.sync || Backbone.sync).call(this, "read", this, options)
		},
		save : function(attrs, options) {
			options || (options = {});
			if (attrs && !this.set(attrs, options)) {
				return false
			}
			var model = this;
			var success = options.success;
			options.success = function(resp, status, xhr) {
				if (!model.set(model.parse(resp, xhr), options)) {
					return false
				}
				if (success) {
					success(model, resp, xhr)
				}
			};
			options.error = wrapError(options.error, model, options);
			var method = this.isNew() ? "create" : "update";
			return (this.sync || Backbone.sync).call(this, method, this, options)
		},
		destroy : function(options) {
			options || (options = {});
			if (this.isNew()) {
				return this.trigger("destroy", this, this.collection, options)
			}
			var model = this;
			var success = options.success;
			options.success = function(resp) {
				model.trigger("destroy", model, model.collection, options);
				if (success) {
					success(model, resp)
				}
			};
			options.error = wrapError(options.error, model, options);
			return (this.sync || Backbone.sync).call(this, "delete", this, options)
		},
		url : function() {
			var base = getUrl(this.collection) || this.urlRoot || urlError();
			if (this.isNew()) {
				return base
			}
			return base + (base.charAt(base.length - 1) == "/" ? "" : "/") + encodeURIComponent(this.id)
		},
		parse : function(resp, xhr) {
			return resp
		},
		clone : function() {
			return new this.constructor(this)
		},
		isNew : function() {
			return this.id == null
		},
		change : function(options) {
			this.trigger("change", this, options);
			this._previousAttributes = _.clone(this.attributes);
			this._changed = false
		},
		hasChanged : function(attr) {
			if (attr) {
				return this._previousAttributes[attr] != this.attributes[attr]
			}
			return this._changed
		},
		changedAttributes : function(now) {
			now || (now = this.attributes);
			var old = this._previousAttributes;
			var changed = false;
			for ( var attr in now) {
				if (!_.isEqual(old[attr], now[attr])) {
					changed = changed || {};
					changed[attr] = now[attr]
				}
			}
			return changed
		},
		previous : function(attr) {
			if (!attr || !this._previousAttributes) {
				return null
			}
			return this._previousAttributes[attr]
		},
		previousAttributes : function() {
			return _.clone(this._previousAttributes)
		},
		_performValidation : function(attrs, options) {
			var error = this.validate(attrs);
			if (error) {
				if (options.error) {
					options.error(this, error, options)
				} else {
					this.trigger("error", this, error, options)
				}
				return false
			}
			return true
		}
	});
	Backbone.Collection = function(models, options) {
		options || (options = {});
		if (options.comparator) {
			this.comparator = options.comparator
		}
		_.bindAll(this, "_onModelEvent", "_removeReference");
		this._reset();
		if (models) {
			this.reset(models, {
				silent : true
			})
		}
		this.initialize.apply(this, arguments)
	};
	_.extend(Backbone.Collection.prototype, Backbone.Events, {
		model : Backbone.Model,
		initialize : function() {
		},
		toJSON : function() {
			return this.map(function(model) {
				return model.toJSON()
			})
		},
		add : function(models, options) {
			if (_.isArray(models)) {
				for ( var i = 0, l = models.length; i < l; i++) {
					this._add(models[i], options)
				}
			} else {
				this._add(models, options)
			}
			return this
		},
		remove : function(models, options) {
			if (_.isArray(models)) {
				for ( var i = 0, l = models.length; i < l; i++) {
					this._remove(models[i], options)
				}
			} else {
				this._remove(models, options)
			}
			return this
		},
		get : function(id) {
			if (id == null) {
				return null
			}
			return this._byId[id.id != null ? id.id : id]
		},
		getByCid : function(cid) {
			return cid && this._byCid[cid.cid || cid]
		},
		at : function(index) {
			return this.models[index]
		},
		sort : function(options) {
			options || (options = {});
			if (!this.comparator) {
				throw new Error("Cannot sort a set without a comparator")
			}
			this.models = this.sortBy(this.comparator);
			if (!options.silent) {
				this.trigger("reset", this, options)
			}
			return this
		},
		pluck : function(attr) {
			return _.map(this.models, function(model) {
				return model.get(attr)
			})
		},
		reset : function(models, options) {
			models || (models = []);
			options || (options = {});
			this.each(this._removeReference);
			this._reset();
			this.add(models, {
				silent : true
			});
			if (!options.silent) {
				this.trigger("reset", this, options)
			}
			return this
		},
		fetch : function(options) {
			options || (options = {});
			var collection = this;
			var success = options.success;
			options.success = function(resp, status, xhr) {
				collection[options.add ? "add" : "reset"](collection.parse(resp, xhr), options);
				if (success) {
					success(collection, resp)
				}
			};
			options.error = wrapError(options.error, collection, options);
			return (this.sync || Backbone.sync).call(this, "read", this, options)
		},
		create : function(model, options) {
			var coll = this;
			options || (options = {});
			model = this._prepareModel(model, options);
			if (!model) {
				return false
			}
			var success = options.success;
			options.success = function(nextModel, resp, xhr) {
				coll.add(nextModel, options);
				if (success) {
					success(nextModel, resp, xhr)
				}
			};
			model.save(null, options);
			return model
		},
		parse : function(resp, xhr) {
			return resp
		},
		chain : function() {
			return _(this.models).chain()
		},
		_reset : function(options) {
			this.length = 0;
			this.models = [];
			this._byId = {};
			this._byCid = {}
		},
		_prepareModel : function(model, options) {
			if (!(model instanceof Backbone.Model)) {
				var attrs = model;
				model = new this.model(attrs, {
					collection : this
				});
				if (model.validate && !model._performValidation(attrs, options)) {
					model = false
				}
			} else {
				if (!model.collection) {
					model.collection = this
				}
			}
			return model
		},
		_add : function(model, options) {
			options || (options = {});
			model = this._prepareModel(model, options);
			if (!model) {
				return false
			}
			var already = this.getByCid(model);
			if (already) {
				throw new Error([
					"Can't add the same model to a set twice", already.id
				])
			}
			this._byId[model.id] = model;
			this._byCid[model.cid] = model;
			var index = options.at != null ? options.at : this.comparator ? this.sortedIndex(model, this.comparator) : this.length;
			this.models.splice(index, 0, model);
			model.bind("all", this._onModelEvent);
			this.length++;
			if (!options.silent) {
				model.trigger("add", model, this, options)
			}
			return model
		},
		_remove : function(model, options) {
			options || (options = {});
			model = this.getByCid(model) || this.get(model);
			if (!model) {
				return null
			}
			delete this._byId[model.id];
			delete this._byCid[model.cid];
			this.models.splice(this.indexOf(model), 1);
			this.length--;
			if (!options.silent) {
				model.trigger("remove", model, this, options)
			}
			this._removeReference(model);
			return model
		},
		_removeReference : function(model) {
			if (this == model.collection) {
				delete model.collection
			}
			model.unbind("all", this._onModelEvent)
		},
		_onModelEvent : function(ev, model, collection, options) {
			if ((ev == "add" || ev == "remove") && collection != this) {
				return
			}
			if (ev == "destroy") {
				this._remove(model, options)
			}
			if (model && ev === "change:" + model.idAttribute) {
				delete this._byId[model.previous(model.idAttribute)];
				this._byId[model.id] = model
			}
			this.trigger.apply(this, arguments)
		}
	});
	var methods = [
		"forEach",
		"each",
		"map",
		"reduce",
		"reduceRight",
		"find",
		"detect",
		"filter",
		"select",
		"reject",
		"every",
		"all",
		"some",
		"any",
		"include",
		"contains",
		"invoke",
		"max",
		"min",
		"sortBy",
		"sortedIndex",
		"toArray",
		"size",
		"first",
		"rest",
		"last",
		"without",
		"indexOf",
		"lastIndexOf",
		"isEmpty",
		"groupBy"
	];
	_.each(methods, function(method) {
		Backbone.Collection.prototype[method] = function() {
			return _[method].apply(_, [
				this.models
			].concat(_.toArray(arguments)))
		}
	});
	Backbone.Router = function(options) {
		options || (options = {});
		if (options.routes) {
			this.routes = options.routes
		}
		this._bindRoutes();
		this.initialize.apply(this, arguments)
	};
	var namedParam = /:([\w\d]+)/g;
	var splatParam = /\*([\w\d]+)/g;
	var escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;
	_.extend(Backbone.Router.prototype, Backbone.Events, {
		initialize : function() {
		},
		route : function(route, name, callback) {
			Backbone.history || (Backbone.history = new Backbone.History);
			if (!_.isRegExp(route)) {
				route = this._routeToRegExp(route)
			}
			Backbone.history.route(route, _.bind(function(fragment) {
				var args = this._extractParameters(route, fragment);
				callback.apply(this, args);
				this.trigger.apply(this, [
					"route:" + name
				].concat(args))
			}, this))
		},
		navigate : function(fragment, triggerRoute) {
			Backbone.history.navigate(fragment, triggerRoute)
		},
		_bindRoutes : function() {
			if (!this.routes) {
				return
			}
			var routes = [];
			for ( var route in this.routes) {
				routes.unshift([
					route, this.routes[route]
				])
			}
			for ( var i = 0, l = routes.length; i < l; i++) {
				this.route(routes[i][0], routes[i][1], this[routes[i][1]])
			}
		},
		_routeToRegExp : function(route) {
			route = route.replace(escapeRegExp, "\\$&").replace(namedParam, "([^/]*)").replace(splatParam, "(.*?)");
			return new RegExp("^" + route + "$")
		},
		_extractParameters : function(route, fragment) {
			return route.exec(fragment).slice(1)
		}
	});
	Backbone.History = function() {
		this.handlers = [];
		_.bindAll(this, "checkUrl")
	};
	var hashStrip = /^#*/;
	var isExplorer = /msie [\w.]+/;
	var historyStarted = false;
	_.extend(Backbone.History.prototype, {
		interval : 50,
		getFragment : function(fragment, forcePushState) {
			if (fragment == null) {
				if (this._hasPushState || forcePushState) {
					fragment = window.location.pathname;
					var search = window.location.search;
					if (search) {
						fragment += search
					}
					if (fragment.indexOf(this.options.root) == 0) {
						fragment = fragment.substr(this.options.root.length)
					}
				} else {
					fragment = window.location.hash
				}
			}
			return decodeURIComponent(fragment.replace(hashStrip, ""))
		},
		start : function(options) {
			if (historyStarted) {
				throw new Error("Backbone.history has already been started")
			}
			this.options = _.extend({}, {
				root : "/"
			}, this.options, options);
			this._wantsPushState = !!this.options.pushState;
			this._hasPushState = !!(this.options.pushState && window.history && window.history.pushState);
			var fragment = this.getFragment();
			var docMode = document.documentMode;
			var oldIE = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));
			if (oldIE) {
				this.iframe = $('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo("body")[0].contentWindow;
				this.navigate(fragment)
			}
			if (this._hasPushState) {
				$(window).bind("popstate", this.checkUrl)
			} else {
				if ("onhashchange" in window && !oldIE) {
					$(window).bind("hashchange", this.checkUrl)
				} else {
					setInterval(this.checkUrl, this.interval)
				}
			}
			this.fragment = fragment;
			historyStarted = true;
			var loc = window.location;
			var atRoot = loc.pathname == this.options.root;
			if (this._wantsPushState && !this._hasPushState && !atRoot) {
				this.fragment = this.getFragment(null, true);
				window.location.replace(this.options.root + "#" + this.fragment);
				return true
			} else {
				if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
					this.fragment = loc.hash.replace(hashStrip, "");
					window.history.replaceState({}, document.title, loc.protocol + "//" + loc.host + this.options.root + this.fragment)
				}
			}
			if (!this.options.silent) {
				return this.loadUrl()
			}
		},
		route : function(route, callback) {
			this.handlers.unshift({
				route : route,
				callback : callback
			})
		},
		checkUrl : function(e) {
			var current = this.getFragment();
			if (current == this.fragment && this.iframe) {
				current = this.getFragment(this.iframe.location.hash)
			}
			if (current == this.fragment || current == decodeURIComponent(this.fragment)) {
				return false
			}
			if (this.iframe) {
				this.navigate(current)
			}
			this.loadUrl() || this.loadUrl(window.location.hash)
		},
		loadUrl : function(fragmentOverride) {
			var fragment = this.fragment = this.getFragment(fragmentOverride);
			var matched = _.any(this.handlers, function(handler) {
				if (handler.route.test(fragment)) {
					handler.callback(fragment);
					return true
				}
			});
			return matched
		},
		navigate : function(fragment, triggerRoute) {
			var frag = (fragment || "").replace(hashStrip, "");
			if (this.fragment == frag || this.fragment == decodeURIComponent(frag)) {
				return
			}
			if (this._hasPushState) {
				var loc = window.location;
				if (frag.indexOf(this.options.root) != 0) {
					frag = this.options.root + frag
				}
				this.fragment = frag;
				window.history.pushState({}, document.title, loc.protocol + "//" + loc.host + frag)
			} else {
				window.location.hash = this.fragment = frag;
				if (this.iframe && (frag != this.getFragment(this.iframe.location.hash))) {
					this.iframe.document.open().close();
					this.iframe.location.hash = frag
				}
			}
			if (triggerRoute) {
				this.loadUrl(fragment)
			}
		}
	});
	Backbone.View = function(options) {
		this.cid = _.uniqueId("view");
		this._configure(options || {});
		this._ensureElement();
		this.delegateEvents();
		this.initialize.apply(this, arguments)
	};
	var selectorDelegate = function(selector) {
		return $(selector, this.el)
	};
	var eventSplitter = /^(\S+)\s*(.*)$/;
	var viewOptions = [
		"model", "collection", "el", "id", "attributes", "className", "tagName"
	];
	_.extend(Backbone.View.prototype, Backbone.Events, {
		tagName : "div",
		$ : selectorDelegate,
		initialize : function() {
		},
		render : function() {
			return this
		},
		remove : function() {
			$(this.el).remove();
			return this
		},
		make : function(tagName, attributes, content) {
			var el = document.createElement(tagName);
			if (attributes) {
				$(el).attr(attributes)
			}
			if (content) {
				$(el).html(content)
			}
			return el
		},
		delegateEvents : function(events) {
			if (!(events || (events = this.events))) {
				return
			}
			if (_.isFunction(events)) {
				events = events.call(this)
			}
			$(this.el).unbind(".delegateEvents" + this.cid);
			for ( var key in events) {
				var method = this[events[key]];
				if (!method) {
					throw new Error('Event "' + events[key] + '" does not exist')
				}
				var match = key.match(eventSplitter);
				var eventName = match[1], selector = match[2];
				method = _.bind(method, this);
				eventName += ".delegateEvents" + this.cid;
				if (selector === "") {
					$(this.el).bind(eventName, method)
				} else {
					$(this.el).delegate(selector, eventName, method)
				}
			}
		},
		_configure : function(options) {
			if (this.options) {
				options = _.extend({}, this.options, options)
			}
			for ( var i = 0, l = viewOptions.length; i < l; i++) {
				var attr = viewOptions[i];
				if (options[attr]) {
					this[attr] = options[attr]
				}
			}
			this.options = options
		},
		_ensureElement : function() {
			if (!this.el) {
				var attrs = this.attributes || {};
				if (this.id) {
					attrs.id = this.id
				}
				if (this.className) {
					attrs["class"] = this.className
				}
				this.el = this.make(this.tagName, attrs)
			} else {
				if (_.isString(this.el)) {
					this.el = $(this.el).get(0)
				}
			}
		}
	});
	var extend = function(protoProps, classProps) {
		var child = inherits(this, protoProps, classProps);
		child.extend = this.extend;
		return child
	};
	Backbone.Model.extend = Backbone.Collection.extend = Backbone.Router.extend = Backbone.View.extend = extend;
	var methodMap = {
		create : "POST",
		update : "PUT",
		"delete" : "DELETE",
		read : "GET"
	};
	Backbone.sync = function(method, model, options) {
		var type = methodMap[method];
		var params = _.extend({
			type : type,
			dataType : "json"
		}, options);
		if (!params.url) {
			params.url = getUrl(model) || urlError()
		}
		if (!params.data && model && (method == "create" || method == "update")) {
			params.contentType = "application/json";
			params.data = JSON.stringify(model.toJSON())
		}
		if (Backbone.emulateJSON) {
			params.contentType = "application/x-www-form-urlencoded";
			params.data = params.data ? {
				model : params.data
			} : {}
		}
		if (Backbone.emulateHTTP) {
			if (type === "PUT" || type === "DELETE") {
				if (Backbone.emulateJSON) {
					params.data._method = type
				}
				params.type = "POST";
				params.beforeSend = function(xhr) {
					xhr.setRequestHeader("X-HTTP-Method-Override", type)
				}
			}
		}
		if (params.type !== "GET" && !Backbone.emulateJSON) {
			params.processData = false
		}
		return $.ajax(params)
	};
	var ctor = function() {
	};
	var inherits = function(parent, protoProps, staticProps) {
		var child;
		if (protoProps && protoProps.hasOwnProperty("constructor")) {
			child = protoProps.constructor
		} else {
			child = function() {
				return parent.apply(this, arguments)
			}
		}
		_.extend(child, parent);
		ctor.prototype = parent.prototype;
		child.prototype = new ctor();
		if (protoProps) {
			_.extend(child.prototype, protoProps)
		}
		if (staticProps) {
			_.extend(child, staticProps)
		}
		child.prototype.constructor = child;
		child.__super__ = parent.prototype;
		return child
	};
	var getUrl = function(object) {
		if (!(object && object.url)) {
			return null
		}
		return _.isFunction(object.url) ? object.url() : object.url
	};
	var urlError = function() {
		throw new Error('A "url" property or function must be specified')
	};
	var wrapError = function(onError, model, options) {
		return function(resp) {
			if (onError) {
				onError(model, resp, options)
			} else {
				model.trigger("error", model, resp, options)
			}
		}
	};
	var escapeHTML = function(string) {
		return string.replace(/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;")
	}
}).call(this);

// -- ./js/expanz.factory.js --
$(function() {
	window.expanz = window.expanz || {};
	window.expanz.Factory = {
		Activity : function(viewNamespace, modelNamespace, activityEl) {
			var activityModel = new modelNamespace.Activity({
				name : $(activityEl).attr("name"),
				title : $(activityEl).attr("title"),
				url : $(activityEl).attr("url"),
				key : $(activityEl).attr("key")
			});
			var activityView = new viewNamespace.ActivityView({
				el : $(activityEl),
				id : $(activityEl).attr("name"),
				key : $(activityEl).attr("key"),
				collection : activityModel
			});
			_.each(expanz.Factory.Field(viewNamespace, modelNamespace, $(activityEl).find("[bind=field]")), function(fieldModel) {
				fieldModel.set({
					parent : activityModel
				}, {
					silent : true
				});
				activityModel.add(fieldModel)
			});
			_.each(expanz.Factory.DependantField(viewNamespace, modelNamespace, $(activityEl).find("[bind=dependant]")), function(dependantFieldModel) {
				dependantFieldModel.set({
					parent : activityModel
				}, {
					silent : true
				});
				activityModel.add(dependantFieldModel)
			});
			_.each(expanz.Factory.Method(viewNamespace, modelNamespace, $(activityEl).find("[bind=method]")), function(methodModel) {
				methodModel.set({
					parent : activityModel
				}, {
					silent : true
				});
				activityModel.add(methodModel)
			});
			_.each(expanz.Factory.Grid(viewNamespace, modelNamespace, activityModel.getAttr("name"), $(activityEl).find("[bind=grid]")), function(gridModel) {
				gridModel.setAttr({
					parent : activityModel,
					activityId : activityModel.getAttr("name")
				});
				activityModel.addGrid(gridModel)
			});
			return activityView
		},
		Field : function(viewNamespace, modelNamespace, DOMObjects) {
			var fieldModels = [];
			_.each(DOMObjects, function(fieldEl) {
				var field = new modelNamespace.Field({
					id : $(fieldEl).attr("name")
				});
				var view = new viewNamespace.FieldView({
					el : $(fieldEl),
					id : $(fieldEl).attr("id"),
					className : $(fieldEl).attr("class"),
					model : field
				});
				fieldModels.push(field)
			});
			return fieldModels
		},
		DependantField : function(viewNamespace, modelNamespace, DOMObjects) {
			var fieldModels = [];
			_.each(DOMObjects, function(fieldEl) {
				var field = new modelNamespace.Bindable({
					id : $(fieldEl).attr("name")
				});
				var view = new viewNamespace.DependantFieldView({
					el : $(fieldEl),
					id : $(fieldEl).attr("id"),
					className : $(fieldEl).attr("class"),
					model : field
				});
				fieldModels.push(field)
			});
			return fieldModels
		},
		Method : function(viewNamespace, modelNamespace, DOMObjects) {
			var methodModels = [];
			_.each(DOMObjects, function(methodEl) {
				var method = new modelNamespace.Method({
					id : $(methodEl).attr("name"),
					contextObject : $(methodEl).attr("contextObject")
				});
				var view = new viewNamespace.MethodView({
					el : $(methodEl),
					id : $(methodEl).attr("id"),
					className : $(methodEl).attr("class"),
					model : method
				});
				methodModels.push(method)
			});
			return methodModels
		},
		Grid : function(viewNamespace, modelNamespace, activityName, DOMObjects) {
			var gridModels = [];
			_.each(DOMObjects, function(gridEl) {
				var gridModel = new modelNamespace.Data.Grid({
					id : $(gridEl).attr("name"),
					populateMethod : $(gridEl).attr("populateMethod")
				});
				var view = new viewNamespace.GridView({
					el : $(gridEl),
					id : $(gridEl).attr("id"),
					className : $(gridEl).attr("class"),
					model : gridModel
				});
				$.get("./formmapping.xml", function(defaultsXML) {
					var activityInfo = _.find($(defaultsXML).find("activity"), function(activityXML) {
						return $(activityXML).attr("name") === activityName
					});
					if (activityInfo) {
						var gridviewInfo = _.find($(activityInfo).find("gridview"), function(gridviewXML) {
							return $(gridviewXML).attr("id") === gridModel.getAttr("id")
						});
						if (gridviewInfo) {
							_.each($(gridviewInfo).find("column"), function(column) {
								gridModel.addColumnDefault($(column).attr("id"), $(column).attr("field"), $(column).attr("label"), $(column).attr("datatype"), $(column).attr("width"))
							})
						}
					}
				});
				gridModels.push(gridModel)
			});
			return gridModels
		}
	}
});

// -- ./js/expanz.model.js --
$(function() {
	window.expanz = window.expanz || {};
	window.expanz.Model = {};
	window.expanz.Model.Login = {};
	window.expanz.Model.Bindable = Backbone.Model.extend({
		destroy : function() {
		}
	});
	window.expanz.Collection = Backbone.Collection.extend({
		initialize : function(attrs, options) {
			this.attrs = {};
			this.setAttr(attrs);
			return
		},
		getAttr : function(key) {
			if (this.attrs[key]) {
				return this.attrs[key]
			}
			return false
		},
		setAttr : function(attrs) {
			for ( var key in attrs) {
				if (key === "id") {
					this.id = attrs[key]
				}
				this.attrs[key] = attrs[key]
			}
			return true
		},
		destroy : function() {
			this.each(function(m) {
				m.destroy()
			});
			return
		}
	});
	window.expanz.Model.Field = expanz.Model.Bindable.extend({
		defaults : function() {
			return {
				error : false
			}
		},
		validate : function(attrs) {
		},
		update : function(attrs) {
			expanz.Net.DeltaRequest(this.get("id"), attrs.value, this.get("parent"));
			return
		}
	});
	window.expanz.Model.Method = expanz.Model.Bindable.extend({
		submit : function() {
			expanz.Net.MethodRequest(this.get("id"), this.get("contextObject"), this.get("parent"));
			return
		}
	});
	window.expanz.Model.Activity = expanz.Collection.extend({
		model : expanz.Model.Bindable,
		initialize : function(attrs) {
			this.grids = {};
			expanz.Collection.prototype.initialize.call(this, attrs)
		},
		getAll : function() {
			return this.reject(function(field) {
				return (field.get("id") === "error") || (field.getAttr && field.getAttr("name"))
			}, this)
		},
		addGrid : function(grid) {
			this.grids[grid.id] = grid;
			return
		},
		getGrid : function(id) {
			return this.grids[id]
		},
		getGrids : function() {
			return this.grids
		},
		hasGrid : function() {
			return this.grids != {}
		},
		load : function(callbacks) {
			expanz.Net.CreateActivityRequest(this, callbacks)
		},
		destroy : function(callbacks) {
			expanz.Net.DestroyActivityRequest(this);
			expanz.Collection.prototype.destroy.call(this, callbacks)
		}
	})
});

// -- ./js/expanz.net.js --
$(function() {
	window.expanz = window.expanz || {};
	window.expanz.Net = {
		CreateSessionRequest : function(username, password, callbacks) {
			var appsite = config._AppSite;
			SendRequest(RequestObject.CreateSession(username, password, appsite), parseCreateSessionResponse(callbacks))
		},
		GetSessionDataRequest : function(callbacks) {
			SendRequest(RequestObject.GetSessionData(expanz.Storage.getSessionHandle()), parseGetSessionDataResponse(callbacks))
		},
		CreateActivityRequest : function(activity, callbacks) {
			SendRequest(RequestObject.CreateActivity(activity, "", expanz.Storage.getSessionHandle()), parseCreateActivityResponse(activity, callbacks))
		},
		DeltaRequest : function(id, value, activity, callbacks) {
			SendRequest(RequestObject.Delta(id, value, activity, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, callbacks))
		},
		MethodRequest : function(name, contextObject, activity, callbacks) {
			SendRequest(RequestObject.Method(name, contextObject, activity, expanz.Storage.getSessionHandle()), parseDeltaResponse(activity, callbacks))
		},
		DestroyActivityRequest : function(activity, callbacks) {
			SendRequest(RequestObject.DestroyActivity(activity, expanz.Storage.getSessionHandle()), parseDestroyActivityResponse(activity, callbacks))
		},
		ReleaseSessionRequest : function(callbacks) {
			SendRequest(RequestObject.ReleaseSession(expanz.Storage.getSessionHandle()), parseReleaseSessionResponse(callbacks))
		}
	};
	var XMLNamespace = window.config._XMLNamespace || "http://www.expanz.com/ESAService";
	var RequestObject = {
		CreateSession : function(username, password, appsite) {
			return {
				data : buildRequest("CreateSessionX", XMLNamespace)(RequestBody.CreateSession(username, password, appsite)),
				url : "CreateSessionX"
			}
		},
		GetSessionData : function(sessionHandle) {
			return {
				data : buildRequest("ExecX", "http://www.expanz.com/ESAService", sessionHandle)(RequestBody.GetSessionData()),
				url : "ExecX"
			}
		},
		CreateActivity : function(activity, style, sessionHandle) {
			return {
				data : buildRequest("ExecX", "http://www.expanz.com/ESAService", sessionHandle)(RequestBody.CreateActivity(activity, style)),
				url : "ExecX"
			}
		},
		Delta : function(id, value, activity, sessionHandle) {
			return {
				data : buildRequest("ExecX", "http://www.expanz.com/ESAService", sessionHandle)(RequestBody.Delta(id, value, activity)),
				url : "ExecX"
			}
		},
		Method : function(name, contextObject, activity, sessionHandle) {
			return {
				data : buildRequest("ExecX", "http://www.expanz.com/ESAService", sessionHandle)(RequestBody.CreateMethod(name, contextObject, activity)),
				url : "ExecX"
			}
		},
		DestroyActivity : function(activity, sessionHandle) {
			return {
				data : buildRequest("ExecX", "http://www.expanz.com/ESAService", sessionHandle)(RequestBody.DestroyActivity(activity)),
				url : "ExecX"
			}
		},
		ReleaseSession : function(sessionHandle) {
			return {
				data : buildRequest("ReleaseSession", "http://www.expanz.com/ESAService", sessionHandle)(RequestBody.CreateReleaseSession()),
				url : "ExecX"
			}
		}
	};
	var buildRequest = function(requestType, xmlns, sessionHandle) {
		return function insertBody(body) {
			var head = "<" + requestType + ' xmlns="' + xmlns + '"><xml><ESA>';
			var tail = "</ESA></xml>";
			tail += sessionHandle ? "<sessionHandle>" + sessionHandle + "</sessionHandle>" : "";
			tail += "</" + requestType + ">";
			return head + body + tail
		}
	};
	var RequestBody = {
		CreateSession : function(username, password, appsite) {
			return '<CreateSession user="' + username + '" password="' + password + '" appSite="' + appsite + '" authenticationMode="Alternate" clientVersion="Flex 1.0" schemaVersion="2.0"/>'
		},
		GetSessionData : function() {
			return "<GetSessionData/>"
		},
		CreateActivity : function(activity, style) {
			var center = '<CreateActivity name="' + activity.getAttr("name") + '"';
			style ? center += ' style="' + style + '"' : "";
			center += activity.getAttr("key") ? ' initialKey="' + activity.getAttr("key") + '">' : ">";
			if (activity.hasGrid()) {
				_.each(activity.getGrids(), function(grid, gridId) {
					center += '<DataPublication id="' + gridId + '" populateMethod="' + grid.getAttr("populateMethod") + '"';
					grid.getAttr("contextObject") ? center += ' contextObject="' + grid.getAttr("contextObject") + '"' : "";
					center += "/>"
				})
			}
			center += "</CreateActivity>";
			return center
		},
		Delta : function(id, value, activity) {
			return '<Activity activityHandle="' + activity.getAttr("handle") + '"><Delta id="' + id + '" value="' + value + '"/></Activity>'
		},
		CreateMethod : function(name, contextObject, activity) {
			var body = '<Activity activityHandle="' + activity.getAttr("handle") + '"><Method name="' + name + '"';
			body += contextObject ? ' contextObject="' + contextObject + '"' : "";
			body += "/></Activity>";
			return body
		},
		CreateMenuAction : function(activity, contextId, contextType, menuAction) {
			return '<Activity activityHandle="' + activity.getAttr("handle") + '"><Context id="' + contextId + '" Type="' + contextType + '"/><MenuAction defaultAction="' + menuAction + '"/></Activity>'
		},
		DestroyActivity : function(activity, sessionHandle) {
			return '<Close activityHandle="' + activity.getAttr("handle") + '"/>'
		},
		CreateReleaseSession : function() {
			return "<ReleaseSession/>"
		}
	};
	var parseCreateSessionResponse = function(callbacks) {
		return function apply(xml) {
			if ($(xml).find("CreateSessionXResult").length > 0) {
				expanz.Storage.setSessionHandle($(xml).find("CreateSessionXResult").text())
			} else {
				if (callbacks && callbacks.error) {
					callbacks.error("Error: Server did not provide a sessionhandle. We are unable to log you in at this time.")
				}
				return
			}
			if (!expanz.Storage.getSessionHandle() || expanz.Storage.getSessionHandle.length > 0) {
				var errorString = "";
				$(xml).find("errorMessage").each(function() {
					errorString = $(this).text()
				});
				if (errorString.length > 0) {
					if (callbacks && callbacks.error) {
						callbacks.error(errorString)
					}
					return
				}
			}
			if (callbacks && callbacks.success) {
				callbacks.success()
			}
			return
		}
	};
	function parseGetSessionDataResponse(callbacks) {
		return function apply(xml) {
			var processAreas = [];
			$(xml).find("processarea").each(function() {
				var processArea = new ProcessArea($(this).attr("id"), $(this).attr("title"));
				$(this).find("activity").each(function() {
					processArea.activities.push(new ActivityInfo($(this).attr("name"), $(this).attr("title"), "#"))
				});
				processAreas.push(processArea)
			});
			$.get("./formmapping.xml", function(data) {
				$(data).find("activity").each(function() {
					var name = $(this).attr("name");
					var url = $(this).attr("form");
					var gridviewList = [];
					$(this).find("gridview").each(function() {
						var gridview = new GridViewInfo($(this).attr("id"));
						$(this).find("column").each(function() {
							gridview.addColumn($(this).attr("field"), $(this).attr("width"))
						});
						gridviewList.push(gridview)
					});
					$.each(processAreas, function(i, processArea) {
						$.each(processArea.activities, function(j, activity) {
							if (activity.name == name) {
								activity.url = url;
								activity.gridviews = gridviewList
							}
						})
					})
				});
				expanz.Storage.setProcessAreaList(processAreas);
				$(data).find("activity").each(function() {
					if ($(this).attr("default") == "true") {
						if (callbacks && callbacks.success) {
							callbacks.success($(this).attr("form"))
						}
						return
					}
				})
			})
		}
	}
	function parseCreateActivityResponse(activity, callbacks) {
		return function apply(xml) {
			var execResults = $(xml).find("ExecXResult");
			if (execResults) {
				$(execResults).find("Message").each(function() {
					if ($(this).attr("type") == "Error") {
						if (callbacks && callbacks.error) {
							callbacks.error($(this).text())
						}
					}
				});
				$(execResults).find("Activity").each(function() {
					activity.setAttr({
						handle : $(this).attr("activityHandle")
					})
				});
				$(execResults).find("Field").each(function() {
					var field = activity.get($(this).attr("id"));
					if (field) {
						field.set({
							label : $(this).attr("label"),
							value : $(this).attr("value")
						});
						if ($(this).attr("datatype")) {
							field.set({
								datatype : $(this).attr("datatype")
							}, {
								silent : true
							});
							if ($(this).attr("datatype").toLowerCase() === "blob" && $(this).attr("url")) {
								field.set({
									value : $(this).attr("url")
								})
							}
						}
					}
				});
				_.each($(execResults).find("Data"), function(data) {
					var gridId = $(data).attr("id");
					var gridModel = activity.getGrid(gridId);
					gridModel.setAttr({
						source : $(data).attr("source")
					});
					_.each($(data).find("Column"), function(column) {
						gridModel.addColumn($(column).attr("id"), $(column).attr("field"), $(column).attr("label"), $(column).attr("datatype"), $(column).attr("width"))
					});
					_.each($(data).find("Row"), function(row) {
						var rowId = $(row).attr("id");
						gridModel.addRow(rowId, $(row).attr("type"));
						_.each($(row).find("Cell"), function(cell) {
							gridModel.addCell(rowId, $(cell).attr("id"), $(cell).html())
						})
					})
				});
				if (callbacks && callbacks.success) {
					callbacks.success("Activity (" + activity.name + ") has been loaded: " + execResults)
				}
			} else {
				if (callbacks && callbacks.error) {
					callbacks.error("Server gave an empty response to a CreateActivity request: " + xml)
				}
			}
			return
		}
	}
	function parseDeltaResponse(activity, callbacks) {
		return function apply(xml) {
			var execResults = $(xml).find("ExecXResult");
			if (execResults) {
				$(execResults).find("Message").each(function() {
					if ($(this).attr("type") == "Error" || $(this).attr("type") == "Warning") {
						if (callbacks && callbacks.error) {
							callbacks.error($(this).text())
						}
					}
				});
				$(execResults).find("Field").each(function() {
					var id = $(this).attr("id");
					var field = activity.get(id);
					if (field && (field.get("value") && (field.get("value") != $(this).attr("value"))) || !field.get("value")) {
						field.set({
							value : $(this).attr("value")
						})
					}
					if (field && field.get("url") && (field.get("url") != $(this).attr("url"))) {
						field.set({
							value : $(this).attr("url")
						})
					}
				})
			}
			return
		}
	}
	function parseDestroyActivityResponse(activity, callbacks) {
		return function apply(xml) {
			var execResults = $(xml).find("ExecXResult");
			if (xml && execResults) {
				var esaResult = $(execResults).find("ESA");
				if (esaResult) {
					if ($(esaResult).attr("success") === 1) {
						if (callbacks && callbacks.success) {
							callbacks.success(true);
							return true
						}
					}
				}
			}
			if (callbacks && callbacks.error) {
				callbacks.error(true)
			}
			return
		}
	}
	function parseReleaseSessionResponse(callbacks) {
		return function apply(xml) {
			var result = $(xml).find("ReleaseSessionResult").text();
			if (result === "true") {
				if (deleteSessionHandle()) {
					if (callbacks && callbacks.success) {
						callbacks.success(result);
						return
					}
				}
			}
			if (callbacks && callbacks.error) {
				callbacks.error(result)
			}
			return
		}
	}
	var SendRequest = function(request, responseHandler) {
		$.ajax({
			type : "POST",
			url : config._URLproxy,
			data : {
				url : config._URLprefix + request.url,
				data : request.data
			},
			dataType : "string",
			processData : true,
			complete : function(HTTPrequest) {
				if (HTTPrequest.status != 200) {
					eval(responseHandler)("There was a problem with the last request.")
				} else {
					var response = HTTPrequest.responseText;
					if (responseHandler) {
						var xml = response.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
						eval(responseHandler)(xml)
					}
				}
			}
		})
	};
	function ProcessArea(id, title) {
		this.id = id;
		this.title = title;
		this.activities = []
	}
	function ActivityInfo(name, title, url) {
		this.name = name;
		this.title = title;
		this.url = url;
		this.gridviews = []
	}
	function GridViewInfo(id) {
		this.id = id;
		this.columns = [];
		this.addColumn = function(field, width) {
			this.columns.push(new ColumnInfo(field, width))
		};
		function ColumnInfo(field, width) {
			this.field = field;
			this.width = width
		}
	}
});

// -- ./js/expanz.storage.js --
$(function() {
	window.expanz = window.expanz || {};
	window.expanz.Storage = {
		getSessionHandle : function() {
			return $.cookies.get("_expanz.session.handle")
		},
		setSessionHandle : function(sessionHandle) {
			$.cookies.set("_expanz.session.handle", sessionHandle);
			setLoginURL(document.location.pathname);
			return true
		},
		getProcessAreaList : function() {
			return $.cookies.get("_expanz.processarea.list")
		},
		setProcessAreaList : function(list) {
			$.cookies.set("_expanz.processarea.list", JSON.stringify(list));
			return true
		},
		getLoginURL : function() {
			return $.cookies.get("_expanz.login.url")
		},
		endSession : function() {
			$.cookies.del("_expanz.session.handle");
			return true
		},
		AppSiteMenu : function() {
			this.processAreas = [];
			this.load = function(el) {
				el.html("");
				_.each(this.processAreas, function(pA) {
					el.append('<div id="' + pA.id + '" class="processarea menuitem"><a>' + pA.title + "</a></div>");
					pA.load(el.find("#" + pA.id + ".processarea.menuitem"))
				});
				el.append('<div id="logout" class="processarea menuitem"><a>logout</a></div>');
				$(el.find("#logout")[0]).click(function(e) {
					expanz.Logout()
				})
			}
		},
		ProcessAreaMenu : function(id, title) {
			this.id = id;
			this.title = title;
			this.activities = [];
			this.load = function(el) {
				el.append('<ul id="' + this.id + '"></ul>');
				_.each(this.activities, function(activity) {
					activity.load(el.find("ul"))
				})
			}
		},
		ActivityMenu : function(name, title, url) {
			this.name = name;
			this.title = title;
			this.url = url;
			this.load = function(el) {
				el.append('<li class="activity"><a href=\'' + this.url + "'>" + this.title + "</a></li>")
			}
		}
	};
	var setLoginURL = function(url) {
		$.cookies.set("_expanz.login.url", url);
		return true
	}
});

// -- ./js/expanz.view.login.js --
$(function() {
	window.expanz = window.expanz || {};
	window.expanz.Views = window.expanz.Views || {};
	window.expanz.Views.Login = {};
	window.expanz.Views.Login.FieldView = Backbone.View.extend({
		initialize : function() {
			this.model.bind("change:label", this.modelUpdate("label"), this);
			this.model.bind("change:value", this.modelUpdate("value"), this)
		},
		modelUpdate : function(attr) {
			return function() {
				var elem = this.el.find("[attribute=" + attr + "]");
				updateViewElement(elem, this.model.get(attr));
				this.el.trigger("update:field")
			}
		},
		events : {
			"change [attribute=value]" : "viewUpdate",
			"blur [attribute=value]" : "viewUpdate"
		},
		viewUpdate : function() {
			this.model.set({
				value : this.el.find("[attribute=value]").val()
			});
			this.el.trigger("update:field")
		}
	});
	window.expanz.Views.Login.DependantFieldView = Backbone.View.extend({
		initialize : function() {
			this.model.bind("change:value", this.toggle, this);
			this.model.bind("error", this.error, this);
			this.el.hide()
		},
		toggle : function() {
			var elem = this.el.find("[attribute=value]");
			updateViewElement(elem, this.model.get("value"));
			if (this.model.get("value").length > 0) {
				this.el.show("slow")
			} else {
				this.el.hide("slow")
			}
		},
		error : function(model, error) {
			return false
		}
	});
	window.expanz.Views.Login.MethodView = Backbone.View.extend({
		events : {
			"click [attribute=submit]" : "attemptSubmit"
		},
		attemptSubmit : function() {
			this.el.trigger("attemptLogin")
		}
	});
	window.expanz.Views.Login.ActivityView = Backbone.View.extend({
		initialize : function() {
			this.collection.bind("error", this.updateError, this)
		},
		updateError : function(model, error) {
			var errorFieldModel = this.collection.get("error");
			if (errorFieldModel) {
				errorFieldModel.set({
					value : error
				})
			}
		},
		events : {
			attemptLogin : "attemptLogin",
			"update:field" : "update"
		},
		attemptLogin : function() {
			if (!this.collection.get("username").get("error") && !this.collection.get("password").get("error")) {
				this.collection.login()
			}
		},
		update : function() {
			if (!this.collection.get("username").get("error") && !this.collection.get("password").get("error")) {
				this.collection.get("error").set({
					value : ""
				})
			}
		}
	});
	window.expanz.Views.redirect = function(destinationURL) {
		window.location.href = destinationURL
	};
	function updateViewElement(elem, value) {
		if ($(elem).is("input")) {
			$(elem).val(value)
		} else {
			$(elem).html(value)
		}
		return elem
	}
});

// -- ./js/expanz.model.login.js --
$(function() {
	window.expanz = window.expanz || {};
	window.expanz.Model.Login = _.extend(expanz.Model, {
		Activity : expanz.Model.Activity.extend({
			validate : function() {
				if (!this.get("username").get("error") && !this.get("password").get("error")) {
					return true
				} else {
					return false
				}
			},
			login : function() {
				if (this.validate()) {
					expanz.Net.CreateSessionRequest(this.get("username").get("value"), this.get("password").get("value"), {
						success : loginCallback,
						error : expanz._error
					})
				}
			}
		})
	});
	var loginCallback = function(error) {
		if (error && error.length > 0) {
			this.get("error").set({
				value : error
			})
		} else {
			expanz.Net.GetSessionDataRequest({
				success : getSessionCallback
			})
		}
	};
	var getSessionCallback = function(url) {
		expanz.Views.redirect(url)
	}
});

// -- ./js/expanz.login.js --
$(function() {
	window.App = [];
	window.expanz = window.expanz || {};
	window.expanz._error = window.expanz._error || function(error) {
		console.log("Expanz JavaScript SDK has encountered an error: " + error)
	};
	window.expanz.CreateActivity = function(DOMObject) {
		DOMObject || (DOMObject = $("body"));
		var viewNamespace = expanz.Views.Login;
		var modelNamespace = expanz.Model.Login;
		var activities = createActivity(viewNamespace, modelNamespace, DOMObject);
		_.each(activities, function(activity) {
			window.App.push(activity)
		});
		return
	};
	window.expanz.SetErrorCallback = function(fn) {
		expanz._error = fn
	};
	function createActivity(viewNamespace, modelNamespace, dom) {
		var activities = [];
		if ($(dom).attr("bind").toLowerCase() === "activity") {
			var activityView = expanz.Factory.Activity(viewNamespace, modelNamespace, dom);
			activities.push(activityView)
		} else {
			_.each($(dom).find("[bind=activity]"), function(activityEl) {
				var activityView = expanz.Factory.Activity(viewNamespace, modelNamespace, dom);
				activities.push(activityView)
			})
		}
		return activities
	}
});
