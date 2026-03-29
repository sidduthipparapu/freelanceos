const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Project = require('../models/Project');
const Invoice = require('../models/Invoice');
const { protect } = require('../middleware/authMiddleware');

// ─── GET DASHBOARD STATS ───
router.get('/', protect, async (req, res) => {
  try {

    // ─── Total Earnings ───
    const earningsData = await Session.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: null, total: { $sum: '$earnings' } } },
    ]);
    const totalEarnings = earningsData.length > 0 ? earningsData[0].total : 0;

    // ─── Total Hours ───
    const hoursData = await Session.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: null, total: { $sum: '$hoursWorked' } } },
    ]);
    const totalHours = hoursData.length > 0 ? hoursData[0].total : 0;

    // ─── Active Projects ───
    const activeProjects = await Project.countDocuments({
      userId: req.userId,
      status: 'active',
    });

    // ─── Overdue Invoices ───
    const overdueInvoices = await Invoice.countDocuments({
      userId: req.userId,
      status: 'overdue',
    });

    // ─── Recent Sessions (last 5) ───
    const recentSessions = await Session.find({ userId: req.userId })
      .populate('projectId', 'title')
      .sort({ date: -1 })
      .limit(5);

    res.status(200).json({
      totalEarnings,
      totalHours,
      activeProjects,
      overdueInvoices,
      recentSessions,
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;