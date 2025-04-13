const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const profileRoutes = require('./routes/profile');
const User = require('./models/User');
const Profile = require('./models/Profile');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const MongoStore = require('connect-mongo');
const Card = require('./models/Card');

const app = express();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Images only (jpeg, jpg, png, gif)!'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const secretKey = crypto.randomBytes(32).toString('hex');
app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb+srv://JACKI:SCRAM@cluster0.jnaox.mongodb.net/BIRTHDAYdb?retryWrites=true&w=majority&appName=Cluster0' }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: 'lax'
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect('mongodb+srv://JACKI:SCRAM@cluster0.jnaox.mongodb.net/BIRTHDAYdb?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Passport Configuration
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) return done(null, false, { message: 'Incorrect username.' });
      const isMatch = await user.comparePassword(password);
      if (!isMatch) return done(null, false, { message: 'Incorrect password.' });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Unauthorized' });
};

// Auth Routes
app.post('/signup', upload.single('profile_pic'), async (req, res, next) => {
  try {
    const { username, password, name, birthdate, questions } = req.body;
    const parsedQuestions = JSON.parse(questions);
    const picture = req.file ? `/uploads/${req.file.filename}` : undefined;

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'Username already exists' });

    const user = new User({ username, password });
    await user.save();
    console.log('Created user with ID:', user._id);

    // Fetch a few default cards to assign to the new user
    const defaultCards = await Card.find().sort({ _id: 1 }).limit(3); // Get the first 3 cards, sorted by _id
    if (defaultCards.length === 0) {
      console.error('No cards found in the database');
      return res.status(500).json({ error: 'No cards available to assign' });
    }

    const profile = new Profile({
      userId: user._id,
      name,
      birthDate: birthdate,
      picture,
      questions: parsedQuestions,
      points: 0,
      cardCollection: defaultCards.map(card => ({
        _id: card._id,
        title: card.title,
        image: card.image,
        value: card.value
      }))
    });
    await profile.save();
    console.log('Created profile with ID:', profile._id);
    console.log('Initial cards assigned:', profile.cardCollection);

    // Log the user in after signup using passport
    req.login(user, (err) => {
      if (err) {
        console.error('Login after signup failed:', err);
        return res.status(500).json({ error: 'Login after signup failed' });
      }
      res.json({ user: { _id: user._id, username: user.username, picture: profile.picture } });
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

app.post('/login', passport.authenticate('local'), async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({
      message: 'Logged in successfully',
      user: {
        _id: req.user._id,
        username: req.user.username,
        picture: profile.picture
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/me', async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const user = req.user;
      const profile = await Profile.findOne({ userId: user._id });
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.json({
        user: {
          _id: user._id,
          username: user.username,
          picture: profile.picture
        }
      });
    } catch (err) {
      console.error('Error in /me:', err);
      res.status(500).json({ error: 'Server error' });
    }
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Answer submission endpoint
app.post('/api/profiles/:id/answer', isAuthenticated, async (req, res) => {
  const { questionIndex, answer } = req.body;
  const profileId = req.params.id;
  const userId = req.user._id;

  if (questionIndex == null || !answer) {
    return res.status(400).json({ error: 'Question index and answer are required' });
  }

  try {
    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    if (questionIndex < 0 || questionIndex >= profile.questions.length) {
      return res.status(400).json({ error: 'Invalid question index' });
    }
    const correctAnswer = profile.questions[questionIndex].answer.toLowerCase();
    const userAnswer = answer.toLowerCase();
    let pointsEarned = 0;
    if (correctAnswer === userAnswer) {
      pointsEarned = 10; // Adjust points as needed
      const currentUserProfile = await Profile.findOne({ userId });
      if (currentUserProfile) {
        currentUserProfile.points += pointsEarned;
        await currentUserProfile.save();
      }
    }
    res.json({ correct: correctAnswer === userAnswer, pointsEarned });
  } catch (err) {
    console.error('Answer submission error:', err);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

app.get('/api/profiles/byUser/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected Routes
app.use('/api/profiles', isAuthenticated, profileRoutes);

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));