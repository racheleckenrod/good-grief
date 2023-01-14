const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const app = express();
// const moment = require("moment");
const server = http.createServer(app);
const io = socketio(server);
const cors = require('cors')
require("dotenv").config({ path: "./config/.env" });
const PORT = process.env.PORT;

app.use(cors())

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
const chatRoutes = require("./routes/chat")
const chatsController = require("./controllers/chats")
const users = require("./utils/users")

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getAllUsers,
} = require("./utils/users");

const rooms = ["Child", "Parent"]


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
    console.log(socket.request.user.userName, "lobby2.use lobby2 socket")
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
    socket.user = socket.request.user.userName
    next();
  } else {
    next(new Error('unauthorized by rachel'))
  }
});
 

// Set static folder-- already done above but in a different way.. Need both??
// app.use(express.static("public"));


const botName = "Grief Support Bot";

 

lobby2.on("connection", (socket) => {
  console.log(`${socket.request.user.userName} connected on lobby2 in room ${socket.request.params}`, socket.id, socket.nsp.name);
  // console.log(session, "LOBBY2");

  // lobby2.on('connect', (socket) => {
    console.log(`new LOBBBBY2 connection ${socket.id} ${socket.request.user.userName}`);
    // socket.on("whoami", (cb) => {
    //   cb(socket.request.user ? socket.request.user.username : "");
    // });
  
    const session = socket.request.session;
    console.log(`lobby2 saving sid ${socket.id} in session ${session.id}`);
    session.socketID = socket.id;
    session.save();
  // })

  // broadcast updates
// setInterval(() => lobby2.emit('time', "about time"), 1000)
  // lobby2.emit('timeClock', `It's about time... Connected = ${socket.connected} socket.id= ${socket.id}`);
setInterval(() => lobby2.emit('timeData', new Date().toLocaleTimeString()), 1000);

  lobby2.emit("hi", "hello everyone!   ");

  lobby2.emit("messageLobby", formatMessage(botName, `Welcome to Live Grief Support, ${socket.request.user.userName}!`));

// handle connections -lobby 
// io.on('connection', socket => {
  console.log('Client connected', new Date().toLocaleTimeString(), socket.id, socket.handshake.headers.referer);
  // lobby2.emit('timeClock', `It's about time... Connected = ${socket.connected} socket.id= ${socket.id}`);
  // socket.join(rooms)
  // console.log(rooms)
});
 
 

// // // Run when client connects
io.on("connection", (socket) => {
  console.log('New WS server.js Connection', "socket.connected=", socket.connected, socket.id,socket.handshake.headers.referer);

  
  
  // io.on('connection', (socket) => {

    console.log("Hee hee", socket.user, socket.rooms)
    console.log(`io.on new connection ${socket.id} userName= ${socket.request.user.userName}, socket.handshake.header.referer= ${socket.handshake.headers.referer}`);
    socket.on("whoami", (cb) => {
      console.log("whoami")
      cb(socket.request.user ? socket.request.user.userName : "");
    });
  
    // socket.data.username = socket.request.user.userName
    const session = socket.request.session;
    console.log(`***saving sid ${socket.id} in session ${session.id} for userName ${socket.request.user.userName} room= ${socket.request.session.room}`);
    session.socketID = socket.id;
    // session.room = socket.request.session.room
    // session.save();
  
     
    // console.log(`NEW ${  socket.request.session.room  } connection ${socket.id} ${socket.request.user.userName}`, socket.request.session, socket.request.session._id);
    
    // console.log(`saving sid ${socket.id} in session ${session.id}`);
    // session.socketID = socket.id;
    // session.room = 
    session.save();
    console.log("TRYHANDSHAKE", socket.request.session.room,session.socketID)
  

// Welcome current user
    io.emit("message", formatMessage(botName, `Welcome to Live Grief Support, ${socket.request.user.userName}!`));

    io.emit("numOfUsers", formatMessage(botName, `message of confusion to lobby`));







  io.on("joinRoom", ({ username, room, _id }) => {
    const user = userJoin(socket.id, username, room, _id);
    console.log("pkkkkkkkk", user)
    socket.join(user.room);

    // Broadcast when a user connects
    io.broadcast
      .to(user.room)
      .to("lobby")
      .emit(
        "message",  formatMessage(botName,`${user.username} has joined the chat`)
      );


//     // Send users and room info

io.to(user.room).to("lobby").emit("roomUsers", {
  room: user.room,
  users: getRoomUsers(user.room),
});
console.log(botName, room, getRoomUsers(user.room))


});

//   // Listen for chatMessage

  io.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
       
    io.to(user.room).emit("message", formatMessage(user.username, msg, user.room));
  });


// Runs when client disconnects
  io.on("disconnect", (reason) => {
    // io.emit("message",  formatMessage(botName,'a user has left the chat'))
    const user = userLeave(socket.id);
    if(user) {
      console.log(`${user.username} disconnected from ${user.room} because reason: ${reason}`)
    }else{
      console.log(`Disconnected because reason: ${reason}`)
    }
   


    if (user) {
      io.to(user.room).to("lobby").emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat because: ${reason}`)
      );


      // Send users and room info

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });

});


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




