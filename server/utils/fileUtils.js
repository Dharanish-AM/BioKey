const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const jsmediatags = require("jsmediatags");
const mime = require("mime-types");
const os = require("os");
const { exec } = require('child_process');


const getFileCategory = (filename) => {
    const mimeType = mime.lookup(filename);
    if (!mimeType) return "others";

    if (mimeType.startsWith("image/")) return "images";
    if (mimeType.startsWith("video/")) return "videos";
    if (mimeType.startsWith("audio/")) return "audios";

    return "others";
};

const createThumbnail = async (filePath, userId, fileCategory, fileName, minioClient) => {
    try {

        const thumbnailPath = `${userId}/thumbnails/${fileCategory}/${path.basename(fileName, path.extname(fileName))}.webp`;

        if (fileCategory === "images") {
            const buffer = await sharp(filePath, { failOnError: false }).resize(500, 500).webp().toBuffer();
            await minioClient.putObject(process.env.MINIO_BUCKET_NAME, thumbnailPath, buffer);

            return thumbnailPath;
        } else if (fileCategory === "videos") {
            return new Promise((resolve, reject) => {
                ffmpeg(filePath)
                    .screenshots({
                        count: 1,
                        timemarks: ["00:00:01.000"],
                        folder: '/tmp',
                        filename: 'thumbnail.webp',
                        size: "500x?",
                    })
                    .on("end", async () => {
                        const thumbnailBuffer = await fs.promises.readFile('/tmp/thumbnail.webp');
                        await minioClient.putObject(process.env.MINIO_BUCKET_NAME, thumbnailPath, thumbnailBuffer);

                        await deleteTempFile('/tmp/thumbnail.webp');

                        resolve(thumbnailPath);
                    })
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

                                await minioClient.putObject(process.env.MINIO_BUCKET_NAME, thumbnailPath, resizedBuffer);

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


const getUniqueFilePath = async (bucketName, folderPath, fileName, minioClient) => {
    const fileExtension = path.extname(fileName);
    const baseFileName = path.basename(fileName, fileExtension);
    let uniqueFileName = `${folderPath}/${fileName}`;


    let fileExists = await minioClient.statObject(bucketName, uniqueFileName).catch((err) => {
        return null;
    });

    let counter = 1;
    while (fileExists) {
        uniqueFileName = `${folderPath}/${baseFileName}(${counter})${fileExtension}`;
        fileExists = await minioClient.statObject(bucketName, uniqueFileName).catch((err) => {
            return null;
        });
        counter++;
    }


    const bucketExists = await minioClient.bucketExists(bucketName).catch((err) => {
        console.error('Error checking bucket existence:', err.message);
        return false;
    });

    if (!bucketExists) {
        console.log('Bucket does not exist, creating:', bucketName);
        await minioClient.makeBucket(bucketName, 'us-east-1').catch((err) => {
            console.error('Error creating bucket:', err.message);
        });
    }

    return uniqueFileName;
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
                    console.error("Error removing file:", unlinkErr.message);
                    reject(unlinkErr);
                }
            } else {
                resolve();
            }
        });
    });
};


const getFileSizeFromMinIO = async (bucketName, filePath, minioClient) => {
    try {

        const stats = await minioClient.statObject(bucketName, filePath);
        return stats.size;
    } catch (err) {
        console.error(`Error getting file size from MinIO: ${err.message}`);
        throw err;
    }
};


const streamToBuffer = async (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", (err) => reject(err));
    });
};



module.exports = {
    getFileCategory,
    createThumbnail,
    getUniqueFilePath,
    getFileSizeFromMinIO,
    streamToBuffer
};
