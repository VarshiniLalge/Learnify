import React, {useState} from "react";
import "../styles/InputBox.css";

function InputBox(){
    const [message, setMessage]=useState("");
    const handleSend=()=>{
        if(message.trim()==="") return;

        alert("Your typed: "+message);
        setMessage("");
    };

    return(
        <div>
            <input type="text" placeholder="Type your message..." value={message} onChange={(e)=> setMessage(e.target.value)} />
            <button onClick={handleSend}>Send</button>
        </div>
    );
    
}

export default InputBox;