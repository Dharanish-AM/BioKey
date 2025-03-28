const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT, 10),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

async function checkMinioConnection() {
  try {
    const bucketExists = await minioClient.bucketExists(
      process.env.MINIO_BUCKET_NAME,
    );
    console.log(
      `✅ MinIO is connected. Bucket '${process.env.MINIO_BUCKET_NAME}' exists: ${bucketExists}`,
    );
  } catch (error) {
    console.error("❌ MinIO Connection Error:", error.message);
  }
}

checkMinioConnection();

module.exports = minioClient;
