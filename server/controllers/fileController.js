const { IncomingForm } = require("formidable");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = "D:/ffmpeg-7.1-essentials_build/bin/ffmpeg.exe";
const jsmediatags = require("jsmediatags");
const busboy = require("busboy");
const File = require("../models/fileSchema");
ffmpeg.setFfmpegPath(ffmpegPath);

const TARGET_DIR = path.join(
  "D:",
  "Github_Repository",
  "BioKey",
  "server",
  "uploads"
);

const getFileCategory = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  if ([".jpg", ".jpeg", ".png"].includes(ext)) return "images";
  if ([".mp4", ".mkv"].includes(ext)) return "videos";
  if ([".mp3", ".wav"].includes(ext)) return "audios";
  return "others";
};

const getUniqueFilePath = (dir, filename) => {
  const ext = path.extname(filename);
  const nameWithoutExt = path.basename(filename, ext);
  let uniquePath = path.join(dir, filename);
  let counter = 1;

  while (fs.existsSync(uniquePath)) {
    uniquePath = path.join(dir, `${nameWithoutExt}_${counter}${ext}`);
    counter++;
  }

  return uniquePath;
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
          .resize(150, 150)
          .webp()
          .toFile(thumbnailPath, (err, info) => {
            if (err) {
              return reject({
                error: "Error creating image thumbnail",
                details: err,
              });
            }
            console.log(`Image thumbnail created: ${thumbnailPath}`);
            resolve(thumbnailPath);
          });
      } else if (fileCategory === "videos") {
        ffmpeg(filePath)
          .screenshots({
            count: 1,
            timemarks: ["00:00:01.000"],
            folder: path.dirname(thumbnailPath),
            filename: path.basename(thumbnailPath),
            size: "150x150",
          })
          .on("end", () => {
            console.log(`Video thumbnail created: ${thumbnailPath}`);
            resolve(thumbnailPath);
          })
          .on("error", (err) => {
            console.error("Error creating video thumbnail:", err);
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
                  .resize(150, 150)
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
                      console.log(`Audio thumbnail created: ${thumbnailPath}`);
                      resolve(thumbnailPath);
                    });
                  })
                  .catch((error) => {
                    console.log("Error resizing image:", error);
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
        console.log(
          `No thumbnail creation for unsupported category: ${fileCategory}`
        );
        resolve(null);
      }
    });
  });
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
        const fileName =
          file.originalFilename ||
          `default_filename_${String(Date.now()).slice(-5)}`;

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

            createThumbnail(sourcePath, userId, fileCategory, fileName)
              .then((thumbnailPath) => {
                console.log("Thumbnail created at:", thumbnailPath);
                fs.unlink(sourcePath, (unlinkErr) => {
                  if (unlinkErr) {
                    console.error(
                      "Error deleting temp file:",
                      unlinkErr.message
                    );
                  } else {
                    console.log("Temporary file deleted:", sourcePath);
                  }
                  resolve({
                    fileName,
                    filePath: targetPath,
                    thumbnailPath: thumbnailPath, // May be `null` for unsupported categories
                    category: fileCategory,
                  });
                });
              })
              .catch((thumbnailErr) => {
                console.error("Error creating thumbnail:", thumbnailErr);
                reject({ fileName, error: "Error creating thumbnail" });
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

const loadImage = async (req, res) => {
  const { userId, category, fileName, folder } =
    req.query || req.body || req.params;

  if (!userId || !category || !fileName) {
    return res.status(400).json({ message: "Missing required parameters." });
  }

  const folderPath = folder
    ? path.join(TARGET_DIR, userId, folder)
    : path.join(TARGET_DIR, userId, category);

  const filePath = path.join(folderPath, fileName);

  try {
    const stats = await fs.promises.stat(filePath);

    res.setHeader("Content-Type", `image/${path.extname(fileName).slice(1)}`);
    res.setHeader("Content-Length", stats.size);
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);

    readStream.on("error", (err) => {
      console.error(err);
      return res.status(500).json({ message: "Error retrieving file data" });
    });
  } catch (err) {
    if (err.code === "ENOENT") {
      return res.status(404).json({ message: "File not found" });
    }
    console.error(err);
    return res.status(500).json({ message: "Error retrieving file data" });
  }
};

const loadVideo = async (req, res) => {
  try {
    const { userId, category, fileName, folder } =
      req.query || req.body || req.params;

    const folderPath = folder
      ? path.join(TARGET_DIR, userId, folder)
      : path.join(TARGET_DIR, userId, category);

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
  getUsedSpace,
  loadImage,
  loadVideo,
  loadAudio,
};
