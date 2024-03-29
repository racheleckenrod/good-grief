const { session } = require("passport");
const Post = require("../models/Post");
const Comment = require("../models/Comment")
module.exports = {

  getLobby: async (req, res) => {
    if(!req.user){
      try {
        const _id = req.session._id

        const posts = await Post.find().populate('user').sort({ likes: "desc" }).lean();
        const comments = await Comment.find().sort({ createdAt: "asc" }).lean()
        res.render("lobby.ejs", { posts: posts, comments: comments, userName: req.session.userName, _id: _id, room: "The Lobby", session: req.session });
      } catch (err) {
        console.log(err)
      }
    
  } else {
    try {
      // console.log("OK", req.user._id)
      const _id = req.user._id
      const posts = await Post.find().populate('user').sort({ likes: "desc" }).lean();
      const comments = await Comment.find().sort({ createdAt: "asc" }).lean()
      
      res.render("lobby.ejs", { posts: posts, comments: comments,  user: req.user, _id: req.user._id, userName: req.user.userName, _id: _id, room: "The Lobby", session: req.session } );
    } catch (err) {
      console.log(err)
    }
  }
},

    // getLobby: (req, res, next) => {
    //     if (req.user) {
    //       // console.log("from getlobby", req.user)
    //       const _id = req.user._id
    //       res.render("lobby.ejs", { userName: req.user.userName, _id: _id, room: "The Lobby", session: req.session });
    //     } else {
    //       const _id = req.session._id
    //       // console.log("from get lobby", req.session, req.session.userName)
    //       res.render("lobby.ejs", { userName: req.session.userName, _id: _id, room: "The Lobby", session: req.session })
    //     }
       
    //   next()
    // },
    getRoom: (req, res, next) => {
     
      const _id = req.user._id
     
      res.render("chatRoom.ejs", { user: req.user, _id: _id, room: req.params.room, session: req.session });
      next();

    },
   
  };
  