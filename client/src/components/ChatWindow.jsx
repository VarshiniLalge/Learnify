import React from "react";
import Message from "./Message";
import InputBox from "./InputBox";
import "../styles/ChatWindow.css";

function ChatWindow(){

    return(
        <div>
            <h2>Chat Window</h2>
            
                <Message sender="🔍AI"
                 text="Hello how can I help you today?"
                 />


                 <Message sender="👨User"
                 text="Explain react components."/>
                 <InputBox/>
            

        </div>
    );
    
}

export default ChatWindow;