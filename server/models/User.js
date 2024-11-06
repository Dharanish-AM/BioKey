const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const usersSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  device_id: {
    type: mongoose.Schema.ObjectId,
    ref: "Device",
    default: null,
  },
  fingerprint_id: {
    type: mongoose.Schema.ObjectId,
    ref: "Fingerprint",
    default: null,
  },
  vault_id: {
    type: mongoose.Schema.ObjectId,
    ref: "Vault",
    default: null,
  },
});

usersSchema.plugin(AutoIncrement, { inc_field: "user_id", start_seq: 1 });

usersSchema.virtual("padded_user_id").get(function () {
  return this.user_id.toString().padStart(6, "0");
});

const User = mongoose.model("User", usersSchema);

module.exports = {
  User,
};
