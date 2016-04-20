'use strict';
const api = {};
global.api = api;
api.net = require('net');

global.application = {};
application.worker = require('./worker.js');

var sockets = [];
var tasks = [];

function isValidTask(array) {
  return Array.isArray(array) && array.every(e => Number.isFinite(e));
}

function processArray (array) {
  for (let i in sockets) {
    let task = {id: i, task: array};
    sockets[i].write(JSON.parse(task))
  }
}

const server = api.net.createServer(socket => {
  console.log('Connected: ' + socket.localAddress);
  socket.on('data', data => {
    let jsonData = JSON.parse(data);

    let task = jsonData.task;
    if (isValidTask(task)) {
      let result = processArray(task);
      socket.write(JSON.stringify(result));
    }

    if (jsonData.newClient) sockets.push(socket);
    
    let r

    if (jsonData.hasOwnProperty('result')) {
      jsonData.result 
    }

    console.log('Data received (by server): ' + data);
  });
});

server.listen(8282);



