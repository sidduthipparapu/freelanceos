const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect } = require('../middleware/authMiddleware');

// ─── GET ALL PROJECTS ───
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.userId })
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// ─── CREATE PROJECT ───
router.post('/', protect, async (req, res) => {
  const { title, description, clientId, hourlyRate, deadline, status } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ message: 'Project title is required' });
    }
    if (!clientId) {
      return res.status(400).json({ message: 'Client is required' });
    }
    if (!hourlyRate) {
      return res.status(400).json({ message: 'Hourly rate is required' });
    }

    const project = await Project.create({
      userId: req.userId,
      clientId,
      title,
      description,
      hourlyRate,
      deadline,
      status: status || 'active',
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// ─── UPDATE PROJECT ───
router.put('/:id', protect, async (req, res) => {
  const { title, description, clientId, hourlyRate, deadline, status } = req.body;

  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.userId });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.title = title || project.title;
    project.description = description || project.description;
    project.clientId = clientId || project.clientId;
    project.hourlyRate = hourlyRate || project.hourlyRate;
    project.deadline = deadline || project.deadline;
    project.status = status || project.status;

    await project.save();

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// ─── DELETE PROJECT ───
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.userId });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.deleteOne();

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;