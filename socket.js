const socketio = require("socket.io");

const GuestUserID = require("./models/GuestUserID");
const generateGuestID = require("./utils/guestUserIDs");
const formatMessage = require("./utils/messages");

const ChatMessage = require('./models/ChatMessage');
const User = require("./models/User");

const chatUsers = [];
const botName = "Grief Support Bot";



module.exports = (server, options) => {
    const io = socketio(server, options);

    // io.on("connection", (socket) => {


 
   
  // run when client connects
  io.on("connection", async ( socket) => {
   
      const userTimeZone = socket.request.session.userTimeZone;
      const userLang = socket.request.session.userLang;
      const guestID = socket.request.session.guestID;
      const userStatus = socket.request.session.status;
      socket.emit('setStatus', userStatus)
  
      GuestUserID.findOneAndUpdate(
        { guestUserID: guestID },
        { $set: { timezone: userTimeZone }},
        { new: true },
        (err) => {
          if (err) {
            console.error(err);
          } 
        }
      );
  
          // Runs when client disconnects
          socket.on("disconnect", (reason) => {
            const chatUser = userLeave(socket.id);
            console.log("chatUser from disconnect", chatUser)
            // console.log(`disconnected ${socket.id} chatUser=`, chatUser.username, "socket.user=",socket.chatUser)
            io.emit("message",  formatMessage(botName,` user ${socket.chatUser} has left a chat`,  userTimeZone, userLang))
          
                if(chatUser) {
                  console.log(`${chatUser.username} disconnected from ${chatUser.room} because reason: ${reason}`)
                }else{
                  console.log(`Disconnected because reason: ${reason}`)
                }
                if (chatUser) {
                  io.to(chatUser.room).emit(
                    "message",
                    formatMessage(botName, `${chatUser.username} has left the chat because: ${reason}`, userTimeZone, userLang)
                  );
                  // Send users and room info
                  io.to(chatUser.room).emit("roomUsers", {
                    room: chatUser.room,
                    chatUsers: getRoomUsers(chatUser.room),
                  });
                }
          });
        
          socket.on("joinLobby", () =>  {
  
            // broadcast updates
                setInterval(() => {
  
                  const postingTime = new Date();
                  const localTime = postingTime.toLocaleString( userLang, {timeZone: userTimeZone } )
  
                  // const localTime = moment.tz(socket.timeZone).format('dddd, MMMM D, YYYY h:mm:ss a');
  
                socket.emit('timeData', localTime);}, 1000);
                socket.emit("timeClock", `It's about time... ${socket.chatUser}, Connected= ${socket.connected}, socketID: ${socket.id}`)
          });
        
          socket.on("joinRoom", ({ username, room, _id}) => {
            // userTimeZone = socket.timeZone
            // console.log("join room", userTimeZone)
            const chatUser = userJoin(socket.id, username, room, _id);
            console.log(`joined ${chatUser.room}`, chatUser, socket.request.session.guestID)
            socket.join(chatUser.room);
  
             // Send users and room info
             io.to(chatUser.room).emit("roomUsers", {
              room: chatUser.room,
              chatUsers: getRoomUsers(chatUser.room),
            });
  
            // Broadcast when a user connects
            socket.broadcast
            .to(chatUser.room)
            .emit(
              "message",  formatMessage(botName,`${chatUser.username} has joined the chat`, userTimeZone, userLang)
            );
      
            // fetch recent messages for the room from the database
            ChatMessage.find({room: chatUser.room })
              .sort({ timestamp: -1 })
              .limit(15)
              .exec(async (err, messages) => {
                if (err) {
                  console.log(err)
                } else {
                  // console.log("CHATmessage", messages)
                  const formattedMessages = []; 
                for (const message of messages) {
                  try {
                    const user = await User.findById(message.user);
                    let username;
                  
                    if (user) {
                      username = user.userName;
                    } else {
                      const guestUser = await GuestUserID.findById(message.user);
                      if (guestUser) {
                        username = guestUser.userName;
                      }
                    }
                    // console.log("awaited username=", username, message.user)
                      const formattedMessage = {
                        text: message.message,
                        username: username,
                        time: (message.timestamp).toLocaleString( userLang, {timeZone: userTimeZone } ),
                      };
                      formattedMessages.push(formattedMessage);
                    } catch (error) {
                      console.error("Error fetching user data", error);
                    }
                  }
                  
                  socket.emit("recentMessages", formattedMessages.reverse());
  
                }
            });
  
  
            // Listen for chatMessage
  
            socket.on("chatMessage", async (msg) => {
              // console.log("chat messages", userTimeZone)
            // console.log("socket.user=",socket.user, socket.id)
            const chatUser = getCurrentUser(socket.id);
              // console.log(user, "from getCurrentUser", socket.id)
            try {
              const newMessage = new ChatMessage({
                room: chatUser.room,
                user: chatUser._id,
                message: msg,
                timestamp: new Date(),
              });
  
              const savedMessage = await  newMessage.save();
  
              console.log(`${chatUser.room} Chat message saved:`, userTimeZone, savedMessage.message);
              io.to(chatUser.room).emit("message", formatMessage(chatUser.username, savedMessage.message,  userTimeZone, userLang));
  
            } catch(error) {
                console.error('Error saving chat message:', error);
            }
                // console.log("User=", user)
            });
  
  
           // Welcome current user
          socket.emit("message", formatMessage(botName, `Welcome to ${chatUser.room} of Live Grief Support, ${chatUser.username}.`,  userTimeZone, userLang));
  
      }); 
  });
  

    // });





       
// Get current user
function getCurrentUser(id) {
    return chatUsers.find(chatUser => chatUser.id.includes(id));
  }
  
  
  // User leaves chat
  function userLeave(id) {
    console.log("leaving socket.id=", id, chatUsers);
  
    for (const chatUser of chatUsers) {
      const socketIndex = chatUser.id.indexOf(id);
      if (socketIndex !== -1) {
        chatUser.id.splice(socketIndex, 1); // Remove the disconnected socket ID
        chatUser.userCount = chatUser.id.length; // Update the user count
        if (chatUser.userCount === 0) {
          // Remove the user when the count reaches 0
          const chatUserIndex = chatUsers.indexOf(chatUser);
          chatUsers.splice(chatUserIndex, 1);
        }
        return chatUser
      }
    }
  }
  
  // // Get room users
  function getRoomUsers(room) {
    return chatUsers.filter(chatUser => chatUser.room === room);
  }
  
  // // Join user to chat
  function userJoin(id, username, room, _id) {
    const existingChatUser = chatUsers.find((chatUser) => chatUser.username === username && chatUser.room === room);
  
    if (existingChatUser) {
      existingChatUser.userCount++;
      existingChatUser.id.push(id);
      return existingChatUser;
    }
    const chatUser = { id: [id], username, room, _id, userCount: 1 };
    chatUsers.push(chatUser);
    return chatUser;
  }
  

    return io;
}