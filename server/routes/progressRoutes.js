
const express = require("express");

const router = express.Router();

const {
  getProgress,
  addTopic,
  toggleTopic,
  deleteTopic
} = require("../controllers/progressController");

router.get("/", getProgress);
router.post("/topics", addTopic);
router.patch("/topics/:topicId", toggleTopic);
router.delete("/topics/:topicId", deleteTopic);

module.exports = router;
