const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    apiKeySet: !!PERPLEXITY_API_KEY,
    env: process.env.NODE_ENV 
  });
});

// Forex analysis
app.get('/api/analyze', async (req, res) => {
  try {
    if (!PERPLEXITY_API_KEY) {
      return res.status(500).json({ 
        error: 'Set PERPLEXITY_API_KEY in Vercel Environment Variables' 
      });
    }

    const prompt = `Give forex signals for: EURUSD GBPUSD USDJPY USDCHF AUDUSD USDCAD NZDUSD
Use only: "Strong Buy", "Buy", "Neutral", "Sell", "Strong Sell"
Return ONLY valid JSON: {"EURUSD":"Buy","GBPUSD":"Sell"}`;

    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar-small-online',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.1
      },
      {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    const signals = JSON.parse(content);

    res.json({
      timestamp: new Date().toISOString(),
      signals
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      error: 'Analysis failed', 
      details: error.response?.status || error.message 
    });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

module.exports = app;
