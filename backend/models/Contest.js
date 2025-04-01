const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the Contest Schema
const contestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    problems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem", // Reference to the Problem model
      },
    ],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Keep track of participants
  },
  {
    timestamps: true, // Automatically track creation and modification times
  }
);

// Create the model for Contest
const Contest = mongoose.model("Contest", contestSchema);

module.exports = Contest;
