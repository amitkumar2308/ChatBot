# 📰 News Chatbot (Frontend)

This is a simple **React + TailwindCSS chatbot** that allows users to ask questions about the news.  
It saves session history, shows "Typing..." while waiting for bot replies, and connects with a backend API.

---

## ⚙️ Setup Guide

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/your-username/news-chatbot.git
cd news-chatbot/frontend
```

### 2️⃣ Install Dependencies
```sh
npm install
```

This will install:
- **react**
- **axios**
- **uuid**
- **tailwindcss**

### 3️⃣ Configure TailwindCSS
Update `tailwind.config.js`:
```js
content: ["./src/**/*.{js,jsx,ts,tsx}"],
```

Add Tailwind imports in `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4️⃣ Run the Development Server
```sh
npm start
```

The app will run at 👉 `http://localhost:3000`

---

## 🔗 Backend API Requirements
The frontend expects a backend running with these endpoints:
- `GET /history/:sessionId` → Fetch chat history  
- `POST /chat/:sessionId` → Send user query & get bot response  
- `DELETE /reset/:sessionId` → Reset chat session  

You can build the backend with **Node.js + Express** and connect it to an AI model (OpenAI, Qdrant, etc.).

---

## 📂 Project Structure
```
frontend/
│── src/
│   ├── components/
│   │   └── ChatBox.jsx   # Chat UI component
│   ├── App.js            # Main app logic
│   ├── index.js          # Entry point
│   ├── App.css
│   ├── index.css
│── package.json
│── tailwind.config.js
│── README.md
```
