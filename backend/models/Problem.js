const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Problem Schema
const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  tags: [{
    type: String,
  }],
  description: {
    type: String,
    required: true,
  },
  expectedInput: {
    type: String,
    required: true,
  },
  expectedOutput: {
    type: String,
    required: true,
  },
  testCases: [{
    input: String,
    output: String,
  }],
}, {
  timestamps: true, // Automatically track creation and modification times
});

// Create the model for Problem
const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;
