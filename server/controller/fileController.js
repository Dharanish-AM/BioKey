const dotenv = require("dotenv");
const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.S3_BUCKET_NAME;

const createUserFolder = async (userId) => {
  const params = {
    Bucket: bucketName,
    Key: `${userId}/`,
    Body: "",
  };

  const command = new PutObjectCommand(params);

  try {
    await s3Client.send(command);
    console.log(`Folder created for user: ${userId}`);
  } catch (err) {
    console.error("Error creating folder:", err);
    throw new Error("Could not create user folder");
  }
};

const uploadFile = async (file, userId) => {
  const uploadParams = {
    Bucket: bucketName,
    Key: `${userId}/${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const command = new PutObjectCommand(uploadParams);
  try {
    const data = await s3Client.send(command);
    console.log("File uploaded successfully:", data);
    return data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("File upload failed");
  }
};

const listFiles = async (userId) => {
  try {
    console.log("Listing files for user:", userId);

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: `${userId}/`,
    });
    const response = await s3Client.send(command);

    //console.log("S3 Response:", response);

    if (!Array.isArray(response.Contents) || response.Contents.length === 0) {
      console.log("No files found for the user:", userId);
      return [];
    }

    const filesWithDetails = await Promise.all(
      response.Contents.map(async (file) => {
        const url = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: bucketName,
            Key: file.Key,
          }),
          { expiresIn: 3600 }
        );

        return {
          Key: file.Key,
          LastModified: file.LastModified,
          Size: file.Size,
          ETag: file.ETag,
          StorageClass: file.StorageClass,
          Url: url,
          MimeType: file.ContentType || "application/octet-stream",
        };
      })
    );

    //console.log("Files retrieved:", filesWithDetails);
    return filesWithDetails;
  } catch (err) {
    console.error("Error listing files:", err.message);
    throw new Error("Could not retrieve files");
  }
};

const deleteFile = async (fileName, userId) => {
  const fileKey = `${userId}/${fileName}`;
  console.log("Attempting to delete file with key:", fileKey);
  
  const params = {
    Bucket: bucketName, // Ensure bucketName is correct
    Key: fileKey,       // Ensure fileKey is correct
  };

  const command = new DeleteObjectCommand(params);
  try {
    const response = await s3Client.send(command);
    console.log(
      `File "${fileName}" deleted successfully for user "${userId}":`,
      response
    );
    return response;
  } catch (error) {
    console.error("Error deleting file:", error.message);
    if (error.$metadata) {
      console.error("Request ID:", error.$metadata.requestId);
      console.error("HTTP Status Code:", error.$metadata.httpStatusCode);
    }
    throw new Error("File deletion failed");
  }
};

module.exports = {
  createUserFolder,
  uploadFile,
  listFiles,
  deleteFile,
};
