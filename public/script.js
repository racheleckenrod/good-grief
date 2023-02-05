const username = document.getElementById('username').innerHTML
// const userlist = document.getElementById('users')

// maybe we can get the room name from the request
const room = "lobby"
// let _id = 123456789 

const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const chatMessages = document.querySelector('.chat-messages');

// const socket = io();
const lobbySocket = io('/lobby2')
const id = lobbySocket.id;



console.log("script.js", lobbySocket)
let timeClock =  document.getElementById('time');


// lobbySocket.emit("joinAll", () =>{























// let username 
// const room = "lobby"
// let _id = 123456789 

// const roomName = document.getElementById('room-name');
// const userList = document.getElementById('users');
// const chatMessages = document.querySelector('.chat-messages');

// const socket = io();
// const lobbySocket = io('/lobby2')
// const id = socket.id;



// console.log("script.js", socket)
// let timeClock ;


// // socket.emit("joinAll", () =>{

// // })
// lobbySocket.on('connect',(message) => {
//     console.log(message)
// })
lobbySocket.on('testmessage',(message) => {
    console.log("OOO", message)
    outputMessage(message, room);
})

// socket.on("connection", (socket) => {
//     console.log('New WS SCRIPT Connection', "script", "socket.connected=", socket.connected, socket.id,socket.handshake.headers.referer)
   
// })

//     socket.emit('joinRoom', { id, username, room, _id });

// });

// socket.on("numOfUsers", (message, room) =>{
//     console.log(message, "numOfUsers");
//     outputMessage(message)
// })

// socket.on("message", (message, room) => {
//     console.log(message, "welcome?")
//     outputMessage(message);

//      //   // Scroll down
//      chatMessages.scrollTop = chatMessages.scrollHeight;
// })
lobbySocket.on('testmessage',(message) => {
    console.log("OOO", message)
    outputMessage(message, room);
})


lobbySocket.on('timeClock', data => {
  console.log(data,"Personal", "connected?", lobbySocket.connected)
  // timeClock.innerHTML = `${data.map(user => `<li class="${user.username}" >${user.username}</li>`).join('')}`

  timeClock.innerHTML = data

})

lobbySocket.on('timeData', (timeString2) => {
  el = document.getElementById('currently');
  el.innerHTML = 'Current time: ' + timeString2;

})

// // Message from server
lobbySocket.on('hi', (message) => {
    console.log(message, "messageLobby");
    outputMessage(message, room);

    // lobbySocket.on("chat-message")
  
//   //   // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
// 
  
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
// recieve testing from io
lobbySocket.on("message", (message) => {
  console.log(message, "test");

  outputMessage(message, room)
})

// // Message from server
lobbySocket.on('messageLobby', (message) => {
    console.log(message, "messageLobby");
    outputMessage(message, room);
  
//   //   // Scroll down
//     chatMessages.scrollTop = chatMessages.scrollHeight;

  })
  function outputMessage(message, room) {
    const div = document.createElement('div');
    div.classList.add('message');
    // div.classList.add(`${room}`);
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
      ${message.text}
    </p>`;
    document.querySelector(`.chat-messages`).appendChild(div);

  }


  // // Add users to DOM
function outputUsers(users) {
    console.log("outputUsers")
    userList.innerHTML = `
    ${users.map(user => `<li class="${user.username}" >${user.username}</li>`).join('')}
    `;
}
