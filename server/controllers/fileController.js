const { IncomingForm } = require("formidable");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = "D:/ffmpeg-7.1-essentials_build/bin/ffmpeg.exe";
const jsmediatags = require("jsmediatags");
const File = require("../models/fileSchema");
const User = require("../models/userSchema");
ffmpeg.setFfmpegPath(ffmpegPath);
const { exec } = require("child_process");
const os = require("os");
const mongoose = require("mongoose");
const mime = require("mime-types");
const Minio = require("minio");
const { getUniqueFilePath, createThumbnail, deleteThumbnail, deleteTempFile, getFileCategory } = require("../utils/fileUtils");
const dotenv = require("dotenv").config();


const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT, 10),
  useSSL: process.env.MINIO_USE_SSL == 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME;

const TARGET_DIR = path.join(
  "D:",
  "Github_Repository",
  "BioKey",
  "server",
  "uploads"
);



const uploadFile = (req, res) => {
  const form = new IncomingForm();
  form.multiples = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err.message);
      return res.status(500).json({ message: "Error processing file upload" });
    }

    const userId = fields.userId?.[0] || fields.userId;
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

      const filePromises = uploadedFiles.map(async (file) => {
        const originalFileName =
          file.originalFilename ||
          file.name ||
          `default_filename_${Date.now()}`;
        const fileCategory = getFileCategory(originalFileName);

        
        const uniqueFileName = await getUniqueFilePath(
          BUCKET_NAME,
          `${userId}/${fileCategory}`,
          originalFileName,
          minioClient
        );

        let thumbnailPath = null;

        try {
          
          await minioClient.putObject(
            BUCKET_NAME,
            uniqueFileName,
            file.filepath
          );

          
          thumbnailPath = await createThumbnail(
            file.filepath,
            userId,
            fileCategory,
            originalFileName,  
            minioClient
          );

          if (thumbnailPath) {
            const thumbnailFileName = `${userId}/thumbnails/${fileCategory}/${path.basename(thumbnailPath)}`;
            await minioClient.putObject(
              BUCKET_NAME,
              thumbnailFileName,
              thumbnailPath
            );

            thumbnailPath = thumbnailFileName;
          }

          
          const fileMetadata = new File({
            name: path.basename(uniqueFileName),
            path: uniqueFileName,
            type: fileCategory,
            thumbnail: thumbnailPath,
            size: file.size,
            owner: userId,
          });

          await fileMetadata.save();
          await deleteTempFile(file.filepath);

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


const deleteFile = async (req, res) => {
  const { userId, fileId } = req.body;
  console.log(userId, fileId)

  if (!userId || !fileId) {
    return res.status(400).json({ message: "Missing userId or fileId" });
  }

  try {
    const file = await File.findOne({ _id: fileId, owner: userId });
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const filePath = path.join(TARGET_DIR, file.path);
    const thumbnailPath = file.thumbnail
      ? path.join(TARGET_DIR, file.thumbnail)
      : null;

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log(`Deleted file: ${filePath}`);
    }

    if (thumbnailPath && fs.existsSync(thumbnailPath)) {
      await fs.promises.unlink(thumbnailPath);
      console.log(`Deleted thumbnail: ${thumbnailPath}`);
    }

    await File.deleteOne({ _id: fileId });
    console.log(`Deleted file metadata with ID: ${fileId}`);

    res.status(200).json({
      message: "File and its metadata deleted successfully",
      fileId,
    });
  } catch (error) {
    console.error("Error deleting file:", error.message);
    res
      .status(500)
      .json({ message: "Error deleting file", error: error.message });
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
      .select("name type size createdAt thumbnail isLiked _id");

    if (!files.length) {
      return res.status(200).json({
        message: "No files found for this user",
        files: [],
      });
    }

    const fileResponses = await Promise.all(
      files.map(async (file) => {
        if (file.thumbnail) {
          const thumbnailPath = path.join(TARGET_DIR, userId, file.thumbnail);

          try {
            const fileData = await fs.promises.readFile(thumbnailPath);
            const base64File = `data:image/webp;base64,${fileData.toString(
              "base64"
            )}`;
            return {
              _id: file._id,
              name: file.name,
              type: file.type,
              size: file.size,
              createdAt: file.createdAt,
              thumbnail: base64File,
              isLiked: file.isLiked,
            };
          } catch (err) {
            console.error(
              `Error reading thumbnail for ${file.name}:`,
              err.message
            );
            return {
              _id: file._id,
              name: file.name,
              type: file.type,
              size: file.size,
              createdAt: file.createdAt,
              thumbnail: null,
              isLiked: file.isLiked,
            };
          }
        } else {
          return {
            _id: file._id,
            name: file.name,
            type: file.type,
            size: file.size,
            createdAt: file.createdAt,
            thumbnail: null,
            isLiked: file.isLiked,
          };
        }
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


const getUsedSpace = async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {

    const files = await File.find({ owner: userId });


    if (!files || files.length === 0) {
      return res.json({
        usedSpace: 0,
      });
    }


    const totalSize = files.reduce((acc, file) => {
      if (file.size && typeof file.size === "number") {
        return acc + file.size;
      }
      return acc;
    }, 0);


    res.json({
      usedSpace: totalSize,
    });
  } catch (err) {
    console.error("Error fetching files:", err.message);
    return res
      .status(500)
      .json({ message: `Error fetching files: ${err.message}` });
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
          const thumbnailPath = path.join(TARGET_DIR, userId, file.thumbnail);
          try {
            await fs.promises.access(thumbnailPath);
            const thumbnailData = await fs.promises.readFile(thumbnailPath);
            base64Thumbnail = `data:image/webp;base64,${thumbnailData.toString(
              "base64"
            )}`;
          } catch (err) {
            console.error(
              `Error reading thumbnail for file ${file.name}:`,
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
    console.error("Missing required parameters");
    return res.status(400).json({ message: "Missing userId or fileId" });
  }

  try {

    const fileRecord = await File.findOne({ _id: fileId, owner: userId });
    if (!fileRecord) {
      console.error("File not found in database");
      return res.status(404).json({ message: "File not found in database" });
    }


    const filePath = path.resolve(TARGET_DIR, userId, fileRecord.path);

    let fileStats;
    try {
      fileStats = await fs.promises.stat(filePath);
    } catch (err) {
      console.error("File not found on disk:", filePath, err);
      return res.status(404).json({ message: "File not found on disk" });
    }

    const fileSize = fileStats.size;
    const contentType = mime.lookup(fileRecord.name) || "application/octet-stream";
    const range = req.headers.range;


    if (range && (contentType.startsWith("video/") || contentType.startsWith("audio/"))) {
      const [startPart, endPart] = range.replace(/bytes=/, "").split("-");
      const start = parseInt(startPart, 10) || 0;
      const end = endPart ? parseInt(endPart, 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize || start > end) {
        console.error("Invalid Range request");
        return res.status(416).json({ message: "Range not satisfiable" });
      }

      const chunkSize = end - start + 1;
      const headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": contentType,
      };

      res.writeHead(206, headers);
      const fileStream = fs.createReadStream(filePath, { start, end });
      fileStream.pipe(res).on("error", (err) => {
        console.error("Read stream error:", err);
        res.status(500).end("Error streaming file");
      });

      return;
    }


    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", fileSize);
    res.setHeader("Content-Disposition", `inline; filename="${fileRecord.name}"`);


    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res).on("error", (err) => {
      console.error("Read stream error:", err);
      res.status(500).end("Error retrieving file data");
    });
  } catch (err) {
    console.error("Error retrieving file:", err.message);
    res.status(500).json({ message: "Error retrieving file data" });
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
      _id: { $in: user.likedFiles },
      owner: userId,
    }, "name type size thumbnail createdAt _id isLiked");

    if (!likedFiles || likedFiles.length === 0) {
      return res.status(200).json({ message: "No liked files found", files: [] });
    }


    const processedFiles = await Promise.all(
      likedFiles.map(async (file) => {
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
          isLiked: file.isLiked
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
  getUsedSpace,
  listFile,
  deleteFile,
  listLiked,
  loadFile
};
