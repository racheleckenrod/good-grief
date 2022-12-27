const Post = require("../models/Post");
const Comment = require("../models/Comment")

module.exports = {
    getIndex: async (req, res) => {
      
      try {
        // console.log("OK", req.user._id)
        const posts = await Post.find().populate('user').sort({ likes: "desc" }).lean();
        const comments = await Comment.find().sort({ createdAt: "asc" }).lean()
        const _id = 33333333
        
        // console.log(_id, "_id")
        res.render("index.ejs", { posts: posts, comments: comments,  user: req.user, _id: req.user._id} );
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
        console.log(likedPosts, "likedPosts from getWelcome")
        res.render("welcome.ejs", { posts: posts, comments: comments, user: req.user, _id: _id, likedPosts: likedPosts });
      }catch (err) {
        console.log(err)
      }

    }
}


  // getFeed: async (req, res) => {
  //   try {
  //     const posts = await Post.find().populate('user').sort({ createdAt: "desc" }).lean();
  //     const comments = await Comment.find().sort({ createdAt: "asc" }).lean()

  //     res.render("feed.ejs", { posts: posts, comments: comments });
  //     console.log(comments, posts)
  //   } catch (err) { 
  //     console.log(err);
  //   }
  // }:
