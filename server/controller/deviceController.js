const { Device } = require("../models/Device.js");
const { updateStock } = require("../controller/productStockController.js");
const { User } = require("../models/User");
require("dotenv").config();

async function addDevice(device_id, user_id) {
  const userDetails = await User({ user_id: user_id });
  const newDevice = new Device({
    device_id: device_id,
    user_id: userDetails._id,
  });

  await newDevice.save();
  await updateStock(device_id);
  return {
    success: true,
    message: "Device added successfully",
    device: newDevice,
  };
}

module.exports = {
  addDevice,
};
