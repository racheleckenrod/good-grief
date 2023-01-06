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

// app.set('socketio', io);

//Body Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// // moment to format time
// app.use((req, res, next) => {
//   res.locals.moment = moment
// })

//Logging
app.use(logger("dev"));


// supposedly to pass the req variables through
// app.use(function(req, res, next){
//   res.locals.user = req.user;
//   // res.locals.authenticated = ! req.user.anonymous;
//   next();
// });

const myLogger = function (req, res, next) {
  console.log('LOGGED')
  next()
}
app.use(myLogger)
//Use forms for put / delete
app.use(methodOverride("_method"));


// // Setup Sessions - stored in MongoDB
// app.use(
//   session({
//     secret: "goPackers",
//     resave: false,
//     saveUninitialized: false,
//     store: new MongoStore({ mongooseConnection: mongoose.connection }),
//   })
// );

// continued set up of sessions with the sessionMiddleware:
app.use(sessionMiddleware)

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());


//Use flash messages for errors, info, ect...
app.use(flash());


// Custom namespace
const lobby2 = io.of("/lobby2");
const parent = io.of("/lobby2/parent")

// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

lobby2.use(wrap(sessionMiddleware));
lobby2.use(wrap(passport.initialize()));
lobby2.use(wrap(passport.session()));

lobby2.use((socket, next) => {
  if (socket.request.user) {
    console.log(socket.request.user.userName, socket.request.session.room, "io.use socket", socket.id)
    next();
  } else {
    next(new Error('unauthorized by rachel'))
  }
});

// lobby2.use(function(socket, next) {
//   var handshakeData = socket.handshake;
//   console.log(handshakeData._query, "handshakeData")
//   // make sure the handshake data looks good as before
//   // if error do this:
//     // next(new Error('not authorized');
//   // else just call next
//   next();
// });
 
lobby2.on('connection', (socket) => {
  const session = socket.request.session
  console.log(`new ${  socket.request.session.room  } connection ${socket.id} ${socket.request.user.userName}`, socket.request.session);
  
  // const session = socket.request.session;
  console.log(`saving sid ${socket.id} in session ${session.id}`);
  session.socketID = socket.id;
  // session.room = 
  session.save();
  console.log("TRYHANDSHAKE", socket.request.session.room,session.socketID)

  lobby2.on("whoami", (cb) => {
    console.log("whooooooo")
    cb(socket.request.user ? socket.request.user.username : "");
  });



  // other things to do on connect belong only in here I think. this is the namespace. join all rooms

    // what name to use for the socket to listen for the joinAll from the "lobby" room connection.




  // trying this
  console.log(`${socket.request.user.userName} connected on lobby2 in room ${socket.request.session.room}`, socket.id, session.socketID, socket.nsp.name);
  console.log(session, "LOBBY2");
  console.log("GOGOOGOG", socket.request.session.room)

  // broadcast updates
// setInterval(() => io.emit('time', "about time"), 1000)
setInterval(() => lobby2.emit('timeData', new Date().toLocaleTimeString()), 1000);
  lobby2.emit("hi", formatMessage("lobby2", "hello everyone!   "));

  // io.emit("hi", "hello everyone!   ");



// handle connections -lobby 
// io.on('connection', socket => {
  console.log('Client connected', new Date().toLocaleTimeString(), session.socketID, socket.handshake.headers.referer);
  lobby2.emit('timeClock', `It's about time... Connected = ${socket.connected} socket.id= ${session.socketID}`);
  // socket.join(rooms)
  // console.log(rooms)

 
  // io.on("connection", (socket) => console.log("GOGOOGOG", req.params.room ));  // myValue

 

// // // Run when client connects
// io.on("connection", (socket) => {
  // console.log('New WS server.js Connection', "socket.connected=", socket.connected, socket.id,socket.handshake.headers.referer);

  // socket.on("lobbyJoin", () => {
  //   socket.join("Child", "Parent")
  // })
  
  lobby2.on("joinRoom", ({ username, room, _id }) => {
    const user = userJoin(session.socketID, username, session.room, _id);
    console.log("pkkkkkkkk", user.room)
    socket.join(user.room);


// Welcome current user
    io.emit("message", formatMessage(botName, `Welcome to Live Grief Support, ${user.username}!`));

    io.emit("messageLobby", formatMessage(botName, `message to lobby`));
    io.emit("numOfUsers", formatMessage(botName, `message of confusion to lobby`));

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
// });
})

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getAllUsers,
} = require("./utils/users");

const rooms = ["Child", "Parent"]



// Set static folder-- already done above but in a different way.. Need both??
// app.use(express.static("public"));


const botName = "Grief Support Bot";

 





// lobby2.on("connection", (socket) => {
//   console.log(`${socket.request.user.userName} connected on lobby2 in room ${socket.handshake.params}`, socket.id, socket.nsp.name);
//   console.log(session, "LOBBY2");
//   console.log("GOGOOGOG", socket.handshake._query)

//   // broadcast updates
// // setInterval(() => io.emit('time', "about time"), 1000)
// setInterval(() => io.emit('timeData', new Date().toLocaleTimeString()), 1000);
//   io.emit("hi", formatMessage("lobby2", "hello everyone!   "));

//   // io.emit("hi", "hello everyone!   ");



// // handle connections -lobby 
// // io.on('connection', socket => {
//   console.log('Client connected', new Date().toLocaleTimeString(), socket.id, socket.handshake.headers.referer);
//   io.emit('timeClock', `It's about time... Connected = ${socket.connected} socket.id= ${socket.id}`);
//   // socket.join(rooms)
//   // console.log(rooms)

 
//   // io.on("connection", (socket) => console.log("GOGOOGOG", req.params.room ));  // myValue

 

// // // // Run when client connects
// // io.on("connection", (socket) => {
//   // console.log('New WS server.js Connection', "socket.connected=", socket.connected, socket.id,socket.handshake.headers.referer);

//   // socket.on("lobbyJoin", () => {
//   //   socket.join("Child", "Parent")
//   // })
  
//   io.on("joinRoom", ({ username, room, _id }) => {
//     const user = userJoin(socket.id, username, room, _id);
//     console.log("pkkkkkkkk", user)
//     socket.join(user.room);


// // Welcome current user
//     io.emit("message", formatMessage(botName, `Welcome to Live Grief Support, ${user.username}!`));

//     io.emit("messageLobby", formatMessage(botName, `message to lobby`));
//     io.emit("numOfUsers", formatMessage(botName, `message of confusion to lobby`));

// // Broadcast when a user connects
//     io.broadcast
//       .to(user.room)
//       .to("lobby")
//       .emit(
//         "message",  formatMessage(botName,`${user.username} has joined the chat`)
//       );



// //     // Send users and room info

//     io.to(user.room).to("lobby").emit("roomUsers", {
//       room: user.room,
//       users: getRoomUsers(user.room),
//     });
//     console.log(botName, room, getRoomUsers(user.room))


//   });






// //   // Listen for chatMessage

//   io.on("chatMessage", (msg) => {
//     const user = getCurrentUser(socket.id);
       
//     io.to(user.room).emit("message", formatMessage(user.username, msg, user.room));
//   });


// // Runs when client disconnects
//   io.on("disconnect", (reason) => {
//     // io.emit("message",  formatMessage(botName,'a user has left the chat'))
//     const user = userLeave(socket.id);
//     if(user) {
//       console.log(`${user.username} disconnected from ${user.room} because reason: ${reason}`)
//     }else{
//       console.log(`Disconnected because reason: ${reason}`)
//     }
   


//     if (user) {
//       io.to(user.room).to("lobby").emit(
//         "message",
//         formatMessage(botName, `${user.username} has left the chat because: ${reason}`)
//       );


//       // Send users and room info

//       io.to(user.room).emit("roomUsers", {
//         room: user.room,
//         users: getRoomUsers(user.room),
//       });
//     }
//   });
// });
// });


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




