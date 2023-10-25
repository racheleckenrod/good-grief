const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const cors = require('cors')
require("dotenv").config({ path: "./config/.env" });
const PORT = process.env.PORT;

app.use(cors())

const moment = require('moment-timezone');
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const methodOverride = require("method-override");
const flash = require("express-flash");
const logger = require("morgan");
const connectDB = require("./config/database");
const mainRoutes = require("./routes/main");
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const chatRoutes = require("./routes/chat");
// const chatsController = require("./controllers/chats")

const rooms = ["The Lobby", "Child", "Parent", "Spouse/Partner", "Sibling", "Suicide", "Terminal", "Friend", "Community Tragety", "Different"]
const users = [];
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

// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

// Custom namespace
const lobby2 = io.of("/lobby2");

lobby2.use(wrap(sessionMiddleware));
lobby2.use(wrap(passport.initialize()));
lobby2.use(wrap(passport.session()));

lobby2.use((socket, next) => {
  if (socket.request.user) {
    console.log(socket.request.user.userName, socket.id,"lobby2.use")
    socket.user = socket.request.user.userName
    next();
  } else {
    next(new Error('unauthorized by rachel'))
  }
});

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {
  if (socket.request.user) {
    console.log(socket.request.user.userName, "io.use socket")
    // socket.user = socket.request.user.userName;
    // socket.userTimeZone = socket.request.session.timezone || 'UTC';
    // console.log(socket.request.session, "TIMEZONE")
    next();
  } else {
    next(new Error('unauthorized by rachel'))
  }
});
 

// Namespace
// I dont think I need the namespace
// const lobbyNamespace = io.of("/lobby");

// lobbyNamespace.use((socket, next) => {
//   if (socket.request.user) {
//     console.log(socket.request.user.userName, "io.use lobbyNamespace socket")
//     socket.user = socket.request.user.userName
//     next();
//   } else {
//     next(new Error('unauthorized by rachel'))
//   }
// });


// lobbyNamespace.on("connection", (socket) => {
//   console.log("LOBBBBBBY", socket.user)

//   // socket.emit("hello", "world")
//   socket.join(rooms)
//   console.log("LOBBBBBBY", socket.user)
//   console.log("Hee HOHO hee", socket.user, socket.rooms)

// })


// // // Join user to chat
// function userJoin(id, username, room, _id) {
//   const user = { id, username, room, _id };
//   users.push(user);
//   return user;
// }

// // Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// // User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// // Get room users
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

// // Join user to chat
function userJoin(id, username, room, _id) {
  const user = { id, username, room, _id };
  users.push(user);
  return user;
}

// // // Get current user
// function getCurrentUser(id) {
//   return users.find(user => user.id === id);
// }

// // User leaves chat
// function userLeave(id) {
//   const index = users.findIndex(user => user.id === id);
//   if (index !== -1) {
//     return users.splice(index, 1)[0];
//   }
// }

// // // Get room users
// function getRoomUsers(room) {
//   return users.filter(user => user.room === room);
// }

 
// run when Lobby connects
lobby2.on("connection", (socket) => {
  // console.log(`${socket.request.user.userName} connected on lobby2 in room ${socket.request.params}`, socket.id, socket.nsp.name);

  // lobby2.on('connect', (socket) => {
    // socket.on("whoami", (cb) => {
    //   cb(socket.request.user ? socket.request.user.username : "");
    // });
    // })
  
    const session = socket.request.session;
    const userTimeZone = socket.request.user.timezone
    console.log(`lobby2 saving ${socket.request.user.userName} in socket: ${socket.id} in session: ${session.id}`);
    session.socketID = socket.id;
    session.save();
  

  // broadcast updates


setInterval(() => {
  const localTime = moment.tz(userTimeZone).format('dddd, MMMM D, YYYY h:mm:ss a');

  
  lobby2.emit('timeData', localTime);}, 1000);

  lobby2.emit("hi", formatMessage(`${socket.request.user.userName}`,"hello everyone!   ", userTimeZone));

  lobby2.emit("timeClock", `It's about time... ${socket.request.user.userName}, Connected= ${socket.connected}, socketID: ${socket.id}`)

  lobby2.emit("messageLobby", formatMessage(botName, `Welcome to Live Grief Support Lobby, ${socket.request.user.userName}.`, userTimeZone));

// lobby2.on("connection", (socket) => {
  console.log(`${socket.request.user.userName} connected on lobby2 in room ${socket.request}`, socket.id, socket.nsp.name);
  // console.log(session, "LOBBY2");

// handle connections -lobby 
// io.on('connection', socket => {
  // console.log('Client connected', new Date().toLocaleTimeString(), socket.id, socket.handshake.headers.referer);

// connect lobby2 to all other rooms
  // lobby2.in(session.socketID).socketsJoin(rooms);

  socket.join("The Lobby")
  // console.log(socket.rooms)

  lobby2.on("disconnect", (reason) => {
    const user = userLeave(socket.id);

    console.log(`${socket.user} disconnected because ${reason}`)
  })
});
 
 

// // // Run when CHAT client connects
io.on("connection", (socket) => {
  console.log('New WS server.js Connection', "socket.connected=", socket.connected, socket.id,socket.handshake.headers.referer);

  // socket.data.username = socket.request.user.userName
  const session = socket.request.session;
  const userTimeZone = socket.request.user.timezone
  console.log(`io saving ${socket.request.user.userName} sid ${socket.id} in session ${session.id}`);
  session.socketID = socket.id;
  // session.room = user.room
  session.save();

// handle connections -lobby 
// io.on('connection', socket => {
  console.log(`Client ${socket.request.user.userName} connected`, new Date().toLocaleTimeString(), socket.id, socket.handshake.headers.referer);

  socket.emit('timeClock', `It's about time... ${socket.request.user.userName} Connected = ${socket.connected}`);

lobby2.on("connection", (socket) => {
  console.log(`${socket.request.user.userName} connected on lobby2 in room ${socket.handshake.params}`, socket.id, socket.nsp.name);})
//   console.log(session, "LOBBY2");
//   console.log("GOGOOGOG", socket.handshake._query)

  socket.on("joinRoom", ({ username, room, _id }) => {
    const user = userJoin(session.socketID, username, room, _id);
    console.log("pkkkkkkkk", user)
    socket.join(user.room);


// Welcome current user
    socket.emit("message", formatMessage(botName, `Welcome to ${user.room} Live Grief Support, ${user.username}!`, userTimeZone));


 // attempting to send from one namespace to the other
//  lobby2.emit("testmessage",  formatMessage(botName, `Welcome to TEST ${user.room} Live Grief Support, ${user.username}!`, userTimeZone));

// // Broadcast when a user connects
//     io.broadcast
//       .to(user.room)
//       .to("lobby")
//       .emit(
//         "message",  formatMessage(botName,`${user.username} has joined the chat`)
//       );

      console.log(users)


    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
    console.log(botName, room, (user.room))

//   });



//   // Listen for chatMessage

  socket.on("chatMessage", (msg) => {
    console.log(socket.id)
    const user = getCurrentUser(socket.id);

    console.log("User=", user)
       
    io.to("The Lobby").to("/lobby2").emit("message", formatMessage(user.username, msg, userTimeZone));
  });

});
// Runs when client disconnects
  socket.on("disconnect", (reason) => {
    // io.emit("message",  formatMessage(botName,'a user has left the chat'))
    const user = userLeave(socket.id);
    if(user) {
      console.log(`${user.username} disconnected from ${user.room} because reason: ${reason}`)
    }else{
      console.log(`Disconnected because reason: ${reason}`)
    }
   

//     if (user) {
//       io.to(user.room).to("lobby").emit(
//         "message",
//         formatMessage(botName, `${user.username} has left the chat because: ${reason}`)
//       );


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
});
// })

//Setup Routes For Which The Server Is Listening
app.use("/", mainRoutes);
app.use("/post", postRoutes);
app.use("/comment", commentRoutes);
// app.post("/chat/:room", chatsController.getRoom);
app.use("/chat/:room", chatRoutes);

app.use("/chat", chatRoutes);
// app.get("/chat",function(req, res, next) {
//   console.log("hhh",req.user.userName, req.query )
//   res.render('lobby.ejs', {username : req.user.userName, room: "POP"});
// });


server.listen(PORT, () => { console.log(`Server running on port ${PORT}`)});

