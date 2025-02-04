const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.delete("/delete", userController.deleteUser);
router.get("/user-details", userController.getUser);
router.post("/setprofile", userController.setProfile);
router.post("/createfolder", userController.createFolder);
router.post("/addfilestofolder", userController.addFilesToFolder)
router.post("/likeorunlikefile", userController.likeOrUnlikeFile)
router.get("/listFolder", userController.ListFolder)
router.delete("/deletefolder", userController.deleteFolder)
router.put("/renamefolder", userController.renameFolder)
router.get("/listfavourite", userController.listLiked)


module.exports = router;
