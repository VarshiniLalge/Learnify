import React, { useState } from "react";
import {  useNavigate } from "react-router-dom";
import axios from "axios";
import {GoogleLogin} from "@react-oauth/google";
import "../styles/Login.css";
const Login = ()=>{
  const navigate = useNavigate();
  const [email,setEmail]= useState("");
  const [password, setPassword] = useState("");
  const [showPassword,setShowPassword]=useState(false);
  const [loading,setLoading] =useState(false);
  const [error,setError]= useState("");
  const handleLogin =async(e)=>{
    e.preventDefault();
    setError("");
    if(!email||!password){
      setError("Please enter email and password");
        return;
      
    }
    try{
      setLoading(true);
      const response=await axios.post("https://learnify-backend-x592.onrender.com/api/auth/login",{
        email,
        password,
      });
      console.log("LOGIN RESPONSE:", response.data);
      localStorage.setItem("token",response.data.token);
      if(response.data.user){
        localStorage.setItem(
        "userId",
        JSON.stringify(response.data.user)
        );
      }
      navigate("/dashboard");
    }catch(err){
      console.error("Login error:",err);
      setError(err.response?.data?.message||"Login failed,Please check your email and password.");
      
      
    }finally{
      setLoading(false);
    }
    
  };
  const handleGoogleSuccess = async (credentialResponse) => {
  try {
    setError("");

    const response = await axios.post(
      "https://learnify-backend-x592.onrender.com/api/auth/google",
      {
        credential: credentialResponse.credential,
      }
    );

    console.log("GOOGLE LOGIN RESPONSE:", response.data);

    // Save JWT token
    localStorage.setItem("token", response.data.token);

    // Save MongoDB user details
    if (response.data.user) {
      localStorage.setItem(
        "userId",
        JSON.stringify(response.data.user)
      );
    } else {
      setError("User details were not received from the server.");
      return;
    }

    navigate("/dashboard");

  } catch (err) {
    console.error("Google login error:", err);

    setError(
      err.response?.data?.message || "Google authentication failed."
    );
  }
};
  return(
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="login-logo">🤖</div>
        <h1>Welcome Back</h1>
        <p>Welcome back to your google assistant</p>
                </div>
       
       <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e)=>setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-container"><input type={showPassword?"text":"password"} placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <button type="button" className="password-toggle" onClick={()=>setShowPassword(!showPassword)}>{showPassword?"🙈":"👁️"
}</button></div>
        </div>
        {error&&(
          <div className="error-message">{error}</div>
        )}
        <button type="submit" className="login-button" disabled={loading}>
          {loading?"Logging in...":"Login"}
        </button>
       </form>

       <div className="login-divider">
        <span>OR</span>
       </div>

       <div className="google-login-wrapper">
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={()=>{
          setError("Google authentication failed.");
        }} 
        text="continue_with" theme="outline" size="large" />
       </div>

       <p className="register-text">Dont't have an account?{""}
        <span onClick={()=>navigate("/register")}>Create an account</span>
       </p>
       </div>
    </div>

      );
    };

    export default Login;
        