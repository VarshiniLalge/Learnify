import React from "react";
import "../styles/Sidebar.css";
import { FiPlusCircle, FiSearch,FiLogOut } from "react-icons/fi";
import bot from "../assets/icons/bot.png"


function Sidebar(){
    return(
        <div className="sidebar">
            <div className="sidebar-top">
                <img src={bot} alt="Bot" className="sidebar-bot"/>
                    
                    <button className="sidebar-btn">
                        <FiPlusCircle className="side-icon"/>
                        <span>Search Chats</span>
                    </button>
                
                <div className="sidebar-history">
                    <h3>Recent Chats</h3>
                    <ul>
                    <li>React Basics</li>
                    <li>Java Interview</li>
                    <li>DBMS Notes</li>
                    <li>Cloud Computing</li>
                </ul>
                </div>
           
            
                
            </div>
            <button className="logout-btn">
                <FiLogOut className="side-icon"/>
                <span>Logout</span>
            </button>
           
        </div> 

    );
}

export default Sidebar;