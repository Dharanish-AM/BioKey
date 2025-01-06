const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/passwordController");

router.post("/addpassword", passwordController.addPassword);
router.get("/getallpasswords",passwordController.getAllPasswords)


module.exports = router;
  