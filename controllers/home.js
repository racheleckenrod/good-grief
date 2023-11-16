const Post = require("../models/Post");
const Comment = require("../models/Comment")
const GuestUserID = require("../models/GuestUserID")
const Feedback = require("../models/Feedback")
const validator = require("validator");


module.exports = {
    getIndex: async (req, res) => {
      try {
        // console.log("OK", req.user._id)
        const user = req.user
        const posts = await Post.find().populate('user').sort({ likes: "desc" }).lean();
        const comments = await Comment.find().sort({ createdAt: "asc" }).lean();
        
        res.render("index.ejs", { posts: posts, comments: comments,  user: user, _id: req.user ? req.user._id : null} );
      } catch (err) {
        console.log(err)
      }
    },
    getWelcome: async (req, res) => {
      try{
        const posts = await Post.find({ user: req.user.id }).populate('user');
        const likedPosts = await Post.find({ user: req.user.id }).sort({likes: "desc"}).lean();
        const comments = await Comment.find().sort({ createdAt: "asc" }).lean()
        const _id = req.user._id
        // console.log(likedPosts, "likedPosts from getWelcome")
        res.render("welcome.ejs", { posts: posts, comments: comments, user: req.user, _id: _id, likedPosts: likedPosts });
      }catch (err) {
        console.log(err)
      }

    },
    postFeedback: async (req, res, next) => {
      const validationErrors = [];
    
      if (!validator.isEmail(req.body.email))
        validationErrors.push({ msg: "Please enter a valid email address." });
    
      if (!validator.isLength(req.body.inputName, { min: 1 }))
        validationErrors.push({
          msg: "Please enter a name.",
        });

        req.session.returnTo = req.headers.referer || '/';
    
      if (validationErrors.length) {
        req.flash("errors", validationErrors);

        const redirectURL = req.session.returnTo || '/';
        return res.redirect(`${redirectURL}#footer`);
      }
    
      req.body.email = validator.normalizeEmail(req.body.email, {
        gmail_remove_dots: false,
      });
    
      try {
        let feedback;
    
        if (req.user) {
          // Handle user feedback
          feedback = await Feedback.create({
            user: req.user.id,
            inputName: req.body.inputName,
            email: req.body.email,
            message: req.body.message,
            userName: req.user.userName,
          });
        } else {
          // Handle guest feedback
          const existingGuest = await GuestUserID.findOne({
            _id: req.session.guestUser._id,
          });
    
          if (existingGuest) {
            // Use the existing guest for feedback
            feedback = await Feedback.create({
              guest: existingGuest._id,
              inputName: req.body.inputName, // Adjust this based on your schema
              email: req.body.email,
              message: req.body.message,
              userName: req.session.guestUser.userName,
            });
          } else {
            // No need to explicitly create a new guest; it's handled by your schema
            feedback = await Feedback.create({
              email: req.body.email,
              message: req.body.message,
              userName: req.body.userName,
            });
          }
        }
    
        console.log("Feedback has been added!");
        req.flash("info", {
          msg: `Your message was sent. Thank you, ${
            req.user ? req.user.userName : req.body.inputName
          }, for your feedback!`,
        });

        const redirectURL = req.session.returnTo || '/';
        delete req.session.returnTo;
        return res.redirect(`${redirectURL}#footer`);
      } catch (err) {
        console.error(err, "from home controller postFeedback");
        return next(err);
      }
    },
    

getPrivacyPolicy: (req, res) => {
  res.render("privacyPolicy");
},

removeCookies: async (req, res) => {
  try {
      // Asynchronously destroy the session
  await new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
      res.clearCookie('consentCookie');
      res.clearCookie('guestID');
      res.clearCookie('connect.sid', { path: '/' }); // Specify the path for session cookie
      res.redirect("/consent");
  } catch (error) {
      console.error('Error destroying session:', error);

      res.status(500).send("Internal Server Error")
  }
  
},

};
   