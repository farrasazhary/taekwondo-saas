const fs = require("fs").promises;
const path = require("path");
const cloudinary = require("./cloudinary");

/**
 * Delete a file from the public/uploads directory or Cloudinary.
 * @param {string} fileIdentifier - The full URL (Cloudinary) or relative path (/uploads/...) of the file.
 */
const deleteFile = async (fileIdentifier) => {
  if (!fileIdentifier) return;

  // Handle Cloudinary Deletion
  if (fileIdentifier.includes("cloudinary.com") || process.env.STORAGE_TYPE === "cloudinary") {
    try {
      // Extract public_id from Cloudinary URL
      // Example: https://res.cloudinary.com/demo/image/upload/v1571218330/taekwondo/profiles/abc.jpg
      const parts = fileIdentifier.split("/");
      const filenameWithExtension = parts[parts.length - 1];
      const filename = filenameWithExtension.split(".")[0];
      
      // Get folder path (taekwondo/profiles/...)
      const uploadIndex = parts.indexOf("upload");
      if (uploadIndex !== -1) {
        // public_id is everything after 'upload/v12345678/' or just 'upload/'
        let publicIdParts = parts.slice(uploadIndex + 1);
        // Remove version if exists (starts with 'v')
        if (publicIdParts[0].startsWith("v") && !isNaN(publicIdParts[0].substring(1))) {
          publicIdParts = publicIdParts.slice(1);
        }
        
        // Remove extension from last part
        const lastPart = publicIdParts[publicIdParts.length - 1];
        publicIdParts[publicIdParts.length - 1] = lastPart.split(".")[0];
        
        const publicId = publicIdParts.join("/");
        
        await cloudinary.uploader.destroy(publicId);
        console.log(`🗑️ Cloudinary file deleted: ${publicId}`);
      }
    } catch (error) {
      console.warn(`⚠️ Could not delete Cloudinary file ${fileIdentifier}: ${error.message}`);
    }
    return;
  }

  // Handle Local Deletion
  try {
    const relativePath = fileIdentifier.replace(/^\/uploads\//, "");
    const absolutePath = path.join(__dirname, "../../public/uploads", relativePath);

    await fs.access(absolutePath);
    await fs.unlink(absolutePath);
    console.log(`🗑️ Local file deleted: ${absolutePath}`);
  } catch (error) {
    console.warn(`⚠️ Could not delete local file ${fileIdentifier}: ${error.message}`);
  }
};

module.exports = { deleteFile };
