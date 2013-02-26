const PORT = 3000;
const SERVER = '10.23.1.253';
const channel_current_measurements = 'current_measurements';

var application_root = __dirname
  , path=require('path')
  , express=require('express')
  , app = module.exports = express()
  , server=require("http").createServer(app)
  , io = require('socket.io').listen(server)
  , redis = require('redis')
  , Cache=require("./lib/sensorcache");

var sensorcache = new Cache();

// see http://stackoverflow.com/questions/4600952/node-js-ejs-example
// for EJS

app.configure(function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(application_root, "public")));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


app.get('/api', function(req, res) {
  res.send("API is running.");
});

app.get('/api/sensor', function(req, res) {
  sensorcache.list_sensors(req, res);
});

app.get('/api/sensor/:id/latest', function(req, res) {
  sensorcache.get_last_value(req, res);
});

app.get('/api/sensor/:id', function(req, res) {
  sensorcache.get_sensor(req, res);
});

app.put('/api/sensor/:id', function(req, res) {
  sensorcache.add_sensor(req, res);
});

app.post('/api/sensor/:id', function(req, res) {
  sensorcache.add_value(req, res);
});

app.get('/', function(req, res) {
  console.log("Sensorlist:" + JSON.stringify(sensorcache.render_sensor_list()));
  res.render('index.ejs', 
    {
      "server": SERVER, 
      "port": PORT,
      "sensorlist": sensorcache.render_sensor_list()
    });
});

server.listen(PORT);

io.sockets.on('connection', function (socket) {
  console.log("Registering new client.");
  sensorcache.on('sensor_update', function(msg) {
    socket.volatile.emit('sensor_update', { sensor: msg });
  });
  // If the sensor metadata changes (e.g. a new sensor occurs),
  // let the client know. This triggers e.g. a refresh of the HTML 
  // page.
  sensorcache.on('sensor_metadata_refresh', function(msg) {
    socket.volatile.emit('sensor_metadata_refresh');
  });
  // a client can also initiate a data update.
  socket.on('sensor_refresh_data', function() {
    console.log("Refresh data event.");
    sensorcache.send_current_data(function(msg) {
      socket.volatile.emit('sensor_update', { sensor: msg });
    });
  });
});

