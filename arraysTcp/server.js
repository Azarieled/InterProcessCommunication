'use strict';
const api = {};
global.api = api;
api.net = require('net');
api.cluster = require('cluster');
api.os = require('os');

global.application = {};
application.worker = require('./worker.js');

if (api.cluster.isMaster) {
  const cpuCount = api.os.cpus().length;

  let processArray = function (array) {
    return array.map(e => 2 * e);
  };

  const server = api.net.createServer(socket => {
    console.log('Connected: ' + socket.localAddress);
    socket.on('data', data => {
      let array = JSON.parse(data);
      if (Array.isArray(array) && array.every(e => Number.isFinite(e))) {
        let result = processArray(array);
        socket.write(JSON.stringify(result));
      }
      console.log('Data received (by server): ' + data);
    });
  });
  
  server.listen(8282);
} else {
  application.worker();
}


