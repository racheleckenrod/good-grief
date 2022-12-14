const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");
// const { post } = require("../routes/main");

module.exports = {
  getProfile: async (req, res) => {
    // console.log(req.user, req.user.profilePicture)
    try {
      const posts = await Post.find({ user: req.user.id });
      const likedPosts = await Post.find({ user: req.user.id }).sort({likes: "desc"}).lean();
      const _id = req.user._id || 33333333
      // console.log(posts)
      res.render("profile.ejs", { posts: posts, user: req.user, likedPosts: likedPosts, _id: _id });
    } catch (err) {
      console.log(err);
    }
  },
  getEditProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      const likedPosts = await Post.find({ user: req.user.id }).sort({likes: "desc"}).lean();
      const _id = req.user._id
      console.log(req.user)
      res.render("editProfile.ejs", { posts: posts, user: req.user, likedPosts: likedPosts, _id: _id });
    } catch (err) {
      console.log(err);
    }
  },
  editProfile: async (req, res) => {
   console.log(req.user, "editProfile")
    try {

      //   if(req.params ){

       
      //   // Upload image to cloudinary
      //   const result = await cloudinary.uploader.upload(req.file.path);
      //   console.log(result)
      //   req.user.profilePicture = result.secure_url
      // }
      await User.findOneAndUpdate(
        { _id: req.params.id },
      
        
          {...req.body }
         
      
      );
      console.log("Updated editProfile() User",req.body );
      res.redirect(`/profile`);
    } catch (err) {
      console.log(err);
    }
  },
  createProfile: async (req, res) => {
   console.log("createProfile")
    try {

      let user = await User.findById(req.params.id)
      const _id = req.user._id
      console.log(user, "second")
      const result = await cloudinary.uploader.upload(req.file.path);
      console.log(result, user)
        const data = {
          profilePicture: result.secure_url || user.profilePicture
        };
        user = await User.findOneAndUpdate(req.params.id, data, {
          new: true
        });
        console.log("after user", user)
        // res.json(user);
      
        // Upload image to cloudinary
        // const result = await cloudinary.uploader.upload(req.file.path);
        // console.log(result)

         //   // Upload image to cloudinary
        // const { result } = await cloudinary.uploader.upload(req.file.path);
        // console.log(result, req.user.profilePicture )
        // req.user.profilePicture = result.secure_url
        // console.log(req.user.profilePicture)
      // // }

      // await User.findOneAndUpdate(
      //   { _id: req.params.id },
      //   {  profilePicture: result.secure_url} ,
     
         
      
      // );
      console.log("Updated createProfile User", req.user.profilePicture );
      res.redirect(`/profile`);
    } catch (err) {
      console.log(err);
    }
  },
  showProfile: async (req, res) => {
    console.log("showprofile", req.params)
    try {
      // const { id } = req.params.id
      const chatUser = await User.findOne( { _id: req.params.id } )
      console.log("yessss",chatUser,"KOKOK")
      const posts = await Post.find({ user: chatUser }).populate('user');
      // console.log("yep", posts, "yoyoyo")
      const likedPosts = await Post.find({ user: chatUser}).sort({likes: "desc"}).lean();
      const _id = req.user._id
      const comments = await Comment.find().populate('user').sort({ createdAt: "asc" }).lean()
      console.log(likedPosts.length, comments.length, "length of likedPost and comments")
      res.render("userProfile.ejs", { posts: posts, user: req.user, chatUser: chatUser, comments: comments, likedPosts: likedPosts, _id: _id });
    } catch (err) {
      console.log(err, "STOP!!");
    }

  },
  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().populate('user').sort({ createdAt: "desc" }).lean();
      const comments = await Comment.find().populate('user').sort({ createdAt: "asc" }).lean()
      console.log(posts,comments, "from getFeed")
      const _id = req.user._id

      res.render("feed.ejs", { posts: posts, comments: comments, user: req.user, _id: _id });
      // console.log(comments, posts, "toooo much")
    } catch (err) { 
      console.log(err);
    }
  },
  getTestFeed: async (req, res) => {
    try {
      const posts = await Post.find().populate('user').sort({ createdAt: "desc" }).lean();
      const comments = await Comment.find().sort({ createdAt: "asc" }).lean()
    
      res.render("feed.ejs", { posts: posts, comments: comments, user: req.user });
      console.log("testFeed" ,posts)
    } catch (err) { 
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id).populate('user');
      const comments = await Comment.find({post: req.params.id}).populate('user').sort({ createdAt: "desc" }).lean();
      const _id = req.user._id
      console.log(post,comments, "from getPost")
      res.render("post.ejs", { post: post, user: req.user, comments: comments, _id: _id });
    } catch (err) {
      console.log(err);
    }
  },
  getNewPost:  async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      const _id = req.user._id
      res.render("newPost.ejs", { posts: posts, user: req.user, _id: _id });
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
      const post = await Post.findById(req.params.id).populate('user');
      const comments = await Comment.find({post: req.params.id}).sort({ createdAt: "desc" }).lean();
      const _id = req.user._id
      res.render("edit.ejs", { post: post, user: req.user, comments: comments, _id: _id });
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
