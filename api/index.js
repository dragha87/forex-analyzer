import express from 'express';
const app = express();
app.use(express.json());

// 🌐 Frontend + API in one file
app.all('*', async (req, res) => {
  // API endpoints
  if (req.path === '/api/analyze') {
    const fallback = {
      EURUSD: 'Strong Buy', GBPUSD: 'Sell', USDJPY: 'Neutral',
      USDCHF: 'Strong Sell', AUDUSD: 'Buy', USDCAD: 'Neutral', NZDUSD: 'Buy'
    };
    
    try {
      const apiKey = process.env.PERPLEXITY_API_KEY;
      if (!apiKey) return res.json({signals: fallback, source: 'fallback'});
      
      const aiResp = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [{role: 'user', content: '{"EURUSD":"Buy"}'}],
          max_tokens: 100
        })
      });
      
      const data = await aiResp.json();
      const signals = JSON.parse(data.choices[0].message.content) || fallback;
      
      res.json({
        timestamp: new Date().toISOString(),
        signals,
        source: 'AI'
      });
      
    } catch (e) {
      res.json({
        timestamp: new Date().toISOString(),
        signals: fallback,
        source: 'fallback',
        error: e.message
      });
    }
    return;
  }
  
  if (req.path === '/api/health') {
    return res.json({
      status: '🟢 LIVE',
      aiEnabled: !!process.env.PERPLEXITY_API_KEY
    });
  }
  
  // Frontend HTML
  res.send(`<!DOCTYPE html>
<html>
<head>
<title>🤖 AI Forex Signals</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<style>
* {margin:0;padding:0;box-sizing:border-box}
body {font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding
