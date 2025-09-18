function ChatBox({ messages, loading }) {
  return (
    <div className="flex-1 bg-white rounded-lg shadow p-4 overflow-y-auto">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`mb-2 p-2 rounded-lg max-w-xs ${
            msg.role === "user"
              ? "bg-blue-500 text-white self-end ml-auto"
              : "bg-gray-200 text-gray-800 self-start"
          }`}
        >
          {msg.text}
        </div>
      ))}
      {loading && <div className="bg-gray-300 p-2 rounded-lg w-24">Typing...</div>}
    </div>
  );
}

export default ChatBox;
