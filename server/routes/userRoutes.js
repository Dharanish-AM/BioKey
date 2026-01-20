const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, validateToken } = require("../utils/checkToken");

router.post("/register", userController.register);
router.post("/login-credentials", userController.loginWithCredentials);
router.post("/login-fingerprint", userController.loginWithFingerPrint);

router.post("/check-token-is-valid", verifyToken, validateToken);

router.use(verifyToken);
router.put("/updateuserprofile", userController.updateProfile);
router.delete("/delete", userController.deleteUser);
router.get("/user-details", userController.getUser);
router.post("/setprofile", userController.setProfile);
router.post("/createfolder", userController.createFolder);
router.post("/addfilestofolder", userController.addFilesToFolder);
router.post("/likeorunlikefile", userController.likeOrUnlikeFile);
router.get("/listFolder", userController.ListFolder);
router.delete("/deletefolder", userController.deleteFolder);
router.post("/removefilefromfolder", userController.removeFileFromFolder);
router.put("/renamefolder", userController.renameFolder);
router.get("/listfavourite", userController.listLiked);
router.post("/updateuserprofileimage", userController.updateProfileImage);
router.get("/getallnotifications", userController.getUserNotifications);
router.post("/clearnotification", userController.clearNotifications);
router.get("/getactivitylogs", userController.getActivityLogs);
router.post("/changepassword", userController.changePassword);
router.get("/storageinfo", userController.storageInfo);
router.get("/getallplans", userController.getAllPlans);

module.exports = router;
