const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.post("/send-push-notification", adminController.sendPushNotifications)

module.exports = router 