const mongoose = require("mongoose");

const recycleBinSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        originalPath: {
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
        deletedAt: {
            type: Date,
            default: Date.now,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);


recycleBinSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RecycleBin", recycleBinSchema);
