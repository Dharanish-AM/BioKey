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
    profile: {
      type: String,
      default: null,
    },
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      default: null,
    },
    likedFiles: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "File",
      default: [],
    },
    folders: [
      {
        name: {
          type: String,
          required: true,
        },
        files: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "File",
            default: [],
          },
        ],
      },
    ],
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
