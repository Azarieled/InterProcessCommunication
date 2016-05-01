'use strict';

const api = {};
global.api = api;
api.net = require('net');

let port = 8282;
let workers = [];
let nextTaskId = 2515156;
let pendingTasks = [];

function isValidTask(array) {
  return Array.isArray(array) && array.every(e => Number.isFinite(e));
}

function chunkify(array, n) {
  if (n < 2) return [array];

  let len = array.length;
  let out = [];
  let i = 0;
  let size;

  if (len % n === 0) {
    size = Math.floor(len / n);
    while (i < len) {
      out.push(array.slice(i, i += size));
    }
  } else {
    while (i < len) {
      size = Math.ceil((len - i) / n--);
      out.push(array.slice(i, i += size));
    }
  }

  return out;
}

function processArray (array, afterProcessed) {
  let pendingTask = {
    taskId: nextTaskId++,
    subTasks: [],
    partialResults: [],
    callback: function callback() {
      if (this.subTasks.length === this.partialResults.length) {
        let mergedResult = Array.prototype.concat.apply([], this.partialResults);
        console.log('Task ' + this.taskId + ' resolved');
        afterProcessed(mergedResult);
        let thisTaskIndex = pendingTasks.findIndex(e => e.taskId === this.taskId);
        pendingTasks = pendingTasks.splice(thisTaskIndex, 1);
      }
    }
  };
  console.log('Task assigned id: ' + pendingTask.taskId);

  let subArrays = chunkify(array, workers.length);
  for (let [i, worker] of workers.entries()) {
    let request = {
      taskId: pendingTask.taskId,
      subTaskId: i,
      task: subArrays[i],
    };
    pendingTask.subTasks.push(i);
    worker.write(JSON.stringify(request));
  }
  return pendingTask;
}

function isValidTaskResult(request, sender) {
  let validSenderIf = w => w.remoteAddress == sender.remoteAddress && w.remotePort === sender.remotePort;
  return request.hasOwnProperty('resolvedTask') && workers.find(validSenderIf);
}

const server = api.net.createServer(socket => {
  console.log('Connected: ' + socket.localAddress);
  socket.on('data', data => {
    let request = JSON.parse(data);

    if (request.hasOwnProperty('newTask')) {
      let task = request.newTask;
      console.log('New task arrived.');
      console.dir(task);
      if (isValidTask(task)) {
        let pendingTask = processArray(task, r => socket.write(JSON.stringify(r)));
        pendingTasks.push(pendingTask);
      }
      
    } else if (request.newWorker) {
      workers.push(socket);
      console.log('New worker added to server: [' + socket.remoteAddress + ']:' + socket.remotePort);
      
    } else if (isValidTaskResult(request, socket)) {
      let remoteTask = request.resolvedTask;
      let localTask = pendingTasks.find(t => t.taskId === remoteTask.taskId);
      
      if (localTask.subTasks.hasOwnProperty(remoteTask.subTaskId)) {
        localTask.partialResults[remoteTask.subTaskId] = remoteTask.result;
        localTask.callback();
      } else {
        socket.write('Bad subTaskId');
        socket.destroy();
      }
      
    } else {
      socket.write('Hackers, go away!');
      socket.destroy();
    }
  });
});

server.on('error', (err) => {
  throw err;
});

server.listen(port, () => {
  console.log('server bound to port ' + port);
});



