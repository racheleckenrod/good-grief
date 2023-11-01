const { session } = require("passport");

module.exports = {
    getLobby: (req, res, next) => {
        if (req.user) {
          const _id = req.user._id
          res.render("lobby.ejs", { userName: req.user.userName, _id: _id, room: "The Lobby", session: req.session });
        } else {
          const _id = req.session._id

          res.render("lobby.ejs", { userName: req.session.userName, _id: _id, room: "The Lobby", session: req.session })
        }
       
      next()
    },
    getRoom: (req, res, next) => {
     
      const _id = req.user._id
     
      res.render("chatRoom.ejs", { user: req.user, _id: _id, room: req.params.room, session: req.session });
      next();

    },
   
  };
  