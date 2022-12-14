module.exports = {
    ensureAuth: function (req, res, next) {
      if (req.isAuthenticated()) {
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
  