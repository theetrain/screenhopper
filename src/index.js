var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)

var screens = [
  {
    width: 0,
    height: 0
  },
  {
    width: 0,
    height: 0
  }
]

app.use('/', express.static(`${__dirname}/public`))

io.on('connection', function (socket) {
  console.log('user connected')

  // Users that are hosting screen hopper sessions
  socket.on('host', function (dimensions) {
    Object.assign(screens[0], dimensions)

    console.log('Screens are', screens)

    io.emit('host', {
      screen: 1
    }) // generate session code
  })

  socket.on('client', function (dimensions) {
    Object.assign(screens[1], dimensions)

    console.log('Screens are', screens)

    io.emit('client', {
      screen: 2
    })
  })

  socket.on('disconnect', function () {
    console.log('user disconnected')
  })
})

http.listen(3000, function () {
  console.log('listening on *:3000')
})
