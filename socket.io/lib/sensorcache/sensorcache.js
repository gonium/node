module.exports.add_value = function(sensor_id, value) {
  console.log("Sensor " + sensor_id + ": Adding value " + value);
}

module.exports.get_last_value = function(sensor_id) {
  console.log("Sensor " + sensor_id + ": Retrieving last value");
  return 23.42;
}
