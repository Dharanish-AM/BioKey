const User = require("../models/userSchema");
const File = require("../models/fileSchema")
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const mongoose = require("mongoose");
const sharp = require("sharp");
const minioClient = require("../config/minio")
const { validateEmail, validatePassword } = require("../utils/validator");
const generateToken = require("../utils/generateToken");

const TARGET_DIR = path.join(
  "D:",
  "Github_Repository",
  "BioKey",
  "server",
  "uploads"
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

    const userId = user._id;


    const folderPath = `${userId}/`;


    await minioClient.putObject(BUCKET_NAME, folderPath, Buffer.from(''));

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
      const profilePath = `${userId}/${user.profile}`;

      try {

        const profileStream = await minioClient.getObject(BUCKET_NAME, profilePath);


        const imageBuffer = await new Promise((resolve, reject) => {
          const chunks = [];
          profileStream.on('data', (chunk) => chunks.push(chunk));
          profileStream.on('end', () => resolve(Buffer.concat(chunks)));
          profileStream.on('error', (err) => reject(err));
        });


        const compressedImageBuffer = await sharp(imageBuffer)
          .resize({ width: 150 })
          .webp({ quality: 100 })
          .toBuffer();


        user.profile = `data:image/webp;base64,${compressedImageBuffer.toString(
          "base64"
        )}`;
      } catch (err) {
        console.error("Error fetching profile image from MinIO:", err.message);
        user.profile = null;
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
  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form data:", err.message);
      return res.status(500).json({ message: "Error processing profile upload" });
    }

    const { userId } = fields;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!files.profile) {
      return res.status(400).json({ message: "Profile image is required." });
    }

    const file = files.profile;
    const fileExtension = file.originalFilename.split('.').pop();
    const minioPath = `${userId}/profile.${fileExtension}`;

    try {
      const fileStream = fs.createReadStream(file.filepath);
      await minioClient.putObject(BUCKET_NAME, minioPath, fileStream, {
        "Content-Type": file.mimetype,
      });

      user.profile = minioPath;
      await user.save();

      res.status(200).json({
        message: "Profile updated successfully.",
        profile: minioPath,
      });

      fs.unlinkSync(file.filepath);
    } catch (uploadError) {
      console.error("Error uploading to MinIO:", uploadError);
      res.status(500).json({ message: "Error uploading profile image to storage." });
    }
  });
};
const createFolder = async (req, res) => {
  const { userId, folderName } = req.query;

  if (!userId || !folderName) {
    return res.status(400).json({ success: false, message: "User ID and folder name are required" });
  }

  try {

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }


    if (!user.folders) {
      user.folders = [];
    }


    const existingFolder = user.folders.find(folder => folder.name.trim().toLowerCase() === folderName.trim().toLowerCase());

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


    await file.save();

    return res.status(200).json({ success: true, isLiked: file.isLiked });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error liking/unliking file" });
  }
};



const ListFolder = async (req, res) => {
  const { userId } = req.query;
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
