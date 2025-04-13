// profile.js
const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const Card = require('../models/Card');

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// GET /api/profiles - Fetch all profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('userId');
    // Sanitize profiles: hide answers for all users (can be adjusted based on req.session.userId)
    const sanitizedProfiles = profiles.map(profile => ({
      ...profile.toObject(),
      questions: profile.questions.map(q => ({ question: q.question }))
    }));
    res.json(sanitizedProfiles);
  } catch (err) {
    console.error('Error fetching profiles:', err);
    res.status(500).json({ error: `Failed to fetch profiles: ${err.message}` });
  }
});

// GET /api/profiles/:id - Fetch a single profile by ID
router.get('/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).populate('userId');
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    // Sanitize profile: hide answers
    const sanitizedProfile = {
      ...profile.toObject(),
      questions: profile.questions.map(q => ({ question: q.question }))
    };
    res.json(sanitizedProfile);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: `Failed to fetch profile: ${err.message}` });
  }
});

// GET /api/profiles/byUser/:userId - Fetch a profile by userId
router.get('/byUser/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId }).populate('userId');
    if (!profile) {
      console.log('Profile not found for userId:', req.params.userId);
      return res.status(404).json({ error: 'Profile not found' });
    }
    // Sanitize profile: hide answers unless the requester is the owner
    const sanitizedProfile = req.session.userId === req.params.userId.toString()
      ? profile.toObject()
      : {
          ...profile.toObject(),
          questions: profile.questions.map(q => ({ question: q.question }))
        };
    res.json(sanitizedProfile);
  } catch (err) {
    console.error('Error fetching profile by userId:', err);
    res.status(500).json({ error: `Failed to fetch profile: ${err.message}` });
  }
});

// POST /api/profiles/:id/answer - Submit an answer to a profile question
router.post('/:id/answer', isAuthenticated, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const { questionIndex, answer } = req.body;
    const question = profile.questions[questionIndex];
    if (!question) return res.status(400).json({ error: 'Question not found' });

    const correct = question.answer.toLowerCase() === answer.toLowerCase();
    if (correct) {
      const userProfile = await Profile.findOne({ userId: req.session.userId });
      if (!userProfile) return res.status(404).json({ error: 'User profile not found' });
      userProfile.points += 10;
      await userProfile.save();
    }

    res.json({ correct, pointsEarned: correct ? 10 : 0 });
  } catch (err) {
    console.error('Error submitting answer:', err);
    res.status(500).json({ error: `Failed to submit answer: ${err.message}` });
  }
});

// POST /api/profiles/:id/unlock - Unlock a card for the profile
router.post('/:id/unlock', isAuthenticated, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    if (profile.userId.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { cardId } = req.body;
    console.log('Attempting to unlock card with ID:', cardId);
    const card = await Card.findById(cardId);
    if (!card) {
      console.log('Card not found for ID:', cardId);
      return res.status(404).json({ error: 'Card not found' });
    }

    if (profile.points < card.price) {
      return res.status(400).json({ error: 'Not enough points' });
    }

    profile.points -= card.price;
    profile.cardCollection.push({
      _id: card._id,
      title: card.title,
      image: card.image,
      value: card.value
    });
    await profile.save();

    res.json({ success: true });
  } catch (err) {
    console.error('Unlock error:', err);
    res.status(500).json({ error: `Failed to unlock card: ${err.message}` });
  }
});

// POST /api/profiles/:id/gift - Gift a card to another profile
router.post('/:id/gift', isAuthenticated, async (req, res) => {
  try {
    const senderProfile = await Profile.findById(req.params.id);
    if (!senderProfile) return res.status(404).json({ error: 'Sender profile not found' });
    if (senderProfile.userId.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { cardId, recipientId } = req.body;
    const cardIndex = senderProfile.cardCollection.findIndex(c => c._id.toString() === cardId);
    if (cardIndex === -1) return res.status(404).json({ error: 'Card not found in collection' });

    const recipientProfile = await Profile.findById(recipientId);
    if (!recipientProfile) return res.status(404).json({ error: 'Recipient profile not found' });

    const card = senderProfile.cardCollection[cardIndex];
    senderProfile.cardCollection.splice(cardIndex, 1);
    recipientProfile.cardCollection.push(card);
    await senderProfile.save();
    await recipientProfile.save();

    res.json({ success: true });
  } catch (err) {
    console.error('Gift error:', err);
    res.status(500).json({ error: `Failed to gift card: ${err.message}` });
  }
});

module.exports = router;