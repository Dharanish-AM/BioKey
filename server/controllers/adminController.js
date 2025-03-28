const User = require("../models/userSchema");
const Notification = require("../models/notificationSchema");
const fetch = require("node-fetch");
const Plan = require("../models/planSchema");

const sendPushNotifications = async (req, res) => {
  try {
    const { title, message, userId } = req.body;

    let users;
    if (userId) {
      users = await User.find({
        _id: userId,
        notificationToken: { $exists: true, $ne: null },
      });
    } else {
      users = await User.find({
        notificationToken: { $exists: true, $ne: null },
      });
    }

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "No users found with notification tokens.",
      });
    }

    const tokens = users.map((user) => user.notificationToken);

    const messages = tokens.map((token) => ({
      to: token,
      sound: "default",
      title,
      body: message,
    }));

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messages),
    });

    const result = await response.json();

    for (const user of users) {
      await Notification.updateOne(
        { userId: user._id },
        { $push: { notifications: { title, message, createdAt: new Date() } } },
        { upsert: true },
      );
    }

    res.json({
      success: true,
      message: "Notifications sent and stored",
      result,
    });
  } catch (error) {
    console.error("Error sending notifications:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send notifications", error });
  }
};

const createPlan = async (req, res) => {
  try {
    const { name, price, features } = req.body;

    if (!name || !price || !Array.isArray(features) || features.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (name, price, features) are required, and features must be an array.",
      });
    }

    const plan = new Plan({ name, price, features });
    await plan.save();

    res.status(201).json({
      success: true,
      message: "Plan created successfully",
      plan,
    });
  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create plan",
      error: error.message,
    });
  }
};

module.exports = {
  sendPushNotifications,
  createPlan,
};
