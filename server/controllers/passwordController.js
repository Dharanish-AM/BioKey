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

    
    const encryptedPassword = encrypt(password);

    
    const newPassword = new Password({
      name: capitalizedName,
      userName: userName || "",
      email: email || "",
      password: encryptedPassword.content,
      website: website || "",
      note: note || "",
    });

    
    await newPassword.save();

    
    return res.status(201).json({ message: "Password added successfully." });
  } catch (error) {
    console.error("Error adding password:", error);
    return res.status(500).json({ error: "An error occurred while adding the password." });
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

    const sortedPasswords = decryptedPasswords.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    res.status(200).json({
      message: "Passwords fetched successfully",
      data: sortedPasswords,
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
