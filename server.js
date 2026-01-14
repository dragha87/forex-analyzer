import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

const client = new Anthropic();

// Serve static files (your HTML)
app.use(express.static(path.join(__dirname, "public")));

// API endpoint to analyze forex pairs
app.get("/api/analyze", async (req, res) => {
  try {
    const prompt = `Analyze the following major and minor forex pairs for the next 24-48 hours. 
    
For each pair, provide ONE of these signals:
- "Strong Buy"
- "Medium Buy"
- "Flat"
- "Medium Sell"
- "Strong Sell"

Return ONLY a JSON object with pair names as keys and signals as values. Example:
{
  "EURUSD": "Strong Buy",
  "USDJPY": "Medium Sell",
  ...
}

Pairs to analyze:
Major: EURUSD, USDJPY, GBPUSD, USDCHF, AUDUSD, USDCAD, NZDUSD
Minor: EURGBP, EURJPY, GBPJPY, AUDNZD, NZDUSD, EURCAD, AUDCAD, EURAUD, GBPCAD, CADCHF, CHFJPY, EURCHF, AUDCHF, NZDCHF, NZDJPY, AUDJPY, GBPAUD, EURUSD, USDJPY, AUDNZD

Base your analysis on:
1. Technical analysis (support/resistance, moving averages, momentum)
2. Market sentiment and news
3. Economic indicators
4. Holistic market conditions`;

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract the text content
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from response");
    }

    const forexData = JSON.parse(jsonMatch[0]);
    res.json(forexData);
  } catch (error) {
    console.error("Error analyzing forex pairs:", error);
    res.status(500).json({
      error: `Failed to analyze forex pairs: ${error.message}`,
    });
  }
});

// Serve index.html for root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`🚀 Forex Analyzer running on port ${port}`);
  console.log(`📊 Analyzing 27 pairs (7 major + 20 minor)`);
  console.log(`🔄 Auto-refresh: Every 60 minutes`);
});
