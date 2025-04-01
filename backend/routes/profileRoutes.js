const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authenticate } = require("../middleware/authMiddleware");

// ✅ GET Profile by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").populate("friends favorites.savedQuestions favorites.savedContests");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
});

// ✅ UPDATE Profile (Only Self)
router.put("/me", authenticate, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user.userId, req.body, { new: true }).select("-password");
    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
});

// ✅ ADD / REMOVE Friend
router.post("/friends", authenticate, async (req, res) => {
  const { friendId, action } = req.body; // action = "add" or "remove"

  try {
    const user = await User.findById(req.user.userId);
    const friend = await User.findById(friendId);
    if (!user || !friend) return res.status(404).json({ message: "User not found" });

    if (action === "add") {
      if (!user.friends.includes(friendId)) user.friends.push(friendId);
    } else if (action === "remove") {
      user.friends = user.friends.filter(id => id.toString() !== friendId);
    }

    await user.save();
    res.json({ message: "Friend list updated", friends: user.friends });
  } catch (error) {
    res.status(500).json({ message: "Error updating friends", error: error.message });
  }
});

module.exports = router;
