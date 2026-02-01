// server/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize App
const app = express();
app.use(cors());
app.use(express.json());

// ✅ CORRECT: We import the route, which internally uses the config file
const matchCoachRoute = require('./routes/ai/matchCoach');

// Mount the route
app.use('/api/ai/match-coach', matchCoachRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Node.js Server running on port ${PORT}`);
});