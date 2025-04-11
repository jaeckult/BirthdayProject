const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const Card = require('../models/Card');
const Question = require('../models/Question');

// Get all profiles
router.get('/', async (req, res) => {
  const profiles = await Profile.find().populate('cardCollection');
  res.json(profiles);
});

// Get single profile
router.get('/:id', async (req, res) => {
  const profile = await Profile.findById(req.params.id).populate('cardCollection');
  res.json(profile);
});

// Get questions for a profile
router.get('/:id/questions', async (req, res) => {
  const questions = await Question.find({ profileId: req.params.id });
  res.json(questions);
});

// Answer a question
router.post('/:id/answer', async (req, res) => {
  const { questionId, answer } = req.body;
  const question = await Question.findById(questionId);
  if (!question || question.profileId.toString() !== req.params.id) {
    return res.status(404).json({ error: 'Question not found' });
  }
  const profile = await Profile.findById(req.params.id);
  if (answer.toLowerCase() === question.correctAnswer.toLowerCase()) {
    profile.points += question.pointsAwarded;
    await profile.save();
    res.json({ correct: true, points: profile.points });
  } else {
    res.json({ correct: false, points: profile.points });
  }
});

// Unlock a card
router.post('/:id/unlock', async (req, res) => {
  const { cardId } = req.body;
  const profile = await Profile.findById(req.params.id);
  const card = await Card.findById(cardId);
  if (!card) return res.status(404).json({ error: 'Card not found' });
  if (profile.points < card.price) {
    return res.status(400).json({ error: 'Not enough points' });
  }
  profile.points -= card.price;
  profile.cardCollection.push(cardId);
  await profile.save();
  res.json({ success: true, points: profile.points, card });
});

// Gift a card
router.post('/:id/gift', async (req, res) => {
  const { cardId, recipientId } = req.body;
  const card = await Card.findById(cardId);
  if (!card) return res.status(404).json({ error: 'Card not found' });
  const recipient = await Profile.findById(recipientId);
  if (!recipient) return res.status(404).json({ error: 'Recipient not found' });
  recipient.cardCollection.push(cardId);
  await recipient.save();
  res.json({ success: true });
});
//get the birthdate
module.exports = router;