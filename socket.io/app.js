var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , redis = require('redis')
var rclient=redis.createClient();

rclient.on("error", function(err) {
  console.log("Redis client error: " + err);
});


app.listen(3000);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

var m1="n/a";
var update_measurements = function(err, data){
  if(err) {
    m1="n/a";
  } else {
    m1=data;
  }
};

io.sockets.on('connection', function (socket) {
  rclient.get("Measurement1", update_measurements);
  socket.emit('news', { hello: 'world' });
  var updates = setInterval( function() {
    rclient.get("Measurement1", update_measurements);
    socket.volatile.emit('measurements', { sensor: m1 });
  },5000);
  socket.on('my other event', function (data) {
    console.log(data);
  });
  socket.on('disconnect', function() {
    clearInterval(updates);
  });
});
