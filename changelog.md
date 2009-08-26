JSandbox Changelog
===============

0.2
---

 * Renamed the library from "jsandbox" to "JSandbox".
 * Renamed the `jsandbox` constructor to `Sandbox`.
 * Created unit tests.
 * All instances of `uri` in the API have been replaced with `url`.
 * Added jsandbox instances (long-lived sandboxes).
 * Added `Sandbox.load` to load scripts. `data` must either be a string (one script) or an array of strings (multiple scripts).
 * Added `Sandbox.exec`. Same as eval but no return value and faster.
 * Added fixed-position arguments-style API: `Sandbox[method](data [,callback] [,input] [,onerror])`
 * `instance.onresponse` is called on all successfull responses from an instance.
 * `instance.onerror` is called all errors from an instance.
 * The worker script has been split from jsandbox.js and is now jsandbox-worker.js.
 * To specify the location of the worker script, add a `<link rel="jsandbox" href="path/to/jsandbox-worker.js"/>` tag to your document before including jsandbox.js.
