const mongoose = require('mongoose');
const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  picture: { type: String, default: 'default.png' },
  bio:  { type: String, required: true },
  points: { type: Number, default: 0 },
  cardCollection: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
  birthDate: {type: Date, required: true}
});
module.exports = mongoose.model('Profile', profileSchema);