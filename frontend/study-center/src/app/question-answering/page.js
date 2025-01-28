"use client";

import { useState } from "react";
import axios from "axios";

export default function QuestionAnsweringPage() {
  const [context, setContext] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleQuestionAnswering = async () => {
    try {
      const response = await axios.post("http://localhost:5000/qa", { context, question });
      setAnswer(response.data.answer);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Question Answering</h1>
      <textarea
        placeholder="Enter context"
        value={context}
        onChange={(e) => setContext(e.target.value)}
        style={{ width: "100%", height: "100px", margin: "10px 0" }}
      />
      <input
        type="text"
        placeholder="Enter question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{ width: "100%", margin: "10px 0", padding: "10px" }}
      />
      <button onClick={handleQuestionAnswering} style={{ padding: "10px 20px", background: "#007bff", color: "#fff" }}>
        Get Answer
      </button>
      {answer && <p>Answer: {answer}</p>}
    </div>
  );
}
