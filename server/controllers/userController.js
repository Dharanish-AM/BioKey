const User = require("../models/userSchema");
const File = require("../models/fileSchema")
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const busboy = require("busboy");
const { IncomingForm } = require("formidable");
const mongoose = require("mongoose");
const sharp = require("sharp");

const { validateEmail, validatePassword } = require("../utils/validator");
const generateToken = require("../utils/generateToken");

const TARGET_DIR = path.join(
  "D:",
  "Github_Repository",
  "BioKey",
  "server",
  "uploads"
);

const TEMP_DIR = path.join(
  "D:",
  "Github_Repository",
  "BioKey",
  "server",
  "temp"
);

const register = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters, include one uppercase, one number, and one special character.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords don't match." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await user.save();

    const directory = path.join(TARGET_DIR, user._id.toString());

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    const userId = user._id;
    const token = generateToken(userId, name, email);

    if (token) {
      res.status(201).json({
        message: "User created successfully.",
        token,
      });
    } else {
      res.status(500).json({ message: "Failed to generate token." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = generateToken();
    if (token) {
      res.status(200).json({ message: "User logged in successfully.", token });
    } else {
      res.status(500).json({ message: "Failed to generate token." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in." });
  }
};

const getUser = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: "UserId is required." });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format." });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.profile) {
      const profilePath = path.join(TARGET_DIR, userId, user.profile);
      if (fs.existsSync(profilePath)) {
        const imageBuffer = fs.readFileSync(profilePath);

        const compressedImageBuffer = await sharp(imageBuffer)
          .resize({ width: 150 })
          .webp({ quality: 100 })
          .toBuffer();

        user.profile = `data:image/webp;base64,${compressedImageBuffer.toString(
          "base64"
        )}`;
      }
    }

    res.status(200).json({
      message: "User fetched successfully.",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user." });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const directory = path.join(TARGET_DIR, user._id.toString());
    if (fs.existsSync(directory)) {
      fs.rmdirSync(directory, { recursive: true });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting user." });
  }
};

const setProfile = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const form = new IncomingForm();
    form.uploadDir = TEMP_DIR;
    form.keepExtensions = true;

    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error processing the file." });
      }

      if (!files.profile || !files.profile[0]) {
        return res.status(400).json({ message: "Profile image is required." });
      }

      const file = files.profile[0];

      if (file.size === 0) {
        return res.status(400).json({ message: "Uploaded file is empty." });
      }

      const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res
          .status(400)
          .json({ message: "Invalid file type. Only images are allowed." });
      }

      const fileExtension = path.extname(file.originalFilename);
      const filePath = path.join(
        TARGET_DIR,
        userId,
        "assets",
        `profile${fileExtension}`
      );
      const tempFilePath = path.join("assets", `profile${fileExtension}`);

      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      fs.renameSync(file.filepath, filePath);

      user.profile = tempFilePath;
      await user.save();

      res.status(200).json({
        message: "Profile updated successfully.",
        profile: filePath,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating profile." });
  }
};

const createFolder = async (req, res) => {
  const { userId, folderName } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.folders) {
      user.folders = [];
    }

    const existingFolder = user.folders.find(folder => folder.name === folderName);
    if (existingFolder) {
      return res.status(400).json({ success: false, message: "Folder already exists" });
    }

    const newFolder = { name: folderName, files: [] };
    user.folders.push(newFolder);
    await user.save();

    return res.status(201).json({ success: true, folder: newFolder });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error creating folder" });
  }
};


const addFilesToFolder = async (req, res) => {
  const { userId, folderName, fileId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const folder = user.folders.find(f => f.name === folderName);
    if (!folder) {
      return res.status(404).json({ success: false, message: "Folder not found" });
    }

    if (folder.files.includes(fileId)) {
      return res.status(400).json({ success: false, message: "File already in the folder" });
    }

    folder.files.push(fileId);
    await user.save();

    return res.status(200).json({ success: true, folder });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error adding file to folder" });
  }
};



const likeOrUnlikeFile = async (req, res) => {
  const { userId, fileId } = req.body;
  try {
    const user = await User.findById(userId);
    const file = await File.findById(fileId);

    if (!user || !file) {
      return res.status(404).json({ success: false, message: "User or File not found" });
    }

    file.isLiked = !file.isLiked;

    if (file.isLiked) {
      if (!user.likedFiles) {
        user.likedFiles = [];
      }
      user.likedFiles.push(fileId);
    } else {
      user.likedFiles = user.likedFiles.filter((id) => id.toString() !== fileId);
    }

    await file.save();
    await user.save();

    return res.status(200).json({ success: true, isLiked: file.isLiked });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error liking/unliking file" });
  }
};


const ListFolder = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId).select("folders");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, folders: user.folders });
  } catch (error) {
    console.error("Error fetching folders: ", error);
    return res.status(500).json({ success: false, message: "Error fetching folders" });
  }
};


module.exports = {
  register,
  login,
  deleteUser,
  getUser,
  setProfile,
  createFolder,
  addFilesToFolder,
  likeOrUnlikeFile,
  ListFolder
};
