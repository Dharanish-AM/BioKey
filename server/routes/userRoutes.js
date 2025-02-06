const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", userController.register);
router.post("/login-credentials", userController.loginWithCredentials);
router.put("/updateuserprofile", userController.updateProfile)
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
router.post('/updateuserprofileimage', userController.updateProfileImage)


module.exports = router;
