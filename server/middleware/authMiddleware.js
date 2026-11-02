const jwt = require("jsonwebtoken");
const protect =(req,res,next)=>{
    console.log("auth middleware started");
    try{
        const authHeader=req.headers.authorization;
        console.log("auth:",authHeader);
        if(!authHeader || !authHeader.startsWith("Bearer "))
        {
            console.log("No token");
            return res.status(401).json({
                message:"No token provided"
            });
        }
        const token=authHeader.split(" ")[1];
        console.log("Token received")
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        console.log("token verified:",decoded);
        req.user=decoded;
        next();

    }catch(error){
        console.error("auth error",error)
        return res.status(401).json({
            message:"Invalid or expired token"
        });
    }
};

module.exports = protect;
