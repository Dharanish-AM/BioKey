const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const validateEnv = require("./config/validateEnv");

validateEnv();
app.use(helmet());

const PORT = process.env.PORT || 8000;

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
];
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : defaultOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
app.use(express.json());

const connectToDB = require("./config/db");
const fileRoutes = require("./routes/fileRoutes");
const userRoutes = require("./routes/userRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const adminRoutes = require("./routes/adminRoutes");

connectToDB();

app.use("/api/files", fileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/passwords", passwordRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  if (err?.message === "Not allowed by CORS") {
    return res.status(403).json({ success: false, message: err.message });
  }
  return next(err);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
