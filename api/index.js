const express = require('express');
const app = express();

app.use(express.json());

// HARDCODED API KEY FOR TESTING (⚠️ NEVER PUSH TO PRODUCTION)
const PERPLEXITY_API_KEY = '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';

// 🎨 Frontend HTML
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>🤖 AI Forex Signals</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
      color: #333;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    }
    
    h1 {
      font-size: 2.5em;
      text-align: center;
      margin-bottom: 10px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
      font-size: 1.1em;
    }
    
    button {
      width: 100%;
      padding: 16px;
      font-size: 18px;
      font-weight: 600;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 20px;
    }
    
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
    }
    
    button:active {
      transform: translateY(0);
    }
    
    .status {
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 20px;
      text-align: center;
      font-weight: 500;
      font-size: 1.1em;
    }
    
    .loading {
      background: #E3F2FD;
      color: #1976D2;
    }
    
    .ai-active {
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
    }
    
    .error {
      background: #FFCDD2;
      color: #C62828;
    }
    
    .timestamp {
      font-size: 0.9em;
      color: #888;
      text-align: center;
      margin-bottom: 20px;
    }
    
    .signals-section {
      margin-bottom: 40px;
    }
    
    .section-title {
      font-size: 1.5em;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }
    
    .signals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 15px;
    }
    
    .signal {
      text-align: center;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 8px;
      border: 1px solid #eee;
    }
    
    .pair-name {
      font-size: 12px;
      color: #666;
      margin-bottom: 6px;
      font-weight: 500;
    }
    
    .pair-signal {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }
    
    .buy {
      color: #4CAF50;
    }
    
    .sell {
      color: #D32F2F;
    }
    
    .neutral {
      color: #EF6C00;
    }
    
    .strong-buy {
      color: #2E7D32;
    }
    
    .strong-sell {
      color: #880E4F;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📈 AI Forex Signals</h1>
    <p class="subtitle">Real-time trading signals powered by Perplexity AI</p>
    
    <button onclick="fetchSignals()">🔄 Get Fresh AI Signals</button>
    
    <div id="status" class="status loading">⏳ Loading signals...</div>
    <div class="timestamp" id="timestamp"></div>
    
    <!-- Signals Section -->
    <div class="signals-section">
      <div class="section-title">📊 Trading Signals</div>
      <div id="signals" class="signals-grid"></div>
    </div>
  </div>

  <script>
    async function fetchSignals() {
      const statusEl = document.getElementById('status');
      const signalsEl = document.getElementById('signals');
      const timestampEl = document.getElementById('timestamp');
      
      statusEl.className = 'status loading';
      statusEl.textContent = '🧠 Fetching AI signals...';
      signalsEl.innerHTML = '';
      timestampEl.textContent = '';
      
      try {
        const response = await fetch('/api/analyze');
        const data = await response.json();
        
        if (response.status === 500 || data.error) {
          statusEl.className = 'status error';
          statusEl.textContent = '❌ Error: ' + (data.error || 'Failed to get signals');
          return;
        }
        
        timestampEl.textContent = 'Updated: ' + new Date(data.timestamp).toLocaleString();
        statusEl.className = 'status ai-active';
        statusEl.textContent = '✅ Live AI Signals';
        
        const signalCount = Object.keys(data.signals || {}).length;
        if (signalCount === 0) {
          statusEl.textContent = '⚠️ No signals received';
          return;
        }
        
        // Display signals
        signalsEl.innerHTML = Object.entries(data.signals)
          .map(([pair, signal]) => {
            const signalClass = signal.toLowerCase().replace(/\\s+/g, '-');
            return \`
              <div class="signal">
                <div class="pair-name">\${pair}</div>
                <div class="pair-signal \${signalClass}">\${signal}</div>
              </div>
            \`;
          }).join('');
          
      } catch (error) {
        statusEl.className = 'status error';
        statusEl.textContent = '❌ Network error: ' + error.message;
        console.error('Fetch error:', error);
      }
    }
    
    window.addEventListener('load', fetchSignals);
    setInterval(fetchSignals, 86400000); // Refresh every 24 hours
  </script>
</body>
</html>`);
});

// 🤖 Simplified API Endpoint - Signals Only
app.get('/api/analyze', async (req, res) => {
  try {
    console.log('🤖 Calling Perplexity AI for signals...');

    const aiResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a professional forex trading analyst. Respond ONLY with a valid JSON object containing trading signals for the specified pairs. Use only "Buy", "Sell", or "Neutral" as values. No explanations, no additional text.'
          },
          {
            role: 'user',
            content: 'Provide trading signals for next 3-4 days for these pairs ONLY as JSON: EURUSD, GBPUSD, USDJPY, USDCHF, USDCAD, AUDUSD, NZDUSD, EURGBP, EURCHF, EURJPY, EURAUD, EURCAD, EURNZD, GBPCHF, GBPJPY, GBPAUD, GBPCAD, GBPNZD, CHFJPY, AUDJPY, AUDNZD, AUDCAD, AUDCHF, CADJPY, CADCHF, NZDJPY, NZDCHF, NZDCAD. Format exactly: {"EURUSD":"Buy","GBPUSD":"Sell",...}'
          }
        ],
        max_tokens: 1000,
        temperature: 0.2
      })
    });

    const aiData = await aiResponse.json();

    if (!aiResponse.ok) {
      console.error('❌ AI API Error:', aiResponse.status, aiData);
      return res.status(500).json({
        timestamp: new Date().toISOString(),
        error: `Perplexity ${aiResponse.status}: ${aiData.error?.message || 'API Error'}`,
        signals: {}
      });
    }

    const aiContent = aiData.choices[0].message.content.trim();
    console.log('✅ AI response received');

    let signals = {};
    
    // Extract JSON from response
    const jsonMatch = aiContent.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      try {
        signals = JSON.parse(jsonMatch[0]);
        console.log('✅ Parsed', Object.keys(signals).length, 'signals');
      } catch (e) {
        console.log('⚠️ JSON parse failed, trying fallback');
      }
    }

    // Fallback text extraction if JSON fails
    if (Object.keys(signals).length === 0) {
      const lines = aiContent.split('\n');
      lines.forEach(line => {
        const match = line.match(/([A-Z]{6})\s*[-:]\s*(Buy|Sell|Neutral)/i);
        if (match) {
          const pair = match[1];
          const signal = match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase();
          signals[pair] = signal;
        }
      });
    }

    if (Object.keys(signals).length === 0) {
      return res.status(500).json({
        timestamp: new Date().toISOString(),
        error: 'No signals extracted',
        signals: {}
      });
    }

    res.json({
      timestamp: new Date().toISOString(),
      signals: signals,
      pairCount: Object.keys(signals).length
    });

  } catch (error) {
    console.error('❌ Critical Error:', error.message);
    res.status(500).json({
      timestamp: new Date().toISOString(),
      error: error.message,
      signals: {}
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: '✅ LIVE - Signals Only Mode',
    timestamp: new Date().toISOString(),
    apiKeyActive: !!PERPLEXITY_API_KEY
  });
});

module.exports = app;
