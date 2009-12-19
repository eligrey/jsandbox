/*
 * JSandbox JavaScript Library v0.2.2
 * 2009-11-08
 * By Elijah Grey, http://eligrey.com
 *
 * License: GNU GPL v3 and the X11/MIT license
 *   See COPYING.md
 */

/*global self */

/*jslint white: true, undef: true, nomen: true, eqeqeq: true, bitwise: true, regexp: true,
newcap: true, immed: true, maxerr: 1000, maxlen: 90 */

var JSandbox = (function (self, globalEval) {
	"use strict";
	
	var undef_type = "undefined",
	doc = self.document,
	Worker = self.Worker;
	
	if (typeof Worker === undef_type || typeof doc === undef_type) {
		return;
	}
	
	var
	JSON = self.JSON,
	
	// repeatedly used properties/strings (for minification)
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
	$call       = "call",
	
	str_type   = "string",
	fun_type   = "function",
	
	
	Sandbox = function () {
		var sandbox = this;
		
		if (!(sandbox instanceof Sandbox)) {
			return new Sandbox();
		}
		
		sandbox[$worker] = new Worker(Sandbox.url);
		sandbox[$requests] = {};
		
		sandbox[$worker].onmessage = function (event) {
			var data = event[$data], request;
			if (typeof data === str_type) { // parse JSON
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
					if (typeof sandbox[$onerror] === fun_type) {
						sandbox[$onerror](data, request);
					}
					if (typeof request[$onerror] === fun_type) {
						request[$onerror][$call](sandbox, data.error);
					}
				} else {
					if (typeof sandbox[$onresponse] === fun_type) {
						sandbox[$onresponse](data, request);
					}
				
					if (typeof request[$callback] === fun_type) {
						request[$callback][$call](sandbox, data.results);
					}
				}
				delete sandbox[$requests][data.id];
			}
		};
	},
	proto = Sandbox[$prototype],
	jsonStringifyThis = function () { // for compatability with WebKit/Chrome
		return JSON.stringify(this);
	},
	createRequestMethod = function (method) {
		proto[method] = function (options, callback, input, onerror) {
			if (typeof options === str_type ||
			    Object[$prototype].toString[$call](options) === "[object Array]" ||
			    arguments.length > 1)
			{ // called in (data, callback, input, onerror) style
				options = {
					data     : options,
					input    : input,
					callback : callback,
					onerror  : onerror
				};
			}
			
			if (method === $load && typeof options[$data] === str_type) {
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
				toString : jsonStringifyThis
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
				Array[$prototype].slice[$call](arguments)
			);
			return Sandbox;
		};
	},
	linkElems = doc.getElementsByTagName("link"),
	methods = [$eval, $load, $exec],
	i = 3, // methods.length
	ready = true,
	readyQueue = [];
	
	Sandbox.ready = function (fn) {
		if (ready) {
			try {
				fn();
			} catch (e) {}
		} else {
			readyQueue.unshift(fn);
		}
	};
	
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
	
	if (typeof JSON === undef_type) {
		ready = false;
		var jsonScript = doc.createElement("script");
		jsonScript.type = "text/javascript";
		jsonScript.onload = function () {
			if (self.JSON) {
				JSON = self.JSON;
				ready = true;
				var i = readyQueue.length;
			
				while (i--) {
					try {
						readyQueue.pop()();
					} catch (e) {}
				}
			}
		};
		jsonScript.src = "http://github.com/eligrey/jsandbox/raw/master/min/json2.js";
		doc.documentElement.appendChild(jsonScript);
	}
	
	i = linkElems.length;
	while (i--) {
		if (linkElems[i].getAttribute("rel") === "jsandbox")
		{
			Sandbox.url = linkElems[i].getAttribute("href");
			break;
		}
	}
	
	return Sandbox;
}(self, eval)),
Sandbox = JSandbox;
