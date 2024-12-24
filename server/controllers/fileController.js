const { IncomingForm } = require("formidable");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = "D:/ffmpeg-7.1-essentials_build/bin/ffmpeg.exe";
const pdf = require("pdf-poppler");
const os = require("os");
const jsmediatags = require("jsmediatags");
const busboy = require("busboy");

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

    const fileBuffer = await fs.promises.readFile(filePath);
    const base64Data = fileBuffer.toString("base64");

    res.status(200).json({
      fileName,
      fileSize: stats.size,
      fileType: path.extname(fileName),
      base64Data,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
    });
  } catch (err) {
    if (err.code === "ENOENT") {
      return res.status(404).json({ message: "File not found" });
    }
    console.error(err);
    return res.status(500).json({ message: "Error retrieving file data" });
  }
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

const dummyUpload = async (req, res) => {
  if (!req.headers["content-type"]) {
    return res.status(400).send("Missing Content-Type header");
  }

  const bb = busboy({ headers: req.headers });
  let userId = "jp";
  console.log(userId);

  const uploadDir = path.join(TARGET_DIR, userId);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  const filename = "hi.txt";

  bb.on("file", (fieldname, file, encoding, mimeType) => {
    if (typeof filename === "string") {
      console.log(`Uploading file: ${filename}`);
      const saveTo = path.join(uploadDir, filename);
      file.pipe(fs.createWriteStream(saveTo));

      file.on("end", () => {
        console.log(`File ${filename} uploaded successfully.`);
      });
    } else {
      console.log(`Received invalid filename: ${filename}`);
      res.status(400).send("Invalid file upload.");
    }
  });

  bb.on("field", (fieldname, val) => {
    console.log(`Received field: ${fieldname} with value: ${val}`);
  });

  bb.on("finish", () => {
    res.status(200).send("File uploaded successfully.");
  });

  req.pipe(bb);
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

const generateImageThumbnail = async (file, method) => {
  try {
    const buffer = await sharp(file.filePath).toBuffer();
    const finalBuffer = await resizeThumbnail(buffer, method);
    return {
      ...file,
      thumbnail: `data:image/png;base64,${finalBuffer.toString("base64")}`,
    };
  } catch (error) {
    console.error("Error generating image thumbnail:", error);
    return { ...file, thumbnail: null };
  }
};

const generateVideoThumbnail = async (file, method) => {
  const tempThumbnailPath = path.join(
    os.tmpdir(),
    `${path.basename(file.name, path.extname(file.name))}_thumbnail.png`
  );

  try {
    const stats = await fs.promises.access(
      path.dirname(tempThumbnailPath),
      fs.constants.W_OK
    );
    await new Promise((resolve, reject) => {
      ffmpeg(file.filePath)
        .screenshots({
          count: 1,
          timemarks: ["0"],
          folder: path.dirname(tempThumbnailPath),
          filename: path.basename(tempThumbnailPath),
        })
        .on("end", resolve)
        .on("error", reject);
    });

    const data = await fs.promises.readFile(tempThumbnailPath);
    const resizedBuffer = await resizeThumbnail(data, method);
    await fs.promises.unlink(tempThumbnailPath);

    return {
      ...file,
      thumbnail: `data:image/png;base64,${resizedBuffer.toString("base64")}`,
    };
  } catch (err) {
    console.error("Error generating video thumbnail:", err);
    await fs.promises.unlink(tempThumbnailPath);
    return { ...file, thumbnail: null };
  }
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

const resizeThumbnail = (buffer, size) => {
  const dimensions =
    size === "recent"
      ? { width: 150, height: 150 }
      : { width: 500, height: 500 };

  return sharp(buffer).resize(dimensions.width, dimensions.height).toBuffer();
};

const getRecentFiles = async (req, res) => {
  const userId = req.params.userId || req.query.userId || req.body.userId;

  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  const userDir = path.join(TARGET_DIR, userId);

  try {
    const userDirExists = await fs.promises
      .access(userDir, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);

    if (!userDirExists) {
      console.error(`User directory not found: ${userDir}`);
      return res.status(404).json({ message: "User directory not found" });
    }

    const allFiles = [];

    const readFilesRecursively = async (dir) => {
      const items = await fs.promises.readdir(dir, { withFileTypes: true });
      const filePromises = items.map(async (item) => {
        const itemPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          return readFilesRecursively(itemPath);
        } else {
          const category = getFileCategory(item.name);
          const stats = await fs.promises.stat(itemPath);
          allFiles.push({
            name: item.name,
            size: stats.size,
            modifiedTime: stats.mtime,
            filePath: itemPath,
            category,
            thumbnail: null,
          });
        }
      });
      await Promise.all(filePromises);
    };

    await readFilesRecursively(userDir);

    allFiles.sort((a, b) => b.modifiedTime - a.modifiedTime);

    const recentFiles = allFiles.slice(0, 7);

    const filesWithThumbnails = await Promise.all(
      recentFiles.map(async (file) => {
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
          return file;
        } else {
          return file;
        }
      })
    );

    return res.status(200).json({
      message: "Recent files retrieved successfully",
      files: filesWithThumbnails,
    });
  } catch (error) {
    console.error("Error retrieving files:", error.message);
    return res.status(500).json({ message: "Error retrieving files" });
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
      const files = await fs.promises.readdir(dir);

      const fileStatsPromises = files.map(async (file) => {
        const filePath = path.join(dir, file);
        const stats = await fs.promises.stat(filePath);

        if (stats.isDirectory()) {
          return getFolderSize(filePath);
        } else {
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

const getFilesByCategory = async (req, res) => {
  const { userId, category, page = 1, limit } = req.query;
  console.log("Fetching files of category - " + category);

  if (!userId || !category) {
    return res.status(400).json({
      error: "userId and category are required parameters.",
    });
  }

  const categories =
    category === "all"
      ? ["images", "videos", "audios", "documents"]
      : [category];

  try {
    const allFiles = [];

    await Promise.all(
      categories.map(async (cat) => {
        const folderPath = path.join(TARGET_DIR, userId, cat);

        if (fs.existsSync(folderPath)) {
          const fileNames = await fs.promises.readdir(folderPath);
          const filesToReturn =
            limit == 0 || !limit
              ? fileNames
              : fileNames.slice((page - 1) * limit, page * limit);

          await Promise.all(
            filesToReturn.map(async (fileName) => {
              const filePath = path.join(folderPath, fileName);
              const stats = await fs.promises.stat(filePath);

              if (stats.isFile()) {
                const file = {
                  name: fileName,
                  filePath,
                  size: stats.size,
                  createdAt: stats.birthtime,
                  modifiedAt: stats.mtime,
                  thumbnail: null,
                  category: cat,
                };

                let fileWithThumbnail = { ...file };

                try {
                  if (cat === "images") {
                    fileWithThumbnail =
                      (await generateImageThumbnail(fileWithThumbnail)) ||
                      fileWithThumbnail;
                  } else if (cat === "videos") {
                    fileWithThumbnail =
                      (await generateVideoThumbnail(fileWithThumbnail)) ||
                      fileWithThumbnail;
                  } else if (cat === "audios") {
                    fileWithThumbnail =
                      (await generateAudioThumbnail(fileWithThumbnail)) ||
                      fileWithThumbnail;
                  } else if (cat === "documents") {
                    fileWithThumbnail.thumbnail = null;
                  }
                } catch (thumbnailError) {
                  console.error("Error generating thumbnail:", thumbnailError);
                  fileWithThumbnail.thumbnail = null;
                }

                if (!fileWithThumbnail.thumbnail) {
                  fileWithThumbnail.thumbnail = null;
                }

                allFiles.push({
                  fileName: fileWithThumbnail.name,
                  size: fileWithThumbnail.size,
                  createdAt: fileWithThumbnail.createdAt,
                  modifiedAt: fileWithThumbnail.modifiedAt,
                  thumbnail: fileWithThumbnail.thumbnail,
                  category: fileWithThumbnail.category,
                });
              }
            })
          );
        } else {
          console.warn(
            `Folder not found for userId: ${userId}, category: ${cat}`
          );
        }
      })
    );

    console.log(
      `Successfully fetched ${allFiles.length} files for userId: ${userId}, category: ${category}`
    );

    return res.json({
      success: true,
      files: allFiles,
      page: parseInt(page),
      limit: limit == 0 || !limit ? "All" : parseInt(limit),
      totalFiles: allFiles.length,
    });
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

    fs.exists(folderPath, (exists) => {
      if (!exists) {
        fs.mkdir(folderPath, { recursive: true }, (mkdirErr) => {
          if (mkdirErr) {
            console.error("Error creating directory:", mkdirErr.message);
            return res.status(500).json({
              message: "Error creating folder",
              error: mkdirErr.message,
            });
          }

          console.log(
            "Folder created successfully or already exists:",
            folderPath
          );
        });
      }

      if (!files.file || files.file.length === 0) {
        return res.status(200).json({
          message: "Folder exists, no files uploaded",
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

const loadVideo = async (req, res) => {
  const { userId, category, fileName } = req.query || req.body || req.params;
  const folderPath = path.join(TARGET_DIR, userId, category);
  const filePath = path.join(folderPath, fileName);

  try {
    const stat = await fs.promises.stat(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const file = fs.createReadStream(filePath, { start, end });

      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };

      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error loading video file." });
  }
};

const loadAudio = async (req, res) => {
  const { userId, category, fileName } = req.query || req.body || req.params;
  const folderPath = path.join(TARGET_DIR, userId, category);
  const filePath = path.join(folderPath, fileName);

  try {
    const stat = await fs.promises.stat(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const file = fs.createReadStream(filePath, { start, end });

      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "audio/mp3",
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "audio/mp3",
      };

      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error loading audio file." });
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  getRecentFiles,
  getUsedSpace,
  getFilesByCategory,
  createSaveFolder,
  loadImage,
  loadVideo,
  dummyUpload,
  loadAudio,
};
