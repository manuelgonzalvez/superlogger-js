const express = require('express');
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const os = require('os');

const portName = 'COM3'; // Replace with your port name
const baudRate = 460800;

const serialPort = new SerialPort(portName, {
  baudRate: baudRate
});

const parser = new Readline();
serialPort.pipe(parser);

let messagesByTagAndLevel = {};

parser.on('data', function (data) {
  const message = parseMessage(data);
  if (message) {
    updateMessagesByTagAndLevel(message);
    io.emit('messagesUpdated', messagesByTagAndLevel);
  }
});

function parseMessage(data) {

// Remove ANSI color coding from the message
const messageWithoutColors = data.replace(/\033\[[\d;]+m/g, '');

const trimmedMessage = messageWithoutColors.trim();

  const messageRegex = /\[(.*?)\]\s*\[(.*?)\]\s*\[(.*?)\]\s*(.*?)\:\s*(.*)/;
  const match = trimmedMessage.match(messageRegex);
  if (match) {
    const [, tag, level, path, func, messageText] = match;
    return {
      tag,
      level,
      path,
      func,
      messageText
    };
  }
  return null;
}

function updateMessagesByTagAndLevel(message) {
  if (!messagesByTagAndLevel[message.tag]) {
    messagesByTagAndLevel[message.tag] = {};
  }

  if (!messagesByTagAndLevel[message.tag][message.level]) {
    messagesByTagAndLevel[message.tag][message.level] = {
      messages: [],
      collapsed: false
    };
  }

  const messageGroup = messagesByTagAndLevel[message.tag][message.level];

  // Check if the path and function of the message matches the last message in the group
  if (messageGroup.messages.length > 0) {
    const lastMessage = messageGroup.messages[messageGroup.messages.length - 1];
    if (lastMessage.path === message.path && lastMessage.func === message.func) {
      // If the path and function matches, append the message text to the last message
      lastMessage.messageText += `\n${message.messageText}`;
      return;
    }
  }

  // If the message is not collapsed, add it as a separate message to the group
  if (!messageGroup.collapsed) {
    messageGroup.messages.push(message);
    return;
  }

  // If the message is collapsed, update the last message in the group with the new text
  messageGroup.messages[messageGroup.messages.length - 1].messageText = message.messageText;
}

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function () {
  console.log('Listening on *:3000');
});

io.on('connection', function (socket) {
  const uptime = Math.floor(process.uptime());
  const timestamp = new Date().toLocaleString();

  socket.emit('init', {
    messagesByTagAndLevel,
    uptime,
    timestamp
  });

  socket.on('collapseToggle', function (tag, level) {
    const messageGroup = messagesByTagAndLevel[tag][level];
    messageGroup.collapsed = !messageGroup.collapsed;
    io.emit('messagesUpdated', messagesByTagAndLevel);
  });
});
