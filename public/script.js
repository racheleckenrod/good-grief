let username 
const room = "lobby"
let _id = 123456789 

const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const chatMessages = document.querySelector('.chat-messages');

const socket = io();
const lobbySocket = io('/lobby2')
const id = socket.id;



console.log("script.js", socket)
let timeClock ;


// socket.emit("joinAll", () =>{

// })
// lobbySocket.on('connect',(socket) => {
    // console.log(socket)
// })

socket.on('timeClock', data => {
    console.log(data,"Personal", "connected?", socket.connected)
    timeClock = document.getElementById('time').innerHTML = data
   
})

socket.on('timeData', (timeString2) => {
    el = document.getElementById('currently');
    el.innerHTML = 'Current time: ' + timeString2;
})


// // Message from server
socket.on('hi', (message) => {
    console.log(message, "messageLobby");
    outputMessage(message, room);
  
  //   // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;

  
  });



socket.on("socket", (socket) => {
    console.log('New WS SCRIPT Connection', "script", "socket.connected=", socket.connected, socket.id,socket.handshake.headers.referer)
   
    socket.emit('whoami', (username) => {
        console.log(username)
    })

    socket.emit('joinRoom', { id, username, room, _id });

});

socket.on("numOfUsers", (message, room) =>{
    console.log(message, "numOfUsers");
    outputMessage(message)
})

socket.on("message", (message, room) => {
    console.log(message, "welcome?")
    outputMessage(message);

     //   // Scroll down
     chatMessages.scrollTop = chatMessages.scrollHeight;
})




  function outputMessage(message, room) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
      ${message.text}${room}
    </p>`;
    document.querySelector(`.chat-messages `).appendChild(div);

  }
// // Get room and users
socket.on('roomUsers', ({ room, users }) => {

    outputNumUsers(users)
    console.log("mainJS2", users, socket.connected, socket.id)
  
    // console.log("bigtest", room, users)
    outputRoomName(room);
    // console.log("output", room)
    outputUsers(users);
    // console.log("output", users)
    

  });

  // // Add users to DOM
function outputUsers(users) {
    console.log("outputUsers")
    userList.innerHTML = `
    ${users.map(user => `<li class="${user.username}" >${user.username}</li>`).join('')}
    `;
}



socket.on("numOfUsers", (message) =>{
    console.log(message)
})