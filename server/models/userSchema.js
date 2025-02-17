const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    phone: {
      type: Number,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Others"]
    },
    location: {
      type: String,
      required: true
    },
    profile: {
      type: String,
      default: null,
    },
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      default: null,
    },
    totalSpace: {
      type: Number,
      default: 5368709120
    },
    usedSpace: {
      type: Number,
      default: 0
    },
    notificationToken: {
      type: String,
      default: ""
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("User", userSchema);
