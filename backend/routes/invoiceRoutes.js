const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const { protect } = require('../middleware/authMiddleware');

// ─── GET ALL INVOICES ───
router.get('/', protect, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.userId })
      .populate('clientId', 'name email')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// ─── CREATE INVOICE ───
router.post('/', protect, async (req, res) => {
  const { clientId, projectId, amount, dueDate, status } = req.body;

  try {
    if (!clientId) {
      return res.status(400).json({ message: 'Client is required' });
    }
    if (!projectId) {
      return res.status(400).json({ message: 'Project is required' });
    }
    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const invoice = await Invoice.create({
      userId: req.userId,
      clientId,
      projectId,
      amount,
      dueDate,
      status: status || 'draft',
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// ─── UPDATE INVOICE ───
router.put('/:id', protect, async (req, res) => {
  const { clientId, projectId, amount, dueDate, status } = req.body;

  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.userId });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.clientId = clientId || invoice.clientId;
    invoice.projectId = projectId || invoice.projectId;
    invoice.amount = amount || invoice.amount;
    invoice.dueDate = dueDate || invoice.dueDate;
    invoice.status = status || invoice.status;

    await invoice.save();

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// ─── DELETE INVOICE ───
router.delete('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.userId });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    await invoice.deleteOne();

    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;