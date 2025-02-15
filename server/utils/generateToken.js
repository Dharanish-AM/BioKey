const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

const generateToken = (userId, name, email) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not found in environment variables");
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresIn = 24 * 60 * 60; 

  const payload = {
    userId,
    name,
    email,
    iat: issuedAt,
    exp: issuedAt + expiresIn,
  };


  const token = jwt.sign(payload, process.env.JWT_SECRET);

  return token;
};

module.exports = generateToken;
