import axios from "axios";
const  API_URL = "http://localhost:5000/api/chat";
export const sendChatMessage = async(
    userId,
    message,
    conversationId
)=>{
    const token = localStorage.getItem("token");
    const response = await axios.post(
        API_URL,
        {
            userId,
            message,
            conversationId,
        },
        {
            headers:{
                Authorization:`Bearer ${token}`,
            },
        }
    );
    return response.data;
};

export const getChatHistory=async(conversationId)=>{
    const token=localStorage.getItem("token");
    const response=await axios.get(
        `${API_URL}/history/${conversationId}`,
        {
            headers:{
                Authorization:`Bearer ${token}`,
            },
        }
    );
    return response.data;
};

export const getUserConversations = async (userId) => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API_URL}/conversations/${userId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const deleteChatHistory=async(conversationId)=>{
    const token=localStorage.getItem("token");
    const response=await axios.delete(
        `${API_URL}/history/${conversationId}`,
        {
            headers:{
                Authorization:`Bearer ${token}`,
            },
        }
    );
    return response.data;
};

