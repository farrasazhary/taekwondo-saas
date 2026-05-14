const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("../lib/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const logFile = path.join(__dirname, "../../multer_debug.log");
const log = (msg) => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
};

// Base upload directory for local fallback
const baseUploadDir = path.join(__dirname, "../../public/uploads");
const eventsDir = path.join(baseUploadDir, "events");
const profilesDir = path.join(baseUploadDir, "profiles");
const galleryDir = path.join(baseUploadDir, "gallery");
const proofsDir = path.join(baseUploadDir, "proofs");
const instructorsDir = path.join(baseUploadDir, "instructors");

[eventsDir, profilesDir, galleryDir, proofsDir, instructorsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

let storage;

if (process.env.STORAGE_TYPE === "cloudinary") {
  log("Using Cloudinary Storage");
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      // Determine folder based on fieldname
      let folder = "taekwondo/others";
      if (file.fieldname === "profileImage") folder = "taekwondo/profiles";
      else if (file.fieldname === "image") folder = "taekwondo/events";
      else if (file.fieldname === "galleryImage") folder = "taekwondo/gallery";
      else if (file.fieldname === "paymentProof") folder = "taekwondo/proofs";
      else if (file.fieldname === "instructorImage") folder = "taekwondo/instructors";

      return {
        folder: folder,
        allowed_formats: ["jpg", "png", "webp", "jpeg"],
        transformation: [{ width: 1200, height: 1200, crop: "limit", quality: "auto" }],
        public_id: `${file.fieldname}-${Date.now()}`,
      };
    },
  });
} else {
  log("Using Local Memory Storage (fallback)");
  storage = multer.memoryStorage();
}

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
upload.instructorsDir = instructorsDir;

module.exports = upload;
