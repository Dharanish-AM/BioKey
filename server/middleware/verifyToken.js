const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({ message: "Token not provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

async function checkToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    return { success: true, decoded: decoded };
  } catch (error) {
    console.error("Token verification error:", error);
    return { success: false, error: "Token verification failed" };
  }
}

module.exports = { verifyToken, checkToken };
