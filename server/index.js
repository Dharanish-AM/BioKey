const express = require("express");
const cors = require("cors");
const multer = require("multer");

const fs = require("fs"); // Import the File System module
const path = require("path"); // Import the Path module
const { createCanvas } = require("canvas"); // Import createCanvas from the canvas library

const app = express();
const port = 3000;

app.use(express.json());

const { connectToDb } = require("./config/db");
const { verifyToken, checkToken } = require("./middleware/verifyToken");

const { sign } = require("jsonwebtoken");

const {
  signUp,
  Login,
  getUserDetails,
} = require("./controller/userController");
const { addDevice } = require("./controller/deviceController");
const { addStock } = require("./controller/productStockController");
const { addFingerprint } = require("./controller/fingerprintController");
const {
  uploadFile,
  listFiles,
  deleteFile,
  createUserFolder,
} = require("./controller/fileController");

app.use(
  cors({
    origin: "*",
  })
);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
  console.log(response);

  if (response.success) {
    const userDetailsResponse = await getUserDetails(email);

    if (userDetailsResponse.success) {
      const userId = userDetailsResponse.user._id;

      await createUserFolder(userId);

      res.status(200).json({
        message: "Signup - Success!",
        user: userDetailsResponse.user,
      });
    } else {
      res.status(400).json({ message: userDetailsResponse.message });
    }
  } else {
    res.status(400).json({ message: response.message });
  }
});

app.post("/checktoken", async (req, res) => {
  const { token } = req.body;
  console.log(token);

  const response = await checkToken(token);

  if (response && response.success) {
    console.log(response.decoded);
    return res
      .status(200)
      .json({ message: "Valid Token", user: response.decoded });
  } else {
    return res.status(401).json({ message: "Invalid Token" });
  }
});

app.get("/getuserdetails", verifyToken, async (req, res) => {
  const { email } = req.query;
  const response = await getUserDetails(email);
  if (response.success) {
    return res
      .status(200)
      .json({ message: "User Details", user: response.user });
  } else {
    return res.status(400).json({ message: response.message });
  }
});

app.post("/upload", verifyToken, upload.array("files[]"), async (req, res) => {
  const { userId } = req.body;
  console.log("Files received:", req.files);

  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No files uploaded.");
  }

  try {
    const uploadedFiles = [];

    for (const file of req.files) {
      const response = await uploadFile(file, userId);
      uploadedFiles.push(response);
    }

    res.status(200).send({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).send("Error uploading files.");
  }
});

app.get("/viewfiles", async (req, res) => {
  try {
    const userId = req.query.userId;

    const files = await listFiles(userId);
    //console.log("Files fetched:", files);

    if (!files || files.length === 0) {
      return res
        .status(200)
        .json({ message: "No files found or unable to retrieve files." });
    }

    res.status(200).json({ files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve files from S3 bucket." });
  }
});

app.delete("/deletefile", async (req, res) => {
  const { fileKey, userId } = req.query;
  console.log(fileKey);
  if (!fileKey || !userId) {
    return res.status(400).json({ error: "File key and user ID are required" });
  }

  try {
    const response = await deleteFile(fileKey, userId);
    return res
      .status(200)
      .json({ message: "File deleted successfully", response });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error deleting file", details: error.message });
  }
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

app.post("/fingerprint", async (req, res) => {
  try {
    const templateBase64 = req.body.template;

    if (!templateBase64) {
      return res
        .status(400)
        .json({ error: "No fingerprint template provided" });
    }

    // Decode Base64 to Buffer
    const templateBuffer = Buffer.from(templateBase64, "base64");

    // Check if the buffer is the expected size (512 bytes)
    if (templateBuffer.length !== 512) {
      return res.status(400).json({ error: "Invalid template size" });
    }

    // Print the raw buffer for debugging
    console.log("Fingerprint Template Buffer:", templateBuffer);

    // Convert the buffer back to Base64 if needed
    //const newBase64 = templateBuffer.toString("base64");

    //console.log("Base64 : " + newBase64);

    res.status(200).json({
      message: "Fingerprint template processed",
    });
  } catch (error) {
    console.error("Error processing fingerprint template:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
