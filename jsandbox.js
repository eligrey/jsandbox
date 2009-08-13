/*
* jsandbox JavaScript Library v0.1.1
* 2009-06-22
* By Elijah Grey, http://eligrey.com
*
* License: GNU GPL v3 and the X11/MIT license
*   See README.md
*/

if (typeof document === "undefined" && typeof JSON !== "undefined" && JSON.stringify) // loaded as a worker
	this.onmessage = function (event) { // received code
		var data = event.data;
		
		if (typeof data.code !== "string")
			throw new TypeError("code must be a string");
		
		postMessage((function() {
			with({ // block access to XMLHttpRequest, importScripts, and postMessage from the sandboxed code
				window        : this, // provide a window object for compatibility with code that may use it
				self          : this,
				input         : this.input,
				
				importScripts : undefined,
				postMessage   : undefined,
				XMLHttpRequest: undefined,
									
				event         : undefined, // dereference the MessageEvent and this function
				arguments     : undefined
			})
				return eval("with({data:undefined})eval(" + JSON.stringify(data.code) + ")"); // dereference data object and eval data.code
				// the above line must be hand-minified if you minified the name of the data object
		}).call({input: data.input}));
	}; // you should terminate this worker now as it may have been tainted with new globals

else (function() { // loaded in a document
	
	var jsandbox = function(uri) { // pass a uri to set file uri
		if (uri)
			jsandbox.uri = uri;
		
		return jsandbox;
	},
	scriptNode = document.getElementById("jsandbox");
	
	if (scriptNode && scriptNode.nodeName.toUpperCase() === "SCRIPT" && scriptNode.hasAttribute("src")) // jsandbox element is an external script
		jsandbox.uri = scriptNode.getAttribute("src");
	
	else // create an error to get the file URI
		jsandbox.uri = (new Error).fileName;
	
	
	jsandbox.eval = function(options) {
	/* options parameters:
	[REQUIRED]  code     : Code to eval().
	[OPTIONAL]  input    : Input available to the code.
	[OPTIONAL]  callback : Callback to pass the return value of the eval() if no exceptions were thrown.
	[OPTIONAL]  onerror  : Callback to pass an exception if one is thrown opon eval()ing the code.
	[OPTIONAL]  uri      : URI of worker script. Defaults to jsandbox.uri.
	*/
		var worker = new Worker(options.uri || jsandbox.uri),
		request    = { // request object
			code: options.code
		};
		
		if ("input" in options)
			request.input = options.input;
		
		worker.onmessage = function(event) {
			worker.terminate();
			
			if (typeof options.callback === "function")
				options.callback(event.data);
		};
		worker.onerror = function(e) {
			worker.terminate();
			
			if (typeof options.onerror === "function")
				options.onerror(e);
		};

		worker.postMessage(request);
		
		return jsandbox;
	};

	this.jsandbox = jsandbox;
}.call(this));
