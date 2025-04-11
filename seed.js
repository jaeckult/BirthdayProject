const mongoose = require('mongoose');
const Profile = require('./models/Profile');
const Card = require('./models/Card');
const Question = require('./models/Question');

// Connect to MongoDB Atlas (consider moving credentials to .env)
mongoose.connect('mongodb+srv://JACKI:SCRAM@cluster0.jnaox.mongodb.net/BIRTHDAYdb?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

const seed = async () => {
  try {
    // Clear existing data
    await Profile.deleteMany({});
    await Card.deleteMany({});
    await Question.deleteMany({});

    // Cards
    const card1 = await new Card({ title: 'Star Card', value: 5, image: 'star.png', price: 10 }).save();
    const card2 = await new Card({ title: 'Heart Card', value: 10, image: 'heart.png', price: 20 }).save();
    const card3 = await new Card({ title: 'Gold Card', value: 25, image: 'gold.png', price: 50 }).save();

    // Profiles with birthdates
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

    const profile3 = await new Profile({
      name: 'Fuad',
      picture: 'fuad.png',
      bio: 'Yeberehaw Anbessa',
      cardCollection: [],
      points: 40,
      birthDate: new Date(2004, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    }).save();

    const profile4 = await new Profile({
      name: 'Haile',
      picture: 'haile.png',
      bio: 'Wesagn',
      cardCollection: [],
      points: 0,
      birthDate: new Date(2005, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    }).save();

    const profile5 = await new Profile({
      name: 'Abel',
      picture: 'abel.png',
      bio: 'Abela Danger',
      cardCollection: [],
      points: 0,
      birthDate: new Date(2005, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    }).save();

    const profile6 = await new Profile({
      name: 'Sofi',
      picture: 'sofi.png',
      bio: 'Certified Debt Accumulator',
      cardCollection: [],
      points: 0,
      birthDate: new Date(2005, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    }).save();

    const profile7 = await new Profile({
      name: 'Eyasu',
      picture: 'eyasu.png',
      bio: 'yekennedyiw kebet',
      cardCollection: [],
      points: 0,
      birthDate: new Date(2005, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    }).save();

    const profile8 = await new Profile({
      name: 'Aman',
      picture: 'aman.png',
      bio: 'Vibes',
      cardCollection: [],
      points: 0,
      birthDate: new Date(2005, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    }).save();

    const profile9 = await new Profile({
      name: 'Betrsh',
      picture: 'betre.png',
      bio: 'Beatrice',
      cardCollection: [],
      points: 0,
      birthDate: new Date(2004, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    }).save();

    // Questions for all profiles
    await Question.insertMany([
      { profileId: profile1._id, questionText: 'What’s Alice’s favorite color?', correctAnswer: 'Blue', pointsAwarded: 10 },
      { profileId: profile1._id, questionText: 'What’s Alice’s favorite hobby?', correctAnswer: 'Hiking', pointsAwarded: 15 },
      { profileId: profile2._id, questionText: 'What’s Bob’s favorite band?', correctAnswer: 'Beatles', pointsAwarded: 10 },
      { profileId: profile2._id, questionText: 'What’s Bob’s favorite instrument?', correctAnswer: 'Guitar', pointsAwarded: 15 },
      { profileId: profile3._id, questionText: 'What’s Fuad’s favorite animal?', correctAnswer: 'Lion', pointsAwarded: 10 },
      { profileId: profile3._id, questionText: 'What’s Fuad’s favorite food?', correctAnswer: 'Injera', pointsAwarded: 15 },
      { profileId: profile4._id, questionText: 'What’s Haile’s favorite sport?', correctAnswer: 'Soccer', pointsAwarded: 10 },
      { profileId: profile4._id, questionText: 'What’s Haile’s favorite season?', correctAnswer: 'Spring', pointsAwarded: 15 },
      { profileId: profile5._id, questionText: 'What’s Abel’s favorite movie?', correctAnswer: 'The Matrix', pointsAwarded: 10 },
      { profileId: profile5._id, questionText: 'What’s Abel’s favorite game?', correctAnswer: 'Chess', pointsAwarded: 15 },
      { profileId: profile6._id, questionText: 'What’s Sofi’s favorite book?', correctAnswer: 'Dune', pointsAwarded: 10 },
      { profileId: profile6._id, questionText: 'What’s Sofi’s favorite drink?', correctAnswer: 'Coffee', pointsAwarded: 15 },
      { profileId: profile7._id, questionText: 'What’s Eyasu’s favorite city?', correctAnswer: 'Addis Ababa', pointsAwarded: 10 },
      { profileId: profile7._id, questionText: 'What’s Eyasu’s favorite color?', correctAnswer: 'Green', pointsAwarded: 15 },
      { profileId: profile8._id, questionText: 'What’s Aman’s favorite song?', correctAnswer: 'Vibes', pointsAwarded: 10 },
      { profileId: profile8._id, questionText: 'What’s Aman’s favorite weather?', correctAnswer: 'Sunny', pointsAwarded: 15 },
      { profileId: profile9._id, questionText: 'What’s Betrsh’s favorite flower?', correctAnswer: 'Rose', pointsAwarded: 10 },
      { profileId: profile9._id, questionText: 'What’s Betrsh’s favorite dessert?', correctAnswer: 'Cake', pointsAwarded: 15 }
    ]);

    console.log('Database seeded!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    mongoose.connection.close();
  }
};

seed();