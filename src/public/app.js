/* globals $, io */

$(document).ready(function () {
  // Vendors
  var socket = io()

  // Session
  var sessionId = ''
  var screenNum = 0

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
    $page.connect.addClass('inactive')
    $page.play.removeClass('inactive')

    setScreenNum(response.screenNum)
  })

  socket.on('client', function (response) {
    $page.connect.addClass('inactive')
    $page.play.removeClass('inactive')

    setScreenNum(response.screenNum)
  })

  socket.on('update', function (response) {
    updateCharacter(response.x, response.y)
  })

  // ###
  // Helpers
  var startAnimation = function () {
    var step = function () {
      updateCharacter(
        $canvas.character.offset().left + 1,
        $canvas.character.offset().top
      )
      window.requestAnimationFrame(step)
    }

    window.requestAnimationFrame(step)
  }

  var updateCharacter = function (x, y) {
    $canvas.character.css('transform', 'translate(' + x + 'px, ' + y + 'px')
  }

  var setScreenNum = function (screenNumToAssign) {
    // Don't set screen number if already set

    if (screenNum) {
      return
    }

    screenNum = screenNumToAssign
    $screenStatus.html(screenNumToAssign)
  }
})
