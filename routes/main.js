

const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest, ensureFeedback } = require("../middleware/auth");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const formatMessage = require("../utils/messages");
const botName = "Server says";
// const { userTimeZone, userLang } = require("../public/js/shared.js");


module.exports = function (io) {
//Main Routes - simplified for now
router.get("/", homeController.getIndex);

// router.post("/feedback", ensureFeedback, homeController.postFeedback)
router.post('/feedback', function(req, res) {
    if(!req.user){
        res.redirect(307, '/feedbackGuest');
    }else {
        res.redirect(307, '/feedbackUser');
    }
  });
router.post("/feedbackGuest", homeController.postGuestFeedback)
router.post("/feedbackUser", ensureAuth, homeController.postUserFeedback)
router.get("/profile/:id", ensureAuth,postsController.showProfile);
router.get("/profile", ensureAuth, postsController.getProfile);
router.get("/editProfile", ensureAuth, postsController.getEditProfile);
router.put("/editProfile/:id", ensureAuth, postsController.editProfile)
router.put("/profilePicture/:id", ensureAuth, upload.single("file"), postsController.editProfilePic);


router.get("/welcome", ensureAuth, homeController.getWelcome);
router.get("/feed", ensureAuth, postsController.getFeed);
// router.get("/testFeed", ensureAuth, postsController.getTestFeed);

router.get("/passwordResetRequest", authController.getPasswordResetRequest);
router.post("/passwordResetRequest", authController.postPasswordResetRequest);
router.get("/passwordReset/:token", authController.getPasswordReset);
router.get("/passwordReset", authController.getPasswordReset);

router.post("/passwordUpdate/:token", authController.postPasswordUpdate);

// router.get("/login", authController.getLogin);
router.get("/login", (req, res, io) => {
    console.log("first login message");
    if (req.user) {
    // io.to("The Lobby").emit("login", `${req.user.userName} has logged in.`);
    // io.emit("test", "test message from login route.");
    console.log("message from the login route");
    req.app.io.emit('tx',  formatMessage(botName, `${req.user.userName} is logging in`,  req.session.userTimeZone, req.session.userLang));
    console.log("before emitting")
    authController.getLogin(req, res);
    } else {
        console.log("else first login");
        authController.getLogin(req, res);
        console.log("else second login")

    }
        // res.redirect('/login');
    
});
router.post("/login", authController.postLogin, () => {console.log("post Route")});
//  (req, res, io) => {
    // io.to("The Lobby").emit("login", `${req.user.userName} has logged in.`);
    // io.emit("test", "test message from login route.");
    // console.log("message from the login route");
    // req.app.io.emit('tx',  formatMessage(botName, `${req.user.userName} is logging in`,  req.session.userTimeZone, req.session.userLang))
// });
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

    return router;
};