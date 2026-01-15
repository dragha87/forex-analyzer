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
    
    .buy {
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
    }
    
    .sell {
      background: linear-gradient(135deg, #D32F2F, #B71C1C);
      color: white;
    }
    
    .neutral {
      background: #FFF3E0;
      color: #EF6C00;
    }
    
    .strong-buy {
      background: linear-gradient(135deg, #4CAF50, #2E7D32);
      color: white;
    }
    
    .strong-sell {
      background: linear-gradient(135deg, #D32F2F, #880E4F);
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
    
    .ai-analysis {
      background: #f5f5f5;
      border-left: 4px solid #667eea;
      padding: 20px;
      border-radius: 8px;
      line-height: 1.8;
      color: #333;
      font-size: 0.95em;
      max-height: 600px;
      overflow-y: auto;
    }
    
    .ai-analysis h3 {
      color: #667eea;
      margin-top: 0;
      margin-bottom: 15px;
    }
    
    .ai-analysis p {
      margin-bottom: 12px;
    }
    
    .ai-analysis::-webkit-scrollbar {
      width: 8px;
    }
    
    .ai-analysis::-webkit-scrollbar-track {
      background: #e0e0e0;
      border-radius: 10px;
    }
    
    .ai-analysis::-webkit-scrollbar-thumb {
      background: #667eea;
      border-radius: 10px;
    }
    
    .ai-analysis::-webkit-scrollbar-thumb:hover {
      background: #764ba2;
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
    
    <!-- Signals Section -->
    <div class="signals-section">
      <div class="section-title">📊 Trading Signals</div>
      <div id="signals" class="signals-grid"></div>
    </div>
    
    <!-- AI Analysis Section -->
    <div class="signals-section">
      <div class="section-title">🧠 AI Analysis</div>
      <div id="aiAnalysis" class="ai-analysis">
        <p>AI analysis will appear here after signals are loaded...</p>
      </div>
    </div>
  </div>

  <script>
    async function fetchSignals() {
      const statusEl = document.getElementById('status');
      const signalsEl = document.getElementById('signals');
      const aiAnalysisEl = document.getElementById('aiAnalysis');
      const timestampEl = document.getElementById('timestamp');
      
      statusEl.className = 'status loading';
      statusEl.textContent = '🧠 Analyzing markets with AI...';
      signalsEl.innerHTML = '';
      aiAnalysisEl.innerHTML = '<p>Loading...</p>';
      timestampEl.textContent = '';
      
      try {
        const response = await fetch('/api/analyze');
        const data = await response.json();
        
        if (response.status === 500 || data.error) {
          statusEl.className = 'status error';
          statusEl.textContent = '❌ Error: ' + (data.error || 'AI analysis failed');
          aiAnalysisEl.innerHTML = '<p>Error: ' + (data.error || 'Failed to get AI analysis') + '</p>';
          return;
        }
        
        timestampEl.textContent = 'Updated: ' + new Date(data.timestamp).toLocaleString();
        statusEl.className = 'status ai-active';
        statusEl.textContent = '✅ Live Perplexity AI Analysis';
        
        const signalCount = Object.keys(data.signals || {}).length;
        if (signalCount === 0) {
          statusEl.textContent = '⚠️ No signals received from AI';
          return;
        }
        
        // Display signals
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
        
        // Display full AI analysis
        if (data.aiAnalysis) {
          aiAnalysisEl.innerHTML = '<h3>📝 Full Market Analysis</h3><p>' + 
            data.aiAnalysis.replace(/\\n/g, '</p><p>') + 
            '</p>';
        } else {
          aiAnalysisEl.innerHTML = '<p>No detailed analysis available</p>';
        }
          
      } catch (error) {
        statusEl.className = 'status error';
        statusEl.textContent = '❌ Network error: ' + error.message;
        console.error('Fetch error:', error);
      }
    }
    
    window.addEventListener('load', fetchSignals);
    setInterval(fetchSignals, 300000);
  </script>
</body>
</html>`);
});

// 🤖 AI-Powered API Endpoint - PURE AI ONLY
app.get('/api/analyze', async (req, res) => {
  try {
    console.log('🤖 Calling Perplexity AI...');

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
            content: 'You are a professional forex trading analyst with expertise in technical analysis, market trends, and economic indicators. Provide detailed market analysis and clear trading signals.'
          },
          {
            role: 'user',
            content: 'Analyze these 29 forex pairs for the next 3-4 days of trading: EURUSD, GBPUSD, USDJPY, USDCHF, USDCAD, AUDUSD, NZDUSD, EURGBP, EURCHF, EURJPY, EURAUD, EURCAD, EURNZD, GBPCHF, GBPJPY, GBPAUD, GBPCAD, GBPNZD, CHFJPY, AUDJPY, AUDNZD, AUDCAD, AUDCHF, CADJPY, CADCHF, NZDJPY, NZDCHF, NZDCAD. First, provide a JSON object with trading signals. Then provide a detailed market analysis explaining your signals. For signals, use: "Buy", "Sell", or "Neutral" based on technical analysis. Format: Start with JSON like {"EURUSD":"Buy",...} then add detailed market analysis below.'
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
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

    let aiContent = aiData.choices[0].message.content.trim();
    console.log('✅ AI response received, length:', aiContent.length);

    let signals = {};
    let aiAnalysis = '';
    
    // Try to extract JSON first
    const jsonMatch = aiContent.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      try {
        signals = JSON.parse(jsonMatch[0]);
        console.log('✅ Successfully parsed AI JSON response');
        
        // Get analysis text (everything after JSON)
        const jsonEndIndex = aiContent.indexOf(jsonMatch[0]) + jsonMatch[0].length;
        aiAnalysis = aiContent.substring(jsonEndIndex).trim();
      } catch (e) {
        console.log('⚠️ JSON parse failed');
      }
    }
    
    // If no JSON found, try text extraction
    if (Object.keys(signals).length === 0) {
      console.log('⚠️ No JSON found, trying text extraction');
      
      const lines = aiContent.split('\n');
      lines.forEach(line => {
        const match = line.match(/([A-Z]{6})\s*[-:]\s*(Buy|Sell|Neutral|Strong Buy|Strong Sell)/i);
        if (match) {
          const pair = match[1].toUpperCase();
          const signal = match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase();
          signals[pair] = signal;
          console.log(`Extracted: ${pair} = ${signal}`);
        }
      });
      
      aiAnalysis = aiContent;
    }

    if (Object.keys(signals).length === 0) {
      console.error('⚠️ No signals extracted from AI response');
      return res.status(500).json({
        timestamp: new Date().toISOString(),
        error: 'Failed to extract signals from AI response',
        signals: {},
        rawResponse: aiContent.substring(0, 200)
      });
    }

    res.json({
      timestamp: new Date().toISOString(),
      signals: signals,
      aiAnalysis: aiAnalysis,
      source: '🧠 Perplexity AI (sonar-pro)',
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
    status: '✅ LIVE',
    timestamp: new Date().toISOString(),
    apiKeyActive: !!PERPLEXITY_API_KEY,
    keyPreview: PERPLEXITY_API_KEY.substring(0, 10) + '...'
  });
});

module.exports = app;
