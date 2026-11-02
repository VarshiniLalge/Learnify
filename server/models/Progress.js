
const mongoose = require("mongoose");

// Each topic belongs to a subject
const topicSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },

  topicName: {
    type: String,
    required: true,
    trim: true
  },

  completed: {
    type: Boolean,
    default: false
  },

  // When the topic was added
  createdAt: {
    type: Date,
    default: Date.now
  },

  // When the topic was completed
  completedAt: {
    type: Date,
    default: null
  }
});

// One progress document per user
const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    topics: [topicSchema]
  },
  {
    timestamps: true
  }
);

// Prevent multiple progress documents for one user
progressSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);
