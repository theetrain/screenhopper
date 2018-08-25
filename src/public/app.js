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
  var session = {
    sessionId: '',
    screenNum: 0,
    screens: {}
  }

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

    session.sessionId = 'abc'

    socket.emit('host', {
      screen: {
        width: $(window).width(),
        height: $(window).height()
      },
      sessionId: session.sessionId
    })
  })

  $button.client.on('click', function () {
    console.log('Joining session')
    session.sessionId = $page.idBox.val()
    socket.emit('client', session)
  })

  $button.play.on('click', function () {
    console.log('Start animation')
    move('right')
  })

  var move = function (dir) {
    moveDirectionOut(dir).then(function () {
      console.log('Animation over')
      socket.emit('pushDirection', Object.assign({}, session, { dir: 'right' }))
    })
  }

  // developer hacks
  $(window).on('keydown', function (e) {
    switch (e.key) {
      case 'ArrowRight':
        move('right')
        break
      case 'ArrowLeft':
        move('left')
        break
      default:
        break
    }
  })

  // ###
  // Socket events
  socket.on('host', function (response) {
    if (!session.sessionId) {
      return
    }

    setSession(response)
  })

  socket.on('client', function (response) {
    setSession(response)
  })

  socket.on('pullDirection', function (response) {
    console.log('ready to pull')
    if (response.screenNum === session.screenNum) {
      moveDirectionIn(response.dir)
    }
  })

  // ###
  // Animaters
  var moveDirectionOut = function (dir) {
    var x = ''

    if (dir === 'right') {
      x = '100vw'
    } else if (dir === 'left') {
      x = '-100vw'
    }
    return new Promise(function (resolve) {
      $canvas.character
        .css({
          transform: 'translate(' + x + ', calc(50vh - 50px))'
        })
        .one('transitionend', function () {
          resolve()
        })
    })
  }

  var moveDirectionIn = function (dir) {
    return new Promise(function (resolve) {
      $canvas.character
        .css({
          transform: 'translate(50vw, calc(50vh - 50px))'
        })
        .one('transitionend', function () {
          resolve()
        })
    })
  }

  var setSession = function (response) {
    // Don't set screen number if already set
    if (session.screenNum) {
      return
    }

    session.screens = response.screens
    console.log('Screens are', session.screens)

    session.screenNum = response.screenNum
    $screenStatus.html(session.screenNum)

    if (session.screenNum !== 1) {
      $canvas.character
        .addClass('notransition')
        .css('transform', 'translate(-100px, calc(50vh - 50px))')
        .removeClass('notransition')
    }

    $page.connect.addClass('inactive')
    $page.play.removeClass('inactive')
  }
})
