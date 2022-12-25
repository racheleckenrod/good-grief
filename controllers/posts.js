const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");
// const { post } = require("../routes/main");

module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      const likedPosts = await Post.find({ user: req.user.id }).sort({likes: "desc"}).lean();
      console.log(posts)
      res.render("profile.ejs", { posts: posts, user: req.user, likedPosts: likedPosts });
    } catch (err) {
      console.log(err);
    }
  },
  showProfile: async (user, res) => {
    try {
      // const { id } = req.params.id
      const user = await User.find( {userName: user} )
      console.log("yessss","KOKOK")
      const posts = await Post.find({ user: user.id });
      const likedPosts = await Post.find({ user: user.id }).sort({likes: "desc"}).lean();
      res.render("profile.ejs", { posts: posts, user: user, likedPosts: likedPosts });
    } catch (err) {
      console.log(err, "STOP!!");
    }

  },
  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().populate('user').sort({ createdAt: "desc" }).lean();
      const comments = await Comment.find().sort({ createdAt: "asc" }).lean()

      res.render("feed.ejs", { posts: posts, comments: comments, user: req.user });
      console.log(comments, posts)
    } catch (err) { 
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const comments = await Comment.find({post: req.params.id}).sort({ createdAt: "desc" }).lean();
      res.render("post.ejs", { post: post, user: req.user, comments: comments });
    } catch (err) {
      console.log(err);
    }
  },
  getNewPost:  async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("newPost.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
      console.log(result)

      await Post.create({
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  editPostPage:  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const comments = await Comment.find({post: req.params.id}).sort({ createdAt: "desc" }).lean();
      res.render("edit.ejs", { post: post, user: req.user, comments: comments });
    } catch (err) {
      console.log(err)
    }
  },

  editPost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
      
        
          {...req.body }
         
      
      );
      console.log("Updated Post",req.body.title );
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
};
