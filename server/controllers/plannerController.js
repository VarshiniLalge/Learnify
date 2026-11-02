
const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const generateStudyPlan = async (req, res) => {
    try {
        console.log("PLANNER REQUEST:", req.body);

        // 1. Get student information
        const {
            dailyHours,
            studyDays,
            subjects,
            examDate,
            dailyCodingProblems,
            studyMinutes,
            breakMinutes
        } = req.body;

        const preferredStartTime =
            req.body.preferredStartTime || req.body.startTime;

        const preferredEndTime =
            req.body.preferredEndTime || req.body.endTime;

        // 2. Validate required fields
        if (!dailyHours || Number(dailyHours) <= 0) {
            return res.status(400).json({
                message: "Valid daily study hours are required"
            });
        }

        if (!Array.isArray(studyDays) || studyDays.length === 0) {
            return res.status(400).json({
                message: "Study days are required"
            });
        }

        if (!preferredStartTime || !preferredEndTime) {
            return res.status(400).json({
                message: "Preferred study time is required"
            });
        }

        if (!Array.isArray(subjects) || subjects.length === 0) {
            return res.status(400).json({
                message: "At least one subject is required"
            });
        }

        if (!examDate) {
            return res.status(400).json({
                message: "Exam date is required"
            });
        }

        // 3. Set default values
        const codingProblems = Math.max(
    0,
    Number(
        req.body.dailyCodingProblems ??
        req.body.codingProblems
    ) || 0
);
        const sessionMinutes =
            Number(studyMinutes) || 50;

        const breakTime =
            Number(breakMinutes) || 10;

        // 4. Prepare subject information
        const subjectInformation = subjects
            .map((subject) => {
                const topics = Array.isArray(subject.topics)
                    ? subject.topics.join(", ")
                    : subject.topics || "";

                return `
Subject: ${subject.name}
Level: ${subject.level || "Medium"}
Topics: ${topics}
`;
            })
            .join("\n");

        // 5. Create the AI prompt
        const prompt = `
Create a practical study plan for a college student.

STUDENT INFORMATION

Daily study hours: ${dailyHours} hours
Study days: ${studyDays.join(", ")}
Preferred study time: ${preferredStartTime} to ${preferredEndTime}
Exam date: ${examDate}
Daily coding problems: ${codingProblems}
Study session duration: ${sessionMinutes} minutes
Break duration: ${breakTime} minutes

SUBJECTS AND TOPICS:
${subjectInformation}


PLANNING RULES:
1. Use only the selected study days.
2. Keep sessions within the preferred study time.
3. Do not exceed the daily study-hour limit.
4. Give more attention to Weak subjects.
5. Cover all topics provided by the student.
6. Break every topic into smaller concepts to learn.
7. For each concept, provide specific learning points.
8. Include a practical task or question for each concept.
9. Allocate a specific start time and end time to every session.
10. Include breaks between study sessions.
11. Arrange concepts from basic to advanced.
12. Include revision and a self-test.
13. Do not add unrelated subjects or topics.
14. Do not schedule anything after the exam date.
15. Return only valid JSON without Markdown.

For example, if the topic is OOP Concepts,
do not return only "OOP Concepts".
Break it into classes and objects, encapsulation,
inheritance, polymorphism, and abstraction.

For every concept, explain what the student should learn
and give a practice task.

Return this JSON structure:
{
  "plan": [
    {
      "day": "Monday",
      "date": "YYYY-MM-DD",
      "sessions": [
        {
          "startTime": "6:00 PM",
          "endTime": "6:20 PM",
          "subject": "Java",
          "topic": "OOP Concepts",
          "concept": "Classes and Objects",
          "learningPoints": [
            "Understand what a class is",
            "Understand what an object is",
            "Learn fields and methods"
          ],
          "practiceTask": "Create a Student class and two objects.",
          "activity": "Learn and practice"
        }
      ]
    }
  ]
}

Every session must contain all these fields:
startTime, endTime, subject, topic, concept,
learningPoints, practiceTask, and activity.

The top-level object must contain a "plan" array.
Each plan item must contain day, date, and sessions.
Return no text outside the JSON.
`;



const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
        {
            role: "system",
            content: `You generate concise study plans.
Return one complete, valid JSON object only.
The object must contain a "plan" array.
Do not include Markdown or explanations.
Keep each day and session concise.`
        },
        {
            role: "user",
            content: prompt + `

IMPORTANT:
Generate a compact schedule.
Use only the selected study days.
Do not repeat topics unnecessarily.
Keep activity descriptions short.
Finish the entire JSON object, including all closing brackets.
`
        }
    ],
    temperature: 0,
    max_completion_tokens: 8192,
    reasoning_effort: "low",
    reasoning_format: "hidden"
});





        // 7. Read the AI response
        


console.log(
    "FINISH REASON:",
    completion.choices?.[0]?.finish_reason
);

const choice = completion.choices?.[0];
const responseText = choice?.message?.content?.trim();

console.log("Groq finish reason:", choice?.finish_reason);
console.log("Groq response length:", responseText?.length);
console.log("Groq raw response:", responseText);

if (!responseText) {
    return res.status(502).json({
        message: "Groq returned an empty response"
    });
}

if (choice?.finish_reason === "length") {
    return res.status(502).json({
        message: "Groq response was cut off. Reduce the size of the study plan."
    });
}






// Remove Markdown code fences if the AI includes them
const cleanedText = responseText
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");


let studyPlan;

try {
    // Extract the first complete JSON object from the response
    const start = cleanedText.indexOf("{");

    if (start === -1) {
        throw new Error("No JSON object found in Groq response");
    }

    let depth = 0;
    let inString = false;
    let escaped = false;
    let end = -1;

    for (let i = start; i < cleanedText.length; i++) {
        const char = cleanedText[i];

        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (char === "\\") {
                escaped = true;
            } else if (char === '"') {
                inString = false;
            }
            continue;
        }

        if (char === '"') {
            inString = true;
        } else if (char === "{") {
            depth++;
        } else if (char === "}") {
            depth--;

            if (depth === 0) {
                end = i + 1;
                break;
            }
        }
    }

    if (end === -1) {
        throw new Error("Groq returned incomplete JSON");
    }

    studyPlan = JSON.parse(cleanedText.slice(start, end));

} catch (error) {
    console.error("JSON PARSE ERROR:", error.message);
    console.error("RAW GROQ RESPONSE:", cleanedText);

    return res.status(500).json({
        message: "Groq returned invalid planner JSON",
        error: error.message
    });
}


if (!studyPlan || !Array.isArray(studyPlan.plan)) {
    return res.status(500).json({
        message: "Invalid study plan format"
    });
}


return res.status(200).json({
    message: "Study plan generated successfully",
    studyPlan: {
        planTitle: "Your Personalized Study Plan",
        overview: "Your topics are divided into learning concepts and practice tasks.",
        dailySchedule: studyPlan.plan
    }
});




    } catch (error) {
        console.error("STUDY PLANNER ERROR:", error);

        return res.status(500).json({
            message: "Failed to generate the study plan",
            error: error.message
        });
    }
};

module.exports = { generateStudyPlan };

