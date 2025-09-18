# News AI Chat Backend

This is a Node.js backend for a news-based AI chat application. It fetches the latest news, stores article embeddings in Qdrant, and provides a conversational interface powered by Google Gemini AI. The application also uses Redis to manage and store session-based chat history.

---

## ✨ Features

- **GNews API Integration**: Fetches the latest news articles to keep the knowledge base up-to-date.
- **Jina AI Embeddings**: Generates high-quality vector embeddings for news articles.
- **Qdrant Vector Database**: Efficiently stores and searches news embeddings to find the most relevant articles for user queries.
- **Google Gemini AI**: Utilizes a powerful Large Language Model (LLM) to generate accurate and relevant answers based on the retrieved news content.
- **Redis Session Management**: Provides session-based chat history, allowing for seamless, multi-turn conversations.
- **Scheduled News Ingestion**: Uses `node-cron` to automatically fetch, embed, and store new articles on a recurring schedule.

---

## 🛠️ Tech Stack

- **Node.js & Express.js**: Powers the backend server and its RESTful API.
- **Redis**: Serves as a fast, in-memory data store for caching and managing chat sessions.
- **Qdrant**: A high-performance vector database used to store and search for document embeddings.
- **Google Gemini AI**: The core LLM for generating responses.
- **Jina AI**: The embedding model used to convert text into vectors.
- **Axios**: A promise-based HTTP client for making API requests.
- **Node-cron**: A versatile library for scheduling recurring tasks.
- **Dotenv**: Manages environment variables for secure and configurable application settings.
- **CORS**: Handles cross-origin requests for secure communication between the backend and a frontend application.

---

## 🚀 Installation

Follow these steps to set up and run the project locally.

1.  **Clone the repository:**
    ```bash
    git clone <repo-url>
    cd <repo-folder>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    Create a new file named `.env` in the root directory and add your API keys and configuration URLs.
    ```env
    PORT=3000
    REDIS_URL=redis://localhost:6379
    QDRANT_URL=[https://your-qdrant-instance.com](https://your-qdrant-instance.com)
    QDRANT_API_KEY=your-qdrant-api-key
    GNEWS_API_KEY=your-gnews-api-key
    JINA_API_KEY=your-jina-api-key
    GEMINI_API_KEY=your-google-gemini-api-key
    ```
    ⚠️ **Note:** Ensure your Qdrant instance and Redis server are running and accessible via these URLs.

---

## 📂 Project Structure  
├── server.js            # Main Express server and API endpoints
├── embeddings.js        # Logic for generating Jina AI embeddings
├── qdrant.js            # Functions for Qdrant operations (CRUD, search)
├── newsFetcher.js       # Handles fetching articles from the GNews API
├── gemini.js            # Integration with the Google Gemini AI model
├── package.json
└── README.md

## 🏃 Running the Server

To start the server, run the following command from the project root:

```bash
npm start

The server will be live at http://localhost:3000

API Endpoints
Health Check
GET /

Description: Checks if the server is running.

Response:  "Hello route is working"

Chat
POST /chat/:sessionId

Description: Answers a user query using AI, leveraging relevant news articles. It also stores the conversation history in Redis.

Request Body:
{
  "query": "What is happening in world news?"
}

Get Chat History
GET /history/:sessionId

Description: Retrieves all messages from a specific chat session.

Response: An array of chat messages.

Reset Session
DELETE /reset/:sessionId

Description: Clears the chat history for a given session from Redis.

Fetch Latest News
GET /news

Description: Fetches the latest news articles from the GNews API.

Response: A JSON array of news articles.

Fetch Qdrant Data
GET /qdrant-data

Description: Returns the stored points (articles) in the Qdrant collection for debugging purposes.

Response: A JSON object containing Qdrant data.

⏱️ Scheduled Jobs
A cron job runs every hour (0 * * * *) to automatically update the news articles.

This job performs the following actions:

Fetches the latest news.

Generates embeddings for new articles.

Stores the new embeddings in Qdrant.

Caches trending topics in Redis for quick, fallback responses.
