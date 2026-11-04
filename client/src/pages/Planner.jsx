
import React, { useState } from "react";
import "../styles/StudyPlanner.css";

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

const StudyPlanner = () => {
    const [dailyHours, setDailyHours] = useState("");

    const [studyDays, setStudyDays] = useState([...DAYS]);

    const [preferredStartTime, setPreferredStartTime] =
        useState("18:00");

    const [preferredEndTime, setPreferredEndTime] =
        useState("23:00");

    const [subjects, setSubjects] = useState([
        {
            name: "",
            level: "Medium",
            topics: ""
        }
    ]);

    const [examDate, setExamDate] = useState("");
    const [dailyCodingProblems, setDailyCodingProblems] =
        useState(2);

    const [studyMinutes, setStudyMinutes] = useState(50);
    const [breakMinutes, setBreakMinutes] = useState(10);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [plan, setPlan] = useState(null);

    const toggleStudyDay = (day) => {
        setStudyDays((previousDays) =>
            previousDays.includes(day)
                ? previousDays.filter((item) => item !== day)
                : [...previousDays, day]
        );
    };

    const addSubject = () => {
        setSubjects((previousSubjects) => [
            ...previousSubjects,
            {
                name: "",
                level: "Medium",
                topics: ""
            }
        ]);
    };

    const removeSubject = (index) => {
        if (subjects.length === 1) return;

        setSubjects((previousSubjects) =>
            previousSubjects.filter((_, i) => i !== index)
        );
    };

    const updateSubject = (index, field, value) => {
        setSubjects((previousSubjects) =>
            previousSubjects.map((subject, i) =>
                i === index
                    ? { ...subject, [field]: value }
                    : subject
            )
        );
    };

    const handleGeneratePlan = async (event) => {
        event.preventDefault();
        setError("");
        setPlan(null);

        if (!dailyHours || Number(dailyHours) <= 0) {
            setError("Please enter valid daily study hours.");
            return;
        }

        if (studyDays.length === 0) {
            setError("Please select at least one study day.");
            return;
        }

        if (!preferredStartTime || !preferredEndTime) {
            setError("Please select your study start and end times.");
            return;
        }

        if (preferredStartTime >= preferredEndTime) {
            setError("End time must be later than start time.");
            return;
        }

        if (!examDate) {
            setError("Please select your exam date.");
            return;
        }

        const validSubjects = subjects.filter(
            (subject) => subject.name.trim() !== ""
        );

        if (validSubjects.length === 0) {
            setError("Please add at least one subject.");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            const plannerData = {
                dailyHours: Number(dailyHours),
                studyDays,
                startTime: preferredStartTime,
                endTime: preferredEndTime,

                subjects: validSubjects.map((subject) => ({
                    name: subject.name.trim(),
                    level: subject.level,
                    topics: subject.topics
                        .split(",")
                        .map((topic) => topic.trim())
                        .filter(Boolean)
                })),

                examDate,
                codingProblems: Number(dailyCodingProblems),
                studyMinutes: Number(studyMinutes),
                breakMinutes: Number(breakMinutes),
                breakPattern: `${studyMinutes} minutes study + ${breakMinutes} minutes break`
            };

            const response = await fetch(
                "https://learnify-backend-x592.onrender.com/api/planner/generate",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token
                            ? { Authorization: `Bearer ${token}` }
                            : {})
                    },
                    body: JSON.stringify(plannerData)
                }
            );

            const data = await response.json();

            console.log("Planner response:", data);

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to generate the study plan."
                );
            }

            // Support the different response formats used by the backend.
            const receivedPlan =
                data.studyPlan ??
                data.studyplan ??
                (data.plan
                    ? Array.isArray(data.plan)
                        ? { dailySchedule: data.plan }
                        : data.plan
                    : null);

            if (!receivedPlan) {
                throw new Error(
                    "The backend response does not contain a study plan."
                );
            }

            // Convert the backend response into one consistent format.
            let normalizedPlan;

            if (Array.isArray(receivedPlan)) {
                normalizedPlan = {
                    dailySchedule: receivedPlan
                };
            } else if (Array.isArray(receivedPlan.dailySchedule)) {
                normalizedPlan = receivedPlan;
            } else if (Array.isArray(receivedPlan.plan)) {
                normalizedPlan = {
                    ...receivedPlan,
                    dailySchedule: receivedPlan.plan
                };
            } else {
                throw new Error(
                    "The study plan has no daily schedule. Check the backend response."
                );
            }

            setPlan(normalizedPlan);
        } catch (err) {
            console.error("Planner error:", err);
            setError(
                err.message ||
                "Something went wrong while generating the study plan."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="study-planner">
            <div className="planner-header">
                <h1>AI Study Planner</h1>
                <p>
                    Create a personalized study plan with detailed
                    concepts, learning points, and practice tasks.
                </p>
            </div>

            <form
                className="planner-form"
                onSubmit={handleGeneratePlan}
            >
                <div className="planner-section">
                    <h2>Study Time</h2>

                    <div className="form-group">
                        <label>Daily Study Hours</label>
                        <input
                            type="number"
                            min="1"
                            max="12"
                            value={dailyHours}
                            onChange={(e) =>
                                setDailyHours(e.target.value)
                            }
                            placeholder="Example: 3"
                            required
                        />
                    </div>
                </div>

                <div className="planner-section">
                    <h2>Study Days</h2>

                    <div className="study-days">
                        {DAYS.map((day) => (
                            <button
                                type="button"
                                key={day}
                                className={
                                    studyDays.includes(day)
                                        ? "day-button selected"
                                        : "day-button"
                                }
                                onClick={() => toggleStudyDay(day)}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="planner-section">
                    <h2>Preferred Study Time</h2>

                    <div className="time-row">
                        <div className="form-group">
                            <label>Start Time</label>
                            <input
                                type="time"
                                value={preferredStartTime}
                                onChange={(e) =>
                                    setPreferredStartTime(e.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>End Time</label>
                            <input
                                type="time"
                                value={preferredEndTime}
                                onChange={(e) =>
                                    setPreferredEndTime(e.target.value)
                                }
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="planner-section">
                    <div className="section-heading">
                        <h2>Subjects</h2>

                        <button
                            type="button"
                            onClick={addSubject}
                            className="add-subject-button"
                        >
                            + Add Subject
                        </button>
                    </div>

                    {subjects.map((subject, index) => (
                        <div className="subject-card" key={index}>
                            <div className="subject-row">
                                <div className="form-group">
                                    <label>Subject</label>
                                    <input
                                        type="text"
                                        placeholder="Example: Java"
                                        value={subject.name}
                                        onChange={(e) =>
                                            updateSubject(
                                                index,
                                                "name",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Level</label>
                                    <select
                                        value={subject.level}
                                        onChange={(e) =>
                                            updateSubject(
                                                index,
                                                "level",
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Topics</label>
                                <input
                                    type="text"
                                    placeholder="Example: OOP Concepts, Inheritance, Abstraction"
                                    value={subject.topics}
                                    onChange={(e) =>
                                        updateSubject(
                                            index,
                                            "topics",
                                            e.target.value
                                        )
                                    }
                                />
                                <small>
                                    Separate topics using commas. The AI
                                    will break each topic into smaller
                                    concepts to learn.
                                </small>
                            </div>

                            {subjects.length > 1 && (
                                <button
                                    type="button"
                                    className="remove-subject-button"
                                    onClick={() => removeSubject(index)}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="planner-section">
                    <h2>Exam & Practice</h2>

                    <div className="subject-row">
                        <div className="form-group">
                            <label>Exam Date</label>
                            <input
                                type="date"
                                min={new Date().toLocaleDateString("en-CA")}
                                value={examDate}
                                onChange={(e) => setExamDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Coding Problems / Day</label>
                            <input
                                type="number"
                                min="0"
                                value={dailyCodingProblems}
                                onChange={(e) =>
                                    setDailyCodingProblems(e.target.value)
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="planner-section">
                    <h2>Break Pattern</h2>

                    <div className="subject-row">
                        <div className="form-group">
                            <label>Study Minutes</label>
                            <input
                                type="number"
                                min="10"
                                value={studyMinutes}
                                onChange={(e) =>
                                    setStudyMinutes(e.target.value)
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Break Minutes</label>
                            <input
                                type="number"
                                min="1"
                                value={breakMinutes}
                                onChange={(e) =>
                                    setBreakMinutes(e.target.value)
                                }
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="planner-error" role="alert">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="generate-plan-button"
                    disabled={loading}
                >
                    {loading
                        ? "Generating Your Plan..."
                        : "✨ Generate AI Study Plan"}
                </button>
            </form>

            {plan && (
                <div className="generated-plan">
                    <div className="plan-title">
                        <h2>
                            {plan.planTitle ||
                                "Your Personalized Study Plan"}
                        </h2>

                        {plan.overview && <p>{plan.overview}</p>}
                    </div>

                    {plan.dailySchedule.map((day, dayIndex) => (
                        <div
                            className="plan-day"
                            key={`${day.date || day.day}-${dayIndex}`}
                        >
                            <div className="plan-day-header">
                                <h3>{day.day || "Study Day"}</h3>
                                {day.date && <span>{day.date}</span>}
                            </div>

                            {day.sessions?.map((session, sessionIndex) => (
                                <div
                                    className="plan-session"
                                    key={sessionIndex}
                                >
                                    <div className="session-time">
                                        {session.startTime || ""}
                                        {session.endTime
                                            ? ` - ${session.endTime}`
                                            : ""}
                                    </div>

                                    <div className="session-details">
                                        <h4>
                                            {session.concept ||
                                                session.topic ||
                                                session.subject ||
                                                "Study Session"}
                                        </h4>

                                        {session.subject && (
                                            <p>
                                                <strong>Subject:</strong>{" "}
                                                {session.subject}
                                            </p>
                                        )}

                                        {session.topic && (
                                            <p>
                                                <strong>Main topic:</strong>{" "}
                                                {session.topic}
                                            </p>
                                        )}

                                        {Array.isArray(
                                            session.learningPoints
                                        ) &&
                                            session.learningPoints.length > 0 && (
                                                <div>
                                                    <strong>
                                                        What to learn:
                                                    </strong>
                                                    <ul>
                                                        {session.learningPoints.map(
                                                            (point, pointIndex) => (
                                                                <li key={pointIndex}>
                                                                    {point}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            )}

                                        {session.practiceTask && (
                                            <p>
                                                <strong>
                                                    Practice task:
                                                </strong>{" "}
                                                {session.practiceTask}
                                            </p>
                                        )}

                                        {session.activity && (
                                            <p>
                                                <strong>Activity:</strong>{" "}
                                                {session.activity}
                                            </p>
                                        )}

                                        {session.duration && (
                                            <p>
                                                <strong>Duration:</strong>{" "}
                                                {session.duration}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}

                    {plan.revisionStrategy && (
                        <div className="plan-extra">
                            <h3>📚 Revision Strategy</h3>
                            <p>{plan.revisionStrategy}</p>
                        </div>
                    )}

                    {Array.isArray(plan.examTips) &&
                        plan.examTips.length > 0 && (
                            <div className="plan-extra">
                                <h3>🎯 Exam Tips</h3>
                                <ul>
                                    {plan.examTips.map((tip, index) => (
                                        <li key={index}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                </div>
            )}
        </div>
    );
};

export default StudyPlanner;
