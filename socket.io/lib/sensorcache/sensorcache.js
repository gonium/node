const BUFFER_SIZE=4;
var CBuffer=require("CBuffer");
var sensors={};


format_sensor = function(sensor) {
  response={};
  response["sensor_id"]=sensor.id;
  response["name"]=sensor.name;
  response["values"]=sensor.values.toArray();
  return response;
}

module.exports.list_sensors = function(req, res) {
  retval=new Array();
  for (var sensoridx in sensors) {
    retval.push(format_sensor(sensors[sensoridx]));
  }
  res.send(JSON.stringify(retval));
}

module.exports.add_sensor = function(req, res) {
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

module.exports.get_sensor = function(req, res) {
  sensor_id=req.params.id;
  if (sensor_id in sensors) {
    sensor=sensors[sensor_id];
    res.send(JSON.stringify(format_sensor(sensor)));
  } else {
    res.send("Sensor " + sensor_id + " not found.", 404);
  }
}

module.exports.add_value = function(req, res) {
  sensor_id=req.params.id;
  if (sensor_id in sensors) {
    var sensor = sensors[sensor_id];
    console.log("Found sensor " + sensor);
    if (req.body.value != undefined) {
      var unix = Math.round(+new Date()/1000);
      var entry={};
      entry[unix]=req.body.value;
      sensor.values.push(entry);
      res.send("OK");
    } else {
      res.send("Adding a value to sensor "+ sensor_id+" requires a value.", 422);
    }
  } else {
    res.send("Sensor " + sensor_id + " not found.", 404);
  }
}

module.exports.get_last_value = function(req, res) {
  sensor_id=req.params.id;
  if (sensor_id in sensors) {
    sensor=sensors[sensor_id];
    res.send(JSON.stringify(sensor.values.last()));
  } else {
    res.send("Sensor " + sensor_id + " not found.", 404);
  }
}
