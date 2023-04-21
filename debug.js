const express = require('express');
const app = express();
const port = 3000;

// Set up serial port communication
const SerialPort = require('serialport');
const portName = 'COM9'; // Replace with your serial port name
const baudRate = 115200; // Replace with your baud rate
// const baudRate = 460800; // Replace with your baud rate
const serialPort = new SerialPort(portName, { baudRate });

// var port = new SerialPort("COM3", { baudRate: 460800, autoOpen: true });
const Readline = require('@serialport/parser-readline');
const parser = serialPort.pipe(new Readline({ delimiter: '\r\n' }));



// Set up route to serve webpage
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Set Debug Levels</h1>
        <form>
          <label>Main:</label>
          <button onclick="setDebug('main', 0)">None</button>
          <button onclick="setDebug('main', 1)">Error</button>
          <button onclick="setDebug('main', 2)">Warning</button>
          <button onclick="setDebug('main', 3)">Info</button>
          <button onclick="setDebug('main', 4)">Debug</button>
          <button onclick="setDebug('main', 5)">Verbose</button>
          <br>
          <label>UART:</label>
          <button onclick="setDebug('uart', 0)">None</button>
          <button onclick="setDebug('uart', 1)">Error</button>
          <button onclick="setDebug('uart', 2)">Warning</button>
          <button onclick="setDebug('uart', 3)">Info</button>
          <button onclick="setDebug('uart', 4)">Debug</button>
          <button onclick="setDebug('uart', 5)">Verbose</button>
          <br>
          <label>Nodos:</label>
          <button onclick="setDebug('nodos', 0)">None</button>
          <button onclick="setDebug('nodos', 1)">Error</button>
          <button onclick="setDebug('nodos', 2)">Warning</button>
          <button onclick="setDebug('nodos', 3)">Info</button>
          <button onclick="setDebug('nodos', 4)">Debug</button>
          <button onclick="setDebug('nodos', 5)">Verbose</button>
          <br>
          <!-- Repeat for other tags -->
        </form>
        <script>
          function setDebug(tag, level) {
            fetch('/', {
              method: 'POST',
              body: JSON.stringify({ setDebug: { tag, level } }),
              headers: { 'Content-Type': 'application/json' },
            });
          }
        </script>
      </body>
    </html>
  `);
});

// Set up route to handle POST requests
app.post('/', (req, res) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const { setDebug } = JSON.parse(body);
    const { tag, level } = setDebug;
    const message = JSON.stringify({ "CMD":"setDebug", "PARAMS":{ tag, level } });
    // console.log(message)
    serialPort.write(message);
    res.sendStatus(200);
  });
});

// // Set up listener for serial port messages
// serialPort.on('data', (data) => {
//   console.log(data.toString());
// });

// parse and categorize incoming messages
parser.on('data', (line) => {
    console.log(line)
    
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
