const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const checkToken = require("../utils/checkToken");

router.post("/register", userController.register);
router.post("/login-credentials", userController.loginWithCredentials);
router.post("/login-fingerprint", checkToken, userController.loginWithFingerPrint);
router.put("/updateuserprofile", userController.updateProfile)
router.delete("/delete", userController.deleteUser);
router.get("/user-details", userController.getUser);
router.post("/setprofile", userController.setProfile);
router.post("/createfolder", userController.createFolder);
router.post("/addfilestofolder", userController.addFilesToFolder)
router.post("/likeorunlikefile", userController.likeOrUnlikeFile)
router.get("/listFolder", userController.ListFolder)
router.delete("/deletefolder", userController.deleteFolder)
router.post("/removefilefromfolder", userController.removeFileFromFolder)
router.put("/renamefolder", userController.renameFolder)
router.get("/listfavourite", userController.listLiked)
router.post('/updateuserprofileimage', userController.updateProfileImage)
router.post("/check-token-is-valid", checkToken)
router.get("/getallnotifications", userController.getUserNotifications)
router.post("/clearnotification", userController.clearNotifications)
router.get("/getactivitylogs", userController.getActivityLogs)
router.post("/changepassword", userController.changePassword)
router.get("/storageinfo", userController.storageInfo)


module.exports = router;
