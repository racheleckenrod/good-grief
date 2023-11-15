import { socket, userTimeZone, userLang, userStatus } from './js/shared.js'

let el

// console.log("test timezone", userTimeZone)

const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('chatUsers');
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
socket.emit('joinRoom', {  username, room, _id });

// // Get room and users
socket.on('roomUsers', ({ room, chatUsers }) => {
  outputRoomName(room);
  outputUsers(chatUsers);
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

socket.on('tx', (message) => {
  console.log("login received", message)
  outputMessage(message);

  //   // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('logout', (message) => {
  console.log("logout received", message)
  outputMessage(message);

  //   // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

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

  console.log(message)

  const timestamp = new Date(message.time)
  
  const localTime = timestamp.toLocaleString( userLang, {timeZone: userTimeZone } )

  div.innerHTML = `<p class="meta">${message.username} <span>${localTime}</span></p>
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
function outputUsers(chatUsers) {
  userList.innerHTML = `
  ${chatUsers.map(chatUser => `<li class="${chatUser.username}" >${chatUser.username}</li>`).join('')}
  `;
  // Add event listeners to names to connect to their profile page
  chatUsers.forEach((chatUser) => {
    console.log("first", chatUser)
    console.log("userStatus=", userStatus)
    
    
       document.querySelector(`.${chatUser.username}`).addEventListener('click', () => {
        
      if (userStatus === 'guest') {
        alert("Guest users don't have access to user Profiles. Please sign up to see them.");
      } else if (chatUser.username.startsWith("guest")){
        alert("Guest users do not have profiles.");
      } else {
        window.open(`/profile/${chatUser._id}`, '_blank');
      }
      // console.log("forEach", user.username, user._id)
      //  window.location = `/profile/${user._id}`
    });
    
   
//     const li = document.createElement('li');
//     li.innerText = user.username;
//     userList.appendChild(li);
  });
};

document.addEventListener('DOMContentLoaded', function () {
  const modalButtons = document.querySelectorAll('.openModalButton');
  const modal = document.querySelector('.modal');
  const modalText = document.getElementById('modalLoginText');

  modalButtons.forEach(function (button) {
      button.addEventListener('click', function (event) {
          event.preventDefault();

          if (userStatus !== 'loggedIn') {
          let action = button.getAttribute('data-modal');

          const notLoggedInMessage = 'You need to be logged in to ';

          if (action === 'chatRoom') {
            modalText.textContent = notLoggedInMessage + 'enter that Chat Room.'
          } else if (action === 'profile') {
            modalText.textContent = notLoggedInMessage + 'to have a Profile.'
          } else if (action === 'comment') {
            modalText.textContent = notLoggedInMessage + 'comment on Posts.'
          } else if (action === 'noAccess') {
            modalText.textContent = 'Guest users do not have access to user Profiles'
          } else if (action === 'feed') {
            modalText.textContent = notLoggedInMessage + 'to see our Community posts.'
          } else if (action === 'newPost') {
            modalText.textContent = notLoggedInMessage + 'make a new Post.'
          }
          modal.style.display = 'block';
        } else {
          window.location.href = button.href;
        }
      });
  });

  // Close modal when the close button is clicked
  let closeButton = modal.querySelector('.close');
  closeButton.addEventListener('click', function () {
      modal.style.display = 'none';
  });

  // Close modal when an element with the 'continue' class is clicked
  modal.addEventListener('click', function (event) {
    if (event.target.classList.contains('continue')) {
      modal.style.display = 'none';
    }
  });

   // Close modal when clicking outside the modal
  window.addEventListener('click', function (event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});
});

