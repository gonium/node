var http = require("http");
var url = require("url");
var port = 8888;

function start(router, handle) {
  function onRequest(request, response) {
    var postdata = "";
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");

    request.setEncoding("utf8");

    request.addListener("data", function(postDataChunk) {
      postdata += postDataChunk;
      console.log("received POST data chunk '"+postDataChunk+"'.");
    });
    request.addListener("end", function() {
      router(handle, pathname, response, postdata);
    });
  }
  http.createServer(onRequest).listen(port);
  console.log("Server listening on port", port);
}

exports.start = start;
