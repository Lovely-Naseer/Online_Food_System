// routes/order.js
const express = require('express');
const router = express.Router();
const Order = require('../models/order');


// Dummy authentication middleware (replace with your real one)
function isAuthenticated(req, res, next) {
    if (req.session && req.session.username) {
      return next();
    } else {
      return res.redirect('/login'); // not logged in → redirect to login
    }
  }
  

// Save order to DB
router.post('/place-order', isAuthenticated, async (req, res) => {
  try {
    console.log("Request body received:", req.body);

    const orderData = {
      username: req.session.username, // might be undefined!
      itemName: req.body.itemName,
      price: req.body.price,
      quantity: req.body.quantity,
      totalAmount: req.body.totalAmount,
      paymentType: req.body.paymentType?.toLowerCase(), // guard against undefined
      delivery_Address: req.body.delivery_Address,
    };
    const newOrder = new Order(orderData);
    await newOrder.save(); // error likely happens here if schema mismatch

    res.status(200).json({ message: 'Order placed successfully' });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ message: 'Error placing order', error: err.message });
  }
});

router.get('/my-orders', isAuthenticated, async (req, res) => {
    try {
      const orders = await Order.find({ username: req.session.username }).sort({ createdAt: -1 });
      res.render('orders', { orders }); // ✅ This tells Express to render orders.ejs
    } catch (err) {
      res.status(500).send('Server Error');
    }
  });
  // DELETE /cancel-order/:orderId
router.delete('/cancel-order/:orderId', isAuthenticated, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    await Order.findByIdAndDelete(orderId);
    res.status(200).json({ message: 'Order canceled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel order', error: err.message });
  }
});


  
  module.exports = router;