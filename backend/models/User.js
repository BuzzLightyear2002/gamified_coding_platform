const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  avatar: { type: String, default: "" }, // Profile picture
  bio: { type: String, default: "" },
  xp: {
    total: { type: Number, default: 0 }, // Total XP
    problemsSolvedXP: { type: Number, default: 0 },
    contestsXP: { type: Number, default: 0 },
    codingStreakXP: { type: Number, default: 0 },
    timeSpentXP: { type: Number, default: 0 },
  },
  level: { type: Number, default: 1 }, // User level
  joinDate: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: null }, // For tracking login streaks
  socialLinks: {
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Pending friend requests
  achievements: [{ type: String }], // List of achievement IDs
  codingStats: {
    solvedQuestions: { type: Number, default: 0 },
    solvedProblemIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
    ], // Prevent duplicate XP
    codingStreak: { type: Number, default: 0 }, // Daily login streak
    longestStreak: { type: Number, default: 0 }, // Longest streak ever
    contestsParticipated: { type: Number, default: 0 }, // Number of contests joined
    contestsFinished: { type: Number, default: 0 }, // Completed contests
    timeSpent: { type: Number, default: 0 }, // Time in minutes
  },
  loginHistory: [{ type: Date }], // Store each login date
  participatedContests: [
    {
      contestId: { type: mongoose.Schema.Types.ObjectId, ref: "Contest" },
      solvedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }], // Track solved problems within contest
      completed: { type: Boolean, default: false }, // Track contest completion,
      joinedAt: { type: Date, default: Date.now },
    },
  ],
  favorites: {
    savedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
    savedContests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contest" }],
    favoriteThreads: [{ type: mongoose.Schema.Types.ObjectId, ref: "Thread" }],
  },
  leaderboardRank: { type: Number, default: null },
});

// Avoid redefining the model if it already exists
const User = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = User;
