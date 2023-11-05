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

const moment = require('moment-timezone');
const { DateTime } = require('luxon');
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
const mainRoutes = require("./routes/main");
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const chatRoutes = require("./routes/chat");
const GuestUserID = require("./models/GuestUserID");
const generateGuestID = require("./utils/guestUserIDs");
const formatMessage = require("./utils/messages");

const ChatMessage = require('./models/ChatMessage');
const User = require("./models/User");

const users = [];
const botName = "Grief Support Bot";

// moment.tz.setDefault('Etc/UTC')




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
  resave: false,
  saveUninitialized: false,
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

  // req.session.userTimeZone = req.cookies.userTimeZone || 'error';
 
  // if (!req.session._id) {
  //   if (!req.user) {

  //     const { guestID, userName } = await generateGuestID(req.session.userTimeZone);
  //     const guestUser = await GuestUserID.findOne({ guestUserID: guestID });

  //       if (guestUser) {
  //         req.session._id = guestUser._id;
  //         req.session.userName = guestUser.userName;
  //         req.session.guestID = guestUser.guestUserID
  //         req.session.timezone = req.cookies.userTimeZone
  //       }

  //       // req.session.timezone = timezone
  //       // console.log("app,use guestUser=", guestUser)
  //   }
  // }
  // console.log("app.use", req.session)
  next();
})

// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);


io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use(expressSocketIoSession(sessionMiddleware));

io.use((socket, next) => {
  const userTimeZone = socket.handshake.query.userTimeZone;
  socket.timeZone = userTimeZone;

  // console.log("first things", socket.request.session)
  // if (socket.request.user) {
    // console.log("second")
    // socket.user = socket.request.user.userName;
  // console.log("third")
  // } else {
    // console.log('forth')
    // socket.user = socket.request.session.userName
    // socket.guestID = socket.request.session.guestID
    // const userTimeZone = socket.request.session.timezone
    // console.log('fifth', socket.guestID, socket.request.session)
  // }

  next();
});
 

// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id.includes(id));
}

// // // User leaves chat
// function userLeave(id) {
//   console.log("leaving socket.id=", id)
//   const user = users.find((user) => user.id.some(id => id === id));
//   console.log(user)
//   if (user) {
//     user.userCount--;

//     if (user.userCount === 0){
//       const index = users.findIndex(user => user.id === id);
//   if (index !== -1) {
//     return users.splice(index, 1)[0];
//   }
//     }
//   }
  
// }

// User leaves chat
function userLeave(id) {
  console.log("leaving socket.id=", id);

  for (const user of users) {
    const socketIndex = user.id.indexOf(id);
    if (socketIndex !== -1) {
      user.id.splice(socketIndex, 1); // Remove the disconnected socket ID
      user.userCount = user.id.length; // Update the user count
      if (user.userCount === 0) {
        // Remove the user when the count reaches 0
        const userIndex = users.indexOf(user);
        users.splice(userIndex, 1);
      }
    }
  }
}

// // Get room users
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

// // Join user to chat
function userJoin(id, username, room, _id, userTimeZone) {
  const existingUser = users.find((user) => user.username === username && user.room === room);
  console.log("existingUser=", existingUser)
  if (existingUser) {
    existingUser.userCount++;
    existingUser.id.push(id);
    return existingUser;
  }
  const user = { id: [id], username, room, _id, userTimeZone, userCount: 1 };
  users.push(user);
  return user;
}

 
// run when client connects
io.on("connection", async ( socket) => {
 
    const userTimeZone = socket.timeZone
    console.log(`socket ${socket.id} connected`, userTimeZone, socket.user)
    const session = socket.request.session;
    // console.log("socket.request.session=session=", session)
    socket.data.username = socket.request.userName;
    socket.data = { guestID: socket.request.session.guestID };
    console.log("socket.data=",socket.data)
    session.save();

  

        // Runs when client disconnects
        socket.on("disconnect", (reason) => {
          const user = userLeave(socket.id);
          console.log(`disconnected ${socket.id} user=`, user, "socket.user=",socket.user)
          io.emit("message",  formatMessage(botName,` user ${socket.user} has left a chat`, userTimeZone))
        
              if(user) {
                console.log(`${user.username} disconnected from ${user.room} because reason: ${reason}`)
              }else{
                console.log(`Disconnected because reason: ${reason}`)
              }
              if (user) {
                io.to(user.room).emit(
                  "message",
                  formatMessage(botName, `${user.username} has left the chat because: ${reason}`, userTimeZone)
                );
                // Send users and room info
                io.to(user.room).emit("roomUsers", {
                  room: user.room,
                  users: getRoomUsers(user.room),
                });
              }
        });
      
        socket.on("joinLobby", () =>  {

          // broadcast updates
              setInterval(() => {

                const localTime = moment.tz(socket.timeZone).format('dddd, MMMM D, YYYY h:mm:ss a');

              socket.emit('timeData', localTime);}, 1000);
              socket.emit("timeClock", `It's about time... ${socket.user}, Connected= ${socket.connected}, socketID: ${socket.id}`)
        });
      
        socket.on("joinRoom", ({ username, room, _id, userTimeZone }) => {
          // userTimeZone = socket.timeZone
          // console.log("join room", userTimeZone)
          const user = userJoin(socket.id, username, room, _id, userTimeZone);
          console.log(`joined ${user.room}`, user, socket.request.session.guestID)
          socket.join(user.room);

           // Send users and room info
           io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room),
          });

          // Broadcast when a user connects
          socket.broadcast
          .to(user.room)
          .emit(
            "message",  formatMessage(botName,`${user.username} has joined the chat`, userTimeZone)
          );
    
          // fetch recent messages for the room from the database
          ChatMessage.find({room: user.room })
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
                      time: moment.tz(message.timestamp, socket.timeZone).format('h:mm:ss a'),
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
          const user = getCurrentUser(socket.id);
            console.log(user, "from getCurrentUser", socket.id)
          try {
            const newMessage = new ChatMessage({
              room: user.room,
              user: user._id,
              message: msg,
              timestamp: new Date(),
            });

            const savedMessage = await  newMessage.save();

            console.log(`${user.room} Chat message saved:`, userTimeZone, savedMessage.message);
            io.to(user.room).emit("message", formatMessage(user.username, savedMessage.message, userTimeZone));

          } catch(error) {
              console.error('Error saving chat message:', error);
          }
              // console.log("User=", user)
          });


         // Welcome current user
        socket.emit("message", formatMessage(botName, `Welcome to ${user.room} of Live Grief Support, ${user.username}.`, userTimeZone));

    }); 
});

//Setup Routes For Which The Server Is Listening
app.use("/", mainRoutes);
app.use("/post", postRoutes);
app.use("/comment", commentRoutes);
app.use("/chat/:room", chatRoutes);

app.use("/chat", chatRoutes);



server.listen(PORT, () => { console.log(`Server running on port ${PORT}`)});

