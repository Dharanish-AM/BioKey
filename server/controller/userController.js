const { User } = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function signUp(name, email, phone, password) {
  const saltRounds = 10;

  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await newUser.save();
    return {
      success: true,
      message: "User registered successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "An error occurred during registration",
    };
  }
}

async function Login(email, password) {
  const userDetails = await User.findOne({ email: email });
  if (!userDetails) {
    return { success: false, message: "User not found" };
  }

  const isPasswordMatch = await bcrypt.compare(password, userDetails.password);

  if (!isPasswordMatch) {
    return { success: false, message: "Incorrect password" };
  }

  const token = jwt.sign({ email: userDetails.email }, process.env.TOKEN_KEY, {
    expiresIn: "1h",
  });
  console.log({
    UserDetails: userDetails,
    token: token,
  });
  return {
    success: true,
    user: userDetails,
    token: token,
  };
}

module.exports = {
  signUp,
  Login,
};
