const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest, ensureFeedback } = require("../middleware/auth");

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
router.get("/profile/:id", postsController.showProfile);
router.get("/profile", ensureAuth, postsController.getProfile);
router.get("/editProfile", ensureAuth, postsController.getEditProfile);
router.put("/editProfile/:id", postsController.editProfile)
router.post("/profilePicture", upload.single("file"), postsController.createProfile);


router.get("/welcome", ensureAuth, homeController.getWelcome);
router.get("/feed", ensureAuth, postsController.getFeed);
// router.get("/testFeed", ensureAuth, postsController.getTestFeed);

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

module.exports = router;
