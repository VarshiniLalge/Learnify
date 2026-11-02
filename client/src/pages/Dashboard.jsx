import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const Dashboard=()=>{
    const navigate =useNavigate();
    const user=JSON.parse(localStorage.getItem('user'));
    const handleLogout=()=>
    {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };
    return(
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon">🤖</div>
                <div>
                <h2>AI Study</h2>
                <span>Assistant</span>
                </div>
                  </div>
                  <nav className="sidebar-menu">
                    <button className="sidebar-link active" onClick={()=>
                        navigate("/dashboard")
                    }>
                        <span>🏠</span>Dashboard
                    </button>
                    <button className="sidebar-link" onClick={()=>navigate("/chat")}>
                        <span>💬</span>AI Chat
                    </button>
                    <button className="sidebar-link" onClick={()=>navigate("/quiz")}>
                        <span>📑</span>Quiz
                    </button>
                    <button className="sidebar-link" onClick={()=>navigate("/planner")}>
                        <span>📆</span>Study Planner
                    </button>
                    <button className="sidebar-link" onClick={()=>navigate("/progress")}>
                        <span>📊</span>Progress
                    </button>
                    <button className="sidebar-link" onClick={()=>navigate("/summary")}>
                        <span>📚</span>Summary
                    </button>
                  </nav>
                  <div className="sidebar-bottom">
                    <button className="sidebar-link" onClick={()=>navigate("/profile")}>
                        <span>👨🏻‍✈️</span>Profile
                    </button>
                    <button className="sidebar-link logout-link" onClick={handleLogout}>
                        <span>📲</span>Logout
                    </button>
                  </div>

            </aside>

            <main className="dashboard-main">
                <header className="dashboard-topbar">
                    <div>
                        <h1>Dashboard</h1>
                        <p>Your learning overview</p>
                    </div>
                    <div className="user-info">
                        <div className="user-avatar">
                            {(user?.name||"S").charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <strong>{user?.name||"Student"}</strong>
                            <span>Student</span>
                        </div>
                    </div>
                </header>
                <section className="welcome-section">
                    <div>
                        <h2>Welcome back,{user?.name||"Student"}👋</h2>
                        <p>Continue your learning journey and achieve your goals.</p>
                    </div>
                </section>

                <section className="dashboard-grid">
                    <div className="dashboard-card" onClick={()=>navigate("/chat")}>
                        <div className="catd-icon">💬</div>
                        <h3>AI Chat</h3>
                        <p>Ask questions and learn with your personal AI assistant.</p>
                        <span className="card-action">Start chatting....</span>
                    </div>
                    <div className="dashboard-card" onClick={()=>navigate("/quiz")}>
                        <div className="card-icon">📑</div>
                        <h3>Quiz</h3>
                        <p>Test your knowledge with interactive quizzes.</p>
                        <span className="card-action">Take quiz</span>
                        
                    </div>
                    <div className="dashboard-card" onClick={()=>navigate("/planner")}>
                        <div className="card-icon">📆</div>
                        <h3>Study Planner</h3>
                        <p>Organize your subjects and plan your study time</p>
                        <span className="card-action">Plan now</span>
                        
                    </div>
                    <div className="dashboard-card" onClick={()=>navigate("/progress")}>
                        <div className="card-icon">📊</div>
                        <h3>Progress</h3>
                        <p>Monitor your learning progress and performance</p>
                        <span className="card-action">View progress</span>
                        
                    </div>
                    <div className="dashboard-card" onClick={()=>navigate("/summary")}>
                        <div className="card-icon">📚</div>
                        <h3>Summary</h3>
                        <p>Create quick summaries from your study materials.</p>
                        <span className="card-action">Create summary</span>
                        
                    </div>

                </section>
            </main>
        </div>
    )
}

export default Dashboard;