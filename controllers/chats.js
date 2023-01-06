module.exports = {
    getLobby: (req, res, next) => {
        console.log("lobby test", req.user.userName)
        const _id = req.user._id
      res.render("lobby.ejs", { user: req.user, _id: _id });
      next()
    },
    getRoom: (req, res, next) => {
      console.log("from getRoom",req.user.userName, req.query._id, req.user._id, req.params.room)
      var sess = req.session
      const _id = req.user._id
      sess.room = req.params.room
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