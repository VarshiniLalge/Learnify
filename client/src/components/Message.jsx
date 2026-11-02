import React from "react";
import "../styles/Message.css";

function Message({sender, text}){
    return(
        <div>
            <strong>{sender}:</strong>
            <span>{text}</span>
        </div>
    );
}

export default Message;