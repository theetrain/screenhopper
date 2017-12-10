/* globals $, io */

$(document).ready(function () {
  // Vendors
  var socket = io()

  // Session
  var sessionId = ''
  var screenNum = 0
  var screens = []

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
    animateCharacter(response.x, response.y)
  })

  // ###
  // Helpers
  var startAnimation = function () {
    updateCharacter(
      $canvas.character.offset().left,
      $canvas.character.offset().top
    )
  }

  var moveRight = function () {}

  var updateCharacter = function (x, y) {
    socket.emit('update', {
      x: x + 1,
      y: y
    })
  }

  var animateCharacter = function (x, y) {
    window.requestAnimationFrame(function () {
      $canvas.character.css('transform', 'translate(' + x + 'px, ' + y + 'px')
    })

    updateCharacter(x + 1, y)
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
