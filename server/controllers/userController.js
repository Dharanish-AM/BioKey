const User = require("../models/userSchema");
const File = require("../models/fileSchema");
const Folder = require("../models/folderSchema");
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
  const { userId, folderName } = req.body;


  if (!userId || !folderName) {
    return res.status(400).json({ success: false, message: "User ID and folder name are required" });
  }

  try {

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }


    const existingFolder = await Folder.findOne({
      name: folderName.trim().toLowerCase(),
      owner: userId,
    });

    if (existingFolder) {
      return res.status(400).json({ success: false, message: "Folder already exists" });
    }


    const newFolder = new Folder({
      name: folderName,
      owner: userId,
      files: [],
    });


    await newFolder.save();

    return res.status(201).json({ success: true, folder: newFolder });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error creating folder" });
  }
};



const addFilesToFolder = async (req, res) => {
  const { userId, folderId, fileId } = req.body;

  try {

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }


    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ success: false, message: "Folder not found" });
    }


    if (!folder.owner.equals(userId)) {
      return res.status(403).json({ success: false, message: "Folder does not belong to the user" });
    }


    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: "File not found" });
    }


    if (folder.files.includes(fileId)) {
      return res.status(400).json({ success: false, message: "File already in the folder" });
    }


    folder.files.push(fileId);


    await folder.save();

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

    const folders = await Folder.find({ owner: userId }).populate({
      path: 'files',
      select: 'name type size thumbnail createdAt'
    });

    if (!folders || folders.length === 0) {
      return res.status(404).json({ success: false, message: "No folders found for this user" });
    }

    const folderDetails = [];

    for (let folder of folders) {
      const files = [];


      for (let file of folder.files) {
        if (file.thumbnail) {
          try {

            const presignedUrl = await minioClient.presignedGetObject(process.env.MINIO_BUCKET_NAME, file.thumbnail, 24 * 60 * 60);
            files.push({
              _id: file._id,
              name: file.name,
              type: file.type,
              size: file.size,
              thumbnail: presignedUrl,
            });
          } catch (error) {
            console.error("Error generating presigned URL for file thumbnail: ", error);
            files.push({
              _id: file._id,
              name: file.name,
              type: file.type,
              size: file.size,
              thumbnail: null,
            });
          }
        } else {

          files.push({
            fileId: file._id,
            name: file.name,
            type: file.type,
            size: file.size,
            thumbnailUrl: null,
          });
        }
      }

      folderDetails.push({
        folderId: folder._id,
        folderName: folder.name,
        files: files,
      });
    }

    return res.status(200).json({ success: true, folders: folderDetails });
  } catch (error) {
    console.error("Error fetching folders: ", error);
    return res.status(500).json({ success: false, message: "Error fetching folders" });
  }
};


const deleteFolder = async (req, res) => {
  const { userId, folderIds } = req.body;
  console.log(userId,folderIds)

  if (!userId || !folderIds) {
    return res.status(400).json({ success: false, message: "User ID and folder ID(s) are required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }


    const folderIdsArray = Array.isArray(folderIds) ? folderIds : [folderIds];


    const foldersToDelete = await Folder.find({
      _id: { $in: folderIdsArray },
      owner: userId,
    });

    if (foldersToDelete.length === 0) {
      return res.status(404).json({ success: false, message: "No folders found or they do not belong to the user" });
    }


    await Folder.deleteMany({ _id: { $in: folderIdsArray } });

    return res.status(200).json({ success: true, message: `${foldersToDelete.length} folder(s) deleted successfully` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error deleting folder(s)" });
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
  ListFolder,
  deleteFolder
};
