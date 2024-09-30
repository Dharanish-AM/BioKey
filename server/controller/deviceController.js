const { Device } = require("../models/Device.js");
const { removeStock } = require("../controller/productStockController.js");
require("dotenv").config();

async function addDevice(device_id, user_id) {
  const newDevice = new Device({
    device_id: device_id,
    user_id: user_id,
  });

  await newDevice.save();
  await removeStock(device_id);
  return {
    success: true,
    message: "Device added successfully",
    device: newDevice,
  };
}

module.exports = {
  addDevice,
};
