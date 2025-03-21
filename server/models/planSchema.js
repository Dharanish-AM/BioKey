const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    price: { type: String, required: true },
    features: { type: [String], required: true }
});

module.exports = mongoose.model("Plan", PlanSchema);