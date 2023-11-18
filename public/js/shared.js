console.log("Shared")

const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
console.log("from shared.js UTZ=", userTimeZone);

const userLang = navigator.language || navigator.userLanguage;
console.log("userLang=", userLang)

let userStatus = 'guest';
// let guestID
const socket = io({
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 5000,
    reconnectionDelayMax: 30000,  // 30 seconds
    query: { userTimeZone: userTimeZone, userLang: userLang  },
  });
  
  socket.connect();


socket.on('connect', () => {

  console.log("socket connected!!", socket.timeZone, socket, socket.id, socket.data);

  socket.on('setStatus', (onlineStatus) => {
    userStatus = onlineStatus;
    console.log("userStatus=", userStatus);
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

socket.on('disconnect', () => {
  console.log('socket disconnected... attempting to reconnect');
});
 
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
  

  export { socket, userTimeZone, userLang, userStatus };