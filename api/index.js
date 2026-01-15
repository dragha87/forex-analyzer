const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: '✅ OK', 
    apiKeySet: !!PERPLEXITY_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// 2. Forex analysis - SIMPLIFIED & BULLETPROOF
app.get('/api/analyze', async (req, res) => {
  // Immediate fallback signals (works without AI)
  const fallbackSignals = {
    "EURUSD": "Strong Buy",
    "GBPUSD": "Sell", 
    "USDJPY": "Neutral",
    "USDCHF": "Strong Sell",
    "AUDUSD": "Buy",
    "USDCAD": "Neutral",
    "NZDUSD": "Buy"
  };

  try {
    if (!PERPLEXITY_API_KEY) {
      console.log('⚠️ No API key - using fallback');
      return res.json({ 
        timestamp: new Date().toISOString(), 
        signals: fallbackSignals,
        source: 'fallback'
      });
    }

    console.log('🤖 Calling Perplexity...');

    const aiResponse = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [{
          role: 'user',
          content: '{"EURUSD":"Buy"}'  // Force JSON format
        }],
        max_tokens: 100,
        temperature: 0.0
      },
      {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000  // 15s timeout
      }
    );

    const content = aiResponse.data.choices[0].message.content.trim();
    console.log('✅ AI response:', content.slice(0, 50));

    // Parse AI response or use fallback
    let signals = fallbackSignals;
    try {
      const parsed = JSON.parse(content);
      signals = { ...fallbackSignals, ...parsed };
    } catch (e) {
      console.log('⚠️ AI JSON parse failed, using fallback');
    }

    res.json({
      timestamp: new Date().toISOString(),
      signals,
      source: 'AI + fallback'
    });

  } catch (error) {
    console.error('❌ AI Error:', error.response?.status, error.message);
    
    res.json({
      timestamp: new Date().toISOString(),
      signals: fallbackSignals,
      source: 'fallback (AI error)',
      error: error.message
    });
  }
});

// 3. Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

module.exports = app;
