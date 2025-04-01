const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const authenticate = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1]; // Extract token correctly

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ Send Friend Request
router.post("/request/:id/:friendId", async (req, res) => {
  try {
    const userId = req.params.id;
    const friendId = req.params.friendId;

    if (userId === friendId) {
      return res
        .status(400)
        .json({ message: "You can't send a request to yourself!" });
    }

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.friends.includes(friendId)) {
      return res.status(400).json({ message: "Already friends!" });
    }

    if (friend.friendRequests.includes(userId)) {
      return res.status(400).json({ message: "Friend request already sent!" });
    }

    friend.friendRequests.push(userId);
    await friend.save();

    res.json({ message: "Friend request sent!" });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Accept Friend Request
router.post("/accept/:id/:friendId", async (req, res) => {
  try {
    const userId = req.params.id;
    const friendId = req.params.friendId;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.friendRequests.includes(friendId)) {
      return res
        .status(400)
        .json({ message: "No friend request from this user!" });
    }

    user.friends.push(friendId);
    friend.friends.push(userId); // Mutual friendship

    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== friendId
    );

    await user.save();
    await friend.save();

    res.json({ message: "Friend request accepted!" });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Decline Friend Request
router.post("/decline/:id/:friendId", async (req, res) => {
  try {
    const userId = req.params.id;
    const friendId = req.params.friendId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== friendId
    );
    await user.save();

    res.json({ message: "Friend request declined." });
  } catch (error) {
    console.error("Error declining friend request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Remove Friend
router.post("/remove", authenticate, async (req, res) => {
  try {
    const { friendId } = req.body;

    const user = await User.findById(req.user.userId).select("-password");
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    user.friends = user.friends.filter((id) => id.toString() !== friendId);
    friend.friends = friend.friends.filter((id) => id.toString() !== req.user.userId);

    await user.save();
    await friend.save();

    res.json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Get Friend Requests
router.get("/requests/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "friendRequests",
      "name avatar"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ friendRequests: user.friendRequests });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Get Friends List
router.get("/list/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "friends",
      "name avatar"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ friends: user.friends });
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
