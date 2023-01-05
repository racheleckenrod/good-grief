module.exports = {
    getLobby: (req, res) => {
        console.log("lobby test", req.user.userName)
        const _id = req.user._id
      res.render("lobby.ejs", { user: req.user, _id: _id });
    },
    getRoom: (req, res, next) => {
      console.log("from getRoom",req.user,req.user.userName, req.user._id, req.query.room)
      const _id = req.user._id
      console.log("getRoom _id=", _id)
      res.render("chatRoom.ejs", { user: req.user, _id: _id, room: req.query.room });
      // res.render("chatRoom.ejs", {  }(req));

    },
  };
  