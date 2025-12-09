import { useState } from "react";
import api from "../api/client";

type Message = {
  id: number;
  from: "user" | "ai";
  text: string;
};

export default function AiAssistantPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!question.trim()) return;
    const userMsg: Message = {
      id: Date.now(),
      from: "user",
      text: question.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);
    try {
      const res = await api.post<{ answer: string }>("/ai/stock-analyst", {
        question: userMsg.text,
      });
      const aiMsg: Message = {
        id: Date.now() + 1,
        from: "ai",
        text: res.data.answer,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const aiMsg: Message = {
        id: Date.now() + 1,
        from: "ai",
        text: "Sorry, I could not process this request. Please check backend AI configuration.",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-semibold mb-2">
        AI Stock Analyst & Assistant
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Ask questions about inventory, best sellers, discounts, and upcoming
        expiries. The assistant uses live commerce back-office data from
        StockOnHand2Cash.
      </p>

      <div className="bg-white p-4 shadow rounded mb-4 h-80 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-xs text-gray-500">
            No conversation yet. Try asking, for example:{" "}
            <em>
              &quot;Which products are low on stock and should be reordered
              first?&quot;
            </em>
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`mb-3 text-sm ${
              m.from === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block px-3 py-2 rounded ${
                m.from === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-900"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
          placeholder="Type your question..."
        />
        <button
          onClick={send}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
