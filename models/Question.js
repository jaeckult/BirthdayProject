const mongoose = require('mongoose');
const questionSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
  questionText: String,
  correctAnswer: String,
  pointsAwarded: Number,
});
module.exports = mongoose.model('Question', questionSchema);