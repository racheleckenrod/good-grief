import { socket, userTimeZone } from './js/shared.js'

let el

console.log("test timezone", userTimeZone)

const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const username = document.getElementById('username').innerHTML;
const room =  roomName.innerHTML

const _id =  document.getElementById('_id').innerHTML;

// const socket = io({
//   reconnection: true,
//   reconnectionAttempts: 10,
//   reconnectionDelay: 1000,
// });
const id = socket.id;

let timeClock =  document.getElementById('time');

socket.on('connect', () => {
console.log('lobby connected')
});
socket.on('reconnect', (attemptNumber) => {
  console.log(`Reconnected after ${attemptNumber} attempts`);
});

socket.emit("joinLobby")

socket.on('timeClock', data => {
 
  timeClock.innerHTML = data

})

socket.on('timeData', (timeString2) => {
  el = document.getElementById('currently');
  el.innerHTML = 'Currently: ' + timeString2;

})


// // Join chatroom
socket.emit('joinRoom', {  username, room, _id, userTimeZone });

// // Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Recent messages
socket.on("recentMessages", (messages) => {
  // display the recent messages in the chatroom
  messages.forEach((message) => {
    outputMessage(message);
  });
});

// // Message from server
socket.on('message', (message) => {
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
  roomName.innerText = room;
}

// // Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
  ${users.map(user => `<li class="${user.username}" >${user.username}</li>`).join('')}
  `;
  // Add event listeners to names to connect to their profile page
  users.forEach((user) => {
    console.log("first", user)
    console.log("guestID=", guestID.value)
    // console.log("socket.data=", socket.data, "req", req)
    
    
       document.querySelector(`.${user.username}`).addEventListener('click', () => {
        
      if (guestID.value) {
        alert("Guest users don't have access to user Profiles. Please sign up to see them.");
      } else if (user.username.startsWith("guest")){
        alert("Guest users do not have profiles.");
      } else {
        window.open(`/profile/${user._id}`, '_blank');
      }
      // console.log("forEach", user.username, user._id)
      //  window.location = `/profile/${user._id}`
    });
    
   
//     const li = document.createElement('li');
//     li.innerText = user.username;
//     userList.appendChild(li);
  });
};



