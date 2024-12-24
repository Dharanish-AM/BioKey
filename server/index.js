const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const cors = require("cors");

const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json()); 

const fileRoutes = require("./routes/fileRoutes");

app.use("/api/files", fileRoutes);
// app.use("/api/users");
// app.use("/api/passwords");
// app.use("/api/devices");

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
