const mongoose = require('mongoose');
const Profile = require('./models/Profile');
const Card = require('./models/Card');
const Question = require('./models/Question');
const User = require('./models/User'); // Add User model

mongoose.connect('mongodb+srv://JACKI:SCRAM@cluster0.jnaox.mongodb.net/BIRTHDAYdb?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

const seed = async () => {
  try {
    await Profile.deleteMany({});
    await Card.deleteMany({});
    await Question.deleteMany({});
    await User.deleteMany({}); // Clear users

    // Cards
    const card1 = await new Card({ title: 'Star Card', value: 5, image: 'star.png', price: 10 }).save();
    const card2 = await new Card({ title: 'Heart Card', value: 10, image: 'heart.png', price: 20 }).save();
    const card3 = await new Card({ title: 'Gold Card', value: 25, image: 'gold.png', price: 50 }).save();

    // Profiles
    const profile1 = await new Profile({
      name: 'Alice',
      picture: 'alice.png',
      bio: 'Loves adventure!',
      cardCollection: [card1._id],
      points: 30,
      birthDate: new Date(1990, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    }).save();

    const profile2 = await new Profile({
      name: 'Bob',
      picture: 'bob.png',
      bio: 'Music enthusiast.',
      cardCollection: [],
      points: 0,
      birthDate: new Date(1992, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    }).save();

    

    // Add other profiles (Fuad, Haile, etc.) as before...

    // Users
    await User.create([
      { username: 'admin', password: 'birthday123' },
      { username: 'user1', password: 'pass123' }
    ]);

    // Questions (as per previous completion)
    await Question.insertMany([
      { profileId: profile1._id, questionText: 'What’s Alice’s favorite color?', correctAnswer: 'Blue', pointsAwarded: 10 },
      { profileId: profile1._id, questionText: 'What’s Alice’s favorite hobby?', correctAnswer: 'Hiking', pointsAwarded: 15 },
      { profileId: profile2._id, questionText: 'What’s Bob’s favorite band?', correctAnswer: 'Beatles', pointsAwarded: 10 },
      { profileId: profile2._id, questionText: 'What’s Bob’s favorite instrument?', correctAnswer: 'Guitar', pointsAwarded: 15 },
      // Add other questions...
    ]);

    console.log('Database seeded!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    mongoose.connection.close();
  }
};

seed();