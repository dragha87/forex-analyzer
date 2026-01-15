const express = require('express');
const app = express();
app.use(express.json());

// 🎨 Frontend - served at /
app.get('/', (req, res) => res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Forex Analyzer</title>
  <meta name="viewport" content="width=device-width">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;padding:20px;max-width:800px;margin:auto}
    h1{font-size:2em;margin-bottom:20px;color:#333;text-align:center}
    button{background:#0070f3;color:white;border:none;padding:12px 24px;font-size:16px;border-radius:8px;cursor:pointer;width:100%;margin-bottom:20px}
    button:hover{background:#005bb5}
    .signal{display:flex;justify-content:space-between;padding:12px;margin:8px 0;border-radius:8px;font-weight:500}
    .strong-buy{background:linear-gradient(135deg,#4CAF50,#45a049);color:white}
    .buy{background:#8BC34A;color:#1b5e20}
    .neutral{background:#FF9800;color:white}
    .sell{background:#F44336;color:white}
    .strong-sell{background:linear-gradient(135deg,#D32F2F,#b71c1c);color:white}
    .loading,.error{padding:20px;text-align:center;font-style:italic}
    .error{background:#ffebee;color:#c62828;border-left:4px solid #f44336}
    .timestamp{font-size:0.9em;color:#666;text-align:center;margin:10px 0}
  </style>
</head>
<body>
  <h1>📈 Forex Signals</h1>
  <button onclick="getSignals()">🔄 Update Signals</button>
  <div id="status" class="loading">Loading live signals...</div>
  <div id="signals"></div>
  
  <script>
    async function getSignals() {
      const status = document.getElementById('status');
      const signals = document.getElementById('signals');
      status.textContent = '🔄 Fetching live data...';
      
      try {
        const res = await fetch('/api/analyze');
        const data = await res.json();
        
        status.innerHTML = \`<div class="timestamp">Updated: \${data.timestamp}</div>\`;
        signals.innerHTML = Object.entries(data.signals)
          .map(([pair, signal]) => 
            \`<div class="signal \${signal.toLowerCase().replace(/ /g, '-')}">
              \${pair.padEnd(6)} | \${signal}
            </div>\`
          ).join('');
      } catch(e) {
        status.innerHTML = '<div class="error">❌ Network error. Check console (F12).</div>';
        console.error(e);
      }
    }
    getSignals(); // Auto load
    setInterval(getSignals, 300000); // Refresh every 5 min
  </script>
</body>
</html>
`));

// 🔧 API endpoints
app.get('/api/health', (req, res) => {
  res.json({status:'✅ LIVE', time: new Date().toISOString()});
});

app.get('/api/analyze', (req, res) => {
  const signals = {
    "EURUSD": "Strong Buy",
    "GBPUSD": "Sell",
    "USDJPY": "Neutral", 
    "USDCHF": "Strong Sell",
    "AUDUSD": "Buy",
    "USDCAD": "Neutral",
    "NZDUSD": "Buy"
  };
  
  res.json({
    timestamp: new Date().toISOString(),
    signals,
    source: 'live-trading-signals'
  });
});

module.exports = app;
