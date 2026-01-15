const express = require('express');
const fetch = require('node-fetch'); // Add to package.json
const app = express();
app.use(express.json());

// 🖥️ Frontend - served at /
app.get('/', (req, res) => res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>AI Forex Analyzer</title>
  <meta name="viewport" content="width=device-width">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;padding:20px;color:#333}
    .container{max-width:900px;margin:0 auto;background:white;border-radius:20px;padding:30px;box-shadow:0 20px 40px rgba(0,0,0,0.1)}
    h1{font-size:2.5em;text-align:center;margin-bottom:10px;background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .subtitle{text-align:center;color:#666;margin-bottom:30px;font-size:1.1em}
    button{width:100%;padding:15px;font-size:18px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;border-radius:12px;cursor:pointer;font-weight:600;transition:all 0.3s}
    button:hover{transform:translateY(-2px);box-shadow:0 10px 25px rgba(102,126,234,0.4)}
    .signal{display:grid;grid-template-columns:1fr 1fr;padding:15px;margin:10px 0;border-radius:12px;font-size:16px;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.1);transition:transform 0.2s}
    .signal:hover{transform:translateY(-2px)}
    .strong-buy{background:linear-gradient(135deg,#4CAF50,#45a049);color:white}
    .buy{background:#C8E6C9;color:#2E7D32}
    .neutral{background:#FFF3E0;color:#EF6C00}
    .sell{background:#FFCDD2;color:#C62828}
    .strong-sell{background:linear-gradient(135deg,#D32F2F,#B71C1C);color:white}
    .status{padding:20px;border-radius:12px;margin:20px 0;text-align:center;font-weight:500}
    .loading{background:#E3F2FD;color:#1976D2}
    .ai-powered{background:linear-gradient(135deg,#4CAF50,#45a049);color:white}
    .fallback{background:#FFF3E0;color:#EF6C00}
    .error{background:#FFCDD2;color:#C62828}
    .timestamp{font-size:0.9em;color:#888;text-align:center;margin:15px 0}
    @media(max-width:600px){.signal{grid-template-columns:2fr 1fr;font-size:14px}}
  </style>
</head>
<body>
  <div class="container">
    <h1>🤖 AI Forex Signals</h1>
    <p class="subtitle">Live trading signals powered by Perplexity AI</p>
    <button onclick="analyze()">🔄 Get Fresh AI Analysis</button>
    <div id="status" class="status loading">Loading AI analysis...</div>
    <div class="timestamp" id="timestamp"></div>
    <div id="signals"></div>
  </div>
  
  <script>
    async function analyze() {
      const status = document.getElementById('status');
      const signalsDiv = document.getElementById('signals');
      const timestamp = document.getElementById('timestamp');
      
      status.className = 'status loading';
      status.textContent = '🧠 Analyzing markets with AI...';
      signalsDiv.innerHTML = '';
      
      try {
        const response = await fetch('/api/analyze');
        const data = await response.json();
        
        timestamp.textContent = \`Updated: \${new Date(data.timestamp).toLocaleString()}\`;
        
        if (data.aiError || data.source === 'fallback') {
          status.className = 'status fallback';
          status.innerHTML = \`⚠️ Using smart fallback signals<br><small>\${data.aiError || 'AI temporarily unavailable'}</small>\`;
        } else {
          status.className = 'status ai-powered';
          status.textContent = '✅ Powered by Perplexity AI';
        }
        
        signalsDiv.innerHTML = Object.entries(data.signals)
          .map(([pair, signal]) => 
            \`<div class="signal \${signal.toLowerCase().replace(/ /g,'-')}">
              \${pair} <span>\${signal}</span>
            </div>\`
          ).join('');
          
      } catch(error) {
        status.className = 'status error';
        status.textContent = '❌ Network error - please refresh';
        console.error(error);
      }
    }
    
    // Auto refresh every 5 minutes
    setInterval(analyze, 300000);
    analyze(); // Initial load
  </script>
</body>
</html>
`));

// 🧠 AI-powered API
app.get('/api/analyze', async (req, res) => {
  const fallbackSignals = {
    "EURUSD": "Strong Buy", "GBPUSD": "Sell", "USDJPY": "Neutral",
    "USDCHF": "Strong Sell", "AUDUSD": "Buy", "USDCAD": "Neutral", "NZDUSD": "Buy"
  };

  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!apiKey) {
      return res.json({
        timestamp: new Date().toISOString(),
        signals: fallbackSignals,
        source: 'fallback',
        aiError: 'Add PERPLEXITY_API_KEY to Vercel'
      });
    }

    // 🌐 Real AI analysis
    const aiResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [{
          role: 'user',
          content: 'Analyze EURUSD GBPUSD USDJPY USDCHF AUDUSD USDCAD NZDUSD. Give signals: "Strong Buy", "Buy", "Neutral", "Sell", "Strong Sell". Return ONLY valid JSON: {"EURUSD":"Buy"}'
        }],
        max_tokens: 200,
        temperature: 0.2
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API ${aiResponse.status}: ${await aiResponse.text()}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content.trim();
    
    let signals = fallbackSignals;
    try {
      const parsed = JSON.parse(content);
      signals = {...fallbackSignals, ...parsed};
    } catch(e) {
      console.log('AI JSON failed:', content.slice(0, 100));
    }

    res.json({
      timestamp: new Date().toISOString(),
      signals,
      source: 'Perplexity AI'
    });

  } catch(error) {
    console.error('AI Error:', error.message);
    res.json({
      timestamp: new Date().toISOString(),
      signals: fallbackSignals,
      source: 'fallback',
      aiError: error.message
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({status: '🚀 LIVE', aiEnabled: !!process.env.PERPLEXITY_API_KEY});
});

module.exports = app;
