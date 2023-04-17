
// var SerialPort = require("serialport");
const SerialPort = require('serialport')
//const { write } = require("bitwise/byte");

var serialPort = new SerialPort("COM3", { baudRate: 115200, autoOpen: false });
var stdin = process.openStdin();



module.exports = {
    serialPort
}