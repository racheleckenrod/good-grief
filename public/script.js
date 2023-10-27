const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const username = document.getElementById('username').innerHTML;
const room =  roomName.innerHTML

const _id =  document.getElementById('_id').innerHTML;
// console.log("room=", room, username, _id)

const socket = io();
const id = socket.id;
// const lobbySocket = io('/lobby2')

// console.log("mainJS", socket, socket.connected, socket.id)

let timeClock =  document.getElementById('time');

socket.on('timeClock', data => {
  // console.log("Nothing",data,"Personal", "connected?", lobbySocket.connected)
 
  timeClock.innerHTML = data
  console.log("script.js2", socket, id)

})

socket.on('timeData', (timeString2) => {
  el = document.getElementById('currently');
  el.innerHTML = 'Currently: ' + timeString2;

})


// // Join chatroom
socket.emit('joinRoom', {  username, room, _id });
console.log("joinRoom", username, room, _id)

// // Get room and users
socket.on('roomUsers', ({ room, users }) => {
  console.log("mainJS2", socket, socket.connected, socket.id)


  outputRoomName(room);
  console.log("output", room)
  outputUsers(users);
  console.log(users)
});

// // Message from server
socket.on('message', (message) => {
  console.log("Message", message);
  outputMessage(message);

//   // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// // Message submit- prevent default stops page reload
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

//   // Get message text
  let msg = e.target.elements.msg.value;
  console.log("msg", msg)
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

  document.querySelector('.chat-messages').appendChild(div);
}

// // Add room name to DOM
function outputRoomName(room) {
  console.log("output test", socket, socket.connected, socket.id)
  roomName.innerText = room;
}

// // Add users to DOM
function outputUsers(users) {
  console.log("outputUsers", users)
  userList.innerHTML = `
  ${users.map(user => `<li class="${user.username}" >${user.username}</li>`).join('')}
  `;

  // Add event listeners to names to connect to their profile page
  users.forEach((user) => {
    console.log("first", user)
    document.querySelector(`.${user.username}`).addEventListener('click', () => {
      console.log("forEach", user.username, user._id)
       window.location = `/profile/${user._id}`
    })
//     const li = document.createElement('li');
//     li.innerText = user.username;
//     userList.appendChild(li);
  });
}

// // // User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}


