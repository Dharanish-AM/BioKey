const mongoose = require("mongoose");

const connectToDb = () => {
  mongoose
    .connect("mongodb://localhost:27017/BioKey")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log(err));
};

connectToDb();

module.exports = {
  connectToDb,
};
