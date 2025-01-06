const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["images", "videos", "audios", "others"],
    },
    thumbnail: {
      type: String,
      default: null,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

fileSchema.index({ owner: 1, createdAt: -1 });
 
module.exports = mongoose.model("File", fileSchema); 
  