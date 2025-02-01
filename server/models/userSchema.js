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
      required: true
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
    totalSpace: {
      type: Number,
      default: 5368709120
    },
    usedSpace: {
      type: Number,
      default: 0
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
