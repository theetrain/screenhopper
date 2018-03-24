/* globals $, io */

/*
* Overall flow
* 1. Host creates session ID, their device is stored in an array
* 2. Client connects to host's session ID, their device is stored in an array
* 3. Object animates from a 'sender' screen to a 'receiver' screen. On both screens
*    the animation is static. No object data such as screen position is stored
*    on the session, nor is it shared.
*/

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
    idBox: $('#client-id'),
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
    sessionId = $page.idBox.val()
    socket.emit('client', getSession())
  })

  $button.play.on('click', function () {
    console.log('Start animation')
    moveRightOut().then(function () {
      console.log('Animation over')
      socket.emit('pushRight', getSession())
    })
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

  socket.on('pullRight', function (response) {
    console.log('ready to pull')
    if (response.screenNum === screenNum) {
      moveRightIn()
    }
  })

  // ###
  // Animaters
  var moveRightOut = function () {
    return new Promise(function (resolve, reject) {
      $canvas.character
        .css({
          transform: 'translate(100vw, calc(50vh - 50px))'
        })
        .one('transitionend', function () {
          resolve()
        })
    })
  }

  var moveRightIn = function () {
    return new Promise(function (resolve, reject) {
      $canvas.character
        .css({
          transform: 'translate(50vw, calc(50vh - 50px))'
        })
        .one('transitionend', function () {
          resolve()
        })
    })
  }

  var animateCharacter = function (startScreen, endScreen, endPoint) {
    if (screenNum === startScreen) {
      // Animate away from here
      $canvas.character.animate({
        transform: 'translate(100vw, calc(50vh - 50px))'
      })
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

    screens = response.screens
    console.log('Screens are', screens)

    screenNum = response.screenNum
    $screenStatus.html(screenNum)

    if (screenNum !== 1) {
      $canvas.character
        .addClass('notransition')
        .css('transform', 'translate(-100px, calc(50vh - 50px))')
        .removeClass('notransition')
    }

    $page.connect.addClass('inactive')
    $page.play.removeClass('inactive')
  }

  var getSession = function () {
    return {
      screen: {
        width: $(window).width(),
        height: $(window).height()
      },
      sessionId: sessionId,
      screenNum: screenNum
    }
  }
})
