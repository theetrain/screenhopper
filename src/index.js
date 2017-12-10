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

var sessionId = ''

app.use('/', express.static(`${__dirname}/public`))

io.on('connection', socket => {
  console.log('user connected')

  // Users that are hosting screen hopper sessions
  socket.on('host', data => {
    Object.assign(screens[0], data.screen)

    sessionId = data.sessionId

    logInfo('Host')

    io.emit('host', {
      screenNum: 1,
      screens
    }) // generate session code
  })

  socket.on('client', data => {
    if (data.sessionId !== sessionId) {
      console.warn('Client session ID does not match')
      return
    }

    Object.assign(screens[1], data.screen)

    logInfo('Client')

    io.emit('client', {
      screenNum: 2,
      screens
    })
  })

  socket.on('update', position => {
    io.emit('update', position)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

http.listen(3000, () => {
  console.log('listening on *:3000')
})

// ###
// Helpers

var logInfo = who => {
  console.log(`${who} connected`)
  console.log('Screens are', screens)
  console.log('Session ID is', sessionId)
}
