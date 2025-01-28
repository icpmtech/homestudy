import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">Welcome to the Study Center</h1>
      <p className="text-center mb-6">
        Use this platform to assist with homework tasks like Question Answering, Summarization, and Translation.
      </p>
      <div className="flex flex-col gap-4">
        <a href="/question-answering" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-800">Question Answering</a>
        <a href="/summarization" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-800">Summarization</a>
        <a href="/translation" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-800">Translation</a>
      </div>
    </div>
  );
}

