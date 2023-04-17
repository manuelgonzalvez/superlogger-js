


var SerialPort = require("serialport");
var port = new SerialPort("COM3", { baudRate: 460800, autoOpen: true });
const Readline = require('@serialport/parser-readline');
const parser = port.pipe(new Readline({ delimiter: '\r\n' }));



// const parser = serialPort.pipe(new Readline({ delimiter: '\n' }));

// parser.on('data', (data) => {
//   console.log(`${data}`);
// });

// serialPort.on('open', () => {
//   console.log('Serial port opened');
// });

const latestMessages = []

const messageArrays = {

};

const express = require('express');
const exphbs = require('express-handlebars');
const app = express();

const SSE = require('sse');
const sse = new SSE(app);
// configure express-handlebars as the view engine
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', 'views'); // <-- set the "views" directory


app.get('/', (req, res) => {
  const data = Object.entries(messageArrays).map(([name, messages]) => {
    return { name, messages };
  });
  res.json(data);
});

// parse and categorize incoming messages
// parser.on('data', (data) => {
//   // remove ANSI color codes from the message
//   // const regex = /\u001b\[(\d+)?m/g;
//   const cleanData = data.replace(/\u001b\[(\d+)?m/g, '');

//   const match = /\[(.*?)\]/.exec(cleanData); // extract the message name between [brackets]
//   if (match) {
//     const name = match[1];
//     const message = cleanData.replace(/\u001b\[[0-9;]*m/g, ''); // remove ANSI color codes from the line
//     if (!messageArrays[name]) messageArrays[name] = []; // create a new array for this message name if it doesn't exist
//     messageArrays[name].push(message); // add the message to the appropriate array
//   }
// });

// app.get('/', (req, res) => {
//   // const messageArrays = {
//   //   // your message arrays here
//   // };
//   res.render('home', { data: messageArrays });

//   // res.render('home', messageArrays);
// });

// render the handlebars template
app.get('/home', (req, res) => {

  res.render('home', { data: messageArrays });

  // console.log(messageArrays)
});

// start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

// parse and categorize incoming messages
parser.on('data', (line) => {
  console.log(line)

      // Ignore empty lines
      if (line === "") {
        return;
      }
  // remove ANSI color codes from the message
  const regex = /\u001b\[(\d+)?m/g;
  const cleanData = line.replace(regex, '');

  // categorize message based on name between brackets
  const nameRegex = /\[(.*?)\]/;
  const match = nameRegex.exec(cleanData);
  let name = match ? match[1] : '';

  // remove the name from the message
  const message = cleanData.replace(`[${name}]`, '').trim();
  const message2 = message.replace(/\u001b\[[0-9;]*m/g, ''); // remove ANSI color codes from the line

    if (!messageArrays[name]) messageArrays[name] = []; // create a new array for this message name if it doesn't exist

  messageArrays[name].push(message2);

  // add the new message to the latest messages array
latestMessages.push({ category: name.toLowerCase(), message2 });
});

app.get('/stream', (req, res) => {
  sse.init(req, res);
  sse.send({ data: JSON.stringify(latestMessages) });
});


// parser.on('data', (line) => {
//   console.log(line)

//   const match = /\[(.*?)\]/.exec(line); // extract the message name between [brackets]
//   if (match) {
//     const name = match[1];
//     const message = line.replace(/\u001b\[[0-9;]*m/g, ''); // remove ANSI color codes from the line
//     if (!messageArrays[name]) messageArrays[name] = []; // create a new array for this message name if it doesn't exist

    
//     messageArrays[name].push(message); // add the message to the appropriate array
//   }
// });

// parser.on('data', (line) => {
//   console.log(line)
//   const match = /\[(.*?)\]/.exec(line); // extract the message name between [brackets]
//   if (match) {
//     const name = match[1];
//     const message = line.replace(/\u001b\[[0-9;]*m/g, ''); // remove ANSI color codes from the line
//     if (!messageArrays[name]) messageArrays[name] = []; // create a new array for this message name if it doesn't exist
//     messageArrays[name].push(message); // add the message to the appropriate array
//   }
// });

// parser.on('data', (line) => {
//   const match = /\[(.*?)\]/.exec(line); // extract the message name between [brackets]
//   if (match) {
//     const name = match[1];
//     const message = line.substring(match.index + match[0].length); // remove the message name from the line
//     if (!messageArrays[name]) messageArrays[name] = []; // create a new array for this message name if it doesn't exist
//     messageArrays[name].push(message); // add the message to the appropriate array
//   }
// });

// app.get('/', (req, res) => {
//   const data = Object.entries(messageArrays).map(([name, messages]) => {
//     return { name, messages };
//   });
//   res.render('home', { data });
// });

// app.listen(3000, () => {
//   console.log('Server started on port 3000');
// });
// define your routes and handlebars templates




// // define your routes and handlebars templates
// app.get('/', (req, res) => {
//   const messageArrays = {
//     main: [
//       { message: 'Hello world!', type: 'info' },
//       { message: 'Error!', type: 'error' },
//       { message: 'Warning!', type: 'warning' }
//     ],
//     screen: [
//       { message: 'Screen message 1', type: 'info' },
//       { message: 'Screen message 2', type: 'warning' },
//       { message: 'Screen message 3', type: 'error' }
//     ]
//   };
//   res.render('home', { messageArrays });
// });


// // start the server
// app.listen(3000, () => {
//   console.log('Server listening on port 3000');
// });