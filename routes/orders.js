const express = require('express');
const router = express.Router();
const Order = require('../models/order');

// POST /api/orders — Save order to DB
router.post('/', async (req, res) => {
  const user = req.session.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { itemName, price, quantity, totalAmount, paymentType, delivery_Address } = req.body;

  if (!itemName || !price || !quantity || !totalAmount || !paymentType || !delivery_Address) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newOrder = new Order({
      username: user.username,
      itemName,
      price,
      quantity,
      totalAmount,
      paymentType,
      delivery_Address
    });

    await newOrder.save();
    res.status(201).json({ message: 'Order saved successfully' });
  } catch (err) {
    console.error("Order save error:", err);
    res.status(500).json({ error: 'Failed to save order' });
  }
});

// GET /api/orders — Get logged-in user's orders
router.get('/', async (req, res) => {
  const username = req.session.username;
  if (!username) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const orders = await Order.find({ username }).sort({ createdAt: -1 });
    res.json(orders); 
  } catch (err) {
    console.error("Order fetch error:", err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});


module.exports = router;
