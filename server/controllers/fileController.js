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

  const imageExts = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".tiff",
    ".svg",
    ".heif",
    ".heic",
    ".raw",
    ".ico",
    ".apng",
    ".avif",
  ];

  const videoExts = [
    ".mp4",
    ".avi",
    ".mov",
    ".wmv",
    ".flv",
    ".mkv",
    ".webm",
    ".mpeg",
    ".mpg",
    ".3gp",
    ".m4v",
    ".ogg",
    ".rm",
    ".rmvb",
    ".ts",
    ".divx",
    ".vob",
    ".f4v",
    ".swf",
  ];

  const audioExts = [
    ".mp3",
    ".wav",
    ".aac",
    ".flac",
    ".ogg",
    ".wma",
    ".m4a",
    ".alac",
    ".opus",
    ".aiff",
    ".ape",
    ".mka",
    ".mid",
    ".midi",
    ".spx",
  ];

  const docExts = [
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".rtf",
    ".odt",
    ".ods",
    ".odp",
    ".epub",
    ".md",
    ".tex",
    ".csv",
    ".xml",
    ".json",
    ".yaml",
    ".html",
    ".chm",
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

const resizeThumbnail = (buffer, size) => {
  const dimensions =
    size === "recent"
      ? { width: 150, height: 150 }
      : { width: 500, height: 500 };

  return sharp(buffer).resize(dimensions.width, dimensions.height).toBuffer();
};

const generateImageThumbnail = (file, method) => {
  return sharp(file.filePath)
    .toBuffer()
    .then((buffer) => resizeThumbnail(buffer, method))
    .then((finalBuffer) => ({
      ...file,
      thumbnail: `data:image/png;base64,${finalBuffer.toString("base64")}`,
    }))
    .catch(() => ({
      ...file,
      thumbnail: null,
    }));
};

const generateVideoThumbnail = (file, method) => {
  return new Promise((resolve, reject) => {
    const tempThumbnailPath = path.join(
      os.tmpdir(),
      `${path.basename(file.name, path.extname(file.name))}_thumbnail.png`
    );

    ffmpeg(file.filePath)
      .screenshots({
        count: 1,
        timemarks: ["0"],
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

          resizeThumbnail(data, method)
            .then((finalBuffer) => {
              cleanUp(tempThumbnailPath);
              resolve({
                ...file,
                thumbnail: `data:image/png;base64,${finalBuffer.toString(
                  "base64"
                )}`,
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

const generateAudioThumbnail = (file, method) => {
  const filePath = file.filePath;
  return new Promise((resolve, reject) => {
    jsmediatags.read(filePath, {
      onSuccess: function (tag) {
        const albumArt = tag.tags["APIC"];

        if (albumArt) {
          const imageData = albumArt.data;

          if (imageData && imageData.data) {
            const imageBuffer = Buffer.from(imageData.data);

            resizeThumbnail(imageBuffer, method)
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
            return generateImageThumbnail(file, "recent");
          } else if (file.category === "videos") {
            return generateVideoThumbnail(file, "recent");
          } else if (file.category === "audios") {
            return generateAudioThumbnail(file, "recent");
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

const getFilesByCategory = async (req, res) => {
  const { userId, category } = req.query;

  if (!userId || !category) {
    return res.status(400).json({
      error: "userId and category are required parameters.",
    });
  }

  const folderPath = path.join(TARGET_DIR, userId, category);

  try {
    const files = [];

    if (fs.existsSync(folderPath)) {
      const fileNames = fs.readdirSync(folderPath);

      for (const fileName of fileNames) {
        const filePath = path.join(folderPath, fileName);
        if (fs.statSync(filePath).isFile()) {
          const stats = fs.statSync(filePath);
          const file = {
            name: fileName,
            filePath,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            thumbnail: null,
            category: category,
          };

          let fileWithThumbnail = { ...file };

          try {
            if (category === "images") {
              fileWithThumbnail =
                (await generateImageThumbnail(fileWithThumbnail)) ||
                fileWithThumbnail;
            } else if (category === "videos") {
              fileWithThumbnail =
                (await generateVideoThumbnail(fileWithThumbnail)) ||
                fileWithThumbnail;
            } else if (category === "audios") {
              fileWithThumbnail =
                (await generateAudioThumbnail(fileWithThumbnail)) ||
                fileWithThumbnail;
            } else if (category === "documents") {
              fileWithThumbnail.thumbnail = null;
            }
          } catch (thumbnailError) {
            console.error("Error generating thumbnail:", thumbnailError);

            fileWithThumbnail.thumbnail = null;
          }

          if (!fileWithThumbnail.thumbnail) {
            fileWithThumbnail.thumbnail = null;
          }

          files.push({
            fileName: fileWithThumbnail.name,
            size: fileWithThumbnail.size,
            createdAt: fileWithThumbnail.createdAt,
            modifiedAt: fileWithThumbnail.modifiedAt,
            thumbnail: fileWithThumbnail.thumbnail,
            category: fileWithThumbnail.category,
          });
        }
      }

      return res.json({
        success: true,
        files,
      });
    } else {
      return res.status(404).json({
        error: `Folder not found for userId: ${userId}, category: ${category}`,
      });
    }
  } catch (error) {
    console.error("Error fetching files:", error);
    return res.status(500).json({
      error: "An error occurred while fetching files.",
      details: error.message,
    });
  }
};

const deleteFile = (req, res) => {
  const { userId, filename } = req.body;

  const fileCategory = getFileCategory(filename);
  const targetDir = path.join(TARGET_DIR, userId, fileCategory);
  const targetPath = path.join(targetDir, filename);

  fs.access(targetPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("File not found:", targetPath);
      return res.status(404).json({ message: "File not found" });
    }

    fs.unlink(targetPath, (deleteErr) => {
      if (deleteErr) {
        console.error("Error deleting file:", deleteErr.message);
        return res
          .status(500)
          .json({ message: "Error deleting file", error: deleteErr });
      }

      console.log("File deleted successfully:", targetPath);
      return res.status(200).json({ message: "File deleted successfully" });
    });
  });
};

const createSaveFolder = (req, res) => {
  const form = new IncomingForm();
  form.multiples = true;

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err.message);
      return res.status(500).json({ message: "Error processing file upload" });
    }

    const userId = fields.userId?.[0] || fields.userId;
    const folderName = fields.folderName?.[0] || fields.folderName;

    if (!userId) {
      console.error("Missing userId in the request.");
      return res.status(400).json({ message: "Missing userId" });
    }

    if (!folderName) {
      console.error("Missing folderName in the request.");
      return res.status(400).json({ message: "Missing folderName" });
    }

    const userDir = path.join(TARGET_DIR, userId);
    const folderPath = path.join(userDir, folderName);

    fs.mkdir(folderPath, { recursive: true }, (mkdirErr) => {
      if (mkdirErr) {
        console.error("Error creating directory:", mkdirErr.message);
        return res
          .status(500)
          .json({ message: "Error creating folder", error: mkdirErr.message });
      }

      console.log("Folder created successfully or already exists:", folderPath);

      if (!files.file || files.file.length === 0) {
        return res.status(200).json({
          message: "Folder created successfully, no files uploaded",
          folderPath,
        });
      }

      const uploadedFiles = Array.isArray(files.file)
        ? files.file
        : [files.file];
      const uploadPromises = uploadedFiles.map((file) => {
        return new Promise((resolve, reject) => {
          const fileName =
            file.originalFilename ||
            `default_filename_${String(Date.now()).slice(-5)}`;

          const targetPath = path.join(folderPath, fileName);
          const sourcePath = file.filepath;

          const readStream = fs.createReadStream(sourcePath);
          const writeStream = fs.createWriteStream(targetPath);

          readStream.pipe(writeStream);

          writeStream.on("finish", () => {
            fs.unlink(sourcePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error("Error deleting temp file:", unlinkErr.message);
              } else {
                console.log("Temporary file deleted:", sourcePath);
              }
            });

            resolve({
              fileName,
              filePath: targetPath,
            });
          });

          writeStream.on("error", (copyErr) => {
            console.error("Error copying file:", copyErr.message);
            reject({ error: "Error saving file", detail: copyErr.message });
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
        .catch((error) => {
          console.error("Error uploading files:", error);
          res.status(500).json({
            message: "Some files failed to upload",
            errors: error,
          });
        });
    });
  });
};

module.exports = {
  uploadFile,
  deleteFile,
  getRecentFiles,
  getUsedSpace,
  getFilesByCategory,
  createSaveFolder,
};
