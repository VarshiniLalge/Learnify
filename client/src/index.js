import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/variables.css";
import "./styles/global.css";
import "./styles/App.css";
import {GoogleOAuthProvider} from "@react-oauth/google";



const root= ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <GoogleOAuthProvider clientId ="451281920218-ofaamg1em2d4ap700oolphs52a20npsv.apps.googleusercontent.com">
        <App/>

    </GoogleOAuthProvider>
    
);