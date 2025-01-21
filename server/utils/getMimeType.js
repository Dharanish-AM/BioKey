const mime = require("mime-types");

/**
 * Get the MIME type of a file based on its name or extension.
 * @param {string} filename - The name of the file.
 * @returns {string|null} - The MIME type (e.g., "image/jpeg") or null if not found.
 */
const getMimeType = (filename) => {
    if (!filename) {
        return null;
    }


    const mimeType = mime.lookup(filename);

    return mimeType || null;
};

module.exports = {
    getMimeType,
};
