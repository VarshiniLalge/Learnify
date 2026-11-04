
import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../styles/Progress.css";

const API_URL = "https://learnify-backend-x592.onrender.com/api/progress";


const getStoredUserId = () => {
  try {
    // First check the user stored after login
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);

      if (typeof parsedUser === "string") {
        return parsedUser;
      }

      return (
        parsedUser?._id ||
        parsedUser?.id ||
        parsedUser?.userId ||
        ""
      );
    }

    // Check userId separately
    const storedId = localStorage.getItem("userId");

    if (storedId) {
      try {
        const parsedId = JSON.parse(storedId);

        if (typeof parsedId === "object" && parsedId !== null) {
          return (
            parsedId._id ||
            parsedId.id ||
            parsedId.userId ||
            ""
          );
        }

        return parsedId;
      } catch {
        return storedId;
      }
    }

    return "";
  } catch (error) {
    console.error("USER ID ERROR:", error);
    return "";
  }
};


function Progress() {
  const userId = useMemo(() => getStoredUserId(), []);

  const [progress, setProgress] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const [subject, setSubject] = useState("");
  const [topicName, setTopicName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [filter, setFilter] = useState("All");

  const loadProgress = useCallback(async () => {
    if (!userId) {
      setError("User ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}?userId=${encodeURIComponent(userId)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load progress");
      }

      setProgress(data.progress);
      setAnalytics(data.analytics);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const addTopic = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !topicName.trim()) {
      setError("Please enter both subject and topic name.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          subject: subject.trim(),
          topicName: topicName.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add topic");
      }

      setProgress(data.progress);
      setAnalytics(data.analytics);

      setSubject("");
      setTopicName("");
      setMessage("Your new learning topic has been added!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleTopic = async (topicId) => {
    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/topics/${topicId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update topic");
      }

      setProgress(data.progress);
      setAnalytics(data.analytics);
      setMessage("Learning progress updated!");
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTopic = async (topicId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this topic?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/topics/${topicId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete topic");
      }

      setProgress(data.progress);
      setAnalytics(data.analytics);
      setMessage("Topic deleted successfully.");
    } catch (err) {
      setError(err.message);
    }
  };

  const topics = progress?.topics || [];

  const filteredTopics = topics.filter((topic) => {
    if (filter === "Completed") return topic.completed;
    if (filter === "Pending") return !topic.completed;
    return true;
  });

  if (loading) {
    return (
      <div className="progress-loading">
        <div className="progress-spinner"></div>
        <p>Preparing your learning dashboard...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="progress-page">
        <div className="progress-error-panel">
          <h2>Unable to load your progress</h2>
          <p>{error || "Please try again."}</p>
          <button onClick={loadProgress}>Try again</button>
        </div>
      </div>
    );
  }

  const maxActivity = Math.max(
    1,
    ...analytics.weeklyActivity.map((day) => day.completed)
  );

  return (
    <main className="progress-page">
      <section className="progress-welcome">
        <div>
          <span className="progress-eyebrow">YOUR LEARNING SPACE</span>
          <h1>Learning Overview</h1>
          <p>
            Track your growth, celebrate progress and keep moving forward.
          </p>
        </div>

        <div className="progress-level">
          <span>YOUR LEVEL</span>
          <strong>{analytics.level}</strong>
          <small>LEARNER</small>
        </div>
      </section>

      {error && <div className="progress-alert error">{error}</div>}
      {message && <div className="progress-alert success">{message}</div>}

      <section className="progress-stat-grid">
        <article className="progress-stat-card">
          <div className="progress-stat-icon purple">◈</div>
          <span>Total topics</span>
          <strong>{analytics.totalTopics}</strong>
          <small>Across all subjects</small>
        </article>

        <article className="progress-stat-card">
          <div className="progress-stat-icon green">✓</div>
          <span>Completed</span>
          <strong>{analytics.completedCount}</strong>
          <small>Successfully learned</small>
        </article>

        <article className="progress-stat-card">
          <div className="progress-stat-icon orange">◷</div>
          <span>Learning streak</span>
          <strong>{analytics.streak} days</strong>
          <small>Consecutive active days</small>
        </article>

        <article className="progress-stat-card">
          <div className="progress-stat-icon blue">✦</div>
          <span>Total XP</span>
          <strong>{analytics.xp}</strong>
          <small>Experience earned</small>
        </article>
      </section>

      <section className="progress-main-grid">
        <article className="progress-panel progress-overall">
          <div className="progress-panel-heading">
            <div>
              <span className="progress-eyebrow">YOUR PERFORMANCE</span>
              <h2>Overall progress</h2>
            </div>
            <span className="progress-percentage">
              {analytics.overallPercentage}%
            </span>
          </div>

          <div
            className="progress-ring"
            style={{
              "--progress-value": `${analytics.overallPercentage * 3.6}deg`
            }}
          >
            <div className="progress-ring-inner">
              <strong>{analytics.overallPercentage}%</strong>
              <span>Completed</span>
            </div>
          </div>

          <p className="progress-center-caption">
            You have completed {analytics.completedCount} out of{" "}
            {analytics.totalTopics} topics.
          </p>

          <div className="progress-xp-section">
            <div className="progress-xp-heading">
              <span>Level {analytics.level} progress</span>
              <strong>
                {analytics.xpInCurrentLevel}/100 XP
              </strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${analytics.xpInCurrentLevel}%`
                }}
              ></div>
            </div>

            <small>
              {analytics.xpToNextLevel} XP needed for the next level
            </small>
          </div>
        </article>

        <article className="progress-panel">
          <div className="progress-panel-heading">
            <div>
              <span className="progress-eyebrow">STUDY CONSISTENCY</span>
              <h2>Weekly activity</h2>
            </div>
            <span className="progress-chart-symbol">↗</span>
          </div>

          <div className="progress-week-chart">
            {analytics.weeklyActivity.map((day, index) => (
              <div className="progress-chart-column" key={day.date}>
                <div className="progress-chart-value">
                  {day.completed > 0 ? day.completed : ""}
                </div>

                <div className="progress-chart-bar-area">
                  <div
                    className={`progress-chart-bar ${
                      index === 6 ? "today" : ""
                    }`}
                    style={{
                      height: `${
                        day.completed === 0
                          ? 4
                          : (day.completed / maxActivity) * 100
                      }%`
                    }}
                  ></div>
                </div>

                <span>{day.day}</span>
              </div>
            ))}
          </div>

          <p className="progress-chart-caption">
            Number of topics completed per day
          </p>
        </article>
      </section>

      <section className="progress-panel progress-subject-panel">
        <div className="progress-panel-heading">
          <div>
            <span className="progress-eyebrow">SUBJECT ANALYTICS</span>
            <h2>Your subjects</h2>
          </div>
          <span className="progress-muted">
            {analytics.subjects.length} subjects
          </span>
        </div>

        {analytics.subjects.length === 0 ? (
          <p className="progress-empty">
            Add your first topic to see subject analytics.
          </p>
        ) : (
          <div className="progress-subject-list">
            {analytics.subjects.map((item) => (
              <div className="progress-subject-item" key={item.subject}>
                <div className="progress-subject-info">
                  <strong>{item.subject}</strong>
                  <span>
                    {item.completed}/{item.total} topics completed
                  </span>
                </div>

                <div className="progress-subject-bar">
                  <div
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>

                <strong className="progress-subject-percent">
                  {item.percentage}%
                </strong>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="progress-panel progress-achievement-panel">
        <div className="progress-panel-heading">
          <div>
            <span className="progress-eyebrow">MILESTONES</span>
            <h2>Achievements</h2>
          </div>
          <span className="progress-muted">
            {analytics.achievements.filter((item) => item.unlocked).length}/
            {analytics.achievements.length} unlocked
          </span>
        </div>

        <div className="progress-achievement-grid">
          {analytics.achievements.map((item) => (
            <article
              className={`progress-achievement ${
                item.unlocked ? "unlocked" : "locked"
              }`}
              key={item.id}
            >
              <div className="progress-achievement-icon">
                {item.icon}
              </div>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
              <span>
                {item.unlocked ? "Unlocked" : "Not unlocked yet"}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="progress-panel progress-topic-panel">
        <div className="progress-panel-heading">
          <div>
            <span className="progress-eyebrow">KEEP LEARNING</span>
            <h2>Manage your topics</h2>
          </div>
        </div>

        <form className="progress-add-form" onSubmit={addTopic}>
          <input
            type="text"
            placeholder="Subject (e.g. Java)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <input
            type="text"
            placeholder="Topic (e.g. OOP Concepts)"
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
          />

          <button type="submit" disabled={saving}>
            {saving ? "Adding..." : "+ Add topic"}
          </button>
        </form>

        <div className="progress-topic-toolbar">
          <h3>Learning topics</h3>

          <div className="progress-filters">
            {["All", "Pending", "Completed"].map((item) => (
              <button
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {filteredTopics.length === 0 ? (
          <div className="progress-empty">
            <span>✧</span>
            <h3>No topics found</h3>
            <p>Add a topic or choose another filter.</p>
          </div>
        ) : (
          <div className="progress-topic-list">
            {filteredTopics.map((topic) => (
              <article
                className="progress-topic-item"
                key={topic._id}
              >
                <label className="progress-topic-label">
                  <input
                    type="checkbox"
                    checked={topic.completed}
                    onChange={() => toggleTopic(topic._id)}
                  />

                  <span className="progress-topic-text">
                    <strong className={topic.completed ? "done" : ""}>
                      {topic.topicName}
                    </strong>
                    <small>{topic.subject}</small>
                  </span>
                </label>

                <div className="progress-topic-actions">
                  <span
                    className={
                      topic.completed
                        ? "progress-status completed"
                        : "progress-status pending"
                    }
                  >
                    {topic.completed ? "Completed" : "In progress"}
                  </span>

                  <button
                    type="button"
                    className="progress-delete"
                    onClick={() => deleteTopic(topic._id)}
                    aria-label={`Delete ${topic.topicName}`}
                    title="Delete topic"
                  >
                    ×
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Progress;
