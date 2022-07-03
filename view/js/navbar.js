const $ = require('jquery')

$('#produce-sign').on('click', () =>{
    $('li').removeClass('select-active')
    $('#produce-sign').addClass('select-active')
    $('.row.mt-3').addClass('hidden')
    $('#col-uploadFile').removeClass('hidden')
    $('#col-send').removeClass('hidden')
})
$('#setting-apikey').on('click', () =>{
    $('li').removeClass('select-active')
    $('#setting-apikey').addClass('select-active')
    $('.row.mt-3').addClass('hidden')
    $('#col-apiKey').removeClass('hidden')
})
$('#setting-privatekey').on('click', () =>{
    $('li').removeClass('select-active')
    $('#setting-privatekey').addClass('select-active')
    $('.row.mt-3').addClass('hidden')
    $('#col-privateKey').removeClass('hidden')
})
$('#instructions').on('click', () =>{
    $('li').removeClass('select-active')
    $('#instructions').addClass('select-active')
    $('.row.mt-3').addClass('hidden')
    $('#col-instructions').removeClass('hidden')
})

