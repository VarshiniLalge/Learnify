
const mongoose = require("mongoose");
const Progress = require("../models/Progress");

// Get or create the user's progress document
const getOrCreateProgress = async (userId) => {
  let progress = await Progress.findOne({ userId });

  if (!progress) {
    progress = await Progress.create({
      userId,
      topics: []
    });
  }

  return progress;
};

// Calculate XP, level, streak and subject analytics
const calculateAnalytics = (topics) => {
  const completedTopics = topics.filter(
    (topic) => topic.completed
  );

  const totalTopics = topics.length;
  const completedCount = completedTopics.length;
  const pendingCount = totalTopics - completedCount;

  const overallPercentage =
    totalTopics === 0
      ? 0
      : Math.round((completedCount / totalTopics) * 100);

  // 20 XP for each completed topic
  const xp = completedCount * 20;
  const level = Math.floor(xp / 100) + 1;
  const xpInCurrentLevel = xp % 100;
  const xpToNextLevel = 100 - xpInCurrentLevel;

  // Group topics by subject
  const subjectMap = {};

  topics.forEach((topic) => {
    const subject = topic.subject;

    if (!subjectMap[subject]) {
      subjectMap[subject] = {
        subject,
        total: 0,
        completed: 0
      };
    }

    subjectMap[subject].total += 1;

    if (topic.completed) {
      subjectMap[subject].completed += 1;
    }
  });

  const subjects = Object.values(subjectMap).map((item) => ({
    ...item,
    percentage:
      item.total === 0
        ? 0
        : Math.round((item.completed / item.total) * 100)
  }));

  // Use UTC calendar dates for consistent activity calculations
  const getDateKey = (date) => {
    const d = new Date(date);

    return [
      d.getUTCFullYear(),
      String(d.getUTCMonth() + 1).padStart(2, "0"),
      String(d.getUTCDate()).padStart(2, "0")
    ].join("-");
  };

  const completedDates = new Set(
    completedTopics
      .filter((topic) => topic.completedAt)
      .map((topic) => getDateKey(topic.completedAt))
  );

  // Last 7 days of activity
  const weeklyActivity = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - i);

    const key = getDateKey(date);

    weeklyActivity.push({
      date: key,
      day: date.toLocaleDateString("en-US", {
        weekday: "short",
        timeZone: "UTC"
      }),
      completed: completedTopics.filter(
        (topic) =>
          topic.completedAt &&
          getDateKey(topic.completedAt) === key
      ).length
    });
  }

  // Calculate consecutive days with completed topics
  let streak = 0;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const todayKey = getDateKey(today);

  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  const yesterdayKey = getDateKey(yesterday);

  let currentDate = new Date(today);

  if (
    !completedDates.has(todayKey) &&
    completedDates.has(yesterdayKey)
  ) {
    currentDate = yesterday;
  }

  while (completedDates.has(getDateKey(currentDate))) {
    streak += 1;
    currentDate.setUTCDate(currentDate.getUTCDate() - 1);
  }

  // Achievements are calculated from actual completed topics
  const achievements = [
    {
      id: "first-step",
      title: "First Step",
      description: "Complete your first topic",
      icon: "🎯",
      unlocked: completedCount >= 1
    },
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Complete 5 topics",
      icon: "⭐",
      unlocked: completedCount >= 5
    },
    {
      id: "consistent-learner",
      title: "Consistent Learner",
      description: "Complete topics on 3 different days",
      icon: "🔥",
      unlocked: completedDates.size >= 3
    },
    {
      id: "topic-master",
      title: "Topic Master",
      description: "Complete 20 topics",
      icon: "🏆",
      unlocked: completedCount >= 20
    }
  ];

  return {
    totalTopics,
    completedCount,
    pendingCount,
    overallPercentage,
    xp,
    level,
    xpInCurrentLevel,
    xpToNextLevel,
    streak,
    subjects,
    weeklyActivity,
    achievements
  };
};

// GET: Fetch progress and dashboard analytics
const getProgress = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Valid userId is required"
      });
    }

    const progress = await getOrCreateProgress(userId);
    const analytics = calculateAnalytics(progress.topics);

    return res.status(200).json({
      progress,
      analytics
    });
  } catch (error) {
    console.error("GET PROGRESS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch progress",
      error: error.message
    });
  }
};

// POST: Add a new topic
const addTopic = async (req, res) => {
  try {
    const { userId, subject, topicName } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !subject?.trim() ||
      !topicName?.trim()
    ) {
      return res.status(400).json({
        message: "Valid userId, subject and topicName are required"
      });
    }

    const progress = await getOrCreateProgress(userId);

    const duplicate = progress.topics.some(
      (topic) =>
        topic.subject.toLowerCase() === subject.trim().toLowerCase() &&
        topic.topicName.toLowerCase() === topicName.trim().toLowerCase()
    );

    if (duplicate) {
      return res.status(409).json({
        message: "This topic already exists in this subject"
      });
    }

    progress.topics.push({
      subject: subject.trim(),
      topicName: topicName.trim()
    });

    await progress.save();

    return res.status(201).json({
      message: "Topic added successfully",
      progress,
      analytics: calculateAnalytics(progress.topics)
    });
  } catch (error) {
    console.error("ADD TOPIC ERROR:", error);

    return res.status(500).json({
      message: "Failed to add topic",
      error: error.message
    });
  }
};

// PATCH: Mark a topic complete or incomplete
const toggleTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { userId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(topicId)
    ) {
      return res.status(400).json({
        message: "Valid userId and topicId are required"
      });
    }

    const progress = await Progress.findOne({ userId });

    if (!progress) {
      return res.status(404).json({
        message: "Progress record not found"
      });
    }

    const topic = progress.topics.id(topicId);

    if (!topic) {
      return res.status(404).json({
        message: "Topic not found"
      });
    }

    topic.completed = !topic.completed;
    topic.completedAt = topic.completed ? new Date() : null;

    await progress.save();

    return res.status(200).json({
      message: "Topic updated successfully",
      progress,
      analytics: calculateAnalytics(progress.topics)
    });
  } catch (error) {
    console.error("TOGGLE TOPIC ERROR:", error);

    return res.status(500).json({
      message: "Failed to update topic",
      error: error.message
    });
  }
};

// DELETE: Remove a topic
const deleteTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { userId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(topicId)
    ) {
      return res.status(400).json({
        message: "Valid userId and topicId are required"
      });
    }

    const progress = await Progress.findOne({ userId });

    if (!progress) {
      return res.status(404).json({
        message: "Progress record not found"
      });
    }

    const topic = progress.topics.id(topicId);

    if (!topic) {
      return res.status(404).json({
        message: "Topic not found"
      });
    }

    topic.deleteOne();
    await progress.save();

    return res.status(200).json({
      message: "Topic deleted successfully",
      progress,
      analytics: calculateAnalytics(progress.topics)
    });
  } catch (error) {
    console.error("DELETE TOPIC ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete topic",
      error: error.message
    });
  }
};

module.exports = {
  getProgress,
  addTopic,
  toggleTopic,
  deleteTopic
};
