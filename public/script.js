const username = "admin "

// maybe we can get the room name from the request
const room = "lobby"
const _id = 123456789 

const socket = io();
const id = socket.id;



console.log("script.js", socket)
let timeClock ;

socket.emit('joinRoom', { id, username, room, _id });

socket.emit("joinAll", () =>{

})


socket.on("connection", (socket) => {
    console.log('New WS SCRIPT Connection', "script", "socket.connected=", socket.connected, socket.id,socket.handshake.headers.referer)
   
});

socket.on("numOfUsers", (message, room) =>{
    console.log(message, "numOfUsers");
    outputMessage(message)
})

socket.on("message", (message, room) => {
    console.log(message, "welcome?")
    outputMessage(message);

     //   // Scroll down
    //  chatMessages.scrollTop = chatMessages.scrollHeight;
})


// // Message from server
socket.on('messageLobby', (message) => {
    console.log(message, "messageLobby");
    outputMessage(message, room);
  
  //   // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;

  
  });

  function outputMessage(message) {
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
    console.log("mainJS2", socket, socket.connected, socket.id)
  
    // console.log("bigtest", room, users)
    outputRoomName(room);
    // console.log("output", room)
    outputUsers(users);
    // console.log("output", users)

  });

  // // Add users to DOM
function outputUsers(users) {
    console.log("outputUsers", users)
    userList.innerHTML = `
    ${users.map(user => `<li class="${user.username}" >${user.username}</li>`).join('')}
    `;
}
socket.on('timeClock', data => {
    console.log(data,"Personal", "connected?", socket.connected)
    timeClock = document.getElementById('time').innerHTML = data
   
})

socket.on('timeData', (timeString2) => {
    el = document.getElementById('currently');
    el.innerHTML = 'Current time: ' + timeString2;
})
socket.on("numOfUsers", (message) =>{
    console.log(message)
})