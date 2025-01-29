"use client";

import { useState } from "react";
import { SparklesIcon, ScissorsIcon, DocumentTextIcon } from "@heroicons/react/24/solid";

export default function SummarizationPage() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSummarization = async () => {
    if (!text.trim()) {
      setError("Please enter some text to summarize");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch("http://localhost:5000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error("Error summarizing text:", error);
      setError("Failed to generate summary. Please try again.");
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
            Text Summarizer
          </h1>
          <ScissorsIcon className="w-8 h-8 text-purple-400 animate-float" />
        </div>

        {/* Text Input */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-700">
          <label className="flex items-center gap-2 mb-3 text-pink-300">
            <DocumentTextIcon className="w-6 h-6" />
            <span className="font-medium">Input Text</span>
          </label>
          <textarea
            className="w-full bg-gray-900/50 text-white p-3 rounded-lg border-2 border-gray-700 focus:border-purple-400 outline-none placeholder-gray-400 resize-none"
            placeholder="Paste your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleSummarization}
          disabled={isLoading}
          className={`w-full flex items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all ${
            isLoading
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105"
          }`}
        >
          {isLoading ? (
            <>
              <span className="animate-wave">🧠</span> Processing...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              Generate Summary
            </>
          )}
        </button>

        {/* Summary Display */}
        {summary && (
          <div className="mt-6 bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-purple-400/30 animate-fade-in">
            <div className="flex items-center gap-2 mb-3 text-green-300">
              <SparklesIcon className="w-5 h-5" />
              <span className="font-medium">✨ Summary</span>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <p className="text-gray-100 whitespace-pre-wrap leading-relaxed">
                {summary}
              </p>
            </div>
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