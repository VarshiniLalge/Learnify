const mongoose = require("mongoose");

const Chat =require("../models/Chat");
const { GoogleGenAI } =require("@google/genai");
const ai=new GoogleGenAI({
    apiKey:process.env.GEMINI_API_KEY,
});
const sendMessage= async(req,res)=>{
    try{
        console.log("REQUEST BODY:", req.body);
        const{userId,message,conversationId}=req.body;
        if(!userId||!message){
            return res.status(400).json({
                message:"User ID and message are required",
            });
        }
        const currentConversationId=conversationId||`conversation_${Date.now()}`;
        const response=await ai.models.generateContent({
            model:"gemini-2.5-flash",
            contents:message,
            config:{
                systemInstruction:
                "You are an intelligent AI Student Assistent ."
                +"Help students with programming, mathematics, science, technology, ."+
                "college subjects, general knowledge, study planning and problem solving. "+
                "Explain answers clearly and step by step appropriately. "+
                "Be friendly, accurate snd concise.",
            },
        });
        const aiResponse=response.text;
        const chat =new Chat({userId,conversationId:currentConversationId,userMessage:message,aiResponse,

        });
    
    await chat.save();

    return res.status(201).json({
        message:"Chat proceeded successfully",
        conversationId:currentConversationId,
        reply:aiResponse,
        chat:{
            id:chat._id,
            userMessage:chat.userMessage,
            aiResponse:chat.aiResponse,
            createdAt:chat.createdAt,
        },
    });
}
catch(error){
    console.error("😢Chat error:",error);
    return res.status(500).json({
        message:"Failed to process chat",
       error: error.message,
    });
}
};

const getChatHistory = async (req, res) => {
    try {
        const { conversationId } = req.params;

        console.log("================================");
        console.log("HISTORY REQUEST");
        console.log("Conversation ID:", conversationId);

        const chats = await Chat.find({
            conversationId: conversationId,
        }).sort({
            createdAt: 1,
        });

        console.log("FOUND CHATS:", chats.length);
        console.log("CHAT DOCUMENTS:", chats);

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
const deleteChatHistory=async(req,res)=>{
    try{
        const{conversationId}=req.params;
        
const result=await Chat.deleteMany({
    
    conversationId,
});
if(result.deletedCount===0){
    return res.status(404).json({
        message:"conversation not found",
    });
}
return res.status(200).json({
    message:"Conversataion deleted Successfully!",
    
    deletedCount:result.deletedCount,
});
    }catch(error){
        console.error("😢Deleted conversation error:",error);
        return res.status(500).json({
            message:"Failed to delete conversation",
            error:error.message
        });
    }
}

const getUserConversations = async (req, res) => {
    try {
        const { userId } = req.params;

        console.log("Getting conversations for user:", userId);

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
module.exports={
    sendMessage,
    getChatHistory,
    deleteChatHistory,
    getUserConversations,
};