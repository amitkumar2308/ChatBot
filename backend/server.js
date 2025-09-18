const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('redis');
const cron = require('node-cron');
const { getEmbedding } = require('./embeddings');
const { search, ensureCollection, insertPoint } = require('./qdrant');
const { askGemini } = require('./gemini');
const { fetchNews } = require('./newsFetcher');
const axios = require('axios');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Redis setup
const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.log('Redis Error:', err));
(async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis Connected');
  } catch (err) {
    console.error('Redis Connection Failed:', err);
  }
})();

// Ensure Qdrant collection
(async () => {
  try {
    await ensureCollection();
  } catch (err) {
    console.error('Failed to ensure collection:', err.message);
  }
})();

// ---- News Ingestion Job ----
async function ingestNewsJob() {
  try {
    await ensureCollection();
    console.log('📥 Starting news ingestion...');

    let allArticles = [];
    const target = 50;
    let attempts = 0;

    while (allArticles.length < target && attempts < 10) {
      attempts++;
      const articles = await fetchNews(attempts);
      if (!articles.length) break;

      for (const a of articles) {
        if (!a.url) continue;
        if (!allArticles.find(x => x.url === a.url)) {
          allArticles.push(a);
        }
        if (allArticles.length >= target) break;
      }
    }

    console.log(`Fetched ${allArticles.length} articles`);

    let inserted = 0;
    for (let i = 0; i < allArticles.length; i++) {
      const art = allArticles[i];
      const text = `${art.title} ${art.description}`.trim();
      if (!text) continue;

      let vector;
      try {
        vector = await getEmbedding(text);
      } catch (err) {
        console.error('❌ Embedding failed:', err.message);
        continue;
      }

      if (!Array.isArray(vector) || vector.length === 0) continue;

      const id = Date.now() + i;
      try {
        await insertPoint(id, vector, { text, url: art.url, title: art.title });
        console.log(`✅ Inserted: ${art.title}`);
        inserted++;
      } catch (err) {
        console.error('❌ Insert failed:', err.message);
      }
    }

    await redisClient.set("trending:topics", JSON.stringify(allArticles.map(a => a.title)));

    console.log(`📰 Ingestion done. Stored ${inserted} articles.`);
  } catch (err) {
    console.error('Ingestion job failed:', err.message);
  }
}

ingestNewsJob();
cron.schedule("0 * * * *", ingestNewsJob);

// ---- Routes ----
app.get('/', (req, res) => res.send("Hello route is working"));

app.post('/chat/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const queryVector = await getEmbedding(query);
    const results = await search(queryVector, 3);

    let passages = results.map((r, i) => `${i + 1}. ${r?.payload?.text || ""}`).join("\n");

    if (!results.length || !passages.trim()) {
      const trending = JSON.parse(await redisClient.get("trending:topics")) || [];
      const suggestion = trending.slice(0, 5).join(", ") || "politics, economy, world news";
      const fallback = `⚠️ Sorry, I couldn’t find news about "${query}". Trending topics: ${suggestion}`;

      await redisClient.rPush(`session:${sessionId}`, JSON.stringify({ role: "user", text: query }));
      await redisClient.rPush(`session:${sessionId}`, JSON.stringify({ role: "bot", text: fallback }));

      return res.json({ sessionId, answer: fallback });
    }

    const prompt = `Use the following passages to answer:\n\n${passages}\n\nQuestion: ${query}\n\nAnswer clearly:`;
    const answer = await askGemini(prompt);

    await redisClient.rPush(`session:${sessionId}`, JSON.stringify({ role: "user", text: query }));
    await redisClient.rPush(`session:${sessionId}`, JSON.stringify({ role: "bot", text: answer }));

    res.json({ sessionId, answer });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: "⚠️ Something went wrong." });
  }
});

app.get('/history/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const messages = await redisClient.lRange(`session:${sessionId}`, 0, -1);
  res.json({ sessionId, messages: messages.map(m => JSON.parse(m)) });
});

app.delete('/reset/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  await redisClient.del(`session:${sessionId}`);
  res.json({ status: "Session cleared", sessionId });
});

app.get('/news', async (req, res) => {
  const articles = await fetchNews();
  res.json({ count: articles.length, articles });
});

app.get('/qdrant-data', async (req, res) => {
  try {
    const { data } = await axios.post(
      `${process.env.QDRANT_URL}/collections/news_articles/points/scroll`,
      { limit: 70 },
      { headers: { "api-key": process.env.QDRANT_API_KEY } }
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
