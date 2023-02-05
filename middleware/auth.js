module.exports = {
    ensureAuth: function (req, res, next) {
      if (req.isAuthenticated()) {
<<<<<<< HEAD
        console.log(`${req.user.userName} is authenticated, session is ${req.session.id}`);
=======
        console.log(`user is authenticated, session is ${req.session.id}`);
>>>>>>> 512a168 (moving ahead with changing the links to the chatrooms to contain only the room to be passed as query param)
        return next();
      } else {
        res.redirect("/");
      }
    },
    ensureGuest: function (req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      } else {
        res.redirect("/signup");
      }
    },
    ensureFeedback: function (req, res, next) {
      console.log("ensureFeedback")
      if (req.isAuthenticated()) {
        console.log("is authenticated")
        // want to go to 
        return next();
      } else if(!req.isAuthenticated()) {
        // create Guest, then 
        console.log("not authenticated")
        return res.redirect("/feedbackGuest")
      } else {
        res.redirect("/signup");
      }
    },
  };
  