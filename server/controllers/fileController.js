const { IncomingForm } = require("formidable");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = "D:/ffmpeg-7.1-essentials_build/bin/ffmpeg.exe";
const jsmediatags = require("jsmediatags");
const busboy = require("busboy");
const File = require("../models/fileSchema");
const User = require("../models/userSchema");
ffmpeg.setFfmpegPath(ffmpegPath);
const { exec } = require("child_process");
const os = require("os");
const mongoose = require("mongoose");

const TARGET_DIR = path.join(
  "D:",
  "Github_Repository",
  "BioKey",
  "server",
  "uploads"
);

const getFileCategory = (filename) => {
  const ext = path.extname(filename).toLowerCase();

  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".tiff",
    ".webp",
    ".svg",
    ".ico",
  ];
  if (imageExtensions.includes(ext)) return "images";

  const videoExtensions = [
    ".mp4",
    ".mkv",
    ".avi",
    ".mov",
    ".wmv",
    ".flv",
    ".webm",
    ".3gp",
    ".m4v",
  ];
  if (videoExtensions.includes(ext)) return "videos";

  const audioExtensions = [
    ".mp3",
    ".wav",
    ".aac",
    ".flac",
    ".ogg",
    ".wma",
    ".m4a",
    ".opus",
    ".amr",
  ];
  if (audioExtensions.includes(ext)) return "audios";

  return "others";
};

const createThumbnail = async (filePath, userId, fileCategory, fileName) => {
  try {
    const thumbnailDir = path.join(
      TARGET_DIR,
      userId,
      "thumbnails",
      fileCategory
    );

    const thumbnailPath = path.join(
      thumbnailDir,
      `${path.parse(fileName).name}.webp`
    );

    await fs.promises.mkdir(thumbnailDir, { recursive: true });

    if (fileCategory === "images") {
      await sharp(filePath).resize(500, 500).webp().toFile(thumbnailPath);
      return thumbnailPath;
    } else if (fileCategory === "videos") {
      return new Promise((resolve, reject) => {
        ffmpeg(filePath)
          .screenshots({
            count: 1,
            timemarks: ["00:00:01.000"],
            folder: path.dirname(thumbnailPath),
            filename: path.basename(thumbnailPath),
            size: "500x?",
          })
          .on("end", () => resolve(thumbnailPath))
          .on("error", (err) =>
            reject({ error: "Error creating video thumbnail", details: err })
          );
      });
    } else if (fileCategory === "audios") {
      return new Promise((resolve, reject) => {
        jsmediatags.read(filePath, {
          onSuccess: async (tag) => {
            const albumArt = tag.tags["APIC"];
            if (albumArt?.data) {
              try {
                let imageBuffer;
                if (Buffer.isBuffer(albumArt.data)) {
                  imageBuffer = albumArt.data;
                } else if (Array.isArray(albumArt.data)) {
                  imageBuffer = Buffer.from(albumArt.data);
                } else if (typeof albumArt.data === "object") {
                  imageBuffer = Buffer.from(albumArt.data.data || []);
                } else {
                  throw new Error("Invalid album art data format");
                }

                const resizedBuffer = await sharp(imageBuffer)
                  .resize(500, 500)
                  .webp()
                  .toBuffer();

                await fs.promises.mkdir(path.dirname(thumbnailPath), {
                  recursive: true,
                });

                await fs.promises.writeFile(thumbnailPath, resizedBuffer);

                resolve(thumbnailPath);
              } catch (error) {
                console.error("Error resizing audio thumbnail:", error);
                reject({
                  error: "Error resizing audio thumbnail",
                  details: error.message,
                });
              }
            } else {
              console.log("No album art found in audio file.");
              resolve(null);
            }
          },
          onError: (error) => {
            console.error("Error reading audio metadata:", error);
            reject({
              error: "Error reading audio metadata",
              details: error.message,
            });
          },
        });
      });
    } else {
      return null;
    }
  } catch (error) {
    throw { error: "Error creating thumbnail", details: error };
  }
};

const deleteTempFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        if (unlinkErr.code === "EPERM") {
          const platform = os.platform();
          let command;

          if (platform === "win32") {
            command = `del /f /q "${filePath}"`;
          } else if (platform === "linux" || platform === "darwin") {
            command = `rm -f "${filePath}"`;
          }

          exec(command, (execErr, stdout, stderr) => {
            if (execErr) {
              console.error("Forced removal failed:", execErr.message);
              reject(execErr);
            } else {
              resolve();
            }
          });
        } else {
          reject(unlinkErr);
        }
      } else {
        resolve();
      }
    });
  });
};

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
        const fileName =
          file.originalFilename ||
          file.name ||
          `default_filename_${Date.now()}`;
        const fileCategory = getFileCategory(fileName);

        const targetDir = path.join(TARGET_DIR, userId, fileCategory);
        const uniqueFileName = getUniqueFilePath(targetDir, fileName);
        const uniqueTargetPath = path.join(targetDir, uniqueFileName);

        let thumbnailPath = null;

        try {
          await fs.promises.mkdir(targetDir, { recursive: true });
          await fs.promises.copyFile(file.filepath, uniqueTargetPath);

          thumbnailPath = await createThumbnail(
            uniqueTargetPath,
            userId,
            fileCategory,
            fileName
          );

          const fileMetadata = new File({
            name: uniqueFileName,
            path: path.join(fileCategory, uniqueFileName),
            type: fileCategory,
            thumbnail: thumbnailPath
              ? path.join(
                "thumbnails",
                fileCategory,
                path.basename(thumbnailPath)
              )
              : null,
            size: file.size,
            owner: userId,
          });

          await fileMetadata.save();
          await deleteTempFile(file.filepath);

          return {
            fileName: uniqueFileName,
            filePath: path.join(fileCategory, uniqueFileName),
            thumbnailPath: thumbnailPath
              ? path.join(
                "thumbnails",
                fileCategory,
                path.basename(thumbnailPath)
              )
              : null,
            category: fileCategory,
          };
        } catch (fileError) {
          console.error("Error processing file:", fileError.message);


          if (fs.existsSync(uniqueTargetPath)) {
            await fs.promises.unlink(uniqueTargetPath);
            console.log(`Deleted file: ${uniqueTargetPath}`);
          }

          if (thumbnailPath && fs.existsSync(thumbnailPath)) {
            await fs.promises.unlink(thumbnailPath);
            console.log(`Deleted thumbnail: ${thumbnailPath}`);
          }

          return {
            error: fileError.message,
            details: fileError.stack,
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

const getUniqueFilePath = (dir, fileName) => {
  let filePath = path.join(dir, fileName);
  let count = 1;

  while (fs.existsSync(filePath)) {
    const ext = path.extname(fileName);
    const baseName = path.basename(fileName, ext);
    const newFileName = `${baseName}(${count})${ext}`;
    filePath = path.join(dir, newFileName);
    count++;
  }

  return path.basename(filePath);
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
              fileId: file._id,
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
            fileId: file._id,
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

  const userFolderPath = path.join(TARGET_DIR, userId);

  const getFolderSize = async (dir) => {
    let totalSize = 0;

    try {
      const files = await fs.promises.readdir(dir, { withFileTypes: true });

      const fileStatsPromises = files.map(async (file) => {
        const filePath = path.join(dir, file.name);

        if (file.isDirectory()) {
          return getFolderSize(filePath);
        } else {
          const stats = await fs.promises.stat(filePath);
          return stats.size;
        }
      });

      const fileSizes = await Promise.all(fileStatsPromises);
      totalSize = fileSizes.reduce((acc, size) => acc + size, 0);
    } catch (err) {
      console.error("Error reading folder:", err.message);
    }

    return totalSize;
  };

  try {
    const stats = await fs.promises.stat(userFolderPath);

    if (!stats.isDirectory()) {
      return res
        .status(400)
        .json({ message: "Provided path is not a directory." });
    }

    const usedSpace = await getFolderSize(userFolderPath);

    res.json({
      userId,
      usedSpace,
    });
  } catch (err) {
    console.error("Error accessing folder:", err.message);
    return res
      .status(500)
      .json({ message: `Error accessing folder: ${err.message}` });
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

    const files = await File.find(query, "name type size thumbnail createdAt isLiked _id"); // Added `isLiked`
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
          isLiked: file.isLiked, // Added `isLiked`
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



const loadImage = async (req, res) => {
  const { userId, fileId } = req.query;

  if (!userId || !fileId) {
    console.error("Missing required parameters");
    return res.status(400).json({ message: "Missing userId or fileId" });
  }

  try {
    const fileRecord = await File.findOne({
      _id: fileId,
      owner: userId,
    });

    if (!fileRecord) {
      console.error("File not found in database");
      return res.status(404).json({ message: "File not found in database" });
    }

    const filePath = path.resolve(TARGET_DIR, userId, fileRecord.path);

    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
    } catch (accessErr) {
      console.error("File not found on disk:", filePath, accessErr);
      return res.status(404).json({ message: "File not found on disk" });
    }

    const stats = await fs.promises.stat(filePath);

    const fileExt = path.extname(fileRecord.name).slice(1).toLowerCase();
    const mimeTypes = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
    };

    const contentType = mimeTypes[fileExt] || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", stats.size);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${fileRecord.name}"`
    );

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);

    readStream.on("error", (err) => {
      console.error("Read stream error:", err);
      res.status(500).json({ message: "Error retrieving file data" });
    });
  } catch (err) {
    console.error("Error retrieving file:", err);
    res.status(500).json({ message: "Error retrieving file data" });
  }
};

const loadVideo = async (req, res) => {
  const { userId, fileId } = req.query;

  if (!userId || !fileId) {
    console.error("Missing required parameters");
    return res.status(400).json({ message: "Missing userId or fileId" });
  }

  try {
    const fileRecord = await File.findOne({
      _id: fileId,
      owner: userId,
    });

    if (!fileRecord) {
      console.error("File not found in database");
      return res.status(404).json({ message: "File not found in database" });
    }

    const filePath = path.join(TARGET_DIR, userId, fileRecord.path);

    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
    } catch (accessErr) {
      console.error("File not found on disk:", filePath, accessErr);
      return res.status(404).json({ message: "File not found on disk" });
    }

    const stat = await fs.promises.stat(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      if (start >= fileSize || end >= fileSize) {
        return res.status(416).json({ message: "Range not satisfiable" });
      }

      const fileStream = fs.createReadStream(filePath, { start, end });

      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
      };

      res.writeHead(206, head);
      fileStream.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };

      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    console.error("Error loading video file:", err.message);
    return res.status(500).json({ message: "Error loading video file." });
  }
};

const loadAudio = async (req, res) => {
  const { userId, fileId } = req.query;

  if (!userId || !fileId) {
    console.error("Missing required parameters");
    return res.status(400).json({ message: "Missing userId or fileId" });
  }

  try {
    const fileRecord = await File.findOne({
      _id: fileId,
      owner: userId,
    });

    if (!fileRecord) {
      console.error("File not found in database");
      return res.status(404).json({ message: "File not found in database" });
    }

    const filePath = path.join(TARGET_DIR, userId, fileRecord.path);

    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
    } catch (accessErr) {
      console.error("File not found on disk:", filePath, accessErr);
      return res.status(404).json({ message: "File not found on disk" });
    }

    const stat = await fs.promises.stat(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      if (start >= fileSize || end >= fileSize) {
        return res.status(416).json({ message: "Range not satisfiable" });
      }

      const fileStream = fs.createReadStream(filePath, { start, end });

      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "audio/mp3",
      };

      res.writeHead(206, head);
      fileStream.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "audio/mp3",
      };

      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    console.error("Error loading audio file:", err.message);
    return res.status(500).json({ message: "Error loading audio file." });
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

module.exports = {
  uploadFile,
  getRecentFiles,
  getUsedSpace,
  loadImage,
  loadVideo,
  loadAudio,
  listFile,
  deleteFile,
};
