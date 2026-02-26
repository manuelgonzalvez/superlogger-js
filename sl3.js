const SerialPort = require('serialport');
const readline = require('readline');

async function listSerialPorts() {
  try {
    const ports = await SerialPort.list();
    console.log('Available serial ports:');
    ports.forEach((port, index) => {
      console.log(`${index + 1}. ${port.path}`);
    });
    return ports;
  } catch (error) {
    console.error('Error listing serial ports:', error);
    return [];
  }
}

async function openSerialPort(path) {
  try {
    const port = new SerialPort(path);
    // TODO: Use the opened serial port as needed
    console.log(`Serial port ${path} opened successfully.`);
    return port;
  } catch (error) {
    console.error(`Error opening serial port ${path}:`, error);
    return null;
  }
}

async function chooseSerialPort(ports) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Enter the number of the serial port you want to open: ', (answer) => {
      const portIndex = parseInt(answer) - 1;
      rl.close();
      if (portIndex >= 0 && portIndex < ports.length) {
        const chosenPort = ports[portIndex];
        resolve(chosenPort.path);
      } else {
        console.error('Invalid port number.');
        resolve(null);
      }
    });
  });
}

async function main() {
  const ports = await listSerialPorts();
  if (ports.length > 0) {
    const path = await chooseSerialPort(ports);
    if (path) {
      await openSerialPort(path);
    }
  } else {
    console.log('No serial ports found.');
    console.log('Press any key to close.');

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', () => {
      process.exit();
    });
  }
}

main();
