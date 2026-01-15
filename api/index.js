const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Get API key from environment variables
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

if (!PERPLEXITY_API_KEY) {
  console.error('❌ PERPLEXITY_API_KEY is not set!');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    apiKeySet: !!PERPLEXITY_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Main forex analysis endpoint
app.get('/api/analyze', async (req, res) => {
  try {
    console.log('🔄 Analyzing forex pairs...');
    
    if (!PERPLEXITY_API_KEY) {
      return res.status(500).json({ 
        error: 'PERPLEXITY_API_KEY not configured in Vercel environment variables' 
      });
    }

    // Forex pairs to analyze
    const forexPairs = [
      'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 
      'AUDUSD', 'USDCAD', 'NZDUSD'
    ];

    // Prompt for Perplexity AI
    const prompt = `Analyze these forex pairs for short-term trading (1-4 hours). 
Provide signals: "Strong Buy", "Buy", "Neutral", "Sell", "Strong Sell". 
Base on latest technical analysis, support/resistance, momentum. 
Format exactly as JSON:

{
  "EURUSD": "Strong Buy",
  "GBPUSD": "Sell",
  ...
}`;

    console.log('🤖 Calling Perplexity AI...');

    // Call Perplexity API (sonar-pro model)
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: 'You are a forex trading expert.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.1
      },
      {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Parse AI response
    const aiResponse = response.data.choices[0].message.content;
    console.log('✅ AI analysis received');

    // Extract JSON from response (simple parsing)
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    // Fill missing pairs with neutral
    const result = {};
    forexPairs.forEach(pair => {
      result[pair] = analysis[pair] || 'Neutral';
    });

    res.json({
      timestamp: new Date().toISOString(),
      pairs: result,
      rawAI: aiResponse.slice(0, 200) + '...'
    });

  } catch (error) {
    console.error('❌ Analyze error:', error.message);
    
    if (error.response) {
      console.error('Perplexity API error:', error.response.status, error.response.data);
      res.status(500).json({ 
        error: 'AI analysis failed', 
        details: error.response.data?.error?.message || error.message 
      });
    } else {
      res.status(500).json({ 
        error: 'Server error during analysis',
        details: error.message 
      });
    }
  }
});

// Export for Vercel Serverless
module.exports = app;
