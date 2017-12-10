/* globals $, io */

$(document).ready(function () {
  // Vendors
  var socket = io()

  // Session
  var sessionId = ''
  var screenNum = 0
  var screens

  // Page elements
  var $screenStatus = $('#play-screen-number')
  var $canvas = {
    wrapper: $('#canvas'),
    character: $('#character')
  }
  var $page = {
    connect: $('#page-connect'),
    play: $('#page-play')
  }
  var $button = {
    host: $('#start-host'),
    client: $('#start-client'),
    play: $('#play')
  }

  // ###
  // Page events
  $button.host.on('click', function () {
    console.log('Hosting session')

    sessionId = 'abc'

    socket.emit('host', {
      screen: {
        width: $(window).width(),
        height: $(window).height()
      },
      sessionId: sessionId
    })
  })

  $button.client.on('click', function () {
    console.log('Joining session')
    socket.emit('client', {
      screen: {
        width: $(window).width(),
        height: $(window).height()
      },
      sessionId: $('#client-id').val()
    })
  })

  $button.play.on('click', function () {
    console.log('Start animation')
    startAnimation()
  })

  // ###
  // Socket events
  socket.on('host', function (response) {
    if (!sessionId) {
      return
    }

    setSession(response)
  })

  socket.on('client', function (response) {
    setSession(response)
  })

  socket.on('update', function (response) {
    animateCharacter(
      response.startScreen,
      response.endScreen,
      response.endPoint
    )
  })

  // ###
  // Helpers
  var startAnimation = function () {
    moveRight()
  }

  var moveRight = function () {
    var startScreen = screenNum
    var endScreen = screenNum + 1

    var endPoint = {
      x: screens[endScreen].x / 2,
      y: screens[endScreen].y / 2
    }

    socket.emit('update', {
      startScreen: startScreen,
      endScreen: endScreen,
      endPoint: endPoint
    })
  }

  var animateCharacter = function (startScreen, endScreen, endPoint) {
    if (screenNum === startScreen) {
      // Animate away from here
      $canvas.character.animate()
    } else if (screenNum === endScreen) {
      // Animate into here
    }
    // window.requestAnimationFrame(function () {
    //   $canvas.character.css('transform', 'translate(' + x + 'px, ' + y + 'px')
    // })
  }

  var setSession = function (response) {
    // Don't set screen number if already set
    if (screenNum) {
      return
    }

    $page.connect.addClass('inactive')
    $page.play.removeClass('inactive')

    screens = response.screens
    console.log('Screens are', screens)

    screenNum = response.screenNum
    $screenStatus.html(screenNum)
  }
})
