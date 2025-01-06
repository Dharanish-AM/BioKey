const Password = require("../models/passwordSchema");
const User = require("../models/userSchema");
const { encrypt, decrypt } = require("../utils/crypto");

const addPassword = async (req, res) => {
  try {
    const { userId, name, userName, email, password, website, note } =
      req.query || req.body;

    if (!userId || !name || !password) {
      return res.status(400).json({
        error: "userId, name, and password are required fields.",
      });
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ error: "User not found." });
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long." });
    }

    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    const encryptedPassword = encrypt(password);

    const newPassword = new Password({
      userId,
      name: capitalizedName,
      userName: userName || "",
      email: email || "",
      password: encryptedPassword.content,
      iv: encryptedPassword.iv,
      website: website || "",
      note: note || "",
    });

    await newPassword.save();

    res
      .status(201)
      .json({ message: "Password added successfully", data: newPassword });
  } catch (error) {
    console.error("Error adding password:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding the password." });
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

    // Fetch only the required fields (name, userName, email, password, website, note, updatedAt)
    const passwords = await Password.find({ userId }).select(
      "name userName email password website note updatedAt iv password"
    );

    if (!passwords || passwords.length === 0) {
      return res
        .status(404)
        .json({ error: "No passwords found for this user." });
    }

    const decryptedPasswords = passwords.map((password) => {
      if (!password.iv || !password.password) {
        console.warn(`Invalid password format for user ${userId}:`, password);
        return password.toObject();
      }

      const decryptedPassword = decrypt({
        iv: password.iv,
        content: password.password,
      });

      return {
        name: password.name,
        userName: password.userName,
        email: password.email,
        password: decryptedPassword,
        website: password.website,
        note: password.note,
        updatedAt: password.updatedAt,
      };
    });

    res.status(200).json({
      message: "Passwords fetched successfully",
      data: decryptedPasswords,
    });
  } catch (error) {
    console.error("Error fetching passwords:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching passwords." });
  }
};

module.exports = {
  addPassword,
  getAllPasswords,
};
