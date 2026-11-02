import React, { useState, useEffect, useRef } from "react";
import {
    sendChatMessage,
    getUserConversations,
    getChatHistory,
    deleteChatHistory
} from "../services/chatService";
import "../styles/Chat.css";


function Chat(){
    const[message,setMessage] = useState("");
    const[messages,setMessages] = useState([]);
    const[loading,setLoading] = useState(false);

    const [conversationId,setConversationId] = useState(
    `conversation_${Date.now()}`
);

const storedUser= localStorage.getItem("userId");
const userId = storedUser
    ? JSON.parse(storedUser).id
    : null;

console.log("USER ID:", userId);
console.log("Token:", localStorage.getItem("token"));

const [conversations, setConversations] = useState([]);

useEffect(() => {
    const loadConversations = async () => {
        try {
            const data = await getUserConversations(userId);

            console.log("CONVERSATIONS:", data);

            setConversations(data.conversations || []);
        } catch (error) {
            console.error("Failed to load conversations:", error);
        }
    };

    if (userId) {
        loadConversations();
    }
}, [userId]);




    const handleSendMessage=async ()=>{
        if(!message.trim()) return;

        const userMessage=message;
        setMessages((prev)=>[
            ...prev,
            {
                sender:"user",
                text:userMessage,
            },
    ]);
    setMessage("");
    setLoading(true);
    try{
        const data=await sendChatMessage(
            userId,
            userMessage,
            conversationId
        );
        console.log("CHAT API RESPONSE:", data);
console.log("AI REPLY:", data.reply);

        setMessages((prev)=>[
            ...prev,
            {
                sender:"ai",
                text:data.reply,
            },

        ]);
    }
    catch(error){
        console.error("Chat error:",error);
            console.error("Backend response:", error.response?.data);

        setMessages((prev)=>[
            ...prev,
            {
                sender:"ai",
                text:"Sorry...something went wrong Please try again",

            },

        ]);
    }finally{
        setLoading(false);
    }
    
};
const handleConversationClick = async (selectedConversationId) => {
    try {
        setLoading(true);

        console.log("1. CLICKED CHAT:", selectedConversationId);

        setConversationId(selectedConversationId);

        const data = await getChatHistory(selectedConversationId);

        console.log("2. HISTORY DATA:", data);
        console.log("3. CHATS:", data.chats);

        const formattedMessages = [];

        data.chats.forEach((chat) => {
            formattedMessages.push({
                sender: "user",
                text: chat.userMessage,
            });

            formattedMessages.push({
                sender: "ai",
                text: chat.aiResponse,
            });
        });

        console.log("4. FORMATTED MESSAGES:", formattedMessages);

        setMessages(formattedMessages);

    } catch (error) {
        console.error("5. HISTORY ERROR:", error);
        console.error("6. STATUS:", error.response?.status);
        console.error("7. BACKEND:", error.response?.data);
    } finally {
        setLoading(false);
    }
};
const handleDeleteConversation = async (conversationIdToDelete) => {
    try {
        const confirmed = window.confirm(
            "Delete this conversation?"
        );

        if (!confirmed) {
            return;
        }

        await deleteChatHistory(
            conversationIdToDelete
        );

        console.log(
            "Conversation deleted:",
            conversationIdToDelete
        );

        // Remove deleted conversation from sidebar
        setConversations((prev) =>
            prev.filter(
                (conversation) =>
                    conversation._id !==
                    conversationIdToDelete
            )
        );

        // If currently opened conversation was deleted
        if (conversationId === conversationIdToDelete) {
            setMessages([]);

            setConversationId(
                `conversation_${Date.now()}`
            );
        }

    } catch (error) {
        console.error(
            "Failed to delete conversation:",
            error
        );

        console.error(
            "Backend response:",
            error.response?.data
        );
    }
};
const handleKeyDown =(e)=>{
    if(e.key==="Enter" && !e.shiftKey){
        e.preventDefault();
        handleSendMessage();
    }
};
return (
    <div className="chat-page">

        {/* SIDEBAR */}
        <aside className="chat-sidebar">

            <div className="sidebar-header">
                <h2>AI Assistant</h2>

                <button
                    className="new-chat-btn"
                    onClick={() => {
                        window.location.reload();
                    }}
                >
                    + New Chat
                </button>
            </div>

            <div className="conversation-list">

                <h3>Recent Chats</h3>

                {conversations.length === 0 ? (
                    <p className="no-conversations">
                        No previous conversations
                    </p>
                ) : (
                    conversations.map((conversation) => (
                        <div
    key={conversation._id}
    className="conversation-item"
>
    <span
        className="conversation-text"
        onClick={() =>
            handleConversationClick(conversation._id)
        }
    >
        {conversation.lastMessage}
    </span>

    <button
        className="delete-chat-btn"
        onClick={(e) => {
            e.stopPropagation();
            handleDeleteConversation(
                conversation._id
            );
        }}
    >
        🗑
    </button>
</div>
        ))           
     )}

    </div>

        </aside>


        {/* MAIN CHAT */}
        <section className="chat-main">

            <header className="chat-header">
                <h2>AI Student Assistant</h2>
                <p>Your intelligent study companion</p>
            </header>

            <main className="chat-container">

                {messages.length === 0 && (
                    <div className="empty-chat">
                        <h1>👋 Hello!</h1>

                        <p>
                            Ask me anything about programming,
                            mathematics, college subjects or technology.
                        </p>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${
                            msg.sender === "user"
                                ? "user-message"
                                : "ai-message"
                        }`}
                    >
                        <div className="message-label">
                            {msg.sender === "user"
                                ? "You"
                                : "AI Assistant"}
                        </div>

                        <div className="message-text">
                            {msg.text}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="message ai-message">
                        <div className="message-label">
                            AI Assistant
                        </div>

                        <div className="typing">
                            Thinking....
                        </div>
                    </div>
                )}

            </main>


            <div className="chat-input-area">

                <textarea
                    value={message}
                    onChange={(e) =>
                        setMessage(e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="Ask your question..."
                    rows="1"
                />

                <button
                    onClick={handleSendMessage}
                    disabled={
                        loading || !message.trim()
                    }
                >
                    Send
                </button>

            </div>

        </section>

    </div>
);
}

export default Chat;
 
