JSandbox Changelog
===============

(Worker) 0.2.0.2
----------------

 * Blocked access to the `Worker` constructor.
 * Now using `importScripts.apply` as
   [Chromium issue 20192](http://code.google.com/p/chromium/issues/detail?id=20192)
   has been fixed.


0.2.1
-----

 * Removed `document.querySelector` dependancy.
 * Preparing test suite for the new, standalone, QUnit library. The library still has
   asynchronous bugs so it can't be used yet.
 * `self.onmessage` is deleted after every time code is run in case the code defines it.
 * Instance catch-alls are now passed the request object as their second argument.


0.2
-----

 * Renamed the library from "jsandbox" to "JSandbox".
 * Renamed the `jsandbox` constructor to `Sandbox`.
 * Created unit tests.
 * All instances of `uri` in the API have been replaced with `url`.
 * Added jsandbox instances (long-lived sandboxes).
 * Added `Sandbox.load` to load scripts. `data` must either be a string (one script) or an
   array of strings (multiple scripts).
 * Added `Sandbox.exec`. Same as eval but no return value and faster.
 * Added fixed-position arguments-style API:
   `Sandbox[method](data [,callback] [,input] [,onerror])`
 * `instance.onresponse` is called on all successfull responses from an instance.
 * `instance.onerror` is called all errors from an instance.
 * The worker script has been split from jsandbox.js and is now jsandbox-worker.js.
 * To specify the location of the worker script, add a
   `<link rel="jsandbox" href="path/to/jsandbox-worker.js"/>` tag to your document before
   including jsandbox.js.
