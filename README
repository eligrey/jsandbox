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

The following example code demonstrates how to use the jsandbox API. Every code string is evaluated in a separate sandbox so they cannot interact with each other or cause any harm.

    jsandbox
        .eval({
          code    : "x=1;Math.round(Math.pow(input, ++x))",
          input   : 36.565010597564445,
          callback: function(n) {
              console.log("number: ", n); // number: 1337
          }
      }).eval({
          code   : "][];.]\\ (*# ($(! ~",
          onerror: function(ex) {
              console.log("syntax error: ", ex); // syntax error: [error object]
          }
      }).eval({
          code    : '"foo"+input',
          input   : "bar",
          callback: function(str) {
              console.log("string: ", str); // string: foobar
          }
      }).eval({
          code    : "({q:1, w:2})",
          callback: function(obj) {
              console.log("object: ", obj); // object: object q=1 w=2
          }
      }).eval({
          code    : "[1, 2, 3].concat(input)",
          input   : [4, 5, 6],
          callback: function(arr) {
              console.log("array: ", arr); // array: [1, 2, 3, 4, 5, 6]
          }
      }).eval({
          code    : "function x(z){this.y=z;};new x(input)",
          input   : 4,
          callback: function(x) {
              console.log("new x: ", x); // new x: object y=4
          }
      });

License
-------

jsandbox is dual-licensed under the GNU GPL v3 and the X11/MIT license.

Requirements
------------

jsandbox doubles as the worker used for sandbox evaluation so it needs to know the URI of the JavaScript file being used. The library first checks for a the script tag used to include it in the document as long as the script tag has an id attribute of jsandbox (eg. <script type="text/javascript" id="jsandbox" src="/path/to/jsandbox.js"></script>). If that doesn’t work, the library then checks if the browser supports the non-standard error.fileName property on a thrown error (I know Firefox and Opera support it). To manually set the URI of the script, define jsandbox.uri.

Please note: jsandbox.uri must be on the same domain as web workers follow same-domain restrictions.


