const crypto = require("crypto");
const dotenv = require("dotenv").config();

if (!process.env.AES_KEY) {
  throw new Error("AES_KEY is required in .env");
}
 
const algorithm = "aes-256-cbc";

const key = crypto.createHash("sha256").update(process.env.AES_KEY).digest();
 
const encrypt = (text) => {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
  };
};
 
const decrypt = (hash) => {
  if (!hash || !hash.iv || !hash.content) {
    throw new Error("Invalid hash format. Missing 'iv' or 'content'.");
  }

  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(hash.iv, "hex")
  ); 

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString();
};

module.exports = {
  encrypt,
  decrypt,
};
