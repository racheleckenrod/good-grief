const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now
router.get("/:id", ensureAuth, postsController.getPost);

router.post("/createPost", upload.single("file"), postsController.createPost);

router.get("/newPost/:id", ensureAuth, postsController.getNewPost);

router.put("/likePost/:id", postsController.likePost);

router.put("/likePostFeed/:id", postsController.likePostFeed);

router.get("/editPostPage/:id", postsController.editPostPage);

router.put("/editPost/:id", postsController.editPost)

router.delete("/deletePost/:id", postsController.deletePost);

module.exports = router;
