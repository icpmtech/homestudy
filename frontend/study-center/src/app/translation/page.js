"use client";

import { useState } from "react";
import axios from "axios";

export default function TranslationPage() {
  const [text, setText] = useState("");
  const [translation, setTranslation] = useState("");

  const handleTranslation = async () => {
    try {
      const response = await axios.post("http://localhost:5000/translate", { text });
      setTranslation(response.data.translation);
    } catch (error) {
      console.error("Error fetching translation:", error);
    }
  };

  return (
    <div>
      <h1>Translation (English to Portuguese)</h1>
      <textarea
        placeholder="Enter text to translate"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: "100%", height: "100px", marginBottom: "10px" }}
      />
      <button onClick={handleTranslation} style={{ padding: "10px 20px", background: "#007bff", color: "#fff", border: "none" }}>
        Translate
      </button>
      {translation && <p>Translation: {translation}</p>}
    </div>
  );
}
