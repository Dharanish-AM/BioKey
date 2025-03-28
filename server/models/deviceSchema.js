const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "FINGY",
    },
    serialNumber: {
      type: Number,
      unique: true,
      required: true,
    },
    key: {
      type: String,
      default: "",
    },
    fingerprints: [
      {
        id: {
          type: Number,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    privateKey: {
      type: String,
      default: "",
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Device", deviceSchema);
