console.log("Shared")

const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
console.log("from shared.js UTZ=", userTimeZone);

const userLang = navigator.language || navigator.userLanguage;
console.log("userLang=", userLang)

let userStatus = 'guest';
// let guestID

// // Disconnect existing socket if connected
// if (socket.id && socket.connected) {
//   socket.disconnect();
// }


const socket = io({
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 5000,
    reconnectionDelayMax: 30000,  // 30 seconds
    query: { userTimeZone: userTimeZone, userLang: userLang  },
  });
  
  // socket.connect();



// Optionally, you can also handle the case when the user closes the tab or navigates away
window.addEventListener('beforeunload', function () {
  // Disconnect the socket before the page is unloaded
  console.log("before unload disconnect")
  if (socket.id && socket.connected) {
    socket.disconnect();
  }
});



socket.on('connect', () => {
  console.log("before curious")
  console.log("socket connected!!", socket.id, socket);

  socket.on('setStatus', (onlineStatus) => {
    userStatus = onlineStatus;
    console.log("userStatus=", userStatus);
  });





  socket.on('disconnect', (reason) => {
    console.log(`socket disconnected... ${reason} attempting to reconnect`);
  });


});

socket.on('setCookie', (GuestID) => {
  document.cookie = `guestID=${GuestID}; expires=Thu, 01 Jan 2099 00:00:00 UTC; path=/`;
  console.log("cookie set??NOW?", GuestID)
});
const cookies = document.cookie.split(";");
let guestID = null;
for(const cookie of cookies) {
  const [name, value] = cookie.trim().split('=');
  if (name === 'guestID') {
    guestID = value;
    break;
  }
}







console.log("guestID=", guestID )


 
socket.io.on("reconnect_attempt", (attemptNumber) => {
  // Handle reconnect attempt
  console.log("Reconnect attempt", attemptNumber);
  // console.log(`Attempt numbrt : (attempt ${attemptNumber})`);
});
  
socket.io.on('reconnect', (attemptNumber) => {
  // console.log("trying")
  console.log(`Reconnected after ${attemptNumber} attempts`);
  // Handle any reconnection logic here.
});
  

// LoggedIn Required Modal
console.log("Check")
document.addEventListener('DOMContentLoaded', function () {
  const modalButtons = document.querySelectorAll('.openModalButton');
  const logInModal = document.querySelector('.logInModal');
  const modalText = document.getElementById('modalLoginText');

  modalButtons.forEach(function (button) {
      button.addEventListener('click', function (event) {
          event.preventDefault();

          if (userStatus !== 'loggedIn') {
            console.log("user status===", userStatus)
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
          logInModal.style.display = 'block';
        } else {
          window.location.href = button.href;
        }
      });
  });

  // Close modal when the close button is clicked
  let closeButton = logInModal.querySelector('.close');
  closeButton.addEventListener('click', function () {
      logInModal.style.display = 'none';
  });

  // Close modal when an element with the 'continue' class is clicked
  logInModal.addEventListener('click', function (event) {
    if (event.target.classList.contains('continue')) {
      logInModal.style.display = 'none';
    }
  });

   // Close modal when clicking outside the modal
  window.addEventListener('click', function (event) {
  if (event.target === logInModal) {
    logInModal.style.display = 'none';
  }
});
});


  export { socket, userTimeZone, userLang, userStatus };