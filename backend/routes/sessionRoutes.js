const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Project = require('../models/Project');
const { protect } = require('../middleware/authMiddleware');

// ─── GET ALL SESSIONS ───
router.get('/', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.userId })
      .populate('projectId', 'title hourlyRate')
      .sort({ date: -1 });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// ─── CREATE SESSION ───
router.post('/', protect, async (req, res) => {
  const { projectId, date, hoursWorked, taskDescription } = req.body;

  try {
    if (!projectId) {
      return res.status(400).json({ message: 'Project is required' });
    }
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }
    if (!hoursWorked) {
      return res.status(400).json({ message: 'Hours worked is required' });
    }
    if (!taskDescription) {
      return res.status(400).json({ message: 'Task description is required' });
    }

    const project = await Project.findOne({ _id: projectId, userId: req.userId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const earnings = hoursWorked * project.hourlyRate;

    const session = await Session.create({
      userId: req.userId,
      projectId,
      date,
      hoursWorked,
      taskDescription,
      earnings,
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// ─── UPDATE SESSION ───
router.put('/:id', protect, async (req, res) => {
  const { projectId, date, hoursWorked, taskDescription } = req.body;

  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.userId });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const project = await Project.findOne({ _id: projectId || session.projectId, userId: req.userId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updatedHours = hoursWorked || session.hoursWorked;
    const earnings = updatedHours * project.hourlyRate;

    session.projectId = projectId || session.projectId;
    session.date = date || session.date;
    session.hoursWorked = updatedHours;
    session.taskDescription = taskDescription || session.taskDescription;
    session.earnings = earnings;

    await session.save();

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// ─── DELETE SESSION ───
router.delete('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.userId });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await session.deleteOne();

    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;