const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Forex pairs list
const FOREX_PAIRS = {
  major: [
    'EURUSD', 'USDJPY', 'GBPUSD', 'USDCHF',
    'AUDUSD', 'USDCAD', 'NZDUSD'
  ],
  minor: [
    'EURGBP', 'EURJPY', 'EURCHF', 'EURAUD', 'EURCAD', 'EURNZD',
    'AUDJPY', 'NZDJPY', 'CADJPY', 'CHFJPY',
    'AUDNZD', 'AUDCHF', 'AUDCAD',
    'CADCHF', 'NZDCHF', 'NZDCAD',
    'GBPJPY', 'GBPCHF', 'GBPAUD', 'GBPCAD'
  ]
};

const ALL_PAIRS = [...FOREX_PAIRS.major, ...FOREX_PAIRS.minor];

// Cache to store analysis results
let cachedAnalysis = null;
let lastAnalysisTime = null;

/**
 * Call Perplexity API to get forex analysis
 */
async function analyzeForexPairs() {
  console.log(`[${new Date().toISOString()}] Starting Perplexity API analysis...`);

  try {
    // Build the prompt for Perplexity
    const pairsListText = ALL_PAIRS.join(', ');
    const prompt = `
You are an expert forex trader and market analyst. Analyze the following forex pairs based on CURRENT market conditions, technical indicators, news sentiment, and market trends.

FOREX PAIRS TO ANALYZE: ${pairsListText}

For each pair, provide ONLY ONE of these exact responses:
- "Strong Buy"
- "Strong Sell"
- "Medium Buy"
- "Medium Sell"
- "Flat"

Analysis timeframe: Next 24-48 hours (up to 3 days)

For your analysis, use:
1. Technical Analysis: RSI, MACD, Bollinger Bands, EMA, ADX, support/resistance levels
2. Market Sentiment: Current news, economic events, geopolitical factors
3. Price Action: Trends, momentum, volatility
4. Holistic View: Correlation with other markets, broader economic indicators

IMPORTANT: Respond with ONLY the pair name and signal, one per line, in this exact format:
EURUSD - Strong Buy
USDJPY - Flat
etc.

Do NOT include any explanations, comments, or reasoning. Only the pair name and signal.
`;

    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a precise forex market analyst. Respond with only pair names and signals in the exact format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.5,
        top_p: 0.9
      },
      {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const analysisText = response.data.choices[0].message.content;
    console.log('Raw Perplexity response received');

    // Parse the response
    const analysisResult = parseAnalysisResponse(analysisText);
    cachedAnalysis = analysisResult;
    lastAnalysisTime = new Date();

    console.log(`[${lastAnalysisTime.toISOString()}] Analysis completed successfully`);
    return analysisResult;

  } catch (error) {
    console.error('Error calling Perplexity API:', error.response?.data || error.message);
    
    // Return cached data if available
    if (cachedAnalysis) {
      console.log('Returning cached analysis due to API error');
      return cachedAnalysis;
    }

    // Return error state
    throw new Error(`Perplexity API error: ${error.response?.data?.error?.message || error.message}`);
  }
}

/**
 * Parse Perplexity response into structured format
 */
function parseAnalysisResponse(text) {
  const analysisMap = {};

  // Extract each line and parse
  const lines = text.split('\n').filter(line => line.trim());

  for (const line of lines) {
    // Match patterns like "EURUSD - Strong Buy" or "EURUSD: Flat"
    const match = line.match(/^([A-Z]{6})\s*[-:]\s*(.+?)$/);
    
    if (match) {
      const pair = match[1].trim().toUpperCase();
      const signal = match[2].trim();

      // Validate signal
      if (['Strong Buy', 'Strong Sell', 'Medium Buy', 'Medium Sell', 'Flat'].includes(signal)) {
        analysisMap[pair] = signal;
      }
    }
  }

  // Ensure all pairs have a signal (default to "Flat" if missing)
  for (const pair of ALL_PAIRS) {
    if (!analysisMap[pair]) {
      analysisMap[pair] = 'Flat';
    }
  }

  return analysisMap;
}

/**
 * Main API endpoint
 */
app.get('/api/analyze', async (req, res) => {
  try {
    // Check if we have recent cached data (within 55 minutes)
    if (cachedAnalysis && lastAnalysisTime) {
      const timeSinceLastAnalysis = Date.now() - lastAnalysisTime.getTime();
      const fiftyFiveMinutes = 55 * 60 * 1000;

      if (timeSinceLastAnalysis < fiftyFiveMinutes) {
        console.log('Returning cached analysis');
        return res.json(cachedAnalysis);
      }
    }

    // Perform new analysis
    const analysis = await analyzeForexPairs();
    res.json(analysis);

  } catch (error) {
    console.error('Endpoint error:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to analyze forex pairs. Please try again later.'
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    lastAnalysis: lastAnalysisTime ? lastAnalysisTime.toISOString() : 'Never',
    pairsAnalyzed: ALL_PAIRS.length
  });
});

/**
 * Serve the frontend
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Forex Analyzer running on port ${PORT}`);
  console.log(`📊 Analyzing ${ALL_PAIRS.length} pairs (${FOREX_PAIRS.major.length} major + ${FOREX_PAIRS.minor.length} minor)`);
  console.log(`🔄 Auto-refresh: Every 60 minutes`);
});
