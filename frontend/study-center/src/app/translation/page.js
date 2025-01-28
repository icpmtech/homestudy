"use client";

import { useState } from "react";

export default function TranslationPage() {
  const [text, setText] = useState("");
  const [translation, setTranslation] = useState("");

  const handleTranslation = async () => {
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
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Translation (English to Portuguese)</h1>
      <textarea
        className="w-3/4 h-24 p-2 border border-gray-300 rounded-lg mb-4"
        placeholder="Enter text to translate"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={handleTranslation}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-800"
      >
        Translate
      </button>
      {translation && (
        <p className="mt-4 bg-gray-100 p-4 rounded-lg w-3/4 text-center">
          <strong>Translation:</strong> {translation}
        </p>
      )}
    </div>
  );
}
