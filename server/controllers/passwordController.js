const Password = require("../models/passwordSchema");
const User = require("../models/userSchema");
const { encrypt, decrypt } = require("../utils/crypto");

const addPassword = async (req, res) => {
  try {
    let { userId, name, userName, email, password, website, note } = req.body;

    if (!userId || !name || !password) {
      return res.status(400).json({
        error: "userId, name, and password are required fields.",
      });
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ error: "User not found." });
    }

    if (email) {
      email = email.trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ error: "Invalid email format." });
      }
    }

    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    const { iv, content } = encrypt(password);

    const newPassword = new Password({
      userId,
      name: capitalizedName,
      userName: userName || "",
      email: email || "",
      password: content,
      website: website || "",
      note: note || "",
      iv,
    });

    await newPassword.save();

    return res.status(201).json({ message: "Password added successfully." });
  } catch (error) {
    console.error("Error adding password:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while adding the password." });
  }
};

const getPassword = async (req, res) => {
  try {
    const { userId, passwordId } = req.query;


    if (!userId || !passwordId) {
      return res.status(400).json({ error: "userId and passwordId are required." });
    }


    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ error: "User not found." });
    }


    const passwordRecord = await Password.findOne({ _id: passwordId, userId }).select(
      "name userName email password website note updatedAt iv"
    );

    if (!passwordRecord) {
      return res.status(404).json({ error: "Password not found." });
    }


    let decryptedPassword = passwordRecord.password;
    if (passwordRecord.iv && passwordRecord.password) {
      try {
        decryptedPassword = decrypt({
          iv: passwordRecord.iv,
          content: passwordRecord.password,
        });
      } catch (decryptError) {
        console.warn(`Decryption failed for password ID ${passwordRecord._id}:`, decryptError);
      }
    }


    res.status(200).json({
      message: "Password fetched successfully",
      data: {
        _id: passwordRecord._id,
        name: passwordRecord.name,
        userName: passwordRecord.userName,
        email: passwordRecord.email,
        password: decryptedPassword,
        website: passwordRecord.website,
        note: passwordRecord.note,
        updatedAt: passwordRecord.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching password:", error);
    res.status(500).json({ error: "An error occurred while fetching the password." });
  }
};


const getAllPasswords = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required." });
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ error: "User not found." });
    }

    const passwords = await Password.find({ userId }).select(
      "name userName email website note updatedAt"
    );

    const sortedPasswords = passwords.sort((a, b) =>
      a.name ? a.name.localeCompare(b.name) : -1
    );

    res.status(200).json({
      message: "Passwords fetched successfully",
      data: sortedPasswords,
    });
  } catch (error) {
    console.error("Error fetching passwords:", error);
    res.status(500).json({ error: "An error occurred while fetching passwords." });
  }
};


const deletePassword = async (req, res) => {
  try {
    const { userId, passwordId } = req.query;

    if (!userId || !passwordId) {
      return res
        .status(400)
        .json({ error: "userId and passwordId are required fields." });
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ error: "User not found." });
    }

    const password = await Password.findOne({ _id: passwordId, userId });
    if (!password) {
      return res
        .status(404)
        .json({ error: "Password not found for this user." });
    }

    await Password.deleteOne({ _id: passwordId });

    return res.status(200).json({ message: "Password deleted successfully." });
  } catch (error) {
    console.error("Error deleting password:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while deleting the password." });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { userId, passwordId, updatedData } = req.body;

    if (!userId || !passwordId || !updatedData) {
      return res.status(400).json({ message: "Invalid input data" });
    }


    const password = await Password.findOne({ _id: passwordId, userId });

    if (!password) {
      return res.status(404).json({ message: "Password not found or unauthorized access" });
    }


    if (updatedData.password) {
      const { iv, content } = encrypt(updatedData.password);
      updatedData.password = content;
      updatedData.iv = iv;
    }


    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key]) {
        password[key] = updatedData[key];
      }
    });


    const updatedPassword = await password.save();

    return res
      .status(200)
      .json({ message: "Password updated successfully", data: updatedPassword });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addPassword,
  getAllPasswords,
  deletePassword,
  updatePassword,
  getPassword
};
