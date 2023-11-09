console.log("Shared")
// let userTimeZone
// Read the userTimeZone cookie value
// const cookies = document.cookie.split('; ');
// const userTimeZoneCookie = cookies.find((cookie) => cookie.startsWith('userTimeZone='));

// if (userTimeZoneCookie) {
//   userTimeZone = userTimeZoneCookie.split('=')[1];
//   console.log(`User's timezone from cookie: ${userTimeZone}`);
// } else {
//   console.log("User's timezone cookie not found.");
// }
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
console.log("from shared.js UTZ=", userTimeZone);

const userLang = navigator.language || navigator.userLanguage;
console.log("userLang=", userLang)

let userStatus = 'guest';
// let guestID

const socket = io({
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    query: { userTimeZone: userTimeZone, userLang: userLang  },
  });
  

socket.on('connect', () => {
  console.log("socket connected!!", socket.timeZone, socket, socket.id, socket.data);
});

socket.on('setStatus', (onlineStatus) => {
  userStatus = onlineStatus;
  console.log("userStatus=", userStatus);
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

socket.on('disconnect', () => {
  console.log('socket disconnected... attempting to reconnect');
});

 
socket.on('reconnect', (attemptNumber) => {
  console.log(`Reconnected after ${attemptNumber} attempts`);
  // Handle any reconnection logic here.
});
  
socket.on('reconnecting', (attemptNumber) => {
  console.log(`Attempting to reconnect (attempt ${attemptNumber})`);
  // You can use this event to provide feedback to the user during reconnection attempts.
});

  
  export { socket, userTimeZone, userStatus, userLang };