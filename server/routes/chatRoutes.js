
const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
    sendMessage,
    getChatHistory,
    deleteChatHistory,
    getUserConversations,
} = require("../controllers/chatController");

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Chat routes are working!",
    });
});

// Send message
router.post("/", protect, sendMessage);

// Chat history
router.get("/history/:conversationId", protect, getChatHistory);

// Delete chat history
router.delete("/history/:conversationId", protect, deleteChatHistory);

// Get user conversations
router.get("/conversations/:userId", protect, getUserConversations);

module.exports = router;
