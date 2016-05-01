'use strict';

const api = {};
global.api = api;
api.net = require('net');

const socket = new api.net.Socket();

socket.connect({
  port: 8282,
  host: '::1',
}, () => {
  socket.write(JSON.stringify({newWorker: true}));
  socket.on('data', function (data) {
    let request = JSON.parse(data);
    console.log('Subtask arrived.');
    console.dir(request);
    let result = request.task.map(e => 2 * e);
    let response = {
      resolvedTask: {
        taskId: request.taskId,
        subTaskId: request.subTaskId,
        result: result
      }
    };
    socket.write(JSON.stringify(response));
  });
});
