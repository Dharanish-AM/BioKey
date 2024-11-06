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

    // Use the user's ID to find their fingerprint
    const pre = await Fingerprint.findOne({ user_id: userDetails._id });

    if (pre) {
      // Convert both fingerprints to base64 strings for comparison
      const existingFingerprintBase64 = pre.fingerprint.toString("base64");
      const newFingerprintBase64 = fp_template.toString("base64");
      console.log("Old: " + existingFingerprintBase64);
      console.log("New: " + newFingerprintBase64);

      if (existingFingerprintBase64 === newFingerprintBase64) {
        console.log("Fingerprint already exists");
        return {
          success: false,
          message: "Fingerprint already exists",
        };
      } else {
        // Update the fingerprint if it does not match
        pre.fingerprint = fp_template; // Ensure fp_template is a Buffer
        await pre.save();
        console.log("Fingerprint updated successfully:", pre);
        return {
          success: true,
          message: "Fingerprint updated successfully",
        };
      }
    } else {
      // If no fingerprint exists, create a new one
      const newFingerprint = new Fingerprint({
        user_id: userDetails._id,
        fingerprint: fp_template, // Ensure fp_template is a Buffer
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

async function getFingerprintImage(user_id) {
  try {
    console.log(`Fetching fingerprint for user ID: ${user_id}`);

    const userDetails = await User.findOne({ user_id: user_id });

    if (!userDetails) {
      console.error(`User not found for ID: ${user_id}`);
      return {
        success: false,
        message: "User not found",
      };
    }

    const fingerprintData = await Fingerprint.findOne({
      user_id: userDetails._id,
    });

    if (!fingerprintData) {
      console.log("No fingerprint found for this user");
      return {
        success: false,
        message: "No fingerprint found for this user",
      };
    }

    console.log("Fingerprint retrieved successfully:", fingerprintData);
    return {
      success: true,
      // raw buffer
      fingerprint: fingerprintData.fingerprint,
    };
  } catch (error) {
    console.error(
      `Error fetching fingerprint for user ID: ${user_id}. Error: ${error.message}`
    );
    return {
      success: false,
      message: `Error fetching fingerprint: ${error.message}`,
    };
  }
}

module.exports = {
  addFingerprint,
  getFingerprintImage,
};
