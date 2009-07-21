Using the web workers API supported in Firefox 3.5 I implemented a tiny (1kb minified) open source JavaScript evaluation sandboxing library named jsandbox. jsandbox makes it possible to run untrusted JavaScript without having to worry about any potential dangers.
API

jsandbox has a simple chainable asynchronous API with only one method that accepts one to three arguments. The API is as follows:
`jsandbox.eval(options)`

Where options is an object that contains any of the following properties:

 * `code`
   * The code to eval(). (Required)
 * `input`
   * The input data available to the code via the input variable. The input should be JSON-convertible. (Optional)
 * `callback`
   * The callback to pass the return value of the eval() if no exceptions were thrown. (Optional)
 * `onerror`
   * The callback to pass an exception if one is thrown upon eval()ing the code. (Optional)
 * `uri`
   * The URI of the worker script. Defaults to jsandbox.uri. (Optional)

This [example code][1] demonstrates how to use the jsandbox API. Every code string is evaluated in a separate sandbox so they cannot interact with each other or cause any harm.

Requirements
------------

jsandbox doubles as the worker used for sandbox evaluation so it needs to know the URI of the JavaScript file being used. The library first checks for a the script tag used to include it in the document as long as the script tag has an id attribute of jsandbox (eg. <script type="text/javascript" id="jsandbox" src="/path/to/jsandbox.js"></script>). If that doesn’t work, the library then checks if the browser supports the non-standard error.fileName property on a thrown error (I know Firefox and Opera support it). To manually set the URI of the script, define jsandbox.uri.

Please note: jsandbox.uri must be on the same domain as web workers follow same-domain restrictions.


  [1]: http://gist.github.com/150443
