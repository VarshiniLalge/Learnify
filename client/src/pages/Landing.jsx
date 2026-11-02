import React from "react";
import {Link} from "react-router-dom";
import "../styles/Landing.css";
import {FaRobot} from "react-icons/fa";
import logo from "../assets/images/logo.png";
import banner from "../assets/images/login-banner.png";

function Landing(){
    return(
        <div className="landing-container">
            <nav className="landing-navbar">
                <div className="landing-logo">
                    <img src={logo} alt="Logo" />
                    <h2>AI Chatbot</h2>
                </div>
                <div className="landing-links">
                </div>
            </nav>
            <section className="hero-section">
                <div className="hero-left">
                    <h1>Your Personal <span>AI Assistant</span></h1>
                    <p>Learn faster solve cosing problems,
                        Generate Quizes,Summarize notes,
                        and chat with an intelligent AI assistant anytime.

                    </p>
                    <div className="hero-buttons">
                        <Link to="/register" className="start-btn">Get Started</Link>
                    </div>
                </div>
                <div className="hero-right">
                    <img src={banner} alt="AI" className="hero-image" />
                </div>
            </section>
            <section className="features">
                <div className="feature-card">🤖
<h3>AI Chatbot</h3>
                <p>Ask questions and get instant AI answers</p></div>
                <div className="feature-card">📚<h3>Smart Learning</h3>
                <p>Learn Progarmming</p></div>
                <div className="feature-card">💻<h3>Code Assistant</h3>
                <p>Generate and debug code quikly</p></div>
                <div className="feature-card">📑<h3>Quiz Generator</h3>
                <p>Create Quiz automatically using AI</p></div>
            </section>
        </div>
    );
};

export default Landing;