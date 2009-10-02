/*
 * JSandbox worker v0.2.0.1
 * 2009-10-01
 * By Elijah Grey, http://eligrey.com
 *
 * License: GNU GPL v3 and the X11/MIT license
 *   See COPYING.md
 */

// This file is requested every time a new sandbox is created.
// Make sure to include a Cache-Control header when serving this over HTTP.

/*global self, JSON*/

/*jslint white: true, evil: true, undef: true, eqeqeq: true, immed: true */

(function (window, globalEval) {
	"use strict";
	
	var
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
			delete window.onmessage; // in case the code defined it
			return response;
		}());
	};
	
	if (window.addEventListener) {
		window.addEventListener("message", messageHandler, false);
	} else if (window.attachEvent) { // for compatibility with future IE
		window.attachEvent("onmessage", messageHandler);
	}
	
	window.window = window; // provide a window object for scripts
	
	// dereference unsafe functions
	// some might not be dereferenced: https://bugzilla.mozilla.org/show_bug.cgi?id=512464
	window.addEventListener    = 
	window.removeEventListener =
	window.attachEvent         =
	window.detachEvent         =
	window.importScripts       =
	window.XMLHttpRequest      =
	window.postMessage         =
	window.dispatchEvent       =
	undefined;
	
}(self, eval));
