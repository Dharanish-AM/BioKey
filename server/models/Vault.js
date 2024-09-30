const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const vaultSchema = mongoose.Schema({
  vault_id: {
    type: Number,
    unique: true,
  },
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  vault_url: {
    type: String,
    required: true,
    unique: true,
  },
});

vaultSchema.plugin(AutoIncrement, { inc_field: "vault_id", start_seq: 100001 });

vaultSchema.virtual("padded_vault_id").get(function () {
  return this.vault_id.toString().padStart(6, "0");
});

const Vault = mongoose.model("Vault", vaultSchema);

module.exports = {
  Vault,
};
