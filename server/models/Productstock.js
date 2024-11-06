const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const productStockSchema = new mongoose.Schema({
  device_id: {
    type: Number,
    unique: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive",
  },
  added_date: {
    type: Date,
    default: Date.now,
  },
  warranty_period: {
    type: Date,
    default: () => Date.now() + 6 * 30 * 24 * 60 * 60 * 1000,
  },
  sold_status: {
    type: String,
    enum: ["sold", "not sold"],
    default: "not sold",
  },
});

// Apply the AutoIncrement plugin only once
productStockSchema.plugin(AutoIncrement, {
  inc_field: "device_id",
  start_seq: 1, // Starting sequence number for device_id
});

const ProductStock = mongoose.model("ProductStock", productStockSchema);

module.exports = { ProductStock };
