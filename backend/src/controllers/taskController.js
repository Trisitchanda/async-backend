const Task = require('../models/Task');
const { getRedisClient } = require('../config/redis');
const { z } = require('zod');

const createTaskSchema = z.object({
  title: z.string().min(1),
  input_text: z.string().min(1),
  operation: z.enum(['uppercase', 'lowercase', 'reverse string', 'word count']),
});

// @desc    Create a task
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues });
    }

    const { title, input_text, operation } = parsed.data;

    // Save to DB initially as pending
    const task = await Task.create({
      userId: req.user._id,
      title,
      input_text,
      operation,
      status: 'pending'
    });

    // Push to Redis Queue
    const redisClient = getRedisClient();
    const queuePayload = JSON.stringify({
      taskId: task._id.toString(),
      operation,
      input_text
    });
    
    await redisClient.rPush('task_queue', queuePayload);

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get all tasks for user
// @route   GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    // Queries via the compound index { userId: 1, createdAt: -1 }
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
