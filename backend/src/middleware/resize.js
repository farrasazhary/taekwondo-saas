const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const upload = require('./multer');

/**
 * Image processing middleware to compress and convert images to WebP
 * Uses Memory storage from multer, then saves to disk after processing.
 */
const resizeImage = async (req, res, next) => {
  // If no file was uploaded, skip
  if (!req.file) {
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
    }

    const outputPath = path.join(destDir, filename);

    // Process with Sharp
    await sharp(req.file.buffer)
      .resize(1200, 1200, {
        fit: 'inside', // Maintain aspect ratio, don't enlarge
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toFile(outputPath);

    // Update req.file properties for subsequent route handlers
    req.file.filename = filename;
    req.file.path = outputPath;
    
    next();
  } catch (err) {
    console.error('Sharp processing error:', err);
    // Don't block the request if compression fails, but log it
    // Alternatively, you could fail the request: next(err);
    next();
  }
};

module.exports = resizeImage;
