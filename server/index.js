const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");

app.use(helmet());

const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: "*",
  }),
);
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
