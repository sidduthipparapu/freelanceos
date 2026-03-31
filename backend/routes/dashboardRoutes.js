const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Project = require('../models/Project');
const Invoice = require('../models/Invoice');
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const dateFilter = req.query.date ? new Date(req.query.date) : null;

    let sessionMatch = { userId: userObjectId };

    if (dateFilter) {
      const startOfDay = new Date(dateFilter);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(dateFilter);
      endOfDay.setHours(23, 59, 59, 999);

      sessionMatch.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    const earningsData = await Session.aggregate([
      { $match: sessionMatch },
      { $group: { _id: null, total: { $sum: '$earnings' } } },
    ]);
    const totalEarnings = earningsData.length > 0 ? earningsData[0].total : 0;

    const hoursData = await Session.aggregate([
      { $match: sessionMatch },
      { $group: { _id: null, total: { $sum: '$hoursWorked' } } },
    ]);
    const totalHours = hoursData.length > 0 ? hoursData[0].total : 0;

    const activeProjects = await Project.countDocuments({
      userId: req.userId,
      status: 'active',
    });

    const overdueInvoices = await Invoice.countDocuments({
      userId: req.userId,
      status: 'overdue',
    });

    const recentSessions = await Session.find(sessionMatch)
      .populate('projectId', 'title')
      .sort({ date: -1 })
      .limit(5);

    res.status(200).json({
      totalEarnings,
      totalHours,
      activeProjects,
      overdueInvoices,
      recentSessions,
      isFiltered: dateFilter ? true : false,
      filteredDate: dateFilter ? req.query.date : null,
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;