/* globals $, io */

$(document).ready(function () {
  var socket = io()
  // var $connectStatus = $('#status')
  var $screenStatus = $('#play-screen-number')
  // var $canvas = $('#canvas')
  var $page = {
    connect: $('#page-connect'),
    play: $('#page-play')
  }
  var $button = {
    host: $('#start-host'),
    client: $('#start-client')
  }

  $button.host.on('click', function () {
    console.log('Hosting session')
    socket.emit('host', {
      width: $(window).width(),
      height: $(window).height()
    })
  })

  $button.client.on('click', function () {
    console.log('Joining session')
    socket.emit('client', {
      width: $(window).width(),
      height: $(window).height()
    })
  })

  socket.on('host', function (response) {
    $page.connect.addClass('inactive')
    $page.play.removeClass('inactive')
    $screenStatus.html(response.screen)
  })

  socket.on('client', function (response) {
    $page.connect.addClass('inactive')
    $page.play.removeClass('inactive')
    $screenStatus.html(response.screen)
  })
})
