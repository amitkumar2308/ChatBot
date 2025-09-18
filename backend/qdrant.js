const axios = require('axios');
require('dotenv').config();

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

async function ensureCollection() {
  try {
    await axios.put(
      `${QDRANT_URL}/collections/news_articles`,
      { vectors: { default: { size: 768, distance: 'Cosine' } } },
      { headers: { 'api-key': QDRANT_API_KEY } }
    );
    console.log("✅ Collection ensured");
  } catch (err) {
    if (err.response?.status === 409) {
      console.log("ℹ️ Collection already exists");
    } else {
      console.error("Ensure collection error:", err.response?.data || err.message);
    }
  }
}

async function insertPoint(id, vector, payload) {
  return axios.put(
    `${QDRANT_URL}/collections/news_articles/points`,
    { points: [{ id, vector, payload }] },
    { headers: { 'api-key': QDRANT_API_KEY } }
  );
}

async function search(vector, limit = 3) {
  const res = await axios.post(
    `${QDRANT_URL}/collections/news_articles/points/search`,
    { vector, limit },
    { headers: { 'api-key': QDRANT_API_KEY } }
  );
  return res.data.result || [];
}

module.exports = { ensureCollection, insertPoint, search };
