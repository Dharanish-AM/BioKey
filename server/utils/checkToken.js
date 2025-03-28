const jwt = require("jsonwebtoken");

const checkToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];  

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid or expired token" });
      }
      res
        .status(200)
        .json({ success: true, message: "Token is valid", user: decoded });
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = checkToken;
