const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const app = express();


const authRoute = require("./routes/authRoute");
const chatRoutes = require("./routes/chatRoutes");
const quizRoutes = require("./routes/quizRoutes");
const plannerRoutes = require("./routes/plannerRoutes");
const progressRoutes = require("./routes/progressRoutes");
const summaryRoutes = require("./routes/summaryRoutes");



app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post("/test-body", (req, res) => {
    console.log("TEST BODY REQUEST BODY:", req.body);
    res.status(200).json({ message: "Request body received successfully" ,body:req.body});
});

app.use("/api/auth", authRoute);
app.use("/api/chat", chatRoutes);
app.use("/api/quiz", quizRoutes);

// ✅ FIXED
app.use("/api/planner", plannerRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/summary", summaryRoutes);

app.get("/server-test", (_req, res) => {
    res.json({
        message: "This is the correct server.js"
    });
});

app.get("/", (req, res) => {
    res.send("🚀 AI Chatbot Backend is running...");
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(
                `🚀 Server running on http://localhost:${PORT}`
            );
        });
    } catch (error) {
        console.error(
            "❌ MongoDB Connection Failed:",
            error.message
        );

        process.exit(1);
    }
};

startServer();