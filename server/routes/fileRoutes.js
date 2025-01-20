const express = require("express");
const fileController = require("../controllers/fileController");
const router = express.Router();

router.post("/upload", fileController.uploadFile);
router.delete("/delete", fileController.deleteFile);
router.get("/recent", fileController.getRecentFiles);
router.get("/usedspace", fileController.getUsedSpace);
router.get("/list", fileController.listFile);
router.get("/previewimage", fileController.loadImage);
router.get("/previewvideo", fileController.loadVideo);
router.get("/previewaudio", fileController.loadAudio);
router.get("/previewother", fileController.loadOther);
router.get("/listfavourite",fileController.listLiked)


module.exports = router;  
 