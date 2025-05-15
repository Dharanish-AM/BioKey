const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  date: { 
    type: Date,
    default: Date.now,
  },
  deviceName: { 
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  location: {
    region: String,
    country: String,
    district: String, 
  },
  latitude: { type: Number },
  longitude: { type: Number },
  mode: {
    type: String,
    enum: ["credentials", "biometric"],
  },
  status: {
    type: String,
    enum: ["Success", "Failed"],
    required: true,
  },
});

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

module.exports = ActivityLog;
