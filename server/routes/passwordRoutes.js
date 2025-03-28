const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/passwordController");

router.post("/addpassword", passwordController.addPassword);
router.get("/getallpasswords", passwordController.getAllPasswords);
router.get("/getpassword", passwordController.getPassword);
router.delete("/deletepassword", passwordController.deletePassword);
router.put("/updatepassword", passwordController.updatePassword);

module.exports = router;
