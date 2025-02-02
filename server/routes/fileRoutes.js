const express = require("express");
const fileController = require("../controllers/fileController");
const router = express.Router();

router.post("/upload", fileController.uploadFile);
router.delete("/delete", fileController.deleteFileAndThumbnail);
router.get("/recent", fileController.getRecentFiles);
router.get("/usedspace", fileController.getSpace);
router.get("/list", fileController.listFile);
router.get("/listfavourite", fileController.listLiked)
router.get("/previewfile", fileController.loadFile)


module.exports = router;
