'use strict';

const api = {};
global.api = api;
api.net = require('net');

const task = [2, 17, 3, 2, 5, 7, 15, 22, 1, 14, 15, 9, 0, 11];
var socket = new api.net.Socket();

socket.connect({
  port: 8282,
  host: '::1',
}, () => {
  console.log('Sending task: ' + task);
  socket.write(JSON.stringify({newTask: task}));

  socket.on('data', data => {
    let message = JSON.parse(data);
    console.log('Result: ' + message);
    socket.end(); // kill client after server's response
  });

  socket.on('close', function() {
    console.log('Connection closed');
  });
});


