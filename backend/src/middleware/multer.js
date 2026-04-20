const multer = require("multer");
const path = require("path");
const fs = require("fs");
const logFile = path.join(__dirname, "../../multer_debug.log");
const log = (msg) => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
};

// Base upload directory
const baseUploadDir = path.join(__dirname, "../../public/uploads");
const eventsDir = path.join(baseUploadDir, "events");
const profilesDir = path.join(baseUploadDir, "profiles");
const galleryDir = path.join(baseUploadDir, "gallery");
const proofsDir = path.join(baseUploadDir, "proofs");

[eventsDir, profilesDir, galleryDir, proofsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
log(`Events directory: ${eventsDir}`);
log(`Profiles directory: ${profilesDir}`);
log(`Gallery directory: ${galleryDir}`);
log(`Proofs directory: ${proofsDir}`);

// Use Memory Storage for processing with Sharp
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

upload.eventsDir = eventsDir;
upload.profilesDir = profilesDir;
upload.galleryDir = galleryDir;
upload.proofsDir = proofsDir;

module.exports = upload;
