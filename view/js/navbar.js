const $ = require('jquery')

$('#produce-sign').on('click', () =>{
    $('li').removeClass('select-active')
    $('#produce-sign').addClass('select-active')
    $('.row.mt-3').addClass('hidden')
    $('#col-uploadFile').removeClass('hidden')
    $('#col-encode').removeClass('hidden')
})
$('#setting-folder').on('click', () =>{
    $('li').removeClass('select-active')
    $('#setting-folder').addClass('select-active')
    $('.row.mt-3').addClass('hidden')
    $('#col-unProofDir').removeClass('hidden')
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
$('#setting-cloudlog-folder').on('click', () =>{
    $('li').removeClass('select-active')
    $('#setting-cloudlog-folder').addClass('select-active')
    $('.row.mt-3').addClass('hidden')
    $('#col-cloudLogDir').removeClass('hidden')
})

