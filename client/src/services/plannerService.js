import axios from "axios";
const API_KEY ="http://localhost:5000/api/planner";

export const generateStudyPlan = async (plannerData) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_KEY}/generate`, plannerData, {
        headers: {
            Authorization: `Bearer ${token}`,   
            "Content-Type": "application/json",
        },
    });
    return response.data;
}