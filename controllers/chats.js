module.exports = {
    getLobby: (req, res) => {
        console.log("lobby test", req.user.userName)
      res.render("lobby.ejs", { user: req.user });
    },
    getRoom: (req, res, next) => {
      console.log("from getRoom",req.user,req.user.userName, req.params)
      res.render("chatRoom.ejs", { user: req.user });
      // res.render("chatRoom.ejs", {  }(req));

    },
  };
  