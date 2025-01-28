"use client";

import { useState } from "react";
import axios from "axios";

export default function SummarizationPage() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");

  const handleSummarization = async () => {
    try {
      const response = await axios.post("http://localhost:5000/summarize", { text });
      setSummary(response.data.summary);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  return (
    <div>
      <h1>Summarization</h1>
      <textarea
        placeholder="Enter text to summarize"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: "100%", height: "100px", marginBottom: "10px" }}
      />
      <button onClick={handleSummarization} style={{ padding: "10px 20px", background: "#007bff", color: "#fff", border: "none" }}>
        Summarize
      </button>
      {summary && <p>Summary: {summary}</p>}
    </div>
  );
}
