// const socket = io()
console.log("Shared")

const socket = io({
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    query: { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  });
  const id = socket.id;

  socket.on('reconnect', (attemptNumber) => {
    console.log(`Reconnected after ${attemptNumber} attempts`);
  });
  
//   const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

//   socket.request.session.timezone = userTimeZone
  
//   let timeClock =  document.getElementById('time');
  
  console.log("SHARED userTimeZone:", socket.request)
  
//   socket.emit("updateTimeZone", { timeZone: userTimeZone });
  
 
  