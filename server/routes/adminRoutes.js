const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken } = require("../utils/checkToken");

router.use(verifyToken);

router.post("/send-push-notification", adminController.sendPushNotifications);
router.post("/create-plan", adminController.createPlan);

module.exports = router;
