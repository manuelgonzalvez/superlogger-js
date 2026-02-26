const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;

// Set up serial port communication
const portName = 'COM3'; // Replace with your serial port name
const baudRate = 460800; // Replace with your baud rate
const serialPort = new SerialPort(portName, { baudRate });
const messagesByTagAndLevel = {};
const parser = new Readline();
serialPort.pipe(parser);


const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');
// Create a table for the messages
db.run(`CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME,
    tag TEXT,
    level TEXT,
    path TEXT,
    function TEXT,
    message TEXT
)`);
// Define a function to insert a new message into the database
function insertMessage(msg) {
    db.run(`INSERT INTO messages (timestamp, tag, level, path, function, message) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [msg.timestamp, msg.tag, msg.level, msg.path, msg.function, msg.message], 
            (err) => {
              if (err) {
                console.error('Error inserting message:', err);
              }
            });
  }
/**
 * server
 */

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve static files from public directory
app.use(express.static('public'));

// Set up socket.io connection
io.on('connection', (socket) => {
  console.log('a user connected');

  // Send messagesByTagAndLevel data to client on connection
  socket.emit('messagesUpdated', messagesByTagAndLevel);

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Start server
http.listen(3000, () => {
  console.log('Server listening on port 3000');
});


parser.on('data', (data) => {
    // console.log(data)

// Remove ANSI color coding from the message
const messageWithoutColors = data.replace(/\033\[[\d;]+m/g, '');

const trimmedMessage = messageWithoutColors.trim();

// Split the message into components using the [] characters
  const components = trimmedMessage.split(/(?:\s*\[\s*|\s*\]\s*)+/).filter(Boolean);


  // Check if the message has the correct number of components
  if (components.length !== 5) {
    // console.log(`Discarding message '${trimmedMessage}' because it does not match the expected format`);
    return;
  }

  // Extract the message components
  const tag = components[0];
  const level = components[1].trim();
  const path = components[2];
  const functionName = components[3];
  const messageText = components[4].replace(/^:\s+/, ''); // Remove the initial ': ' from the message text

  // Create the tag and level if they don't already exist
  messagesByTagAndLevel[tag] = messagesByTagAndLevel[tag] || {};
  messagesByTagAndLevel[tag][level] = messagesByTagAndLevel[tag][level] || [];

  // Add the message to the messagesByTagAndLevel object
  messagesByTagAndLevel[tag][level].push({
    path,
    functionName,
    messageText: messageText,
    uptime: (process.uptime()*1000).toFixed(0), // Script uptime timestamp
    timestamp: new Date().toLocaleString() // Local date and time timestamp
  });

  io.emit('messagesUpdated', messagesByTagAndLevel);

//   console.log(`Processed message '${trimmedMessage}'`);

//   console.log({
//     tag,
//     level,
//     path,
//     functionName,
//     messageText,
//     uptime: (process.uptime()*1000).toFixed(0), // Script uptime timestamp
//     timestamp: new Date().toLocaleString() // Local date and time timestamp
//   });

    const msg = {
      timestamp: new Date(),
      tag,
      level,
      path,
      functionName,
      messageText
    };
    console.log('Parsed message:', msg);
    insertMessage(msg);


});


// Define route to send messagesByTagAndLevel data to client
app.get('/messages', (req, res) => {
    res.json(messagesByTagAndLevel);
  });

  // Query the database for all messages
db.all('SELECT * FROM messages', (err, rows) => {
    if (err) {
      console.error('Error querying messages:', err);
    } else {
      console.log('All messages:', rows);
    }
  });
  
  // Close the database connection
//   db.close();

