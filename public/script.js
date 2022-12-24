
// const io = require("socket.io");

const io = require("socket.io-client");


// const socket = io('http://localhost:3333')
console.log("script.js")
let timeClock ;

console.log('New WS Connection', "script", "socket.connected=", socket.connected, socket.id,socket.handshake.headers.referer)});

io.on('timeClock', data => {
    console.log(data,"Personal")
socket.on('timeClock', data => {
    // console.log(data)

    timeClock = document.getElementById('time').innerHTML = data
   
})

io.on('timeData', (timeString2) => {
    el = document.getElementById('currently');
    el.innerHTML = 'Current time: ' + timeString2;
})

