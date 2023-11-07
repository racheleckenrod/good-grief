const passport = require("passport");
const validator = require("validator");
const User = require("../models/User");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { link } = require("fs");

exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect("/profile");
  }
  res.render("login", {
    title: "Login",
    user: req.user,
  });
};

exports.getPasswordResetRequest = (req, res) => {
  res.render("passwordResetRequest", { title: "Password Reset Request" });
};


exports.postPasswordResetRequest = async (req, res) => {
  const validationErrors = [];
  
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (validator.isEmpty(req.body.email))
    validationErrors.push({ msg: "Password cannot be blank." });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/passwordResetRequest");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });
  try {
      // check if it is an email
      const { email } = req.body;
      if (!email) {
          req.flash('errors', 'Email is definitely required.');
          return res.redirect('/passwordResetRequest');
      }

      // check if the email is a user in the database
      const user = await User.findOne({ email });

      if (!user) {
          req.flash('errors', 'No such User found with that email address.');
          return res.redirect('/passwordResetRequest');
      }

      // generate unique reset token with expiration
      crypto.randomBytes(20, (err, buffer) => {

          if (err) {
              req.flash("errors", "Error generating reset token.");
              return res.redirect("/passwordResetRequest");
          }

            const token = buffer.toString('hex');

            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; //token expires in one hour

              // save user with the token and send email
              user.save((err) => {
                  if (err) {
                      req.flash("errors", "Error saving reset token.");
                      return res.redirect("/passwordResetRequest");
                  }
                  // send an email to the user with a link containing the token
                  const resetLink = `https://www.good-grief-live.com/passwordReset/${token}`;

                  // Create a Nodemailer transporter
                  const transporter = nodemailer.createTransport({
                    service: "Gmail",
                    auth: {
                      user: process.env.EMAIL_USER,
                      pass: process.env.EMAIL_PASS,
                    },
                  });

                  // send the reset link in the email
                  const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: "Password Reset Request",
                    text: `Click on the following link to reset your password: ${resetLink}. It's valid for one hour.`,
                  };

                  
                  transporter.sendMail(mailOptions, (emailError) => {
                    if (emailError) {
                      console.error("Error sending password reset email", emailError);
                      req.flash('errors', 'Error sending password reset email.');
                      return res.redirect('/passwordResetRequest');
                    }

                    // Email sent successfully
                    console.log("Password reset email sent.")
                    
                    // redirect to confimation page
                    // req.flash("success", { msg: "Success! You are logged in." });
                    req.flash('success', { msg: 'Password reset request was successful! Please check your email for further instructions.' });
                    res.redirect("/passwordResetRequest");
                  });
              });
          });

  } catch (error) {
      // handle unexpected errors
      console.error(error);
      req.flash("errors", "An unexpected error occurred.");
      res.redirect("/passwordResetRequest");
  }
};


exports.getPasswordReset = async (req, res) => {
  try {
    // Extract token from URL
    const resetToken = req.params.token;

    // Query database to find user with that token
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
      
    });

      console.log("user=", user)

    if (!user) {
      // if no token or it is expired
      req.flash('errors', 'Invalid or expired password reset link.');
      return res.redirect('/passwordResetRequest');
    }

    // render reset page with user data
    res.render("passwordReset", {
      user: user,
      title: "Password Reset",
     });

  } catch (error) {
    console.error(error);
    req.flash('errors', 'An unexpected error occurred.');
    res.redirect('/passwordResetRequest');
  }
  
};



// router.post("/passwordResetConfirmation", authController.postPasswordResetConfirmation);
exports.postPasswordUpdate = async (req, res) => {
  console.log("postPasswordUpdate", req.params.token)
  const resetToken = req.params.token;

  try {
    const { newPassword, confirmPassword } = req.body;
    // console.log(newPassword, confirmPassword)
    if (newPassword !== confirmPassword) {
      req.flash('errors', 'Passwords do not match.');
      return res.redirect(`/passwordReset/${resetToken}`);
    }

    // const user = await User.findById(req.user.id);
    // Query database to find user with that token
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      // resetPasswordExpires: { $gt: Date.now() },
      
    });


    console.log("user==", user)

    if (!user) {
      req.flash('errors', 'User not found.');
      return res.redirect(`passwordReset/${resetToken}`);
    }

    user.password = newPassword;
    user.resetPasswordExpires = Date.now(0);

    await user.save();

    req.flash('success', { msg: 'Password updated successfully!'});
    req.flash('success', { msg: 'You may now login'});

    res.redirect('/login');

  } catch (error) {
    console.error(error);
    req.flash('errors', 'An unexpected error occured.');
    res.redirect(`/passwordResetRequest`);
  }
  
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

  // req.session.timezone = req.body.timezone || "UTC"
  // console.log("timezone:", req.session.timezone, req.body.timezone, req.session)

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("errors", info);
      return res.redirect("/login");
    }
    
    // console.log(req.session, "first check")
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", { msg: "Success! You are logged in." });
      // console.log(req.body.timezone, "second check")
      // User.findByIdAndUpdate(req.user.id, { $set: { timezone: userTimeZone }}, (err, user) => {
        User.findByIdAndUpdate(req.user.id, (err, user) => {

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
  console.log("calling exports.postSignup", req.body.userName, req.body.timezone)
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
    timezone: req.session.timezone,
    userLang: req.session.userLang,
    guestID: [req.session.guestID],
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