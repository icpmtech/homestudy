Here’s the front end of study center is an app to **Next.js** for improved performance, SEO, and server-side rendering. This structure will integrate your backend Flask API with a **Next.js frontend**.

---

### **Step 1: Set Up the Next.js Project**
1. **Create a New Next.js App**:
   ```bash
   npx create-next-app@latest study-center-next
   cd study-center
   ```

2. **Install Axios** (for API requests):
   ```bash
   npm install axios
   ```

---

### **Step 2: Project Structure**
Next.js organizes files in the `pages` directory. Here’s how to structure your app:

```
study-center/
├── app/
│   ├── layout.js          # Root layout for the app
│   ├── page.js            # Default homepage
│   ├── question-answering/
│   │   └── page.js        # Question Answering page
│   ├── summarization/
│   │   └── page.js        # Summarization page
│   ├── translation/
│   │   └── page.js        # Translation page
├── styles/
│   ├── globals.css        # Global styles
├── public/
│   └── favicon.ico        # App favicon
├── package.json           # Dependencies
└── next.config.js         # Next.js configuration


```

---

### **Step 3: Create Pages**

#### **3.1 Main Page (`pages/index.js`)**
This page acts as a dashboard with links to each task.

```jsx
import Link from "next/link";
import styles from "../styles/globals.css";

export default function Home() {
  return (
    <div className="container">
      <h1>Study Center Platform</h1>
      <p>Select a task to get started:</p>
      <ul>
        <li>
          <Link href="/question-answering">Question Answering</Link>
        </li>
        <li>
          <Link href="/summarization">Summarization</Link>
        </li>
        <li>
          <Link href="/translation">Translation</Link>
        </li>
      </ul>
    </div>
  );
}
```

---

#### **3.2 Question Answering Page (`pages/question-answering.js`)**
```jsx
import { useState } from "react";
import axios from "axios";

export default function QuestionAnswering() {
  const [context, setContext] = useState("");
  const [question, setQuestion] = useState("");
  const [qaResult, setQaResult] = useState("");

  const handleQA = async () => {
    try {
      const response = await axios.post("http://localhost:5000/qa", {
        context,
        question,
      });
      setQaResult(response.data.answer);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container">
      <h1>Question Answering</h1>
      <textarea
        placeholder="Enter context (e.g., a paragraph)"
        value={context}
        onChange={(e) => setContext(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter your question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button onClick={handleQA}>Get Answer</button>
      {qaResult && <p>Answer: {qaResult}</p>}
    </div>
  );
}
```

---

#### **3.3 Summarization Page (`pages/summarization.js`)**
```jsx
import { useState } from "react";
import axios from "axios";

export default function Summarization() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");

  const handleSummarization = async () => {
    try {
      const response = await axios.post("http://localhost:5000/summarize", { text });
      setSummary(response.data.summary);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container">
      <h1>Summarization</h1>
      <textarea
        placeholder="Enter text to summarize"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={handleSummarization}>Summarize</button>
      {summary && <p>Summary: {summary}</p>}
    </div>
  );
}
```

---

#### **3.4 Translation Page (`pages/translation.js`)**
```jsx
import { useState } from "react";
import axios from "axios";

export default function Translation() {
  const [text, setText] = useState("");
  const [translation, setTranslation] = useState("");

  const handleTranslation = async () => {
    try {
      const response = await axios.post("http://localhost:5000/translate", { text });
      setTranslation(response.data.translation);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container">
      <h1>Translation</h1>
      <textarea
        placeholder="Enter text to translate"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={handleTranslation}>Translate</button>
      {translation && <p>Translation: {translation}</p>}
    </div>
  );
}
```

---

### **Step 4: Add TTS (Audio Playback)**
Add a reusable TTS button to play audio. Create a component (`components/AudioPlayer.js`):

```jsx
import axios from "axios";

export default function AudioPlayer({ text }) {
  const handleTTS = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/tts",
        { text },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const audio = new Audio(url);
      audio.play();
    } catch (error) {
      console.error("TTS Error:", error);
    }
  };

  return (
    <button onClick={handleTTS} disabled={!text}>
      Listen
    </button>
  );
}
```

Import and use it in each page:
```jsx
<AudioPlayer text={qaResult || summary || translation} />
```

---

### **Step 5: Styling**
1. Add global styles in `styles/globals.css`:
```css
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

textarea, input {
  width: 100%;
  margin: 10px 0;
  padding: 10px;
  font-size: 16px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
```

---

### **Step 6: Running the Project**
1. **Run the Backend**:
   ```bash
   python app.py
   ```

2. **Run the Frontend**:
   ```bash
   npm run dev
   ```

---

