"use client";

import { useState } from "react";
import { SparklesIcon, GlobeAltIcon, DocumentTextIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

export default function TranslationPage() {
  const [text, setText] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTranslation = async () => {
    if (!text.trim()) {
      setError("Please enter some text to translate");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch("http://localhost:5000/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      setTranslation(data.translation);
    } catch (error) {
      console.error("Error translating text:", error);
      setError("Translation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Text Translator
          </h1>
          <GlobeAltIcon className="w-8 h-8 text-cyan-400 animate-float" />
        </div>

        {/* Language Direction */}
        <div className="mb-6 text-center text-gray-300">
          English → Portuguese
        </div>

        {/* Input Section */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-700">
          <label className="flex items-center gap-2 mb-3 text-blue-300">
            <DocumentTextIcon className="w-6 h-6" />
            <span className="font-medium">Input Text</span>
          </label>
          <textarea
            className="w-full bg-gray-900/50 text-white p-3 rounded-lg border-2 border-gray-700 focus:border-cyan-400 outline-none placeholder-gray-400 resize-none"
            placeholder="Enter text to translate..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleTranslation}
          disabled={isLoading}
          className={`w-full flex items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all ${
            isLoading
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-cyan-600 hover:scale-105"
          }`}
        >
          {isLoading ? (
            <>
              <span className="animate-wave">🌍</span> Translating...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              Translate Text
            </>
          )}
        </button>

        {/* Translation Output */}
        {translation && (
          <div className="mt-6 bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-cyan-400/30 animate-fade-in">
            <div className="flex items-center gap-2 mb-3 text-green-300">
              <ArrowDownIcon className="w-5 h-5" />
              <span className="font-medium">Translation Result</span>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <pre className="text-gray-100 whitespace-pre-wrap font-sans">
                {translation}
              </pre>
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