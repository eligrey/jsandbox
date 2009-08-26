/*
* JSandbox worker v0.2
* 2009-08-25
* By Elijah Grey, http://eligrey.com
*
* License: GNU GPL v3 and the X11/MIT license
*   See COPYING.md
*/

// This file is requested every time a new sandbox is created.
// Make sure to include a Cache-Control header when serving this over HTTP.

/*jslint white: true, evil: true, undef: true, eqeqeq: true, immed: true */

(function (globalEval) {
	"use strict";
	
	var
	window        = this,
	postMessage   = window.postMessage,
	importScripts = window.importScripts;
	
	if (typeof JSON === "undefined") {
		importScripts("http://github.com/eligrey/jsandbox/raw/master/min/json2.js");
	}
	
	// need to store JSON.parse and JSON.stringify in case they get changed
	var
	JSONstringify     = JSON.stringify,
	JSONparse         = JSON.parse,
	
	messageHandler = function (event) {
		var request = event.data,
		response = {
			toString : function () { // for compatability with WebKit/Chrome
				return JSONstringify(this);
			}
		};
		
		// optimized to have no unnecessary conditional block scopes
		
		(typeof request === "string" && // parse JSON
			(request = JSONparse(request)));
		
		response.id = request.id;
		
		postMessage(function () {
			var data = request.data;
			window.input = request.input;
			try {
				switch (request.method) {
				
				case "eval": // JSLint has something against indenting cases
					response.results = globalEval(data);
					break;
				case "exec":
					importScripts("data:," + encodeURIComponent(data));
					break;
			//	case "load":
			//		importScripts.apply(window, data);
				// replace the case below with the faster case above once Chromium issue 20192 is fixed
				// http://code.google.com/p/chromium/issues/detail?id=20192
				case "load":
					var len = data.length,
					    i = 0;
					for (; i < len; i++) {
						importScripts(data[i]);
					}
				
				}
			} catch (e) {
				response.error = e;
			}
			delete window.input;
			return response;
		}());
	};
	
	if (window.addEventListener) {
		window.addEventListener("message", messageHandler, false);
		window.addEventListener    = 
		window.removeEventListener =
		undefined;
	} else if (window.attachEvent) { // for compatibility with future IE
		window.attachEvent("onmessage", messageHandler);
		window.attachEvent =
		window.detachEvent =
		undefined;
	}
	
	window.window = window; // provide a window object for scripts
	
	// dereference unsafe functions in case the last loop didn't get these
	window.importScripts       =
	window.XMLHttpRequest      =
	window.postMessage         =
	window.dispatchEvent       =
	undefined;
	
}.call(this, eval)); // in ES5 strict `this' isn't `this' for this function, use .call(this)
