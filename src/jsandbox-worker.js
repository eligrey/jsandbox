/*
 * JSandbox worker v0.2.0.3
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

(function (self, globalEval) {
	"use strict";
	
	var
	postMessage   = self.postMessage,
	importScripts = self.importScripts;
	
	if (typeof self.JSON === "undefined") {
		importScripts("http://github.com/eligrey/jsandbox/raw/master/min/json2.js");
	}
	
	// need to store JSON, JSON.parse and JSON.stringify in case they get changed
	var
	json              = self.JSON,
	jsonStringify     = json.stringify,
	jsonParse         = json.parse,
	jsonStringifyThis = function () { // for compatability with WebKit/Chrome
		return jsonStringify.call(json, this);
	},
	
	messageHandler = function (event) {
		var request = event.data,
		response = {
			toString : jsonStringifyThis
		};
		
		if (typeof request === "string") { // parse JSON
			request = jsonParse.call(json, request);
		}
		
		response.id = request.id;
		
		var data = request.data;
		self.input = request.input;
		
		try {
			switch (request.method) {
			
			case "eval": // JSLint has something against indenting cases
				response.results = globalEval(data);
				break;
			case "exec":
				importScripts("data:application/javascript," +
				              encodeURIComponent(data));
				break;
			case "load":
				importScripts.apply(self, data);
				break;
			
			}
		} catch (e) {
			response.error = e;
		}
		
		delete self.input;
		delete self.onmessage; // in case the code defined it
		
		postMessage(response);
	};
	
	if (self.addEventListener) {
		self.addEventListener("message", messageHandler, false);
	} else if (self.attachEvent) { // for compatibility with future IE
		self.attachEvent("onmessage", messageHandler);
	}
	
	self.window = self; // provide a window object for scripts
	
	// dereference unsafe functions
	// some might not be dereferenced: https://bugzilla.mozilla.org/show_bug.cgi?id=512464
	self.Worker              =
	self.addEventListener    = 
	self.removeEventListener =
	self.importScripts       =
	self.XMLHttpRequest      =
	self.postMessage         =
	self.dispatchEvent       =
	// in case IE implements web workers
	self.attachEvent         =
	self.detachEvent         =
	self.ActiveXObject       =
	
	undefined;
	
}(self, eval));
