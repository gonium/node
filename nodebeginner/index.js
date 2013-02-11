var server=require("./server");
var router=require("./router");
var request_handlers = require("./request_handlers");

var handle = {};
handle["/"] = request_handlers.start;
handle["/start"] = request_handlers.start;
handle["/upload"] = request_handlers.upload;

server.start(router.route, handle);
