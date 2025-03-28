const mongoose = require("mongoose");

const passwordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      match: [/\S+@\S+\.\S+/, "Invalid email address"],
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
    iv: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      default: "",
    },
    note: {
      type: String,
      maxlength: 500,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

passwordSchema.index({ userId: 1 });
passwordSchema.index({ createdAt: -1 });

passwordSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Password", passwordSchema);
