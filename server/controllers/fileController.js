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

const createThumbnail = (filePath, userId, fileCategory, fileName) => {
  return new Promise((resolve, reject) => {
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

    fs.mkdir(thumbnailDir, { recursive: true }, (err) => {
      if (err) {
        return reject({
          error: "Error creating thumbnail directory",
          details: err,
        });
      }

      if (fileCategory === "images") {
        sharp(filePath)
          .resize(500, 500)
          .webp()
          .toFile(thumbnailPath, (err, info) => {
            if (err) {
              return reject({
                error: "Error creating image thumbnail",
                details: err,
              });
            }
            resolve(thumbnailPath);
          });
      } else if (fileCategory === "videos") {
        ffmpeg(filePath)
          .screenshots({
            count: 1,
            timemarks: ["00:00:01.000"],
            folder: path.dirname(thumbnailPath),
            filename: path.basename(thumbnailPath),

            size: "500x?",
          })
          .on("end", () => {
            resolve(thumbnailPath);
          })
          .on("error", (err) => {
            reject({ error: "Error creating video thumbnail", details: err });
          });
      } else if (fileCategory === "audios") {
        jsmediatags.read(filePath, {
          onSuccess: function (tag) {
            const albumArt = tag.tags["APIC"];

            if (albumArt) {
              const imageData = albumArt.data;

              if (imageData && imageData.data) {
                const imageBuffer = Buffer.from(imageData.data);

                sharp(imageBuffer)
                  .resize(500, 500)
                  .webp()
                  .toBuffer()
                  .then((resizedBuffer) => {
                    fs.writeFile(thumbnailPath, resizedBuffer, (err) => {
                      if (err) {
                        return reject({
                          error: "Error saving audio thumbnail",
                          details: err,
                        });
                      }
                      resolve(thumbnailPath);
                    });
                  })
                  .catch((error) => {
                    reject({
                      error: "Error resizing audio thumbnail",
                      details: error,
                    });
                  });
              } else {
                reject({ error: "No album artwork found in audio file" });
              }
            }
          },
          onError: function (error) {
            reject({ error: "Error reading audio metadata", details: error });
          },
        });
      } else {
        resolve(null);
      }
    });
  });
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

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err.message);
      return res.status(500).json({ message: "Error processing file upload" });
    }

    const userId = fields.userId?.[0] || fields.userId;
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    User.findById(userId)
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const uploadedFiles = Array.isArray(files.file)
          ? files.file
          : [files.file];
        if (!uploadedFiles || uploadedFiles.length === 0) {
          return res.status(400).json({ message: "No files uploaded" });
        }

        const uploadPromises = uploadedFiles.map((file) => {
          return new Promise((resolve, reject) => {
            const fileName =
              file.originalFilename || `default_filename_${Date.now()}`;
            const fileCategory = getFileCategory(fileName);

            const targetDir = path.join(TARGET_DIR, userId, fileCategory);

            const uniqueFileName = getUniqueFilePath(targetDir, fileName);
            const uniqueTargetPath = path.join(targetDir, uniqueFileName);

            fs.mkdir(targetDir, { recursive: true }, (mkdirErr) => {
              if (mkdirErr) {
                return reject({ fileName, error: "Error creating directory" });
              }

              const sourcePath = file.filepath;
              const readStream = fs.createReadStream(sourcePath);
              const writeStream = fs.createWriteStream(uniqueTargetPath);

              readStream.pipe(writeStream);

              writeStream.on("finish", () => {
                const thumbnailPath = path.join(
                  "thumbnails",
                  fileCategory,
                  `${Date.now()}_${fileName.replace(
                    path.extname(fileName),
                    ".webp"
                  )}`
                );

                createThumbnail(sourcePath, userId, fileCategory, thumbnailPath)
                  .then((thumbnailPath) => {
                    const relativeFilePath = path.join(
                      fileCategory,
                      uniqueFileName
                    );
                    const relativeThumbnailPath = thumbnailPath
                      ? path.join(
                          "thumbnails",
                          fileCategory,
                          path.basename(thumbnailPath)
                        )
                      : null;

                    const fileMetadata = new File({
                      name: uniqueFileName,
                      path: relativeFilePath,
                      type: fileCategory,
                      thumbnail: relativeThumbnailPath || null,
                      size: file.size,
                      owner: userId,
                    });

                    fileMetadata
                      .save()
                      .then(() => {
                        deleteTempFile(sourcePath)
                          .then(() => {
                            resolve({
                              fileName: uniqueFileName,
                              filePath: relativeFilePath,
                              thumbnailPath: relativeThumbnailPath,
                              category: fileCategory,
                            });
                          })
                          .catch((deleteErr) => {
                            reject({
                              fileName: uniqueFileName,
                              error: "Error deleting temp file",
                            });
                          });
                      })
                      .catch(() => {
                        reject({
                          fileName: uniqueFileName,
                          error: "Error saving file metadata",
                        });
                      });
                  })
                  .catch(() => {
                    reject({
                      fileName: uniqueFileName,
                      error: "Error creating thumbnail",
                    });
                  });
              });

              writeStream.on("error", () => {
                reject({
                  fileName: uniqueFileName,
                  error: "Error saving file",
                });
              });
            });
          });
        });

        Promise.all(uploadPromises)
          .then((results) => {
            res.status(200).json({
              message: "Files uploaded successfully",
              files: results,
            });
          })
          .catch((errors) => {
            res.status(500).json({
              message: "Some files failed to upload",
              errors,
            });
          });
      })
      .catch(() => {
        res.status(500).json({ message: "Database error" });
      });
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

const deleteFile = (req, res) => {
  const { userId, fileName, category } = req.body;

  if (!userId || !fileName || !category) {
    return res
      .status(400)
      .json({ message: "Missing userId, fileName, or category" });
  }

  const targetDir = path.join(TARGET_DIR, userId, category);
  const filePath = path.join(targetDir, fileName);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file from local storage:", err.message);
      return res
        .status(500)
        .json({ message: "Error deleting file from local storage" });
    }

    File.findOneAndDelete({ name: fileName, owner: userId, type: category })
      .then((deletedFile) => {
        if (!deletedFile) {
          return res
            .status(404)
            .json({ message: "File not found in database" });
        }

        res.status(200).json({ message: "File deleted successfully" });
      })
      .catch((err) => {
        console.error(
          "Error deleting file metadata from database:",
          err.message
        );
        res.status(500).json({ message: "Error deleting file from database" });
      });
  });
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
    const user = await User.findById(new mongoose.Types.ObjectId(userId));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const files = await File.find({ owner: userId })
      .sort({ updatedAt: -1 })
      .limit(7);

    if (files.length === 0) {
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
            const fileData = fs.readFileSync(thumbnailPath);
            const base64File = `data:image/webp;base64,${fileData.toString(
              "base64"
            )}`;

            return {
              fileName: file.name,
              fileType: file.type,
              size: file.size,
              createdAt: file.createdAt,
              thumbnail: base64File,
            };
          } catch (err) {
            console.error("Error reading file:", err.message);
            return {
              fileName: file.name,
              fileType: file.type,
              size: file.size,
              createdAt: file.createdAt,
              thumbnail: null,
            };
          }
        } else {
          return {
            fileName: file.name,
            fileType: file.type,
            size: file.size,
            createdAt: file.createdAt,
            thumbnail: null,
          };
        }
      })
    );

    res.status(200).json({
      message: "Recent files retrieved successfully",
      files: fileResponses,
    });
  } catch (err) {
    console.error("Error retrieving files:", err.message);
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

    const files = await File.find(query);

    if (!files || files.length === 0) {
      return res.status(200).json({
        message: "No files found",
        files: [],
      });
    }

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        // Check if thumbnail exists before using it
        let base64Thumbnail = null;
        if (file.thumbnail) {
          const thumbnailPath = path.join(TARGET_DIR, userId, file.thumbnail);
          try {
            if (fs.existsSync(thumbnailPath)) {
              const thumbnailData = fs.readFileSync(thumbnailPath);
              base64Thumbnail = `data:image/webp;base64,${thumbnailData.toString(
                "base64"
              )}`;
            }
          } catch (err) {
            console.error(
              `Error reading thumbnail for file ${file.name}:`,
              err.message
            );
          }
        }

        return {
          name: file.name,
          type: file.type,
          size: file.size,
          thumbnail: base64Thumbnail,
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
  const { userId, category, fileName, folder } =
    req.query || req.body || req.params;

  if (!userId || !category || !fileName) {
    console.error("Missing required parameters");
    return res.status(400).json({ message: "Missing required parameters." });
  }

  try {
    const fileRecord = await File.findOne({
      owner: userId,
      type: category,
      name: fileName,
    });

    if (!fileRecord) {
      console.error("File not found in database");
      return res.status(404).json({ message: "File not found in database" });
    }

    const folderPath = folder
      ? path.join(TARGET_DIR, userId, folder)
      : path.join(TARGET_DIR, userId);
    const filePath = path.resolve(folderPath, fileRecord.path);

    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
    } catch (accessErr) {
      console.error("File not found on disk:", filePath, accessErr);
      return res.status(404).json({ message: "File not found on disk" });
    }

    const stats = await fs.promises.stat(filePath);

    const fileExt = path.extname(fileName).slice(1).toLowerCase();
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
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);

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
  try {
    const { userId, category, fileName, folder } =
      req.query || req.body || req.params;

    if (!userId || !category || !fileName) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const fileRecord = await File.findOne({
      owner: userId,
      type: category,
      name: fileName,
    });

    if (!fileRecord) {
      return res.status(404).json({ message: "File not found in database" });
    }

    const folderPath = folder
      ? path.join(TARGET_DIR, userId, folder)
      : path.join(TARGET_DIR, userId, category);

    const filePath = path.join(folderPath, fileName);

    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
    } catch {
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
  try {
    const { userId, category, fileName, folder } = req.query;

    if (!userId || !category || !fileName) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const folderPath = folder
      ? path.join("uploads", userId, folder)
      : path.join("uploads", userId, category);

    const filePath = path.join(folderPath, fileName);

    const fileExists = await fs.promises
      .access(filePath, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      return res.status(404).json({ message: "File not found" });
    }

    const stat = await fs.promises.stat(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const [startRange, endRange] = range.replace(/bytes=/, "").split("-");
      const start = parseInt(startRange, 10);
      const end = endRange ? parseInt(endRange, 10) : fileSize - 1;
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
  } catch (error) {
    console.error("Error loading audio stream:", error.message);
    return res.status(500).json({ message: "Error loading audio file." });
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
