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

const socket = io({
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    // query: { timeZone:  Intl.DateTimeFormat().resolvedOptions().timeZone  },
  });
  
  const userTimeZone = Intl.DateTimeFormatTimeFormat().resolvedOptions().timeZone;

socket.on('connect', () => {

  socket.emit('setTimeZone', userTimeZone);
  // console.log("socket connected!!", socket.timeZone, socket, socket.id)
  
  // console.log("id=", socket.id)


    // console.log("SHARED userTimeZone1:", userTimeZone)

socket.on('disconnect', () => {
  console.log('socket disconnected... attempting to reconnect');
})

 
  socket.on('reconnect', (attemptNumber) => {
    console.log(`Reconnected after ${attemptNumber} attempts`);
    // Handle any reconnection logic here.
  });
  
  socket.on('reconnecting', (attemptNumber) => {
    console.log(`Attempting to reconnect (attempt ${attemptNumber})`);
    // You can use this event to provide feedback to the user during reconnection attempts.
  });
  
  // console.log("SHARED userTimeZone:", userTimeZone, socket.request)
  
})
 
  export { socket };