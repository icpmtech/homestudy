export const metadata = {
  title: "Study Center Platform",
  description: "A platform to help parents assist children with homework.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="fixed top-0 left-0 w-full bg-black text-white py-4 px-6 flex items-center justify-between z-10">
          <h1 className="text-xl font-bold">Study Center</h1>
          <nav className="flex gap-4">
            <a href="/" className="hover:text-gray-300">Home</a>
            <a href="/question-answering" className="hover:text-gray-300">QA</a>
            <a href="/summarization" className="hover:text-gray-300">Summarize</a>
            <a href="/translation" className="hover:text-gray-300">Translate</a>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1 pt-16">{children}</main>

        {/* Footer Navigation */}
        <footer className="fixed bottom-0 left-0 w-full bg-black text-white py-4 flex justify-around items-center">
          <a href="/" className="flex flex-col items-center text-sm hover:text-gray-300">
            <span>🏠</span>
            Home
          </a>
          <a href="/question-answering" className="flex flex-col items-center text-sm hover:text-gray-300">
            <span>❓</span>
            QA
          </a>
          <a href="/summarization" className="flex flex-col items-center text-sm hover:text-gray-300">
            <span>✂️</span>
            Summarize
          </a>
          <a href="/translation" className="flex flex-col items-center text-sm hover:text-gray-300">
            <span>🌐</span>
            Translate
          </a>
        </footer>
      </body>
    </html>
  );
}
