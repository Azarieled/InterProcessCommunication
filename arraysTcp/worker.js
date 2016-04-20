'use strict';
module.exports = () => {

  console.log('Hello from worker ' + process.pid + ' ' + api.cluster.worker.id);

  process.on('message', msg => {
    console.log(
      'message to worker ' + process.pid +
      ' from master: ' + JSON.stringify(msg)
    );
    process.send({
      result: msg.task.map(e => e * 2)
    });
  });

};