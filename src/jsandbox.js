/*
 * JSandbox JavaScript Library v0.2.1
 * 2009-11-08
 * By Elijah Grey, http://eligrey.com
 *
 * License: GNU GPL v3 and the X11/MIT license
 *   See COPYING.md
 */

/*global Worker, JSON*/

/*jslint white: true, onevar: true, browser: true, undef: true, nomen: true, eqeqeq: true,
bitwise: true, regexp: true, newcap: true, immed: true, maxerr: 1000, maxlen: 90 */

var Sandbox = (function () {
	"use strict";
	
	if (typeof Worker === "undefined") {
		return;
	}
	
	var
	// repeatedly used strings (for minification)
	$eval       = "eval",
	$exec       = "exec",
	$load       = "load",
	$requests   = "requests",
	$input      = "input",
	$terminate  = "terminate",
	$data       = "data",
	$callback   = "callback",
	$onerror    = "onerror",
	$worker     = "worker",
	$onresponse = "onresponse",
	$prototype  = "prototype",
	
	$str_type   = "string",
	$fun_type   = "function",
	
	
	Sandbox = function () {
		var sandbox = this;
		
		if (!(sandbox instanceof Sandbox)) {
			return new Sandbox();
		}
		
		sandbox[$worker] = new Worker(Sandbox.url);
		sandbox[$requests] = {};
		
		sandbox[$worker].onmessage = function (event) {
			var data = event[$data], request;
			if (typeof data === $str_type) { // parse JSON
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
					if (typeof sandbox[$onerror] === $fun_type) {
						sandbox[$onerror](data, request);
					}
					if (typeof request[$onerror] === $fun_type) {
						request[$onerror].call(sandbox, data.error);
					}
				} else {
					if (typeof sandbox[$onresponse] === $fun_type) {
						sandbox[$onresponse](data, request);
					}
				
					if (typeof request[$callback] === $fun_type) {
						request[$callback].call(sandbox, data.results);
					}
				}
				delete sandbox[$requests][data.id];
			}
		};
	},
	proto = Sandbox[$prototype],
	createRequestMethod = function (method) {
		proto[method] = function (options, callback, input, onerror) {
			if (typeof options === $str_type ||
			    Object[$prototype].toString.call(options) === "[object Array]" ||
			    arguments.length > 1)
			{ // called in (data, callback, input, onerror) style
				options = {
					data     : options,
					input    : input,
					callback : callback,
					onerror  : onerror
				};
			}
			
			if (method === $load && typeof options[$data] === $str_type) {
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
		
			sandbox[$onresponse] = sandbox[$onerror] = function () {
				sandbox[$terminate]();
				sandbox = null;
			};
		
			Sandbox[$prototype][method].apply(
				sandbox,
				Array[$prototype].slice.call(arguments)
			);
			return Sandbox;
		};
	},
	doc = document,
	linkElems = doc.getElementsByTagName("link"),
	linkElem,
	methods = [$eval, $load, $exec],
	i = 3;
	
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
	
	(typeof JSON === "undefined" &&
		((doc.getElementsByTagName("head")[0] || doc.documentElement)
			.appendChild(doc.createElement("script")).src =
				"http://github.com/eligrey/jsandbox/raw/master/min/json2.js"
		)
	);
	
	i = linkElems.length;
	while (i--) {
		linkElem = linkElems[i];
		if (linkElem.getAttribute("rel") === "jsandbox" &&
		    linkElem.hasAttribute("href"))
		{
			Sandbox.url = linkElem.getAttribute("href");
			break;
		}
	}
	
	// dereference no-longer used variables
	proto               =
	createRequestMethod =
	doc                 =
	linkElems           =
	linkElem            =
	methods             =
	i                   =
	undefined;
	
	return Sandbox;
}());
