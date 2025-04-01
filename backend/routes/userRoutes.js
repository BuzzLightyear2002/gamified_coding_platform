const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

// Middleware to verify JWT token
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

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

// ✅ GET all users (Admin only)
router.get("/", authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
});

// ✅ GET logged-in user's profile
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ GET user by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("favorites.savedQuestions");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
});

// ✅ UPDATE user details
router.put(
  "/me",
  [
    authenticate,
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("email").optional().isEmail().withMessage("Provide a valid email"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.user.userId,
        req.body,
        { new: true, runValidators: true }
      ).select("-password");

      const populatedUser = await User.findById(updatedUser._id).populate(
        "friends"
      );
      if (!updatedUser)
        return res.status(404).json({ message: "User not found" });

      res.json({ message: "User updated successfully", user: populatedUser });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating user", error: error.message });
    }
  }
);

// ✅ DELETE user account
router.delete("/me", authenticate, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user.userId);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
});

router.post("/favorites/remove", authenticate, async (req, res) => {
  try {
    const { problemId } = req.body;
    const user = await User.findById(req.user.userId);
    user.favorites.savedQuestions = user.favorites.savedQuestions.filter(
      (id) => id.toString() !== problemId
    );
    await user.save();
    res.json({ message: "Problem removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: "Error removing favorite", error });
  }
});

router.post("/favorites/add", authenticate, async (req, res) => {
  try {
    const { problemId } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user.favorites.savedQuestions.includes(problemId)) {
      user.favorites.savedQuestions.push(problemId);
    }
    await user.save();
    res.json({ message: "Problem saved to favorites" });
  } catch (error) {
    res.status(500).json({ message: "Error saving favorite", error });
  }
});

router.post("/favorites/get", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate(
      "favorites.savedQuestions"
    );
    res.json({
      savedQuestions: user.favorites.savedQuestions.map((p) => p._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching favorites", error });
  }
});

module.exports = router;
