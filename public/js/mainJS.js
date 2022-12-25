const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// // Get username and room from URL
// this is major point to change from old to new. instead of query parameters being passed in on the get request.. need a route that takes query params
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
 
});
console.log("room=", room, username)
// my try at pulling the data into the chat

// const room = document.getElementById('room-name');
// const username = document.getElementById('users');
console.log(username, "username")
const socket = io();
console.log("mainJS", socket, socket.connected, socket.id)

socket.on("connection", (socket) => {
  console.log("mainJS", socket, socket.connected, socket.id)
  console.log('New WS Connection', socket, socket.id,socket.handshake.headers.referer);
})

// // Join chatroom
socket.emit('joinRoom', { username, room });
console.log("joinRoom", username, room)

// // Get room and users
socket.on('roomUsers', ({ room, users }) => {
  console.log("bigtest")
  outputRoomName(room);
  console.log("output", room)
  outputUsers(users);
});

// // Message from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

//   // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// // Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

//   // Get message text
  let msg = e.target.elements.msg.value;
  console.log(msg)
//   msg = msg.trim();

//   if (!msg) {
//     return false;
//   }

//   // Emit message to server
  socket.emit('chatMessage', msg);

//   // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// // Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
//   const p = document.createElement('p');
//   p.classList.add('meta');
//   p.innerText = message.username;
//   p.innerHTML += `<span>${message.time}</span>`;
//   div.appendChild(p);
//   const para = document.createElement('p');
//   para.classList.add('text');
//   para.innerText = message.text;
//   div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// // Add room name to DOM
function outputRoomName(room) {
  console.log("output test")
  roomName.innerText = room;
}

// // Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
  ${users.map(user => `<li class="profile" >${user.username}</li>`).join('')}
  `;
  users.forEach((user) => {
    console.log("first")
    document.querySelector('.profile').addEventListener('click', () => {
      window.location = `/profile/${user.username}`
      console.log("forEach")
    })
//     const li = document.createElement('li');
//     li.innerText = user.username;
//     userList.appendChild(li);
  });
}

// //Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../';
  } else {
  }
});


