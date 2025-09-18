const axios = require('axios');
require('dotenv').config();

async function getEmbedding(text) {
  const res = await axios.post(
    "https://api.jina.ai/v1/embeddings",
    { model: "jina-embeddings-v2-base-en", input: [text] },
    { headers: { Authorization: `Bearer ${process.env.JINA_API_KEY}` } }
  );
  return res.data.data[0].embedding;
}

module.exports = { getEmbedding };
