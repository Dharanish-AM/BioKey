const cron = require("node-cron");
const RecycleBin = require("../models/recycleBinSchema");
const {
  permanentlyDeleteFileAndThumbnail,
} = require("../controllers/fileController");
const mongoose = require("mongoose");

cron.schedule("0 0 * * *", async () => {
  console.log("Running scheduled task to delete expired files...");

  try {
    const now = new Date();

    const expiredFiles = await RecycleBin.find({ expiresAt: { $lte: now } });

    if (!expiredFiles.length) {
      console.log("No expired files to delete.");
      return;
    }

    for (const file of expiredFiles) {
      const req = { body: { userId: file.owner, fileId: file._id } };
      const res = {
        status: (code) => ({
          json: (data) => console.log(`Response ${code}:`, data),
        }),
      };

      await permanentlyDeleteFileAndThumbnail(req, res);
    }

    console.log(`Deleted ${expiredFiles.length} expired files.`);
  } catch (error) {
    console.error("Error in scheduled deletion task:", error);
  }
});
