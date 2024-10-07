const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const fingerprintSchema = mongoose.Schema({
  fingerprint_id: {
    type: Number,
    unique: true,
  },
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  fingerprint: {
    type: Buffer,
    required: true,
  },
});

fingerprintSchema.plugin(AutoIncrement, {
  inc_field: "fingerprint_id",
  start_seq: 1,
});

fingerprintSchema.virtual("padded_fingerprint_id").get(function () {
  return this.fingerprint_id.toString().padStart(6, "0");
});

const Fingerprint = mongoose.model("Fingerprint", fingerprintSchema);

module.exports = { Fingerprint };
