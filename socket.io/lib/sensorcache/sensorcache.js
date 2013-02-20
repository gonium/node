const BUFFER_SIZE=4;
var CBuffer=require("CBuffer");
var util = require('util');
var EventEmitter = require('events').EventEmitter;


var SensorCache = function() {

  var self=this;
  var sensors={};

  render_sensor_lastvalue = function(sensor) {
    response={};
    response["sensor_id"]=sensor.id;
    response["value"]=sensor.values.last();
    return response;
  }

  render_sensor_full = function(sensor) {
    response={};
    response["sensor_id"]=sensor.id;
    response["name"]=sensor.name;
    response["values"]=sensor.values.toArray();
    return response;
  }

  this.list_sensors = function(req, res) {
    retval=new Array();
    for (var sensoridx in sensors) {
      retval.push(render_sensor_full(sensors[sensoridx]));
    }
    res.send(JSON.stringify(retval));
  }

  this.add_sensor = function(req, res) {
    var sensor={};
    sensor.id=req.params.id;
    if (sensor.id == undefined) {
      res.send("Adding a sensor requires an id.", 422);
    }
    sensor.name=req.body.name;
    if (sensor.name == undefined) {
      res.send("Adding a sensor requires a name.", 422);
    }
    sensor.values=new CBuffer(BUFFER_SIZE);
    if (req.body.value != undefined) {
      // see http://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
      // for frontend conversion.
      var unix = Math.round(+new Date()/1000);
      var entry={};
      entry[unix]=req.body.value;
      sensor.values.push(entry);
    } 
    sensors[sensor.id] = sensor;
    res.send("New sensor " + sensor.id + " added.");
  }

  this.get_sensor = function(req, res) {
    sensor_id=req.params.id;
    if (sensor_id in sensors) {
      sensor=sensors[sensor_id];
      res.send(JSON.stringify(render_sensor_full(sensor)));
    } else {
      res.send("Sensor " + sensor_id + " not found.", 404);
    }
  }

  this.add_value = function(req, res) {
    sensor_id=req.params.id;
    if (sensor_id in sensors) {
      var sensor = sensors[sensor_id];
      if (req.body.value != undefined) {
        var unix = Math.round(+new Date()/1000);
        var entry={};
        entry[unix]=req.body.value;
        sensor.values.push(entry);
        console.log("Emitting: " + JSON.stringify(render_sensor_lastvalue(sensor)));
        self.emit('sensor_update', render_sensor_lastvalue(sensor));
        res.send("OK");
      } else {
        res.send("Adding a value to sensor "+ sensor_id+" requires a value.", 422);
      }
    } else {
      res.send("Sensor " + sensor_id + " not found.", 404);
    }
  }

  this.get_last_value = function(req, res) {
    sensor_id=req.params.id;
    if (sensor_id in sensors) {
      sensor=sensors[sensor_id];
      res.send(JSON.stringify(sensor.values.last()));
    } else {
      res.send("Sensor " + sensor_id + " not found.", 404);
    }
  }

};

util.inherits(SensorCache, EventEmitter);
module.exports = SensorCache;
