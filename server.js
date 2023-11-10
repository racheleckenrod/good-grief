const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  pingInterval: 25000,
  pingTimeout: 5000,
});
const socketIoCookie = require("socket.io-cookie")
const cors = require('cors');
require("dotenv").config({ path: "./config/.env" });
const PORT = process.env.PORT;

app.use(cors())

// const moment = require('moment-timezone');
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const expressSocketIoSession = require("express-socket.io-session");
const methodOverride = require("method-override");
const flash = require("express-flash");
const logger = require("morgan");
const cookieParser = require('cookie-parser')
const connectDB = require("./config/database");
const mainRoutes = require("./routes/main")(io);
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const chatRoutes = require("./routes/chat");
const GuestUserID = require("./models/GuestUserID");
const generateGuestID = require("./utils/guestUserIDs");
const formatMessage = require("./utils/messages");

const ChatMessage = require('./models/ChatMessage');
const User = require("./models/User");

const chatUsers = [];
const botName = "Grief Support Bot";


// const {
//   userJoin,
//   getCurrentUser,
//   userLeave,
//   getRoomUsers,
//   getAllUsers,
// } = require("./utils/users");

// new setup using sessionMiddleware for socket.io:
const sessionMiddleware = session({
  secret: "goPackers",
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
})

//Use .env file in config folder
require("dotenv").config({ path: "./config/.env" });

// Passport config
require("./config/passport")(passport);

//Connect To Database
connectDB();


//Static Folder
app.use(express.static(path.join(__dirname, "public")));
// server.use(express.static("public"))


//Using EJS for views
app.set("view engine", "ejs");

app.set('socketio', io);
app.io = io

//Body Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Logging
app.use(logger("dev"));

//Use forms for put / delete
app.use(methodOverride("_method"));

// continued set up of sessions with the sessionMiddleware:
app.use(sessionMiddleware)

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());


//Use flash messages for errors, info, ect...
app.use(flash());

// cookies
app.use(cookieParser());

// create guestUserID for guests
app.use( async (req, res, next) => {

  if (req.isAuthenticated()) {
    req.session.status = 'loggedIn';
  } else {
    req.session.status = 'guest'
    const guestIDCookie = req.cookies.guestID;
    if (guestIDCookie) {
      const guestUser = await GuestUserID.findOne({ guestUserID: guestIDCookie });
      if (guestUser) {
        req.session.guestUser = guestUser;
        req.session.userName = guestUser.userName;
        req.session._id = guestUser._id
      }
    }
  }

  console.log("app.use", req.session.status, "req.user=", req.user ? req.user.userName : 'none');
  next();
})

// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.engine.use(sessionMiddleware);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use(expressSocketIoSession(sessionMiddleware));
io.use(async (socket, next) => {
  const userTimeZone = socket.handshake.query.userTimeZone;
  const userLang = socket.handshake.query.userLang;
  // console.log("io.use userLang=", userLang, userTimeZone);

  socket.request.session.userTimeZone = userTimeZone;
  socket.request.session.userLang = userLang;

 
  // check for guestID cookie
  const guestIDCookie = socket.handshake.headers.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('guestID='));

  if (guestIDCookie) {
    const guestID = guestIDCookie.split('=')[1];
    socket.request.session.guestID = guestID;

    const guestUser = await GuestUserID.findOne({ guestUserID: guestID });

    if (guestUser) {
      socket.request.session.guestUser = guestUser
      socket.data = { guestUser: guestUser }
    }
  } else {
    // generate new guestID
    const newGuestUser = await generateGuestID(socket.request.session.timeZone, socket.request.session.userLang);
    socket.request.session.guestUser = newGuestUser
    socket.request.session.guestID = newGuestUser.guestID
    socket.data = { guestUser: newGuestUser };
    
    // emit new guestID to client to set a cookie
    socket.emit('setCookie', newGuestUser.guestID);
    console.log("emitted cookie?", newGuestUser.guestID)
  }

  if (socket.request.user) {
    socket.chatUser = socket.request.user.userName;
  } else {
    socket.chatUser = socket.request.session.guestUser.userName;
  }
  // console.log("socket.chatUser=", socket.chatUser)

  const session = socket.request.session;
  session.save();
  console.log("Big check session=", session, "end")
  
  next();
});


// Get current user
function getCurrentUser(id) {
  return chatUsers.find(chatUser => chatUser.id.includes(id));
}


// User leaves chat
function userLeave(id) {

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
          // console.log("chatUser from disconnect", chatUser)
          // console.log(`disconnected ${socket.id} chatUser=`, chatUser.username, "socket.user=",socket.chatUser)
          // io.emit("message",  formatMessage(botName,` user ${socket.chatUser} has left a chat`,  userTimeZone, userLang))
        
              if(chatUser) {
                console.log(`${chatUser.username} disconnected from ${chatUser.room} because reason: ${reason}`)
              }else{
                console.log(`Disconnected because reason: ${reason}`)
              }
              if (chatUser) {
                io.to(chatUser.room).emit(
                  "message",
                  formatMessage(botName, `${chatUser.username} has left the chat because: ${reason}`)
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

              socket.emit('timeData', localTime);}, 1000);
              socket.emit("timeClock", `It's about time... ${socket.chatUser}, Connected= ${socket.connected}, socketID: ${socket.id}`)
        });
      
        socket.on("joinRoom", ({ username, room, _id}) => {
          
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
            "message",  formatMessage(botName,`${chatUser.username} has joined the chat`)
          );
    
          // fetch recent messages for the room from the database
          ChatMessage.find({room: chatUser.room })
            .sort({ timestamp: -1 })
            .limit(15)
            .exec(async (err, messages) => {
              if (err) {
                console.log(err)
              } else {
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
                    const formattedMessage = {
                      text: message.message,
                      username: username,
                      time: (message.timestamp),
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
            // console.log("chat messages", userTimeZone, socket.request.session.userTimeZone)
          // console.log("socket.user=",socket.user, socket.id)
          const chatUser = getCurrentUser(socket.id);
            // console.log(chatUser, "from getCurrentUser", socket.id, userTimeZone, socket.request.session.userTimeZone)
          try {
            const newMessage = new ChatMessage({
              room: chatUser.room,
              user: chatUser._id,
              message: msg,
              timestamp: new Date(),
            });

            const savedMessage = await  newMessage.save();

            console.log(`${chatUser.room} Chat message saved:`, userTimeZone, savedMessage.message);
            io.to(chatUser.room).emit("message", formatMessage(chatUser.username, savedMessage.message));
          } catch(error) {
              console.error('Error saving chat message:', error);
          }
          });


         // Welcome current user
        socket.emit("message", formatMessage(botName, `Welcome to the room "${chatUser.room}" of Good Grief Live, ${chatUser.username}.`));

    }); 
});

//Setup Routes For Which The Server Is Listening
app.use("/", mainRoutes);
app.use("/post", postRoutes);
app.use("/comment", commentRoutes);
app.use("/chat/:room", chatRoutes);

app.use("/chat", chatRoutes);


// module.exports.io = io;

server.listen(PORT, () => { console.log(`Server running on port ${PORT}`)});

