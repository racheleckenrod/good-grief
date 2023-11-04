const { session } = require("passport");

module.exports = {
    getLobby: (req, res, next) => {
        if (req.user) {
          // console.log("from getlobby", req.user)
          const _id = req.user._id
          res.render("lobby.ejs", { userName: req.user.userName, _id: _id, room: "The Lobby", session: req.session, guestID: null });
        } else {
          const _id = req.session._id
          const guestID = req.session.guestID
          // console.log("from get lobby", req.session, req.session.userName)
          res.render("lobby.ejs", { userName: req.session.userName, _id: _id, room: "The Lobby", session: req.session, guestID: guestID })
        }
       
      next()
    },
    getRoom: (req, res, next) => {
     
      const _id = req.user._id
     
      res.render("chatRoom.ejs", { user: req.user, _id: _id, room: req.params.room, session: req.session });
      next();

    },
   
  };
  