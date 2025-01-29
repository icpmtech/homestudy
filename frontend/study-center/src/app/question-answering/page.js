"use client";

import { useState } from "react";
import { SparklesIcon, BookOpenIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/solid";

export default function QuestionAnsweringPage() {
  const [context, setContext] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleQA = async () => {
    if (!context || !question) {
      setError("Please provide both context and question");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
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
      setError("Failed to get answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Smart Q&A
          </h1>
          <SparklesIcon className="w-8 h-8 text-purple-400 animate-float" />
        </div>

        {/* Context Input */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-700">
          <label className="flex items-center gap-2 mb-3 text-purple-300">
            <BookOpenIcon className="w-6 h-6" />
            <span className="font-medium">Context</span>
          </label>
          <textarea
            className="w-full bg-gray-900/50 text-white p-3 rounded-lg border-2 border-gray-700 focus:border-purple-400 outline-none placeholder-gray-400 resize-none"
            placeholder="Paste your text here..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={5}
          />
        </div>

        {/* Question Input */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-700">
          <label className="flex items-center gap-2 mb-3 text-pink-300">
            <QuestionMarkCircleIcon className="w-6 h-6" />
            <span className="font-medium">Your Question</span>
          </label>
          <input
            type="text"
            className="w-full bg-gray-900/50 text-white p-3 rounded-lg border-2 border-gray-700 focus:border-purple-400 outline-none placeholder-gray-400"
            placeholder="What would you like to know?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleQA}
          disabled={isLoading}
          className={`w-full flex items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all ${
            isLoading
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105"
          }`}
        >
          {isLoading ? (
            <>
              <span className="animate-wave">🧠</span> Analyzing...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              Get Instant Answer
            </>
          )}
        </button>

        {/* Answer Display */}
        {answer && (
          <div className="mt-6 bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-purple-400/30 animate-fade-in">
            <div className="flex items-center gap-2 mb-3 text-green-300">
              <span className="font-medium">✨ Answer</span>
            </div>
            <p className="text-gray-100 bg-gray-900/50 p-4 rounded-lg whitespace-pre-wrap">
              {answer}
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-400/20 text-red-300 rounded-lg animate-shake">
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
}