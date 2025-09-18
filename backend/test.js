const axios = require("axios");
require("dotenv").config();

async function fetchNews() {
  try {
    const res = await axios.get("https://gnews.io/api/v4/top-headlines", {
      params: {
        token: process.env.GNEWS_API_KEY,
        lang: "en",
        max: 10,
        topic: "world" // ADD THIS
      }
    });

    const articles = res.data.articles.map((a, i) => ({
      title: a.title || `Article ${i + 1}`,
      description: a.description || "",
      url: a.url
    }));

    return articles;
  } catch (err) {
    console.error("❌ Error fetching news:", err.message);
    return [];
  }
}

(async () => {
  const articles = await fetchNews();
  console.log("=== Articles ===");
  console.log(articles);
})();
