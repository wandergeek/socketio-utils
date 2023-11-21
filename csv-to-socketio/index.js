// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var httpServer = require('http').createServer(app);
var io = require('socket.io')(httpServer);
var httpPort = process.env.PORT || 3000;
const fs = require('fs');
const csv = require('csv-parser');


httpServer.listen(httpPort, "0.0.0.0", () => {
  console.log('Server listening at port %d', httpPort);
});

app.use(express.static(path.join(__dirname, 'public')));

let dataQueue = [];

fs.createReadStream('public/data-60fps.csv')
  .pipe(csv({ headers: false }))
  .on('data', (row) => {
    dataQueue.push(row[0]);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });

  io.on('connection', (socket) => {
    console.log('a user connected');
  
    let index = 0;
    const interval = setInterval(() => {
      if (index < dataQueue.length) {
        socket.emit('dataz', dataQueue[index]);
        index++;
      } else {
        index = 0; // Reset index to loop the data
      }
    }, 1000 / 60); // Emitting data at 60 samples per second
  
    socket.on('disconnect', () => {
      console.log('user disconnected');
      clearInterval(interval);
    });
  });
  