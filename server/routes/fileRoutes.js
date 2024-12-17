const express = require("express");
const fileController = require("../controllers/fileController");
const router = express.Router();

router.post("/upload", fileController.uploadFile);
router.get("/recent", fileController.getRecentFiles);
router.get("/usedspace", fileController.getUsedSpace);

module.exports = router;
