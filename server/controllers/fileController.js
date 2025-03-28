const fs = require("fs");
const path = require("path");
const Folder = require("../models/folderSchema");
const File = require("../models/fileSchema");
const RecycleBin = require("../models/recycleBinSchema");
const User = require("../models/userSchema");
const mongoose = require("mongoose");
const mime = require("mime-types");
const minioClient = require("../config/minio");
const {
  getUniqueFilePath,
  createThumbnail,
  getFileCategory,
  getFileSizeFromMinIO,
  streamToBuffer,
} = require("../utils/fileUtils");
const formidable = require("formidable");
const Password = require("../models/passwordSchema");

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME;
const maxThumbnailSize = 204800;

const TARGET_DIR = path.join(
  "D:",
  "Github_Repository",
  "BioKey",
  "server",
  "uploads",
);

const uploadFile = async (req, res) => {
  const form = new formidable.IncomingForm({
    multiples: true,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form data:", err.message);
      return res.status(500).json({ message: "Error processing file upload" });
    }
    console.log("Received Files:", files);

    const { userId } = fields;
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const uploadedFiles = Array.isArray(files.file)
        ? files.file
        : [files.file];
      if (!uploadedFiles || uploadedFiles.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      let totalSizeChange = 0;

      const filePromises = uploadedFiles.map(async (file) => {
        const filePath = file.filepath;
        let uniqueFilePath, thumbnailPath;
        let thumbnailSize = 0;
        try {
          const originalFileName =
            file.originalFilename || `default_${Date.now()}`;
          const fileCategory = getFileCategory(originalFileName);
          const fileSize = file.size;

          if (user.totalSpace < user.usedSpace + fileSize + maxThumbnailSize) {
            throw new Error("Insufficient space");
          }

          const folderPath = `${userId}/${fileCategory}`;
          uniqueFilePath = await getUniqueFilePath(
            BUCKET_NAME,
            folderPath,
            originalFileName,
            minioClient,
          );

          const fileStream = fs.createReadStream(filePath);
          await minioClient.putObject(BUCKET_NAME, uniqueFilePath, fileStream);
          fileStream.close();

          thumbnailPath = await createThumbnail(
            filePath,
            userId,
            fileCategory,
            uniqueFilePath,
            minioClient,
          );
          if (thumbnailPath) {
            thumbnailSize = await getFileSizeFromMinIO(
              BUCKET_NAME,
              thumbnailPath,
              minioClient,
            );
          }

          const totalSize = fileSize + thumbnailSize;
          totalSizeChange += totalSize;

          const fileMetadata = new File({
            name: path.basename(uniqueFilePath),
            path: uniqueFilePath,
            type: fileCategory,
            thumbnail: thumbnailPath,
            size: fileSize,
            owner: userId,
          });
          await fileMetadata.save();

          await new Promise((resolve) => {
            fs.unlink(filePath, (err) => {
              if (err && err.code !== "ENOENT" && err.code !== "EPERM") {
                console.error("Error deleting temp file:", err.message);
              }
              resolve();
            });
          });

          return {
            fileName: path.basename(uniqueFilePath),
            filePath: uniqueFilePath,
            thumbnailPath,
            category: fileCategory,
            size: totalSize,
          };
        } catch (error) {
          console.error("File processing error:", error.message);
          try {
            if (uniqueFilePath) {
              await minioClient.removeObject(BUCKET_NAME, uniqueFilePath);
            }
          } catch (cleanupError) {
            console.error("Error removing MinIO file:", cleanupError.message);
          }
          try {
            await fs.promises.unlink(filePath);
          } catch (deleteError) {
            console.error("Error deleting temp file:", deleteError.message);
          }
          return { status: "rejected", reason: error.message, size: 0 };
        }
      });

      const results = await Promise.allSettled(filePromises);

      const successes = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      const errors = results
        .filter((result) => result.status === "rejected")
        .map((result) => result.reason);

      console.log(`User ${userId} previous used space: ${user.usedSpace}`);
      console.log(`Total space change to be added: ${totalSizeChange} bytes`);

      if (successes.length > 0) {
        user.usedSpace += totalSizeChange;
        await user.save();
        console.log(`User ${userId} updated used space: ${user.usedSpace}`);
      }

      if (errors.length > 0) {
        console.error("Upload errors:", errors);
        res.status(207).json({
          message: "Some files failed to upload",
          successes,
          errors: errors.map((error) => error.error || error),
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

const moveToRecycleBin = async (req, res) => {
  try {
    const { userId, fileId } = req.body;

    if (!userId || !fileId) {
      return res.status(400).json({ error: "Provide userId and fileId." });
    }

    const fileIdsArray = Array.isArray(fileId) ? fileId : [fileId];

    const files = await File.find({
      _id: { $in: fileIdsArray },
      owner: userId,
    });

    if (!files.length) {
      return res.status(404).json({ error: "No matching files found." });
    }

    await Folder.updateMany(
      { files: { $in: fileIdsArray } },
      { $pull: { files: { $in: fileIdsArray } } },
    );

    const recycleBinEntries = files.map((file) => ({
      name: file.name,
      originalPath: file.path,
      type: file.type,
      thumbnail: file.thumbnail,
      size: file.size,
      owner: userId,
      deletedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: file.createdAt,
      isLiked: file.isLiked,
    }));

    await RecycleBin.insertMany(recycleBinEntries);

    await File.deleteMany({ _id: { $in: fileIdsArray } });

    return res.status(200).json({
      success: true,
      message: `${files.length} file(s) moved to Recycle Bin successfully.`,
    });
  } catch (error) {
    console.error("Error moving file(s) to Recycle Bin:", error.message);
    return res.status(500).json({
      error: "Error moving file(s) to Recycle Bin.",
      details: error.message,
    });
  }
};

const restoreFile = async (req, res) => {
  try {
    const { userId, RecycleBinId } = req.body;

    if (
      !userId ||
      !RecycleBinId ||
      (Array.isArray(RecycleBinId) && RecycleBinId.length === 0)
    ) {
      return res.status(400).json({
        error: "Provide a valid userId and at least one RecycleBinId.",
      });
    }

    const RecycleBinIdsArray = Array.isArray(RecycleBinId)
      ? RecycleBinId
      : [RecycleBinId];

    const filesToRestore = await RecycleBin.find({
      _id: { $in: RecycleBinIdsArray },
      owner: userId,
    });

    if (filesToRestore.length === 0) {
      return res
        .status(404)
        .json({ error: "No matching files found in Recycle Bin." });
    }

    const restoredFiles = filesToRestore.map((file) => ({
      name: file.name,
      path: file.originalPath,
      type: file.type,
      thumbnail: file.thumbnail,
      size: file.size,
      owner: userId,
      createdAt: file.createdAt || new Date(),
      isLiked: file.isLiked,
    }));

    await File.insertMany(restoredFiles);

    await RecycleBin.deleteMany({ _id: { $in: RecycleBinIdsArray } });

    return res.status(200).json({
      success: true,
      message: `${filesToRestore.length} file(s) restored successfully.`,
    });
  } catch (error) {
    console.error("Error restoring file(s):", error);
    return res.status(500).json({
      error: "Internal server error while restoring files.",
      details: error.message,
    });
  }
};

const permanentlyDeleteFileAndThumbnail = async (req, res) => {
  try {
    const { userId, fileId, all } = req.body;
    console.log("Received request:", { userId, fileId, all });

    if (!userId || (!fileId && !all)) {
      console.error("Missing parameters:", { userId, fileId, all });
      return res
        .status(400)
        .json({ error: "Missing required parameters: userId or fileId." });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found: ${userId}`);
      return res.status(404).json({ error: "User not found." });
    }

    if (all) {
      console.log(`Fetching all files from Recycle Bin for user: ${userId}`);
      const files = await RecycleBin.find({ owner: userId });

      if (!files.length) {
        console.warn(`No files found in Recycle Bin for user: ${userId}`);
        return res
          .status(404)
          .json({ error: "No files found in Recycle Bin." });
      }

      let totalSize = 0;
      const deletePromises = [];

      for (const file of files) {
        const fileSize = file.size + (file.thumbnailSize || 0);
        totalSize += fileSize;
        console.log(`Processing file: ${file.originalPath}, Size: ${fileSize}`);

        deletePromises.push(
          minioClient
            .removeObject(BUCKET_NAME, file.originalPath)
            .then(() => console.log(`Deleted file: ${file.originalPath}`))
            .catch((err) =>
              console.error("Error deleting file from MinIO:", err),
            ),
        );

        if (file.thumbnail) {
          deletePromises.push(
            minioClient
              .removeObject(BUCKET_NAME, file.thumbnail)
              .then(() => console.log(`Deleted thumbnail: ${file.thumbnail}`))
              .catch((err) =>
                console.warn("Failed to delete thumbnail:", file.thumbnail),
              ),
          );
        }
      }

      console.log(`Total space to reduce: ${totalSize}`);

      await Promise.all(deletePromises);

      await User.updateOne(
        { _id: userId },
        { $inc: { usedSpace: -totalSize } },
      );
      await RecycleBin.deleteMany({ owner: userId });

      console.log(`All files permanently deleted for user: ${userId}`);

      return res.status(200).json({
        success: true,
        message: "All files permanently deleted, and user storage updated.",
      });
    }

    if (Array.isArray(fileId) && fileId.length > 0) {
      const deletePromises = [];
      let totalSize = 0;

      for (const id of fileId) {
        console.log(`Fetching file ${id} from Recycle Bin for user: ${userId}`);
        const fileRecord = await RecycleBin.findOne({ _id: id, owner: userId });

        if (!fileRecord) {
          console.warn(`File not found in Recycle Bin: ${id}`);
          continue;
        }

        const { originalPath, thumbnail, size, thumbnailSize = 0 } = fileRecord;
        const sizeToReduce = size + thumbnailSize;
        totalSize += sizeToReduce;

        console.log(`Processing file: ${originalPath}, Size: ${sizeToReduce}`);

        deletePromises.push(
          minioClient
            .removeObject(BUCKET_NAME, originalPath)
            .then(() => console.log(`Deleted file: ${originalPath}`))
            .catch((err) => {
              throw new Error(
                `Failed to delete file from MinIO: ${err.message}`,
              );
            }),
        );

        if (thumbnail) {
          deletePromises.push(
            minioClient
              .removeObject(BUCKET_NAME, thumbnail)
              .then(() => console.log(`Deleted thumbnail: ${thumbnail}`))
              .catch((err) =>
                console.warn(`Failed to delete thumbnail: ${thumbnail}`),
              ),
          );
        }
      }

      await Promise.all(deletePromises);
      await User.updateOne(
        { _id: userId },
        { $inc: { usedSpace: -totalSize } },
      );

      await RecycleBin.deleteMany({ _id: { $in: fileId }, owner: userId });

      console.log(
        `Files permanently deleted for user: ${userId}, Files: ${fileId.join(", ")}`,
      );

      return res.status(200).json({
        success: true,
        message: "Files permanently deleted, and user storage updated.",
      });
    }

    return res.status(400).json({ error: "Invalid fileId format." });
  } catch (error) {
    console.error("Error during permanent deletion:", error.message);
    return res.status(500).json({
      error: "Error permanently deleting file and updating storage.",
      details: error.message,
    });
  }
};

const getRecycleBinFiles = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res
        .status(400)
        .json({ error: "Missing required parameter: userId." });
    }

    const files = await RecycleBin.find({ owner: userId });

    const updatedFiles = await Promise.all(
      files.map(async (file) => {
        let thumbnailUrl = null;
        if (file.thumbnail) {
          try {
            thumbnailUrl = await minioClient.presignedGetObject(
              BUCKET_NAME,
              file.thumbnail,
              24 * 60 * 60,
            );
          } catch (err) {
            console.warn(
              `Failed to generate presigned URL for thumbnail: ${file.thumbnail}`,
              err.message,
            );
          }
        }

        return {
          ...file.toObject(),
          thumbnailUrl,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      files: updatedFiles,
    });
  } catch (error) {
    console.error("Error fetching recycle bin files:", error.message);
    return res.status(500).json({
      error: "Failed to retrieve recycle bin files.",
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
      .sort({ createdAt: -1 })
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
        let preSignedThumbnailUrl = null;

        if (file.thumbnail) {
          try {
            preSignedThumbnailUrl = await minioClient.presignedGetObject(
              process.env.MINIO_BUCKET_NAME,
              file.thumbnail,
              60 * 60,
            );
          } catch (err) {
            console.error(
              `Error fetching thumbnail for ${file.name}:`,
              err.message,
            );
          }
        }

        const folders = await Folder.find({ files: file._id }).select("name");

        return {
          _id: file._id,
          name: file.name,
          type: file.type,
          size: file.size,
          createdAt: file.createdAt,
          thumbnail: preSignedThumbnailUrl,
          isLiked: file.isLiked,
          folders: folders.map((folder) => folder.name),
        };
      }),
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
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      usedSpace: user.usedSpace,
      totalSpace: user.totalSpace,
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

    const files = await File.find(
      query,
      "name type size thumbnail createdAt isLiked _id",
    );

    if (!files || files.length === 0) {
      return res.status(200).json({ message: "No files found", files: [] });
    }

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        let preSignedThumbnailUrl = null;
        if (file.thumbnail) {
          try {
            preSignedThumbnailUrl = await minioClient.presignedGetObject(
              BUCKET_NAME,
              file.thumbnail,
              60 * 60,
            );
          } catch (err) {
            console.warn(
              `Thumbnail not found or error fetching for file ${file.name}:`,
              err.message,
            );
          }
        }

        const folders = await Folder.find({ files: file._id }).select("name");

        return {
          _id: file._id,
          name: file.name,
          type: file.type,
          size: file.size,
          createdAt: file.createdAt,
          thumbnail: preSignedThumbnailUrl,
          isLiked: file.isLiked,
          folders: folders.map((folder) => folder.name),
        };
      }),
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
    const contentType =
      mime.lookup(fileRecord.name) || "application/octet-stream";

    const presignedUrl = await minioClient.presignedGetObject(
      BUCKET_NAME,
      filePath,
      60 * 60,
      {
        "Response-Content-Type": contentType,
      },
    );

    res.json({
      url: presignedUrl,
      contentType: contentType,
      filename: fileRecord.name,
      size: fileRecord.size,
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

    const files = await File.find({ _id: { $in: folder.files } }).select(
      "name type size thumbnail createdAt _id",
    );
    if (!files || files.length === 0) {
      return res
        .status(200)
        .json({ message: "No files found in the folder", files: [] });
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
            console.error(
              `Error reading thumbnail for file ${file.name}:`,
              err.message,
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
        };
      }),
    );

    return res.status(200).json({
      message: "Files retrieved successfully from folder",
      files: processedFiles,
    });
  } catch (error) {
    console.error("Error listing folder files:", error.message);
    return res
      .status(500)
      .json({ message: "Error retrieving files from folder" });
  }
};

const allFileMetaData = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const files = await File.find(
      { owner: userId },
      "name type size createdAt _id",
    );

    const passwords = await Password.find(
      { userId },
      "name userName email website note createdAt _id",
    );

    const processedFiles = files.map(
      ({ _id, name, type, size, createdAt }) => ({
        _id,
        name,
        type,
        size,
        createdAt,
      }),
    );

    const processedPasswords = passwords.map(
      ({ _id, name, userName, email, website, note, createdAt }) => ({
        _id,
        name,
        userName,
        email,
        website,
        note,
        createdAt,
      }),
    );

    return res.status(200).json({
      message: "Data retrieved successfully",
      files: processedFiles,
      passwords: processedPasswords,
    });
  } catch (error) {
    console.error("Error retrieving data:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = {
  uploadFile,
  getRecentFiles,
  getSpace,
  listFile,
  moveToRecycleBin,

  loadFile,
  allFileMetaData,
  restoreFile,
  permanentlyDeleteFileAndThumbnail,
  getRecycleBinFiles,
};
