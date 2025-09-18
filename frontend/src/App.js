import { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import ChatBox from "./components/ChatBox";

function App() {
  const [sessionId, setSessionId] = useState(localStorage.getItem("sessionId") || uuidv4());
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("sessionId", sessionId);
    fetchHistory();
  }, [sessionId]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/history/${sessionId}`);
      setMessages(res.data.messages);
    } catch (err) {
      console.error("History fetch error", err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`http://localhost:3000/chat/${sessionId}`, {
        query: userMsg.text,
      });
      setMessages((prev) => [...prev, { role: "bot", text: res.data.answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "bot", text: "⚠️ Error getting response." }]);
    }
    setLoading(false);
  };

  const resetSession = async () => {
    try {
      await axios.delete(`http://localhost:3000/reset/${sessionId}`);
      setMessages([]);
      const newId = uuidv4();
      setSessionId(newId);
    } catch (err) {
      console.error("Reset error", err);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2 text-center">📰 News Chatbot</h1>

      <ChatBox messages={messages} loading={loading} />

      <div className="flex gap-2 mt-3">
        <input
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Ask about the news..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
        <button
          onClick={resetSession}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default App;
