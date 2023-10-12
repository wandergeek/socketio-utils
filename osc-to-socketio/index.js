// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var httpServer = require('http').createServer(app);
var io = require('socket.io')(httpServer);
var httpPort = process.env.PORT || 3000;
var osc = require("osc");


httpServer.listen(httpPort, "0.0.0.0", () => {
  console.log('Server listening at port %d', httpPort);
});

app.use(express.static(path.join(__dirname, 'public')));


var getIPAddresses = function () {
    var os = require("os"),
        interfaces = os.networkInterfaces(),
        ipAddresses = [];

    for (var deviceName in interfaces) {
        var addresses = interfaces[deviceName];
        for (var i = 0; i < addresses.length; i++) {
            var addressInfo = addresses[i];
            if (addressInfo.family === "IPv4" && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }

    return ipAddresses;
};

var udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 8000,
  multicastMembership: ["239.1.1.1"]
});

udpPort.on("ready", function () {
  var ipAddresses = getIPAddresses();

  console.log("Listening for OSC over UDP.");
  ipAddresses.forEach(function (address) {
      console.log(" Host:", address + ", Port:", udpPort.options.localPort);
  });
});

udpPort.on("message", function (oscMessage) {
  // console.log(oscMessage);
  io.sockets.emit('dataz', oscMessage.args[0]);
});

udpPort.on("error", function (err) {
  console.log(err);
});

udpPort.open();


