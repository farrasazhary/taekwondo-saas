const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const upload = require('./multer');

/**
 * Image processing middleware to compress and convert images to WebP
 * If using Cloudinary, this just passes through as Cloudinary handles transformations.
 * If using local storage (Memory), it saves to disk after processing with Sharp.
 */
const resizeImage = async (req, res, next) => {
  // If no file was uploaded, skip
  if (!req.file) {
    return next();
  }

  // If using Cloudinary, the file is already uploaded and path is the URL
  if (process.env.STORAGE_TYPE === "cloudinary") {
    // For Cloudinary, path is the secure_url
    // We don't need to do anything here, controllers will use req.file.path
    return next();
  }

  try {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `${req.file.fieldname}-${uniqueSuffix}.webp`;
    
    // Choose destination directory based on fieldname
    let destDir = upload.eventsDir; // Default
    if (req.file.fieldname === 'profileImage') {
      destDir = upload.profilesDir;
    } else if (req.file.fieldname === 'galleryImage') {
      destDir = upload.galleryDir;
    } else if (req.file.fieldname === 'paymentProof') {
      destDir = upload.proofsDir;
    } else if (req.file.fieldname === 'instructorImage') {
      destDir = upload.instructorsDir;
    }

    const outputPath = path.join(destDir, filename);

    // Process with Sharp (only for local memory storage)
    if (req.file.buffer) {
        await sharp(req.file.buffer)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 80 })
          .toFile(outputPath);
    
        // Update req.file properties for subsequent route handlers
        req.file.filename = filename;
        req.file.path = outputPath;
    }
    
    next();
  } catch (err) {
    console.error('Sharp processing error:', err);
    next();
  }
};

module.exports = resizeImage;
