const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const { User } = require("../models/User");

const devicesSchema = new mongoose.Schema({
  device_id: {
    type: Number,
    unique: true,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Device = mongoose.model("Device", devicesSchema);

module.exports = {
  Device,
};
