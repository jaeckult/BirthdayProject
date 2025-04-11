const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const profileRoutes = require('./routes/profile');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes (before static files)
app.use('/api/profiles', profileRoutes);

// Static Files (after API routes)
app.use(express.static('public')); // Serves index.html, styles.css, script.js

// MongoDB Connection
mongoose.connect('mongodb+srv://JACKI:SCRAM@cluster0.jnaox.mongodb.net/BIRTHDAYdb?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));


// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));