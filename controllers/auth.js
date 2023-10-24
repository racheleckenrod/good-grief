const passport = require("passport");
const validator = require("validator");
const User = require("../models/User");

exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect("/profile");
  }
  res.render("login", {
    title: "Login",
    user: req.user,
  });
};

exports.postLogin = (req, res, next) => {
  const validationErrors = [];
  
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (validator.isEmpty(req.body.password))
    validationErrors.push({ msg: "Password cannot be blank." });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/login");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  req.session.timezone = req.body.timezone || "UTC"
  console.log("timezone:", req.session.timezone, req.body.timezone, req.session)

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("errors", info);
      return res.redirect("/login");
    }

    const userTimeZone = req.body.timezone;

    

    console.log(req.session, "first check")
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", { msg: "Success! You are logged in." });
      console.log(req.body.timezone, "second check")
      User.findByIdAndUpdate(req.user.id, { $set: { timezone: userTimeZone }}, (err, user) => {
        if (err) {
          return next(err);
        }
      });
      res.redirect(req.session.returnTo || "/profile");
    });
  })(req, res, next);
};

exports.logout = (req, res) => {
  const username = "unknown" || req.user.userName
  req.logout(() => {
    console.log(`User ${username} has logged out.`)
  })
  req.session.destroy((err) => {
    if (err)
      console.log("Error : Failed to destroy the session during logout.", err);
    req.user = null;
    res.redirect("/");
  });
};

exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect("/welcome");
  }
  res.render("signup", {
    title: "Create Account",
    user: req.user,
  });
};

exports.postSignup = (req, res, next) => {
  console.log("calling exports.postSignup", req.body.userName)
  const validationErrors = [];
  // if (validator.blacklist(req.body.userName, '\/s\[\/s\]'))
  //   validationErrors.push({ msg: "Please enter a valid user name without spaces." });
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (!validator.isLength(req.body.password, { min: 8 }))
    validationErrors.push({
      msg: "Password must be at least 8 characters long",
    });
  if (req.body.password !== req.body.confirmPassword)
    validationErrors.push({ msg: "Passwords do not match" });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("../signup");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  const user = new User({
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
  });

  User.findOne(
    { $or: [{ email: req.body.email }, { userName: req.body.userName }] },
    (err, existingUser) => {
      if (err) {
        return next(err);
      }
      if (existingUser) {
        req.flash("errors", {
          msg: "Account with that email address or username already exists.",
        });
        return res.redirect("../signup");
      }
      user.save((err) => {
        if (err) {
          return next(err);
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          res.redirect("/welcome");
        });
      });
    }
  );
};

exports.postFeedback = (req, res, next) => {
  console.log("exports.postFeedback")
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });

  if (!validator.isLength(req.body.userName, { min: 1 }))
  validationErrors.push({
    msg: "Please enter your name.",
  });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/#footer");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

};


// manipulation of user Name tool tip
// userNameHelp.addEventListener('click', () => {console.log('namespace')})