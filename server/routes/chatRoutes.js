const express=require("express");
const protect= require("../middleware/authMiddleware");

const {
    sendMessage,
    getChatHistory,
    deleteChatHistory,
    getUserConversations,
}=require("../controllers/chatController");
const router=express.Router();
router.get("/test", (req, res) => {
    res.json({
        message: "Chat routes are working!"
    });
});

router.post("/",sendMessage);

router.get("/history/:conversationId",protect,getChatHistory);
router.delete("/history/:conversationId",protect,deleteChatHistory);
router.get("/conversations/:userId", getUserConversations);

module.exports=router;