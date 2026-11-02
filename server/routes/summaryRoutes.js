const express = require("express");
const multer = require("multer");

const {
  generateSummary,
} = require("../controllers/summaryController");

const router = express.Router();

// Store uploaded files temporarily in memory
const storage = multer.memoryStorage();

// Configure file upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Maximum 10 MB
  },
});

// Generate summary from text or uploaded file
router.post(
  "/generate",
  upload.single("file"),
  generateSummary
);

module.exports = router;