import React, { useState } from "react";
import "../styles/Register.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

function Register() {
    const navigate=useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");
    const [loading,setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
            setLoading(true);

        

        try {
            const response = await axios.post(
                "https://learnify-backend-x592.onrender.com/api/auth/register",
                formData
            );

            setMessage(response.data.message||"Registration Successfull!");

            setFormData({
                name: "",
                email: "",
                password: "",
            });
            setTimeout(()=>{
                navigate("/login");
            },1000);
        } catch (error) {
            console.error(error);

            setMessage(
                error.response?.data?.message || "Registration Failed"
            );
        }
        finally{
            setLoading(false);
        }
    };
      const handleGoogleSuccess= (credentialResponse)=>{
        console.log("Google authentication Successfull");
        console.log(credentialResponse);

        setMessage("Google Account selected successfully!");
      };

      const handleGoogleError = () => {
    console.error("Google Login Failed");
    setMessage("Google Login Failed. Please try again.");
};

const goToLogin=()=>{
    navigate("/login");
};
    return (
        <div className="register-page">

            {/* Background orbs */}
            <div className="register-orb orb-one"></div>
            <div className="register-orb orb-two"></div>
            <div className="register-orb orb-three"></div>

            {/* Main Card */}
            <div className="register-card">

                {/* Left section */}
                <div className="register-info">

                    <div className="bot-icon">
                        🤖
                    </div>

                    <h1>
                        Welcome to <span>learnify</span>
                    </h1>

                    <p>
                        Create your account and start chatting with your
                        personal AI assistant.
                    </p>

                    <div className="info-features">
                        <div>✨ Smart AI conversations</div>
                        <div>🔒 Secure and private</div>
                        <div>⚡ Fast responses</div>
                    </div>

                </div>

                {/* Right section */}
                <div className="register-form-container">

                    <h2>Create Account</h2>

                    <p className="register-subtitle">
                        Sign up to get started
                    </p>

                    <form onSubmit={handleSubmit}>

                        <div className="input-group">
                            <label>Name</label>

                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Email</label>

                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Password</label>

                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="register-button" disabled={loading}>
                        {loading 
                        ? "Creating Account....":"Create Account"}
                        </button>

                    </form>

                    <div className="register-divider"><span>OR</span>
                    </div>

                    <div className="google-login-container">
                        <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError}  text="continue_with"/>
                    </div>

                    {message && (
                        <p className="register-message">
                            {message}
                        </p>
                    )}

                    <div className="login-link">
                        Already have an account?
                        <span onClick={()=>navigate("/login")}>Login</span>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default Register;