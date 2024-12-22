const express = require("express");
const fileController = require("../controllers/fileController");
const router = express.Router();

router.post("/upload", fileController.uploadFile);
router.delete("/delete", fileController.deleteFile);
router.get("/recent", fileController.getRecentFiles);
router.get("/usedspace", fileController.getUsedSpace);
router.get("/list", fileController.getFilesByCategory);
router.get("/preview", fileController.loadFile);
router.post("/newfolder", fileController.createSaveFolder);

module.exports = router;
