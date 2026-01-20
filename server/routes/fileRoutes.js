const express = require("express");
const fileController = require("../controllers/fileController");
const router = express.Router();
const { verifyToken } = require("../utils/checkToken");

router.use(verifyToken);

router.post("/upload", fileController.uploadFile);
router.delete("/delete", fileController.moveToRecycleBin);
router.delete(
  "/permanentdelete",
  fileController.permanentlyDeleteFileAndThumbnail,
);
router.post("/restorefile", fileController.restoreFile);
router.get("/recent", fileController.getRecentFiles);
router.get("/usedspace", fileController.getSpace);
router.get("/list", fileController.listFile);

router.get("/previewfile", fileController.loadFile);
router.get("/allfilemetadata", fileController.allFileMetaData);
router.get("/recyclebinfiles", fileController.getRecycleBinFiles);

module.exports = router;
