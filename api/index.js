const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', apiKeySet: !!PERPLEXITY_API_KEY });
});

app.get('/api/analyze', async (req, res) => {
  try {
    // Your forex analysis code here
    res.json({ EURUSD: 'Strong Buy', GBPUSD: 'Sell' });
  } catch (error) {
    console.error('Analyze error:', error.message);
    res.status(500).json({ error: 'Failed to analyze forex pairs' });
  }
});

module.exports = app;  // ← CRITICAL: Export for Vercel
