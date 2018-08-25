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

var determineNextScreen = (currentScreen, dir) => {
  console.log('direction is', dir)

  if (dir === 'right') {
    return currentScreen + 1
  }

  if (dir === 'left') {
    return currentScreen - 1
  }

  return 1
}

app.use('/', express.static(`${__dirname}/public`))

io.on('connection', socket => {
  console.log('user connected')

  // Users that are hosting screen hopper sessions
  socket.on('host', data => {
    Object.assign(screens[0], data.screen, { hasCharacter: true })

    sessionId = data.sessionId

    logInfo('Host')

    io.emit('host', {
      screenNum: 0,
      screens
    }) // generate session code
  })

  socket.on('client', data => {
    if (data.sessionId !== sessionId) {
      console.warn('Client session ID does not match', data.sessionId)
      return
    }

    Object.assign(screens[1], data.screen, { hasCharacter: false })

    logInfo('Client')

    io.emit('client', {
      screenNum: 1,
      screens
    })
  })

  socket.on('pushDirection', data => {
    console.log(data)
    // screens[data.screenNum].hasCharacter = false
    io.emit('pushDirection', {
      screenNum: data.screenNum,
      dir: data.dir
    })
  })

  socket.on('pullDirection', data => {
    console.log(data)
    console.log(
      'pulling to screen #',
      determineNextScreen(data.screenNum, data.dir)
    )
    // screens[data.screenNum].hasCharacter = true
    io.emit('pullDirection', {
      screenNum: determineNextScreen(data.screenNum, data.dir),
      dir: data.dir
    })
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
