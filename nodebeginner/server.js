var http = require("http");
var url = require("url");
var port = 8888;

function start(router, handle) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");
    router(handle, pathname, response);
  }
  http.createServer(onRequest).listen(port);
  console.log("Server listening on port", port);
}

exports.start = start;
