const username = document.getElementById('username').innerHTML
const userlist = document.getElementById('users')

// maybe we can get the room name from the request
const room = "lobby"
let _id = 123456789 

const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const chatMessages = document.querySelector('.chat-messages');

// const socket = io();
const lobbySocket = io('/lobby2')
const id = lobbySocket.id;



console.log("script.js", lobbySocket)
let timeClock ;


lobbySocket.emit("joinAll", () =>{

})
// lobbySocket.on('connection',(socket) => {
//     console.log("OOO", socket)
// })

lobbySocket.on('timeClock', (data) => {
    console.log(data,"Personal", "connected?", socket.connected, room)
    timeClock = document.getElementById('time').innerHTML = data
   
})

lobbySocket.on('timeData', (timeString2) => {
    el = document.getElementById('currently');
    el.innerHTML = 'Current time: ' + timeString2;
})


// // Message from server
lobbySocket.on('hi', (message) => {
    console.log(message, "messageLobby");
    // outputMessage(message, room);
  
//   //   // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;

  
  });



// lobbySocket.on("socket", (socket) => {
//     console.log('New WS SCRIPT Connection', "script", "socket.connected=", socket.connected, socket.id,socket.handshake.headers.referer)
   
//     // socket.emit('whoami', (username) => {
//     //     console.log(username)
//     // })

//     // socket.emit('joinRoom', { id, username, room, _id });

// });

//   });

// // // Message from server
// socket.on("message", (message) => {
//     console.log(message, "welcome?")
//     outputMessage(message);

//      //   // Scroll down
//     //  chatMessages.scrollTop = chatMessages.scrollHeight;
//   })


// lobbySocket.on("messageLobby", (message) => {
//     outputMessage(message);

//      //   // Scroll down
//      chatMessages.scrollTop = chatMessages.scrollHeight;
// })


// // Message from server
lobbySocket.on('messageLobby', (message) => {
    console.log(message, "messageLobby");
    outputMessage(message, room);
  
  //   // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;


  function outputMessage(message, room) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(`${room}`);
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
      ${message.text}
    </p>`;
    document.querySelector(`.chat-messages `).appendChild(div);

  }
// // Get room and users
lobbySocket.on('roomUsers', ({ room, users }) => {

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

})