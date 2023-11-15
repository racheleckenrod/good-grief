const Post = require("../models/Post");
const Comment = require("../models/Comment")
const Guest = require("../models/Guest")
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
    postUserFeedback: async (req,res, next) => {
      // console.log("wowowo",req.body)
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
        // there is a req.user
        try {
              await Feedback.create({
                user: req.user.id,
                guest: req.user.id,
                email: req.body.email,
                message: req.body.message,
                userName: req.body.userName,
              });
      
              console.log("Feedback has been added!YAYYAAY");
              req.flash("info", {
                    msg: `Your message was sent. Thank you, ${req.user.userName} for your feedback!`,
                  });
              res.redirect("/#footer");
            } catch (err) {
              console.log(err, "from home controller postFeedback");
            } 
  },
  postGuestFeedback: async (req,res, next) => {
    console.log("GUEST feedback")
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
  
      
        // two options here- either new guest(if) or returning guest(else)
        // get guest then post then logout guest
        try {
            console.log(req.url, "postingGuestFeedback")
            // duplicate posts from same guest
            const guest = await new Guest({
              userName: req.body.userName,
              email: req.body.email,
            });
            console.log(guest)
            Guest.findOne(
              { $or: [{ email: req.body.email }, { userName: req.body.userName }] },
              (err, existingGuest) => {
                console.log("small")
                if (err) {
                  console.log("small error")

                  return next(err);
                }
                else if (existingGuest) {
                  console.log(guest, "closer")
                  
                }else{
                  console.log("new guest")
                  // make new guest
                  guest.save(() => {
                    console.log(guest, "saving")
                      if (err) {
                        return next(err);
                      }
                  })
                }
              })
              } catch (err){
                console.log(err)
              }
              
          // now make feedback post then logout guest

             try {
                  const feedback = await Feedback.create({
                      
                      userName: req.body.userName,
                      email: req.body.email,
                      message: req.body.message,

                  })
                  // save feedback?
                 
                  console.log(feedback, feedback._id, "winninging")
                //  console.log(req.body)
                 req.flash("info", {
                  msg: `Your message was sent. Thank you, ${req.body.userName} for your feedback!`,
                });
                 return res.redirect("/#footer")
               
                  
                }catch (err){
                  console.log(err)
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
   