const User = require("../models/userSchema");
const File = require("../models/fileSchema");
const Folder = require("../models/folderSchema");
const Device = require("../models/deviceSchema")
const Stock = require("../models/stockSchema")
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const mongoose = require("mongoose");
const sharp = require("sharp");
const minioClient = require("../config/minio")
const { validateEmail, validatePassword } = require("../utils/validator");
const generateToken = require("../utils/generateToken");
const UserNotification = require("../models/notificationSchema");
const ActivityLog = require("../models/activityLogsSchema");

const TARGET_DIR = path.join(
  "D:",
  "Github_Repository",
  "BioKey",
  "server",
  "uploads"
);

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME

const NodeRSA = require("node-rsa");

const { generateUniqueKey, decodeUniqueKey } = require('../utils/uniqueKey');

const register = async (req, res) => {
  try {
    const { name, email, phone, password, location, gender, serialNumber = null, fingerPrint = null, confirmPassword, notificationToken } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword || !location || !gender) {
      return res.status(400).json({ success: false, message: "Please fill in all fields." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords don't match." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use." });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let existingStockDevice = null;
    if (serialNumber) {
      existingStockDevice = await Stock.findOne({ serialNumber });

      if (!existingStockDevice) {
        return res.status(400).json({ success: false, message: "Device with this serial number is not found in stock." });
      }

      device = await Device.findOne({ serialNumber });

      if (device && device.owner) {
        return res.status(400).json({ success: false, message: "Device is already registered to another user." });
      }

      if (!device) {
        device = new Device({ serialNumber, owner: null });
        existingStockDevice.deviceStatus = "registered";

        await device.save();
        await existingStockDevice.save();
      }
    }


    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      location,
      gender,
      device: device ? device._id : null,
      notificationToken
    });

    await user.save();

    if (device) {
      device.owner = user._id;

      if (fingerPrint) {
        const { id, name } = fingerPrint;
        if (!id || !name) {
          return res.status(400).json({ success: false, message: "Fingerprint details are incomplete." });
        }

        const existingFingerprint = device.fingerprints.find(fp => fp.id === id);
        if (existingFingerprint) {
          return res.status(400).json({ success: false, message: "Fingerprint ID already exists for this device." });
        }

        device.fingerprints.push({ id, name, date: new Date() });
      }

      const key = new NodeRSA({ b: 2048 });
      const privateKey = key.exportKey("private");
      const publicKey = key.exportKey("public");

      device.privateKey = privateKey;


      const uniqueKey = generateUniqueKey(user._id, user.email)

      console.log(uniqueKey)

      await device.save();
      existingStockDevice.assignedTo = user._id
      await existingStockDevice.save()

      res.status(201).json({

        success: true,
        message: "User and device registered successfully.",
        publicKey: publicKey,
        uniqueKey: uniqueKey,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          location: user.location,
          gender: user.gender,
          device: user.device,
        },
      });
    } else {
      res.status(201).json({
        success: true,
        message: "User registered successfully (No device linked).",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          location: user.location,
          gender: user.gender,
        },
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error creating user." });
  }
};



const loginWithCredentials = async (req, res) => {
  try {
    const { email, password, activityLog } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please fill in all fields." });
    }

    const deviceName = activityLog?.deviceName || "Unknown";
    const ipAddress = activityLog?.ip || "N/A";
    const location = activityLog?.location || { district: "N/A", region: "N/A", country: "N/A" };
    const latitude = location.latitude ?? null;
    const longitude = location.longitude ?? null;


    const user = await User.findOne({ email });


    if (!user) {
      return res.status(400).json({ success: false, message: "User not found." });
    }


    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      try {

        await ActivityLog.create({
          userId: user._id,
          deviceName,
          ipAddress,
          location: { district: location.district, region: location.region, country: location.country },
          latitude,
          longitude,
          mode: "credentials",
          status: "Failed",
        });
      } catch (logError) {
        console.warn("Activity Log Error (Invalid Credentials):", logError.message);
      }

      return res.status(400).json({ success: false, message: "Invalid credentials." });
    }


    const token = generateToken(user._id, user.name, user.email);
    if (!token) {
      return res.status(500).json({ success: false, message: "Failed to generate token." });
    }


    try {
      await ActivityLog.create({
        userId: user._id,
        deviceName,
        ipAddress,
        location: { district: location.district, region: location.region, country: location.country },
        latitude,
        longitude,
        mode: "credentials",
        status: "Success",
      });
    } catch (logError) {
      console.warn("Activity Log Error (Successful Login):", logError.message);
    }

    res.status(200).json({ success: true, message: "User logged in successfully.", token });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Error logging in." });
  }
};



const loginWithFingerPrint = async (req, res) => {
  try {
    const { uniqueKeyEncrypted, serialNumber } = req.body;

    if (!uniqueKeyEncrypted || !serialNumber) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const device = await Device.findOne({ serialNumber });

    if (!device || !device.privateKey) {
      return res.status(400).json({ success: false, message: "Device not found or private key missing." });
    }

    try {
      const privateKey = new NodeRSA(device.privateKey);
      const decryptedToken = privateKey.decrypt(uniqueKeyEncrypted, "utf8");

      const decoded = decodeUniqueKey(decryptedToken);

      if (!decoded || !decoded.userId) {
        return res.status(400).json({ success: false, message: "Invalid token." });
      }


      const token = generateToken(decoded.userId, decoded.name, decoded.email);

      return res.status(200).json({
        success: true,
        message: "Login successful.",
        user: decoded,
        token,
      });
    } catch (err) {
      console.error("Decryption or token verification failed:", err);
      return res.status(400).json({ success: false, message: "Failed to authenticate." });
    }
  } catch (error) {
    console.error("Error in loginWithFingerPrint:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};



const getUser = async (req, res) => {
  try {
    const userId = req.query.userId;


    if (!userId) {
      return res.status(400).json({ success: false, message: "UserId is required." });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId format." });
    }


    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }


    if (user.profile) {

      try {

        const profileStream = await minioClient.getObject(BUCKET_NAME, user.profile);


        const imageBuffer = await new Promise((resolve, reject) => {
          const chunks = [];
          profileStream.on('data', (chunk) => chunks.push(chunk));
          profileStream.on('end', () => resolve(Buffer.concat(chunks)));
          profileStream.on('error', (err) => reject(err));
        });


        const compressedImageBuffer = await sharp(imageBuffer)
          .resize({ width: 500 })
          .webp({ quality: 100 })
          .toBuffer();


        user.profile = `data:image/webp;base64,${compressedImageBuffer.toString("base64")}`;
      } catch (err) {
        console.error("Error fetching profile image from MinIO:", err.message);
        user.profile = null;
      }
    }


    res.status(200).json({
      success: true,
      message: "User fetched successfully.",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching user." });
  }
};


const updateProfile = async (req, res) => {
  try {
    const { userId, profileData } = req.body;
    console.log(userId, profileData)

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }


    user.name = profileData.name || user.name;
    user.email = profileData.email || user.email;
    user.phone = profileData.phone || user.phone;
    user.gender = profileData.gender || user.gender;
    user.location = profileData.location || user.location;


    await user.save();


    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

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
      path: "files",
      select: "name type size thumbnail createdAt",
    });

    if (!folders || folders.length === 0) {
      return res.status(404).json({ success: false, message: "No folders found for this user" });
    }

    const folderDetails = await Promise.all(
      folders.map(async (folder) => {
        const files = await Promise.all(
          folder.files.map(async (file) => {
            let preSignedThumbnailUrl = null;
            if (file.thumbnail) {
              try {
                preSignedThumbnailUrl = await minioClient.presignedGetObject(
                  process.env.MINIO_BUCKET_NAME,
                  file.thumbnail,
                  24 * 60 * 60
                );
              } catch (error) {
                console.error(`Error generating presigned URL for file ${file.name}: `, error);
              }
            }


            const fileFolders = await Folder.find({ files: file._id }).select("name");

            return {
              _id: file._id,
              name: file.name,
              type: file.type,
              size: file.size,
              createdAt: file.createdAt,
              thumbnail: preSignedThumbnailUrl,
              folders: fileFolders.map((f) => f.name),
            };
          })
        );

        return {
          folderId: folder._id,
          folderName: folder.name,
          files: files,
        };
      })
    );

    return res.status(200).json({ success: true, folders: folderDetails });
  } catch (error) {
    console.error("Error fetching folders: ", error);
    return res.status(500).json({ success: false, message: "Error fetching folders" });
  }
};


const deleteFolder = async (req, res) => {
  const { userId, folderIds } = req.body;

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

const renameFolder = async (req, res) => {
  try {
    const { userId, folderId, newFolderName } = req.body;

    if (!userId || !folderId || !newFolderName) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }


    const folder = await Folder.findOneAndUpdate(
      { _id: folderId, owner: userId },
      { name: newFolderName },
      { new: true }
    );

    if (!folder) {
      return res.status(404).json({ success: false, message: "Folder not found." });
    }

    res.status(200).json({ success: true, message: "Folder renamed successfully", folder });
  } catch (error) {
    console.error("Error renaming folder:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const listLiked = async (req, res) => {
  const { userId } = req.query;

  try {
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const likedFiles = await File.find(
      { isLiked: true, owner: userId },
      "name type size createdAt _id isLiked thumbnail"
    );

    if (!likedFiles || likedFiles.length === 0) {
      return res.status(200).json({ message: "No liked files found", files: [] });
    }

    const processedFiles = await Promise.all(
      likedFiles.map(async (file) => {
        let preSignedThumbnailUrl = null;
        if (file.thumbnail) {
          try {
            preSignedThumbnailUrl = await minioClient.presignedGetObject(BUCKET_NAME, file.thumbnail, 60 * 60);
          } catch (err) {
            console.warn(`Thumbnail not found or error fetching for file ${file.name}:`, err.message);
          }
        }


        const folders = await Folder.find({ files: file._id }).select("name");

        return {
          _id: file._id,
          name: file.name,
          type: file.type,
          size: file.size,
          createdAt: file.createdAt,
          isLiked: file.isLiked,
          thumbnail: preSignedThumbnailUrl,
          folders: folders.map(folder => folder.name),
        };
      })
    );

    return res.status(200).json({
      message: "Liked files retrieved successfully",
      files: processedFiles,
    });
  } catch (error) {
    console.error("Error retrieving liked files:", error.message);
    return res.status(500).json({ message: "Error retrieving liked files" });
  }
};

const updateProfileImage = async (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ success: false, message: "Error parsing form data" });
    }

    const { userId } = fields;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      if (!files?.profileImage) {
        return res.status(400).json({ success: false, message: 'No image uploaded' });
      }

      const profileImage = Array.isArray(files.profileImage) ? files.profileImage[0] : files.profileImage;
      const fileExtension = profileImage.originalFilename
        ? profileImage.originalFilename.split('.').pop()
        : "png";

      const fileName = `profile.${fileExtension}`;
      const userFolder = userId;

      const filePath = profileImage.filepath;
      if (!filePath) {
        return res.status(400).json({ success: false, message: "File path is missing" });
      }

      if (!fs.existsSync(filePath)) {
        return res.status(400).json({ success: false, message: "File not found at the specified path" });
      }

      const fileStream = fs.createReadStream(filePath);

      await minioClient.putObject(
        BUCKET_NAME,
        `${userFolder}/${fileName}`,
        fileStream,
        async (err, etag) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Error uploading image to MinIO',
            });
          }

          user.profile = `${userId}/${fileName}`;
          await user.save();

          return res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
          });
        }
      );
    } catch (error) {
      console.error("Error processing request:", error);
      return res.status(500).json({
        success: false,
        message: "Error processing request",
      });
    }
  });
};

const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.query;

    const userNotifications = await UserNotification.findOne({ userId });

    if (!userNotifications) {
      return res.json({ success: true, notifications: [] });
    }

    res.json({ success: true, notifications: userNotifications.notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching notifications", error });
  }
};


const clearNotifications = async (req, res) => {
  try {
    const { userId, notificationId, isAll = false } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    let result;

    if (isAll) {

      result = await UserNotification.updateOne(
        { userId },
        { $set: { notifications: [] } }
      );
    } else if (notificationId) {

      result = await UserNotification.updateOne(
        { userId },
        { $pull: { notifications: { _id: notificationId } } }
      );
    } else {
      return res.status(400).json({ success: false, message: "Specify notificationId or set isAll to true" });
    }

    return res.status(200).json({ success: true, message: "Notification(s) deleted", result });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return res.status(500).json({ success: false, message: "Server error", error });
  }
};

const getActivityLogs = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const logs = await ActivityLog.find({ userId }).sort({ date: -1 });

    return res.status(200).json({ success: true, logs: logs.length > 0 ? logs : [] });

  } catch (err) {
    console.error("Error fetching activity logs:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};



module.exports = {
  register,
  loginWithCredentials,
  deleteUser,
  getUser,
  setProfile,
  createFolder,
  addFilesToFolder,
  likeOrUnlikeFile,
  ListFolder,
  deleteFolder,
  renameFolder,
  listLiked,
  updateProfile,
  updateProfileImage,
  loginWithFingerPrint,
  getUserNotifications,
  clearNotifications,
  getActivityLogs
};
