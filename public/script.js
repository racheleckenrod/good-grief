const io = require("socket.io-client");
const socket = io('http://localhost:2899', {
    withCredentials: true
})

let timeClock 

socket.on('timeClock', data => {
    // console.log(data)
    timeClock = document.getElementById('time').innerHTML = data
   
})

socket.on('timeData', (timeString2) => {
    el = document.getElementById('currently');
    el.innerHTML = 'Current time: ' + timeString2;
})

