const express = require("express");
const router = express.Router();
const Thread = require("../models/Thread");
const User = require("../models/User");

const { authenticate } = require("../middleware/authMiddleware"); // Ensure authentication

// ✅ Get all threads
router.get("/", async (req, res) => {
  try {
    const threads = await Thread.find()
      .sort({ createdAt: -1 })
      .populate("creator"); // Sort by newest first
    res.json(threads);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching threads", error: error.message });
  }
});

// ✅ Get a single thread and increment views
router.get("/:id", async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
      .populate("creator")
      .populate({
        path: "comments.creator", // Populate the 'creator' field in each comment
      });
    if (!thread) return res.status(404).json({ error: "Thread not found" });

    // Increment views count
    thread.views += 1;
    await thread.save();
    res.json(thread);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching thread", error: error.message });
  }
});

// ✅ Create a new thread
router.post("/:id", authenticate, async (req, res) => {
  try {
    const { title, summary, category } = req.body;
    const userId = req.params.id;
    const newThread = new Thread({
      title,
      summary,
      category,
      creator: userId,
    });

    await newThread.save();
    res.status(201).json(newThread);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating thread", error: error.message });
  }
});

// ✅ Like a thread
router.post("/:id/like/:userid", async (req, res) => {
  try {
    const userId = req.params.userid; // Get logged-in user
    const thread = await Thread.findById(req.params.id);

    if (!thread) return res.status(404).json({ message: "Thread not found" });

    if (thread.likedUsers.includes(userId)) {
      thread.likes -= 1;
      thread.likedUsers.pull(userId);
      await thread.save();
      return res.json({ likes: thread.likes, hasLiked: false });
    }

    thread.likes += 1;
    thread.likedUsers.push(userId);
    await thread.save();

    res.json({ likes: thread.likes, hasLiked: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error liking thread", error: error.message });
  }
});

// ✅ Add a comment to a thread
router.post("/:id/comment/:userId", authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    const user = await User.findById(req.params.userId);
    const thread = await Thread.findById(req.params.id).populate({
      path: "comments.creator", // Populate the 'creator' field in each comment
    });
    if (!thread) return res.status(404).json({ error: "Thread not found" });

    const newComment = {
      content,
      creator: user,
    };

    thread.comments.push(newComment);
    thread.replies += 1; // Increment replies count
    await thread.save();

    res.json(thread.comments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding comment", error: error.message });
  }
});

// Delete a comment by user
router.delete("/:threadId/comment/:commentId/:userId", async (req, res) => {
  try {
    const { threadId, commentId, userId } = req.params;

    const thread = await Thread.findById(threadId);
    if (!thread) return res.status(404).json({ error: "Thread not found" });

    // Find the comment
    const commentIndex = thread.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check if the user is the comment creator
    if (thread.comments[commentIndex].creator.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized to delete this comment" });
    }

    // Remove the comment
    thread.comments.splice(commentIndex, 1);

    // Update replies count
    thread.replies = thread.comments.length;

    await thread.save();

    res.json(thread.comments); // Return updated comments
  } catch (error) {
    res.status(500).json({ error: "Error deleting comment", details: error.message });
  }
});

// Delete a thread
router.delete("/:threadId/:userId", async (req, res) => {
  try {
    const { threadId, userId } = req.params;

    const thread = await Thread.findById(threadId);
    if (!thread) return res.status(404).json({ error: "Thread not found" });

    // Check if the user is the thread creator
    if (thread.creator.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized to delete this thread" });
    }

    await Thread.findByIdAndDelete(threadId);

    res.json({ success: true, message: "Thread deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting thread", details: error.message });
  }
});

module.exports = router;
