const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(express.json());

const { connectToDb } = require("./config/db");
const verifyToken = require("./middleware/verifyToken");

const dotenv = require("dotenv");
const { sign } = require("jsonwebtoken");

const { signUp, Login } = require("./controller/userController");
const { addDevice } = require("./controller/deviceController");
const { addStock } = require("./controller/productStockController");
const { addFingerprint } = require("./controller/fingerprintController");

app.use(
  cors({
    origin: "*",
  })
);

dotenv.config;

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const response = await Login(email, password);

  if (response.success) {
    res.status(200).json({
      message: "Login - Success!",
      user: response.user,
      token: response.token,
    });
  } else {
    res.status(400).json({ message: response.message });
  }
});

app.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;

  const response = await signUp(name, email, phone, password);

  if (response.success) {
    res.status(200).json({
      message: "Signup - Success!",
      user: response.user,
    });
  } else {
    res.status(400).json({ message: response.message });
  }
});

app.get("/home", verifyToken, (req, res) => {
  res.status(200).json({ message: "Welcome to Home!" });
});

app.post("/addstock", async (req, res) => {
  try {
    const response = await addStock();
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/adddevice", verifyToken, async (req, res) => {
  const { device_id, user_id } = req.body;

  if (!device_id || !user_id) {
    return res.status(400).json({
      success: false,
      message: "device_id and user_id are required.",
    });
  }

  try {
    const response = await addDevice(device_id, user_id);
    return res.status(201).json({
      success: true,
      message: "Device added successfully.",
      device: response,
    });
  } catch (error) {
    console.error("Error adding device:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding device. Please try again later.",
      error: error.message,
    });
  }
});

app.post("/addfingerprint", async (req, res) => {
  try {
    const { user_id, fp_template } = req.body;
    const response = await addFingerprint(user_id, fp_template);

    if (response.success) {
      return res.status(200).json(response);
    } else {
      return res.status(400).json(response);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
