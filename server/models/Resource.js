const mongoose= require("mongoose");
const resourceSchema = new mongoose.Schema(
    {
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true
        },
        title:{
            type: String,
            required: true,
            trim:true
        },
        content:{
            type: String,
            required: true
        },
        fileName:{
            type: String,
            default:""
        }
    },
    {
        timestamps: true
    }
);

module.exports= mongoose.model("Resource",resourceSchema);