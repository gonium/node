const PORT = 3000;
const SERVER = 'localhost';
const channel_current_measurements = 'current_measurements';

var express=require('express');
var app = module.exports = express();
var server=require("http").createServer(app)
  , io = require('socket.io').listen(server)
  , redis = require('redis')
var rclient=redis.createClient();

rclient.on("error", function(err) {
  console.log("Redis client error: " + err);
});


// see http://stackoverflow.com/questions/4600952/node-js-ejs-example
// for EJS

app.use(express.errorHandler());
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.get('/', function(req, res) {
  res.render('index.jade', {title: "Horst"});
});
app.use(express.static(__dirname + '/public'));

server.listen(PORT);

io.sockets.on('connection', function (socket) {
  rclient.subscribe(channel_current_measurements);
  rclient.on("message", function(channel, msg) {
    console.log(channel + ": " +msg);
    socket.volatile.emit('measurements', { sensor: msg });
  });
  socket.on('disconnect', function() {
    rclient.unsubscribe(channel_current_measurements);
  });
});
