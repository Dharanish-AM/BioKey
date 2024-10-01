const Fingerprint = require("../models/Fingerprint");
const { User } = require("../models/User");

async function addFingerprint(user_id, fp_template) {
  try {
    const userDetails = await User.findOne({ user_id: user_id });

    if (!userDetails) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const fingerprint = new Fingerprint({
      user_id: userDetails._id,
      fingerprint: fp_template,
    });

    await fingerprint.save();

    return {
      success: true,
      message: "Fingerprint added successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Error adding fingerprint: ${error.message}`,
    };
  }
}

module.exports = {
  addFingerprint,
};
