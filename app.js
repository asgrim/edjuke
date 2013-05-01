var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);
io.set('log level', 1);

var exec = require('child_process').exec;

var xmms2cmd = 'sudo su pi -c \'/usr/bin/xmms2';

var sockets = {};
var currentSong = '';

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

  //console.log('exec: ' + xmms2cmd + ' ' + command + '\'');
  exec(xmms2cmd + ' ' + command + '\'', callback);
}

function trackChangedEvent() {
  console.log('track changed');
  for (var key in sockets) {
    if (sockets[key]) {
      console.log('reset vote for ' + key);
      sockets[key].currentTrackVoted = false;
    }
  }
}

function getCurrentTrackVotedCount() {
  var count = 0;
  for (var key in sockets) {
    if (sockets[key]) {
      if (sockets[key].currentTrackVoted) count++;
    }
  }
  return count;
}

function getUserCount() {
  var count = 0;
  for (var key in sockets) {
    if (sockets[key]) {
      count++;
    }
  }
  return count;
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

        var oldSong = currentSong;
        currentSong = matches[1] + '/' + matches[2];
        if (oldSong != currentSong) {
          trackChangedEvent();
        }
      }
      setTimeout(getCurrentPlaying, 1000);
  });
}

function next() {
  runXmmsCommand('next');
}

function voteNext(socket) {
  socket.currentTrackVoted = true;
  var userCount = getUserCount();
  var voteCount = getCurrentTrackVotedCount();

  console.log('socket ' + socket.id + ' voted next');
  console.log('user count = ' + userCount + ', vote count = ' + voteCount);

  if (voteCount >= (userCount / 2)) {
    console.log('nexting track, majority of votes');
    next();
  } else {
    console.log('not nexting yet');
  }
}

io.sockets.on('connection', function (socket) {
  console.log('hello to ' + socket.id);
  sockets[socket.id] = socket;
  sockets[socket.id].currentTrackVoted = false;

  socket.on('disconnect', function(data) {
    console.log('bye to ' + socket.id);
    sockets[socket.id] = null;
  });

  socket.on('votenext', function(data) {
    voteNext(socket);
  });
});

setTimeout(getCurrentPlaying, 1000);
