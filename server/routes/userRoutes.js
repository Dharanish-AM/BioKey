const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.delete("/delete", userController.deleteUser);
router.get("/details", userController.getUser);
router.post("/setprofile", userController.setProfile);

module.exports = router;
  