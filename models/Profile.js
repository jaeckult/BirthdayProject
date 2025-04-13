// models/Profile.js
const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  picture: {
    type: String,
    default: '/uploads/default.png',
    validate: {
      validator: function (value) {
        return !value || /^\/uploads\/(.+\.(jpg|jpeg|png|gif))$/.test(value);
      },
      message: 'Picture must be a valid image path (e.g., /ploads/filename.jpg)'
    }
  },
  bio: { type: String, default: 'New user' },
  cardCollection: [{
    _id: { type: String },
    title: { type: String },
    image: { type: String },
    value: { type: Number }
  }],
  points: { type: Number, default: 0 },
  birthDate: { type: Date, required: true },
  questions: [{
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }],
  answeredQuestions: [{ type: String }]
});

module.exports = mongoose.model('Profile', ProfileSchema);