var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

var exec = require('child_process').exec;

var xmms2cmd = 'sudo su pi -c \'/usr/bin/xmms2';

server.listen(80);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

function runXmmsCommand(command, callback)
{
  if (typeof callback !== 'function') {
    var callback = function(error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    };
  }

  exec(xmms2cmd + ' ' + command + '\'', callback);
}

function getCurrentPlaying() {
  runXmmsCommand('current', function(error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      } else {
        var matches = stdout.match(/Playing: (.*) - (.*): (\d{0,3}:\d{2}) of (\d{0,3}:\d{2})/);
        var np = {
          artist: matches[1],
          track: matches[2],
          curtime: matches[3],
          tracktime: matches[4]
        };
        io.sockets.emit('nowplaying', np);
      }
      setTimeout(getCurrentPlaying, 1000);
  });
}

function next() {
  runXmmsCommand('next');
}

io.sockets.on('connection', function (socket) {
  socket.on('votenext', function(data) {
    next();
  });
});

setTimeout(getCurrentPlaying, 1000);
