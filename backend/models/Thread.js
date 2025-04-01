const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      maxlength: 500,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    votedUsers: { type: Map, of: String }, // Store userId -> 'upvote' or 'downvote'

    reported: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const threadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    summary: {
      type: String,
      required: true,
      maxlength: 500,
    },
    category: {
      type: String,
      enum: ["Algorithms", "Data Structures", "Web Development"],
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    replies: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Store users who liked
    views: {
      type: Number,
      default: 0,
    },
    comments: [commentSchema], // Array of comments
  },
  {
    timestamps: true,
  }
);

const Thread = mongoose.model("Thread", threadSchema);

module.exports = Thread;
