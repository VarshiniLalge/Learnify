const mongoose = require("mongoose");
const OpenAI = require("openai");

const Chat = require("../models/Chat");

// Initialize Grok API
const ai = new OpenAI({
    apiKey: process.env.GROK_API_KEY,
    baseURL: "https://api.x.ai/v1",
});

// =====================================
// SEND CHAT MESSAGE USING GROK
// =====================================
const sendMessage = async (req, res) => {
    try {
        console.log("REQUEST BODY:", req.body);

        const { userId, message, conversationId } = req.body;

        // Validate input
        if (!userId || !message || !message.trim()) {
            return res.status(400).json({
                message: "User ID and message are required",
            });
        }

        // Validate MongoDB user ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid user ID",
            });
        }

        const currentConversationId =
            conversationId || `conversation_${Date.now()}`;

        // Generate AI response using Grok
        const response = await ai.responses.create({
            model: "grok-4.7",

            input: [
                {
                    role: "system",
                    content:
                        "You are an intelligent AI Student Assistant. " +
                        "Help students with programming, mathematics, science, technology, " +
                        "college subjects, general knowledge, study planning and problem solving. " +
                        "Explain answers clearly and step by step when appropriate. " +
                        "Use simple language for beginners. " +
                        "Be friendly, accurate and concise.",
                },
                {
                    role: "user",
                    content: message,
                },
            ],
        });

        const aiResponse = response.output_text;

        if (!aiResponse) {
            throw new Error("Grok returned an empty response");
        }

        // Save conversation in MongoDB
        const chat = new Chat({
            userId,
            conversationId: currentConversationId,
            userMessage: message,
            aiResponse,
        });

        await chat.save();

        return res.status(201).json({
            message: "Chat processed successfully",
            conversationId: currentConversationId,
            reply: aiResponse,
            chat: {
                id: chat._id,
                userMessage: chat.userMessage,
                aiResponse: chat.aiResponse,
                createdAt: chat.createdAt,
            },
        });

    } catch (error) {
        console.error("Grok Chat Error:", error);

        return res.status(500).json({
            message: "Failed to process chat",
            error: error.message,
        });
    }
};


// =====================================
// GET CHAT HISTORY
// =====================================
const getChatHistory = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const chats = await Chat.find({
            conversationId,
        }).sort({
            createdAt: 1,
        });

        return res.status(200).json({
            message: "Chat history fetched successfully",
            chats,
        });

    } catch (error) {
        console.error("Chat history error:", error);

        return res.status(500).json({
            message: "Failed to get chat history",
            error: error.message,
        });
    }
};


// =====================================
// DELETE CHAT HISTORY
// =====================================
const deleteChatHistory = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const result = await Chat.deleteMany({
            conversationId,
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Conversation not found",
            });
        }

        return res.status(200).json({
            message: "Conversation deleted successfully",
            deletedCount: result.deletedCount,
        });

    } catch (error) {
        console.error("Delete conversation error:", error);

        return res.status(500).json({
            message: "Failed to delete conversation",
            error: error.message,
        });
    }
};


// =====================================
// GET USER CONVERSATIONS
// =====================================
const getUserConversations = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid user ID",
            });
        }

        const conversations = await Chat.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $group: {
                    _id: "$conversationId",
                    lastMessage: {
                        $first: "$userMessage",
                    },
                    updatedAt: {
                        $first: "$createdAt",
                    },
                },
            },
            {
                $sort: {
                    updatedAt: -1,
                },
            },
        ]);

        return res.status(200).json({
            conversations,
        });

    } catch (error) {
        console.error("Conversation list error:", error);

        return res.status(500).json({
            message: "Failed to get conversations",
            error: error.message,
        });
    }
};


// =====================================
// EXPORT CONTROLLERS
// =====================================
module.exports = {
    sendMessage,
    getChatHistory,
    deleteChatHistory,
    getUserConversations,
};