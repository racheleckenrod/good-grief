const { session } = require("passport");

module.exports = {
    getLobby: (req, res, next) => {
        // console.log("lobby test", req.user, req.query._id, req.params, req.session)
        if (req.user) {
          const _id = req.user._id
          console.log("getLobby",_id, req.user._id)
          res.render("lobby.ejs", { userName: req.user.userName, _id: _id, room: "The Lobby", session: req.session });
        } else {
          const _id = req.session._id
          console.log("getLobby", _id, req.session._id)

          res.render("lobby.ejs", { userName: req.session.userName, _id: _id, room: "The Lobby", session: req.session })
        }
       
      next()
    },
    getRoom: (req, res, next) => {
      // console.log("from getRoom",req.user.userName, req.query._id, req.user._id, req.params.room)
      // var sess = req.session
      const _id = req.user._id
      // sess.room = req.params.room
      // sess._id = req.query._id

      // console.log("getRoom _id=", _id)
      res.render("chatRoom.ejs", { user: req.user, _id: _id, room: req.params.room, session: req.session });
      // res.render("chatRoom.ejs", {  }(req));
      next();

    },
   
  };
  


// just in case I want to go backwards for a sec: this is what it was
  // getRoom: (req, res, next) => {
  //   console.log("from getRoom",req.user,req.user.userName, req.user._id, req.params)
  //   const _id = req.user._id
  //   console.log("getRoom _id=", _id)
  //   res.render("chatRoom.ejs", { user: req.user, _id: _id });
  //   // res.render("chatRoom.ejs", {  }(req));

  // },