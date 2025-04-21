const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Import User Model

// Get Leaderboard
router.get("/", async (req, res) => {
  try {
    const users = await User.find({role:"user"})
      .sort({ xp: -1 }) // Sort users by XP in descending order
      .limit(50) // Limit to top 50 users
      .select("name avatar xp level leaderboardRank friends codingStats participatedContests"); // Select only necessary fields

    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
