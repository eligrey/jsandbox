/*
* JSandbox JavaScript Library v0.2
* 2009-08-25
* By Elijah Grey, http://eligrey.com
*
* License: GNU GPL v3 and the X11/MIT license
*   See COPYING.md
*/

/*jslint white: true, onevar: true, browser: true, undef: true, nomen: true, eqeqeq: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */

"use strict";

(function () {
	
	if (typeof this.Worker === "undefined") {
		return;
	}
	
	if (typeof JSON === "undefined") {
		(document.getElementsByTagName("head")[0] || document.documentElement)
			.appendChild(document.createElement("script")).src = "http://github.com/eligrey/jsandbox/raw/master/min/json2.js";
	}
	
	var
	window     = this,
	
	// repeatedly used property names (for minification)
	$eval      = "eval",
	$exec      = "exec",
	$load      = "load",
	$requests  = "requests",
	$input     = "input",
	$terminate = "terminate",
	$data      = "data",
	$callback  = "callback",
	$onerror   = "onerror",
	$worker    = "worker",
	
	
	Sandbox = function () {
		var sandbox = this;
		
		if (!(sandbox instanceof Sandbox)) {
			return new Sandbox();
		}
		
		sandbox[$worker] = new window.Worker(Sandbox.url);
		sandbox[$requests] = {};
		
		sandbox[$worker].onmessage = function (event) {
			var data = event[$data], request;
			if (typeof data === "string") { // parse JSON
				try {
					data = JSON.parse(data);
				} catch (e) {
					return;
				}
			}
			if (typeof data !== "object") {
				return;
			}
			request = sandbox[$requests][data.id];
			if (request) {
				if (data.error) {
					if (typeof sandbox[$onerror] === "function") {
						sandbox[$onerror](data);
					}
					if (typeof request[$onerror] === "function") {
						request[$onerror].call(sandbox, data.error);
					}
				} else {
					if (typeof sandbox.onresponse === "function") {
						sandbox.onresponse(data);
					}
				
					if (typeof request[$callback] === "function") {
						request[$callback].call(sandbox, data.results);
					}
				}
				delete sandbox[$requests][data.id];
			}
		};
	},
	proto = Sandbox.prototype,
	createRequestMethod = function (method) {
		proto[method] = function (options, callback, input, onerror) {
			if (typeof options === "string" ||
			    Object.prototype.toString.call(options) === "[object Array]" ||
			    arguments.length > 1)
			{ // called in (data, callback, input, onerror) style
				options = {
					data     : options,
					input    : input,
					callback : callback,
					onerror  : onerror
				};
			}
			
			if (method === $load && typeof options[$data] === "string") {
				options[$data] = [options[$data]];
			}
			
			var data  = options[$data],
				id    = this.createRequestID();
			
			input = options[$input];
			
			delete options[$data];
			delete options[$input];
			
			this[$requests][id] = options;
			
			this[$worker].postMessage({
				id       : id,
				method   : method,
				data     : data,
				input    : input,
				toString : function () { // for compatability with WebKit/Chrome
					return JSON.stringify(this);
				}
			});
		
			return id;
		};
		Sandbox[method] = function () {
			var sandbox = new Sandbox();
		
			sandbox.onresponse = sandbox[$onerror] = function () {
				sandbox[$terminate]();
				sandbox = null;
			};
		
			proto[method].apply(sandbox, Array.prototype.slice.call(arguments));
			return Sandbox;
		};
	},
	jsandboxNode,
	methods = [$eval, $load, $exec],
	i = methods.length;
	
	while (i--) {
		createRequestMethod(methods[i]);
	}
	
	proto[$terminate] = function () {
		this[$requests] = {};
		this[$worker][$terminate]();
	};
	
	proto.abort = function (id) {
		delete this[$requests][id];
	};
	
	proto.createRequestID = function () {
		var id = Math.random().toString();
		if (id in this[$requests]) {
			return this.createRequestID();
		}
		return id;
	};
	
	(document.querySelector &&
		(jsandboxNode = document.querySelector('link[rel="Sandbox"][href]')) &&
			(Sandbox.url = jsandboxNode.getAttribute("href")));
	
	window.Sandbox = Sandbox;
}.call(this)); // in ES5 strict `this' isn't `this' for this function, use .call(this)
