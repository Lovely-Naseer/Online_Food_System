// models/order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  username: { type: String, required: true }, 
  itemName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentType: { type: String, enum: ['card', 'upi', 'cash'], required: true },
  delivery_Address: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
