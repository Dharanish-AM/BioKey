const { Fingerprint } = require("../models/Fingerprint");
const { User } = require("../models/User");

async function addFingerprint(user_id, fp_template) {
  try {
    console.log(`Attempting to add fingerprint for user ID: ${user_id}`);

    const userDetails = await User.findOne({ user_id: user_id });

    if (!userDetails) {
      console.error(`User not found for ID: ${user_id}`);
      return {
        success: false,
        message: "User not found",
      };
    }

    const pre = await Fingerprint.findOne({ fingerprint_id: 1 });
    if (pre) {
      if (pre.fingerprint === fp_template) {
        console.log("Fingerprint already exists");
        return {
          success: false,
          message: "Fingerprint already exists",
        };
      } else {
        pre.fingerprint = fp_template;
        pre.user_id = userDetails._id;
        await pre.save();
        console.log("Fingerprint updated successfully:", pre);
        return {
          success: true,
          message: "Fingerprint updated successfully",
        };
      }
    } else {
      const newFingerprint = new Fingerprint({
        user_id: userDetails._id,
        fingerprint: fp_template,
      });
      await newFingerprint.save();
      console.log("Fingerprint added successfully:", newFingerprint);
      return {
        success: true,
        message: "Fingerprint added successfully",
      };
    }
  } catch (error) {
    console.error(
      `Error adding fingerprint for user ID: ${user_id}. Error: ${error.message}`
    );
    return {
      success: false,
      message: `Error adding fingerprint: ${error.message}`,
    };
  }
}

module.exports = {
  addFingerprint,
};
