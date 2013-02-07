var http = require("http");

function onRequest(request, response) {
  console.log("Handling request.");
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello World");
  response.end();
}

var server = http.createServer(onRequest).listen(8888);
