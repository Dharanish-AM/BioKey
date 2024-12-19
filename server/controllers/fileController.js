const { IncomingForm } = require("formidable");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = "D:/ffmpeg-7.1-essentials_build/bin/ffmpeg.exe";
const pdf = require("pdf-poppler");
const os = require("os");
const jsmediatags = require("jsmediatags");

ffmpeg.setFfmpegPath(ffmpegPath);

const TARGET_DIR = path.join(
  "D:",
  "Github_Repository",
  "BioKey",
  "server",
  "uploads"
);

const getFileCategory = (fileName) => {
  const ext = path.extname(fileName).toLowerCase();

  const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
  const videoExts = [".mp4", ".avi", ".mov", ".wmv", ".flv", ".mkv", ".webm"];
  const audioExts = [".mp3", ".wav", ".aac", ".flac", ".ogg", ".wma"];
  const docExts = [
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
  ];

  if (imageExts.includes(ext)) return "images";
  if (videoExts.includes(ext)) return "videos";
  if (audioExts.includes(ext)) return "audios";
  if (docExts.includes(ext)) return "documents";
  return "documents";
};

const uploadFile = (req, res) => {
  const form = new IncomingForm();
  form.multiples = true;

  console.log("Starting file upload process...");

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err.message);
      return res.status(500).json({ message: "Error processing file upload" });
    }

    console.log("Form parsed successfully.");

    const userId = fields.userId?.[0] || fields.userId;
    if (!userId) {
      console.error("Missing userId in the request.");
      return res.status(400).json({ message: "Missing userId" });
    }
    console.log("UserId obtained:", userId);

    const uploadedFiles = Array.isArray(files.file) ? files.file : [files.file];
    console.log("Files received for upload:", uploadedFiles);

    if (!uploadedFiles || uploadedFiles.length === 0) {
      console.error("No files uploaded.");
      return res.status(400).json({ message: "No files uploaded" });
    }

    console.log("Proceeding with file upload...");

    const uploadPromises = uploadedFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const fileName = file.originalFilename;
        const fileCategory = getFileCategory(fileName);

        console.log("Processing file:", fileName);
        console.log("File category:", fileCategory);

        const targetDir = path.join(TARGET_DIR, userId, fileCategory);
        console.log("Target directory:", targetDir);

        fs.mkdir(targetDir, { recursive: true }, (mkdirErr) => {
          if (mkdirErr) {
            console.error("Error creating directory:", mkdirErr.message);
            return reject({ fileName, error: "Error creating directory" });
          }

          console.log(
            "Directory created successfully or already exists:",
            targetDir
          );

          const targetPath = getUniqueFilePath(targetDir, fileName);
          console.log("Target file path for saving:", targetPath);

          const sourcePath = file.filepath;
          const readStream = fs.createReadStream(sourcePath);
          const writeStream = fs.createWriteStream(targetPath);

          readStream.pipe(writeStream);

          writeStream.on("finish", () => {
            console.log("File write completed:", targetPath);
            fs.unlink(sourcePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error("Error deleting temp file:", unlinkErr.message);
              } else {
                console.log("Temporary file deleted:", sourcePath);
              }
              resolve({
                fileName,
                filePath: targetPath,
                category: fileCategory,
              });
            });
          });

          writeStream.on("error", (copyErr) => {
            console.error("Error copying file:", copyErr.message);
            reject({ fileName, error: "Error saving file" });
          });
        });
      });
    });

    Promise.all(uploadPromises)
      .then((results) => {
        console.log("All files uploaded successfully.");
        res.status(200).json({
          message: "Files uploaded successfully",
          files: results,
        });
      })
      .catch((errors) => {
        console.error("Error uploading files:", errors);
        res.status(500).json({
          message: "Some files failed to upload",
          errors,
        });
      });
  });
};

const getUniqueFilePath = (dir, fileName) => {
  let targetPath = path.join(dir, fileName);
  let fileBaseName = path.parse(fileName).name;
  let fileExt = path.parse(fileName).ext;
  let counter = 1;

  while (fs.existsSync(targetPath)) {
    targetPath = path.join(dir, `${fileBaseName} (${counter})${fileExt}`);
    counter++;
  }

  return targetPath;
};

const generateImageThumbnail = (file) => {
  return sharp(file.filePath)
    .resize(200, 200)
    .toBuffer()
    .then((buffer) => ({
      ...file,
      thumbnail: `data:image/png;base64,${buffer.toString("base64")}`,
    }))
    .catch(() => ({
      ...file,
      thumbnail: null,
    }));
};

const generateVideoThumbnail = (file) => {
  return new Promise((resolve, reject) => {
    const tempThumbnailPath = path.join(
      os.tmpdir(),
      `${path.basename(file.name, path.extname(file.name))}_thumbnail.png`
    );

    ffmpeg(file.filePath)
      .screenshots({
        count: 1,
        timemarks: ["0"],
        size: "200x200",
        folder: path.dirname(tempThumbnailPath),
        filename: path.basename(tempThumbnailPath),
      })
      .on("end", () => {
        fs.readFile(tempThumbnailPath, (err, data) => {
          if (err) {
            console.error("Error reading thumbnail file:", err);
            cleanUp(tempThumbnailPath);
            reject(err);
            return;
          }

          sharp(data)
            .resize(200, 200, {
              fit: sharp.fit.fill,
              position: sharp.strategy.entropy,
            })
            .toBuffer()
            .then((buffer) => {
              cleanUp(tempThumbnailPath);
              resolve({
                ...file,
                thumbnail: `data:image/png;base64,${buffer.toString("base64")}`,
              });
            })
            .catch((sharpErr) => {
              console.error("Error resizing image with sharp:", sharpErr);
              cleanUp(tempThumbnailPath);
              reject(sharpErr);
            });
        });
      })
      .on("error", (err) => {
        console.error("Error generating video thumbnail:", err);
        cleanUp(tempThumbnailPath);
        reject(err);
      });

    const cleanUp = (filePath) => {
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error(
                "Error deleting temporary thumbnail file:",
                unlinkErr
              );
            }
          });
        }
      });
    };
  });
};

const generateAudioThumbnail = (file) => {
  const filePath = file.filePath;
  return new Promise((resolve, reject) => {
    jsmediatags.read(filePath, {
      onSuccess: function (tag) {
        const albumArt = tag.tags["APIC"];

        if (albumArt) {
          const imageData = albumArt.data;

          if (imageData && imageData.data) {
            const imageBuffer = Buffer.from(imageData.data);

            sharp(imageBuffer)
              .resize(200, 200)
              .toBuffer()
              .then((resizedBuffer) => {
                const imageBase64 = resizedBuffer.toString("base64");
                file.thumbnail = `data:image/jpeg;base64,${imageBase64}`;
                resolve(file);
              })
              .catch((error) => {
                console.log("Error resizing image:", error);
                file.thumbnail = null;
                resolve(file);
              });
          } else {
            console.log("Album artwork data is not in the expected format");
            file.thumbnail = null;
            resolve(file);
          }
        } else {
          console.log("No album artwork found");
          file.thumbnail = null;
          resolve(file);
        }
      },
      onError: function (error) {
        console.log("Error reading metadata:", error);
        file.thumbnail = null;
        reject(error);
      },
    });
  });
};

const getRecentFiles = (req, res) => {
  const userId = req.params.userId || req.query.userId || req.body.userId;

  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  const userDir = path.join(TARGET_DIR, userId);

  fs.access(userDir, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`User directory not found: ${userDir}`);
      return res.status(404).json({ message: "User directory not found" });
    }

    const allFiles = [];

    const readFilesRecursively = (dir) => {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        const itemPath = path.join(dir, item.name);

        if (item.isDirectory()) {
          readFilesRecursively(itemPath);
        } else {
          const category = getFileCategory(item.name);
          const stats = fs.statSync(itemPath);
          allFiles.push({
            name: item.name,
            size: stats.size,
            modifiedTime: stats.mtime,
            filePath: itemPath,
            category,
            thumbnail: null,
          });
        }
      }
    };

    try {
      readFilesRecursively(userDir);

      allFiles.sort((a, b) => b.modifiedTime - a.modifiedTime);

      const recentFiles = allFiles.slice(0, 7);

      Promise.all(
        recentFiles.map((file) => {
          if (file.category === "images") {
            return generateImageThumbnail(file);
          } else if (file.category === "videos") {
            return generateVideoThumbnail(file);
          } else if (file.category === "audios") {
            return generateAudioThumbnail(file);
          } else if (
            file.category === "documents" &&
            file.name.endsWith(".pdf")
          ) {
            file.thumbnail = null;
            return Promise.resolve(file);
          } else {
            return Promise.resolve(file);
          }
        })
      )
        .then((filesWithThumbnails) => {
          return res.status(200).json({
            message: "Recent files retrieved successfully",
            files: filesWithThumbnails,
          });
        })
        .catch((error) => {
          console.error("Error generating thumbnails:", error.message);
          return res
            .status(500)
            .json({ message: "Error generating thumbnails" });
        });
    } catch (error) {
      console.error("Error reading files:", error.message);
      return res.status(500).json({ message: "Error retrieving files" });
    }
  });
};

const getUsedSpace = (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  const userFolderPath = path.join(TARGET_DIR, userId);

  const getFolderSize = (dir) => {
    let totalSize = 0;

    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        totalSize += getFolderSize(filePath);
      } else {
        totalSize += stats.size;
      }
    });

    return totalSize;
  };

  fs.stat(userFolderPath, (err, stats) => {
    if (err) {
      return res
        .status(500)
        .json({ message: `Error accessing folder: ${err.message}` });
    } else if (!stats.isDirectory()) {
      return res
        .status(400)
        .json({ message: "Provided path is not a directory." });
    } else {
      const usedSpace = getFolderSize(userFolderPath);
      res.json({
        userId,
        usedSpace,
      });
    }
  });
};

const readMetadata = (filePath) => {
  jsmediatags.read(filePath, {
    onSuccess: function (tag) {
      console.log("Metadata:", tag);
      const albumArt = tag.tags["APIC"];
      if (albumArt) {
        const imageData = albumArt.data;

        if (imageData && imageData.data) {
          const imageBuffer = Buffer.from(imageData.data);
          const imageBase64 = imageBuffer.toString("base64");
          console.log("Album Artwork (Base64):", imageBase64);
        } else {
          console.log("Album artwork data is not in expected format");
        }
      } else {
        console.log("No album artwork found");
      }
    },
    onError: function (error) {
      console.log("Error reading metadata:", error);
    },
  });
};

module.exports = { uploadFile, getRecentFiles, getUsedSpace };
