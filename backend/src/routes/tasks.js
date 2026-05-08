const express = require('express');
const { createTask, getTasks, getTask } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All task routes require authentication

router.route('/')
  .post(createTask)
  .get(getTasks);

router.route('/:id')
  .get(getTask);

module.exports = router;
