'use strict';
const api = {};
global.api = api;
api.net = require('net');

const task = [2, 17, 3, 2, 5, 7, 15, 22, 1, 14, 15, 9, 0, 11];
var socket = new api.net.Socket();

socket.connect({
  port: 8282,
  host: '127.0.0.1',
}, () => {
  socket.write(JSON.stringify(task));
  socket.on('data', data => {
    let message = JSON.parse(data);
    console.log(message);
    socket.destroy(); // kill client after server's response
  });
});


