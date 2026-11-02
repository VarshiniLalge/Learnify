const mongoose=require("mongoose");
const chatSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    conversationId:{
        type:String,
        required:true,
    },
    userMessage:{
        type:String,
        required:true,
        trim:true,
    },
    aiResponse:{
        type:String,
        required:true,
        trim:true,
    },
},
{
    timestamps:true,
});

module.exports=mongoose.model("Chat",chatSchema);