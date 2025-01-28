"use client";

import { useState } from "react";

export default function QuestionAnsweringPage() {
  const [context, setContext] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleQA = async () => {
    try {
      const response = await fetch("http://localhost:5000/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, question }),
      });
      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error("Error fetching answer:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Question Answering</h1>
      <textarea
        className="w-3/4 h-24 p-2 border border-gray-300 rounded-lg mb-4"
        placeholder="Enter context (e.g., a paragraph)"
        value={context}
        onChange={(e) => setContext(e.target.value)}
      />
      <input
        type="text"
        className="w-3/4 p-2 border border-gray-300 rounded-lg mb-4"
        placeholder="Enter your question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button
        onClick={handleQA}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-800"
      >
        Get Answer
      </button>
      {answer && (
        <p className="mt-4 bg-gray-100 p-4 rounded-lg w-3/4 text-center">
          <strong>Answer:</strong> {answer}
        </p>
      )}
    </div>
  );
}
