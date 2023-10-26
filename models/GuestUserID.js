const mongoose = require("mongoose");

const GuestUserIDSchema = new mongoose.Schema({
    guestUserID: { type: String, required: true, unique: true },
    userName: { type: String, unique: true },
    timezone: { type: String, default: 'UTC' },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    leftAt: { type: Date},
  
  });

  module.exports = mongoose.model("GuestUserID", GuestUserIDSchema);