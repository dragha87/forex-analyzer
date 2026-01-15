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
    
    .signals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }
    
    .signal {
      padding: 16px;
      border-radius: 12px;
      font-weight: 500;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.2s;
    }
    
    .signal:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }
    
    .strong-buy {
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
    }
    
    .buy {
      background: #C8E6C9;
      color: #2E7D32;
    }
    
    .neutral {
      background: #FFF3E0;
      color: #EF6C00;
    }
    
    .sell {
      background: #FFCDD2;
      color: #C62828;
    }
    
    .strong-sell {
      background: linear-gradient(135deg, #D32F2F, #B71C1C);
      color: white;
    }
    
    .pair-name {
      font-size: 0.9em;
      opacity: 0.8;
      margin-bottom: 4px;
    }
    
    .pair-signal {
      font-size: 1.1em;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📈 AI Forex Signals</h1>
    <p class="subtitle">Real-time trading signals powered by Perplexity AI</p>
    
    <button onclick="fetchSignals()">🔄 Get Fresh AI Analysis</button>
    
    <div id="status" class="status loading">⏳ Loading AI analysis...</div>
    <div class="timestamp" id="timestamp"></div>
    <div id="signals" class="signals-grid"></div>
  </div>

  <script>
    async function fetchSignals() {
      const statusEl = document.getElementById('status');
      const signalsEl = document.getElementById('signals');
      const timestampEl = document.getElementById('timestamp');
      
      statusEl.className = 'status loading';
      statusEl.textContent = '🧠 Analyzing markets with AI...';
      signalsEl.innerHTML = '';
      timestampEl.textContent = '';
      
      try {
        const response = await fetch('/api/analyze');
        const data = await response.json();
        
        timestampEl.textContent = 'Updated: ' + new Date(data.timestamp).toLocaleString();
        
        if (data.source && data.source.includes('Perplexity')) {
          statusEl.className = 'status ai-active';
          statusEl.textContent = '✅ Live Perplexity AI Analysis';
        } else if (data.error) {
          statusEl.className = 'status error';
          statusEl.textContent = '❌ Error: ' + data.error;
        }
        
        signalsEl.innerHTML = Object.entries(data.signals)
          .map(([pair, signal]) => {
            const signalClass = signal.toLowerCase().replace(/\\s+/g, '-');
            return \`
              <div class="signal \${signalClass}">
                <div class="pair-name">\${pair}</div>
                <div class="pair-signal">\${signal}</div>
              </div>
            \`;
          }).join('');
          
      } catch (error) {
        statusEl.className = 'status error';
        statusEl.textContent = '❌ Network error';
        console.error('Fetch error:', error);
      }
    }
    
    window.addEventListener('load', fetchSignals);
    setInterval(fetchSignals, 300000);
  </script>
</body>
</html>`);
});

// 🤖 AI-Powered API Endpoint
app.get('/api/analyze', async (req, res) => {
  const fallbackSignals = {
    'EURUSD': 'AI is not loading',
    'GBPUSD': 'AI is not loading',
    'USDJPY': 'AI is not loading',
    'USDCHF': 'AI is not loading',
    'AUDUSD': 'AI is not loading',
    'USDCAD': 'AI is not loading',
    'NZDUSD': 'AI is not loading'
  };

  try {
    console.log('🤖 Calling Perplexity AI with hardcoded key...');

    // Real AI call with HARDCODED key
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
            content: 'You are a professional forex trading analyst. Provide accurate trading signals.'
          },
          {
            role: 'user',
            content: 'Analyze these forex pairs for short-term trading: EURUSD, GBPUSD, USDJPY, USDCHF, AUDUSD, USDCAD, NZDUSD. For each pair, provide ONE signal: "Strong Buy", "Buy", "Neutral", "Sell", or "Strong Sell". Return ONLY valid JSON with no other text: {"EURUSD":"Buy","GBPUSD":"Sell","USDJPY":"Neutral","USDCHF":"Sell","AUDUSD":"Buy","USDCAD":"Neutral","NZDUSD":"Buy"}'
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      })
    });

    const aiData = await aiResponse.json();

    if (!aiResponse.ok) {
      console.error('❌ AI API Error:', aiResponse.status, aiData);
      throw new Error(`Perplexity ${aiResponse.status}: ${aiData.error?.message || 'API Error'}`);
    }

    const aiContent = aiData.choices[0].message.content.trim();
    console.log('✅ AI response received');

    let signals = fallbackSignals;
    try {
      signals = JSON.parse(aiContent);
      signals = { ...fallbackSignals, ...signals };
      console.log('✅ Successfully parsed AI signals');
    } catch (e) {
      console.log('⚠️ JSON parse failed, using fallback');
      console.log('AI response was:', aiContent);
    }

    res.json({
      timestamp: new Date().toISOString(),
      signals: signals,
      source: '🧠 Perplexity AI (sonar-pro)',
      status: 'success'
    });

  } catch (error) {
    console.error('❌ AI Error:', error.message);

    res.json({
      timestamp: new Date().toISOString(),
      signals: fallbackSignals,
      source: 'fallback',
      error: error.message,
      status: 'error'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: '✅ LIVE',
    timestamp: new Date().toISOString(),
    apiKeyActive: !!PERPLEXITY_API_KEY,
    keyPreview: PERPLEXITY_API_KEY.substring(0, 10) + '...'
  });
});

module.exports = app;
