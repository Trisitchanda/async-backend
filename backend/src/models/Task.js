const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  input_text: {
    type: String,
    required: true
  },
  operation: {
    type: String,
    enum: ['uppercase', 'lowercase', 'reverse string', 'word count'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'success', 'failed'],
    default: 'pending'
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  logs: {
    type: [String],
    default: []
  }
}, { timestamps: true });

// Compound index for optimized querying of a user's tasks sorted by creation date
taskSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
