const express = require("express");
const router = express.Router();
const Contest = require("../models/Contest");
const Problem = require("../models/Problem");
const { authenticate, isAdmin } = require("../middleware/authMiddleware");

// ✅ Get all contests
router.get("/contests", authenticate, isAdmin, async (req, res) => {
  try {
    const contests = await Contest.find();
    res.json(contests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching contests", error: error.message });
  }
});

// ✅ Delete contest
router.delete("/contests/:id", authenticate, isAdmin, async (req, res) => {
  try {
    await Contest.findByIdAndDelete(req.params.id);
    res.json({ message: "Contest deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting contest", error: error.message });
  }
});

// POST route to create a new contest
router.post('/contests', authenticate, isAdmin, async (req, res) => {
  const { name, startTime, description, duration, problems } = req.body;

  try {
    const newContest = new Contest({
      name,
      startTime,
      duration,
      description,
      problems, // Assuming it's an array of problem IDs
    });

    await newContest.save();
    res.status(201).json(newContest);
  } catch (error) {
    console.error("Error creating contest", error);
    res.status(500).json({ message: "Error creating contest" });
  }
});

//✅ Get all problems
router.get("/problems", authenticate, isAdmin, async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching problems", error: error.message });
  }
});

// ✅ Delete problem
router.delete("/problems/:id", authenticate, isAdmin, async (req, res) => {
  try {
    await Problem.findByIdAndDelete(req.params.id);
    res.json({ message: "Problem deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting problem", error: error.message });
  }
});

// Create a new problem

router.post("/problems", authenticate, isAdmin, async (req, res) => {
    try {
      const { title, difficulty, description, tags, expectedInput, expectedOutput, testCases } = req.body;
      const newProblem = new Problem({
        title,
        difficulty,
        description,
        tags: tags.split(",").map(tag => tag.trim()), // Split tags into an array
        expectedInput,
        expectedOutput,
        testCases,
      });
      await newProblem.save();
      res.status(201).json(newProblem);
    } catch (error) {
      res.status(500).json({ message: "Error creating problem", error: error.message });
    }
  });

module.exports = router;
