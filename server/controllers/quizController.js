const {GoogleGenAI} = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey:process.env.GEMINI_API_KEY,
});

const generateQuiz = async(req,res) =>{
    try{
        const {topic, numberOfQuestions} = req.body;
        if(!topic || !topic.trim()){
            return res.status(400).json({
                message: "Topic is required",
            });
        }

        const questionCount = Number(numberOfQuestions) || 15;
        if(questionCount<1 || questionCount>40){
            return res.status(400).json({
                message:"Number of questions must be between 1 and 40",
            });
        }
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            
            contents:`You are an AI quiz generator.
            Create exactly ${questionCount} multiple-choice questions about the
            following topic: "${topic}"
            Return only valid JSON.
            Use exactly this structure:{
            "questions":[
            {
            "question":"Question text",
            "options":[
            "Option A",
            "Option B",
            "Option C",
            "Option D"
            ],
            "correctAnswer":"Option A",
            "explanation":"Short explaination"
        }
     ]
 }
    Rules:
    1.Generate exactly ${questionCount} questions.
    2.Every question must have exactly four options.
    3.Only one option must be correct.
    4.correct answer must exactly match one of the four option.
    5.Do not repeat questions.
    6.Questions should be educational anxd clear.
    7.Keep explaination short.
    8.Return only JSON.
    9.Do not use markdown.
    10.Do not use code fences. `
        });
        let text = response.text;
        console.log("GEMINI RAW RESPONSE:");
console.log(text);
        if(!text){
            return res.status(500).json({
                message:"Gemini returned an empty response",
            });
        }
        text=text.trim();
        const quiz =JSON.parse(text);
        if(!quiz.questions || !Array.isArray(quiz.questions))
        {
            return res.status(500).json({
                message:"Invalid quiz format received from AI."
            });
        }
        if(quiz.questions.length!=questionCount){
            return res.status(500).json({
                message:`AI generated ${quiz.questions.length} questions instead of ${questionCount}`,
            });
        }

        for (const question of quiz.questions){
            if(!question.question || !Array.isArray(question.options)||
            question.options.length !== 4 || !question.correctAnswer||!question.explanation){
        return res.status(500).json({
            message:"AI returned an a invalid question format"
        });
    }
    if (!question.options.includes(question.correctAnswer)){
        return res.status(500).json({
            message:"Correct answer does not match the question",
        });
    }
}
return res.status(200).json({
    message:"Quiz generated Successfully",quiz
    });
  }catch(error){
    console.error("Quiz genersation Error",error);
    return res.status(500).json({
        message:"failed to generate quiz",
        error:error.message,
    });
  }
};

module.exports={
    generateQuiz,
};