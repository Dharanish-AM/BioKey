const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        files: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "File",
                default: [],
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Folder", folderSchema);
