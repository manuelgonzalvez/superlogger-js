
var SerialPort = require("serialport");
//const { write } = require("bitwise/byte");

var serialPort = new SerialPort("COM25", { baudRate: 19200, autoOpen: false });
var stdin = process.openStdin();



module.exports = {
    serialPort
}