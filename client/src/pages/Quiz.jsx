import React, {useState} from "react";
import "../styles/Quiz.css";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend
} from "recharts";

const Quiz =()=>{
    const [topic,setTopic] = useState("");
    const [numberOfQuestions,setNumberOfQuestions] = useState("15");
    const [quiz,setQuiz] = useState(null);
    const [loading,setLoading] = useState(false);
    const [error,setError]= useState("");
    const [answers, setAnswers] = useState({});
    const [submitted,setSubmitted] = useState(false);
    const [result, setResult] = useState(null);

    const generateQuiz = async()=>{
        if(!topic.trim()){
            setError("Please enter a topic.");
            return;
        }
        try{
            setLoading(true);
            setError("");
            setQuiz(null);
            setAnswers({});
            setSubmitted(false);
            setResult(null);

            const response = await fetch("http://localhost:5000/api/quiz/generate",
                {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                    },
                    body:JSON.stringify({
                        topic:topic,numberOfQuestions:Number(numberOfQuestions),
                    }),
                }       
            );
            
            const data = await response.json();
            if (!response.ok) {
    console.log("Backend response:", data);

    throw new Error(
        data.error ||
        data.message ||
        "Failed to generate quiz"
    );
}
            setQuiz(data.quiz);
        }catch(error){
            console.log("Quiz error: ",error);
            setError(error.message);
        }finally{
            setLoading(false);
        }
    };
    const  submitQuiz=()=>{
        let correct=0;
        let wrong=0;
        let unanswered=0;

        quiz.questions.forEach((question,index)=>{
            const userAnswer =answers[index];
            if(!userAnswer){
                unanswered++;
            }else if(userAnswer===question.correctAnswer){
                correct++;
            }else{
                wrong++;
            }
        });
        const total =quiz.questions.length;
        const percentage =Math.round(
            (correct/total)*100
        );
        setResult({
            correct,
            wrong,
            unanswered,
            total,
            percentage
        });
        setSubmitted(true);
    };

    const charData = result?[
        {
        name:"Correct",
        value:result.correct
        },
        {
            name:"Wrong",
            value:result.wrong
        },
        {
            name:"Unanswered",
            value:result.unanswered
        }

    ]:[];
    const COLORS =[
        "#22c55e",
        "#ef4444",
        "#94a3b8"
    ];

    return(
        <div className="quiz-page">
            <div className="quiz-header">
                <h1>AI Quiz</h1>
                <p>Test your knowledge with an quiz</p>
            </div>
            <div className="quiz-generator">
                <div className="input-group">
                    <label>Topic</label>
                    <input type="text" placeholder="Example: Python,JS,DSA" value={topic} onChange={(e)=>setTopic(e.target.value)}/>
                </div>
                <div className="input-group">
                    <label>Number of Questions</label>
                    <select value={numberOfQuestions} onChange={(e)=>setNumberOfQuestions(e.target.value)}>
                        <option value="5">5 Questions</option>
                        <option value="10">10 Questions</option>
                        <option value="15">15 Questions</option>
                        <option value="20">20 Questions</option>
                        <option value="30">30 Questions</option>

                    </select>
                </div>
                <button type="button" className="generate-btn" onClick={generateQuiz} disabled={loading}>{loading? "Generating...":"Generate Quiz"}</button>

            </div>
            {error&&(
                <div className="quiz-error">{error}</div>
            )}

           {quiz && (
    <div className="quiz-container">
        {quiz.questions.map((question, index) => (
            <div className="question-card" key={index}>

                <h2>
                    {index + 1}. {""}
                    {question.question}
                </h2>

                <div className="options">
                    {question.options.map((option, optionIndex) => (
                        <button
                            key={optionIndex}
                            className={`option-btn ${
                                answers[index] === option?"selected":""
                            }`}
                            onClick={()=>{
                                setAnswers({
                                    ...answers,[index]:option
                                });
                            }}
                            disabled={submitted}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            {submitted&& (
                <div className="answer-review">
                    <p><strong>Your answers:</strong>{""}
                    {answers[index]||"Not answered"}</p>
                    <p><strong>Correct Answer:</strong>{""}
                    {question.correctAnswer}</p>
                    <p><strong>Explanation:</strong>{""}
                    {question.explanation}</p>
                    </div>
            )}
            </div>
        ))}

        {!submitted && (
        <button type="button" className="submit-quiz-btn" onClick={submitQuiz}>Submit Quiz</button>
           )}
           
           {submitted && result && (
            <div className="quiz-result">
                <h2>🎉Quiz Completed!</h2>
                <div className="score">
                    <h1>{result.percentage}%</h1>
                    <p>Your Score</p>
    </div>
    <div className="result-stats">

    <div>
        <strong>{result.correct}</strong>
        <span>Correct</span>
    </div>

    <div>
        <strong>{result.wrong}</strong>
        <span>Wrong</span>
    </div>

    <div>
        <strong>{result.unanswered}</strong>
        <span>Unanswered</span>
    </div>

</div>

<div className="chart-container">
    <PieChart width={350} height={350}>
        <Pie
        data={charData} cx="50%" cy="50%" outerRadius={120} dataKey="value" label>
            {charData.map(
                (entry,index)=>(
                    <Cell key={`cell-${index}`}
                    fill={COLORS[index]}/>
                )
            )}

        </Pie>
        <Tooltip/>
        <Legend/>
    </PieChart>
    </div>
</div>
)}
</div>
 )}
</div>
    );
};

export default Quiz;