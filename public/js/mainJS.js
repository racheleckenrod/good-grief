const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const username = document.getElementById('username').innerHTML;
const room =  roomName.innerHTML

// // Get username and room from URL
// this is major point to change from old to new. instead of query parameters being passed in on the get request.. need a route that takes query params
// const { _id } = Qs.parse(location.search, {
//   ignoreQueryPrefix: true,
 
// });

// get userName from DOM we have logged in users:
// this is major point to change from old to new. instead of query parameter for user, we get it from the request, render it in the DOM, and getElementById
// room could be accessed this way too, and the user id(_id) is already sent(although I dont know exactly if it is necessary to have so the eventlistener can pull up the chatuser's profile) 
// get username from DOM
// const username = document.querySelector('#username');
// const room = document.getElementById('room-name');
const _id =  document.getElementById('_id');
console.log("room=", room, username, _id)
// my try at pulling the data into the chat

// console.log(username, "username")
const socket = io();
const id = socket.id;
console.log("mainJS", socket, socket.connected, socket.id)

// // Join chatroom
socket.emit('joinRoom', { id, username, room, _id });
console.log("joinRoom", id, username, room, _id)

// // Get room and users
socket.on('roomUsers', ({ room, users }) => {
  // console.log("mainJS2", socket, socket.connected, socket.id)

  console.log("bigtest")
  outputRoomName(room);
  console.log("output", room)
  outputUsers(users);
  console.log(users)
});

// // Message from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

//   // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// // Message submit- prevent default stops page reload
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
  div.classList.add(`${room}`);
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

// //Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  // const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  // if (leaveRoom) {
    window.location = '../';
  // } else {
  // }
});
