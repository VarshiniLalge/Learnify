import React from  "react";
import { BrowserRouter,Routes,Route,Navigate } from "react-router-dom";

import Landing from "../pages/Landing";
import Register from "../pages/Register";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Chat from "../pages/Chat";
import Quiz from "../pages/Quiz";
import Planner from "../pages/Planner";
import Progress from "../pages/Progress";
import Summary from "../pages/Summary";
import Profile from "../pages/Profile";


const AppRoutes = ()=> {
    return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing/>}/>
      <Route path="/login" element={<Login/>}/>
     
     
          <Route path="/register" element={<Register/>}/>
           <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/chat" element={<Chat/>}/>
          <Route path="/quiz" element={<Quiz/>}/>
          <Route path="/planner" element={<Planner/>}/>
          <Route path="/progress" element={<Progress/>}/>
           <Route path="/summary" element={<Summary/>}/>
      <Route path="/profile" element={<Profile/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>

    </Routes>
         
    </BrowserRouter>
   );
};


export default AppRoutes;
