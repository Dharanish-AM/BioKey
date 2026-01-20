const requiredVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "AES_KEY",
  "MINIO_ENDPOINT",
  "MINIO_PORT",
  "MINIO_ACCESS_KEY",
  "MINIO_SECRET_KEY",
  "MINIO_BUCKET_NAME",
];

const validateEnv = () => {
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const parsedPort = Number(process.env.MINIO_PORT);
  if (Number.isNaN(parsedPort) || parsedPort <= 0) {
    throw new Error("MINIO_PORT must be a valid positive number");
  }
};

module.exports = validateEnv;
