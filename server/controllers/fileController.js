const fs = require("fs");
const path = require("path");
const File = require("../models/fileSchema");
const User = require("../models/userSchema");
const mongoose = require("mongoose");
const mime = require("mime-types");
const minioClient = require("../config/minio")
const { getUniqueFilePath, createThumbnail, deleteTempFile, getFileCategory, getFileSizeFromMinIO, streamToBuffer } = require("../utils/fileUtils");
const upload = require("../config/multer");

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME;
const maxThumbnailSize = 204800;

const TARGET_DIR = path.join(
  "D:",
  "Github_Repository",
  "BioKey",
  "server",
  "uploads"
);

const uploadFile = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Error uploading files:", err.message);
      return res.status(500).json({ message: "Error processing file upload" });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const uploadedFiles = req.files;
      if (!uploadedFiles || uploadedFiles.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const filePromises = uploadedFiles.map(async (file) => {
        const originalFileName = file.originalname || `default_filename_${Date.now()}`;
        const fileCategory = getFileCategory(originalFileName);
        const fileSize = file.size;

        console.log("File Size from Buffer", fileSize);

        if (user.totalSpace < user.usedSpace + fileSize + maxThumbnailSize) {
          return res.status(400).json({ message: "Insufficient space" });
        }

        const uniqueFileName = await getUniqueFilePath(
          BUCKET_NAME,
          `${userId}/${fileCategory}`,
          originalFileName,
          minioClient
        );

        let thumbnailPath = null;
        let thumbnailSize = 0;

        console.log("Uploading file to MinIO:", uniqueFileName);

        try {
          const fileStream = fs.createReadStream(file.path);
          await minioClient.putObject(BUCKET_NAME, uniqueFileName, fileStream);


          thumbnailPath = await createThumbnail(file.path, userId, fileCategory, uniqueFileName, minioClient);

          if (thumbnailPath) {
            thumbnailSize = await getFileSizeFromMinIO(BUCKET_NAME, thumbnailPath, minioClient);
          }

          const originalFileSize = await getFileSizeFromMinIO(BUCKET_NAME, uniqueFileName, minioClient);
          console.log("Original file size from MinIO:", originalFileSize);

          const fileMetadata = new File({
            name: path.basename(uniqueFileName),
            path: uniqueFileName,
            type: fileCategory,
            thumbnail: thumbnailPath,
            size: originalFileSize,
            owner: userId,
          });

          await fileMetadata.save();

          user.usedSpace += originalFileSize + thumbnailSize;
          await user.save();

          await deleteTempFile(file.path);

          return {
            fileName: path.basename(uniqueFileName),
            filePath: uniqueFileName,
            thumbnailPath,
            category: fileCategory,
          };
        } catch (fileError) {
          console.error("Error processing file:", fileError);

          try {
            await minioClient.removeObject(BUCKET_NAME, uniqueFileName);
          } catch (cleanupError) {
            console.error("Error cleaning up file in MinIO:", cleanupError.message);
          }

          if (thumbnailPath) {
            await minioClient.removeObject(BUCKET_NAME, thumbnailPath);
          }

          return {
            error: fileError.message || "Unknown error",
            details: fileError.stack || "No stack available",
          };
        }
      });

      const results = await Promise.allSettled(filePromises);

      const successes = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      const errors = results
        .filter((result) => result.status === "rejected")
        .map((result) => result.reason);

      if (errors.length > 0) {
        console.error("Upload errors:", errors);
        res.status(207).json({
          message: "Some files failed to upload",
          successes,
          errors: errors.map((error) => error.error),
        });
      } else {
        res.status(200).json({
          message: "Files uploaded successfully",
          files: successes,
        });
      }
    } catch (dbError) {
      console.error("Database error:", dbError.message);
      res.status(500).json({ message: "Database error" });
    }
  });
};



const deleteFileAndThumbnail = async (req, res) => {
  try {
    const { userId, fileId } = req.body;


    if (!userId || !fileId) {
      return res.status(400).json({ error: "Missing required parameters: userId or fileId." });
    }


    const fileRecord = await File.findOne({ _id: fileId, userId });
    if (!fileRecord) {
      return res.status(404).json({ error: "File not found for the given user." });
    }

    const { filePath, thumbnailPath, size: fileSize } = fileRecord;


    let thumbnailSize = 0;
    if (thumbnailPath) {
      try {
        const thumbnailStats = await minioClient.statObject(BUCKET_NAME, thumbnailPath);
        thumbnailSize = thumbnailStats.size;
      } catch (err) {
        console.warn(`Thumbnail not found or stat failed: ${thumbnailPath}. Skipping size calculation.`);
      }
    }


    const sizeToReduce = fileSize + thumbnailSize;


    await minioClient.removeObject(BUCKET_NAME, filePath);
    console.log(`Deleted file: ${filePath}`);


    if (thumbnailPath) {
      try {
        await minioClient.removeObject(BUCKET_NAME, thumbnailPath);
        console.log(`Deleted thumbnail: ${thumbnailPath}`);
      } catch (thumbnailErr) {
        console.warn(`Failed to delete thumbnail: ${thumbnailPath}.`);
      }
    }


    await User.updateOne({ _id: userId }, { $inc: { usedSpace: -sizeToReduce } });
    console.log(`Reduced ${sizeToReduce} bytes from user ${userId}'s storage quota.`);


    await File.deleteOne({ _id: fileId });
    console.log(`Removed file metadata from the database for fileId: ${fileId}`);

    return res.status(200).json({
      success: true,
      message: "File and thumbnail deleted successfully, and user quota updated.",
    });
  } catch (error) {
    console.error("Error during deletion:", error.message);
    return res.status(500).json({
      error: "Error deleting file and thumbnail or updating user quota.",
      details: error.message,
    });
  }
};



const getRecentFiles = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  try {
    const user = await User.exists({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    const files = await File.find({ owner: userId })
      .sort({ updatedAt: -1 })
      .limit(7)
      .select("name type size createdAt thumbnail isLiked path");

    if (!files.length) {
      return res.status(200).json({
        message: "No files found for this user",
        files: [],
      });
    }

    const fileResponses = await Promise.all(
      files.map(async (file) => {
        const filePath = file.path;

        let fileThumbnail = null;
        if (file.thumbnail) {
          try {
            const thumbnailBuffer = await minioClient.getObject(process.env.MINIO_BUCKET_NAME, file.thumbnail);
            fileThumbnail = `data:image/webp;base64,${thumbnailBuffer.toString("base64")}`;
          } catch (err) {
            console.error(`Error fetching thumbnail for ${file.name}:`, err.message);
            fileThumbnail = null;
          }
        }

        return {
          _id: file._id,
          name: file.name,
          type: file.type,
          size: file.size,
          createdAt: file.createdAt,
          thumbnail: fileThumbnail,
          isLiked: file.isLiked,
        };
      })
    );

    res.status(200).json({
      message: "Recent files retrieved successfully",
      files: fileResponses,
    });
  } catch (err) {
    console.error("Error retrieving recent files:", err.message);
    res.status(500).json({ message: "Error retrieving recent files" });
  }
};


const getSpace = async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {

    const user = await File.findById(userId);


    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    res.json({
      usedSpace: user.usedSpace,
      totalSpace: user.totalSpace
    });
  } catch (err) {
    console.error("Error fetching space:", err.message);
    return res
      .status(500)
      .json({ message: `Error fetching space: ${err.message}` });
  }
};


const listFile = async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId || req.params.userId;
    const category =
      req.query.category || req.body.category || req.params.category;

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

    const query = { owner: userId };
    if (category) query.type = category;

    const files = await File.find(query, "name type size thumbnail createdAt isLiked _id");
    if (!files || files.length === 0) {
      return res.status(200).json({ message: "No files found", files: [] });
    }


    const processedFiles = await Promise.all(
      files.map(async (file) => {
        let base64Thumbnail = null;
        if (file.thumbnail) {
          try {

            const thumbnailStream = await minioClient.getObject(
              BUCKET_NAME,
              file.thumbnail
            );
            const thumbnailBuffer = await streamToBuffer(thumbnailStream);
            base64Thumbnail = `data:image/webp;base64,${thumbnailBuffer.toString(
              "base64"
            )}`;
          } catch (err) {
            console.warn(
              `Thumbnail not found or error fetching for file ${file.name}:`,
              err.message
            );
          }
        }

        return {
          _id: file._id,
          name: file.name,
          type: file.type,
          size: file.size,
          createdAt: file.createdAt,
          thumbnail: base64Thumbnail,
          isLiked: file.isLiked,
        };
      })
    );

    return res.status(200).json({
      message: "Files retrieved successfully",
      files: processedFiles,
    });
  } catch (error) {
    console.error("Error listing files:", error.message);
    return res.status(500).json({ message: "Error retrieving files" });
  }
};



const loadFile = async (req, res) => {
  const { userId, fileId } = req.query;

  if (!userId || !fileId) {
    return res.status(400).json({ message: "Missing userId or fileId" });
  }

  try {
    const fileRecord = await File.findOne({ _id: fileId, owner: userId });
    if (!fileRecord) {
      return res.status(404).json({ message: "File not found in database" });
    }

    const filePath = fileRecord.path;
    const contentType = mime.lookup(fileRecord.name) || "application/octet-stream";

    const presignedUrl = await minioClient.presignedUrl('GET', BUCKET_NAME, filePath, 60 * 60);


    res.json({
      url: presignedUrl,
      contentType: contentType,
      filename: fileRecord.name,
      size: fileRecord.size
    });

  } catch (err) {
    console.error("Error generating presigned URL:", err);
    res.status(500).json({ message: "Error generating presigned URL" });
  }
};


const ListFolderFiles = async (req, res) => {
  try {
    const { userId, folderName } = req.body;


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


    const folder = user.folders.find((folder) => folder.name === folderName);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }


    const files = await File.find({ _id: { $in: folder.files } }).select("name type size thumbnail createdAt _id");
    if (!files || files.length === 0) {
      return res.status(200).json({ message: "No files found in the folder", files: [] });
    }


    const processedFiles = await Promise.all(
      files.map(async (file) => {
        let base64Thumbnail = null;
        if (file.thumbnail) {
          const thumbnailPath = path.join(TARGET_DIR, userId, file.thumbnail);
          try {
            await fs.promises.access(thumbnailPath);
            const thumbnailData = await fs.promises.readFile(thumbnailPath);
            base64Thumbnail = `data:image/webp;base64,${thumbnailData.toString("base64")}`;
          } catch (err) {
            console.error(`Error reading thumbnail for file ${file.name}:`, err.message);
          }
        }

        return {
          _id: file._id,
          name: file.name,
          type: file.type,
          size: file.size,
          createdAt: file.createdAt,
          thumbnail: base64Thumbnail,
        };
      })
    );


    return res.status(200).json({
      message: "Files retrieved successfully from folder",
      files: processedFiles,
    });
  } catch (error) {
    console.error("Error listing folder files:", error.message);
    return res.status(500).json({ message: "Error retrieving files from folder" });
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


    const likedFiles = await File.find({
      isLiked: true,
      owner: userId,
    }, "name type size createdAt _id isLiked path");

    if (!likedFiles || likedFiles.length === 0) {
      return res.status(200).json({ message: "No liked files found", files: [] });
    }

    const processedFiles = await Promise.all(
      likedFiles.map(async (file) => {

        const fileStream = await minioClient.getObject(BUCKET_NAME, file.path);


        let base64File = '';
        fileStream.on('data', (chunk) => {
          base64File += chunk.toString('base64');
        });


        await new Promise((resolve, reject) => {
          fileStream.on('end', resolve);
          fileStream.on('error', reject);
        });

        return {
          _id: file._id,
          name: file.name,
          type: file.type,
          size: file.size,
          createdAt: file.createdAt,
          isLiked: file.isLiked,
          fileBase64: base64File,
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



module.exports = {
  uploadFile,
  getRecentFiles,
  getSpace,
  listFile,
  deleteFileAndThumbnail,
  listLiked,
  loadFile
};
