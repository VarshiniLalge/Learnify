import React from "react";
import "../styles/Navbar.css";

import logo from "../assets/images/logo.png";
import {FiSettings, FiUser} from "react-icons/fi";
function Navbar(){
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <img src={logo} alt="AI Chatbot Logo" className="logo"/>
                <h2>🚀AI Chatbot</h2>
            </div>
            <div className="navbar-right">
                <FiSettings className="nav-icon"/>
                <FiUser className="nav-icon"/>
                
            </div>
        </nav>
    );
}

export default Navbar;