const socket = io();
const id = socket.id;

console.log("script.js", socket)
let timeClock ;

socket.on("connection", (socket) => {
    console.log('New WS SCRIPT Connection', "script", "socket.connected=", socket.connected, socket.id,socket.handshake.headers.referer)});

socket.on('timeClock', data => {
    console.log(data,"Personal", "connected?", socket.connected)
    timeClock = document.getElementById('time').innerHTML = data
   
})

socket.on('timeData', (timeString2) => {
    el = document.getElementById('currently');
    el.innerHTML = 'Current time: ' + timeString2;
})

