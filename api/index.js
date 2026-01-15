const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html><head><title>Forex AI</title>
<style>
body {font-family: sans-serif; max-width: 800px; margin: 50px auto; padding: 20px;}
button {padding: 10px 20px; font-size: 16px; cursor: pointer; width: 100%;}
.signal {padding: 10px; margin: 5px 0; border-radius: 5px;}
.buy {background: #4CAF50; color: white;}
.sell {background: #f44336; color: white;}
.neutral {background: #ff9800; color: white;}
</style></head><body>
<h1>📈 Forex Signals</h1>
<button onclick="fetch('/api/analyze').then(r=>r.json()).then(d=>{
  document.getElementById('signals').innerHTML=
  Object.entries(d.signals).map(([p,s])=>
  '<div class=signal class='+s.toLowerCase()+'><strong>'+p+'</strong>: '+s+'</div>'
  ).join('')
})">Get Signals</button>
<div id="signals"></div>
</body></html>`);
});

app.get('/api/analyze', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    signals: {
      EURUSD: 'Strong Buy',
      GBPUSD: 'Sell',
      USDJPY: 'Neutral',
      USDCHF: 'Strong Sell',
      AUDUSD: 'Buy',
      USDCAD: 'Neutral',
      NZDUSD: 'Buy'
    }
  });
});

module.exports = app;
