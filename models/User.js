const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  greeting: { type: String, default: "We can honor our dead by living our best lives." },
  profilePicture: {type: String, default: "https://source.unsplash.com/random/?flowers"},
  about: {type: String, default: "Please use this space to tell us a little bit about yourself. We would love to know why you are here, who or what you are grieving, and how you have found to express your grief, as well as whatever else you would like to share."},
  story: {type: String, default: " After spending most of my life at this point, without my child alive on Earth, I have put together a site that I hope can bring you great comfort in your times of need, and joy in celebrating with others successes we can share. It is my hope that you are supported when you need it most, and don't need to have a reason to connect deeply with those who can offer a safe and supportive envirnment. Please be aware that being a member of this community is a privilege, and we expect you to follow certain rules in order to participate. Kindness is mandatory. As is maintaining respect for others as well as yourself. If you ever feel bullied or experience abuse, we want to know about it right away. We will make every effort to keep this an emotionally safe space. \n May you find compassionate understanding here and enjoy sharing memories of your loved ones, as you offer yourself to those who have an understanding of your losses. May we learn to support each other. \n Please take a moment and tell us  your story by editing your profile."},
  viewUser: {type: Boolean, default: true},
  timezone: {type: String, default: "UTC"}
});

// Password hash middleware.

UserSchema.pre("save", function save(next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

// Helper method for validating user's password.

UserSchema.methods.comparePassword = function comparePassword(
  candidatePassword,
  cb
) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

module.exports = mongoose.model("User", UserSchema);
