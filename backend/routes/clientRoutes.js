const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { protect } = require('../middleware/authMiddleware');

// ─── GET ALL CLIENTS ───
router.get('/', protect, async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// ─── CREATE CLIENT ───
router.post('/', protect, async (req, res) => {
  const { name, email, phone, status } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: 'Client name is required' });
    }

    const client = await Client.create({
      userId: req.userId,
      name,
      email,
      phone,
      status: status || 'active',
    });

    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// ─── UPDATE CLIENT ───
router.put('/:id', protect, async (req, res) => {
  const { name, email, phone, status } = req.body;

  try {
    const client = await Client.findOne({ _id: req.params.id, userId: req.userId });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    client.name = name || client.name;
    client.email = email || client.email;
    client.phone = phone || client.phone;
    client.status = status || client.status;

    await client.save();

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// ─── DELETE CLIENT ───
router.delete('/:id', protect, async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, userId: req.userId });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    await client.deleteOne();

    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;