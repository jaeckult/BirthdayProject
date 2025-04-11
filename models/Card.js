const mongoose = require('mongoose');
const cardSchema = new mongoose.Schema({
  title: String,
  value: Number,
  image: String,
  price: Number,
});
module.exports = mongoose.model('Card', cardSchema);