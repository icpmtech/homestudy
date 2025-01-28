export const metadata = {
  title: "Study Center Platform",
  description: "A platform to help parents assist children with homework.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header style={{ background: "#007bff", color: "#fff", padding: "15px" }}>
          <h1>Study Center</h1>
          <nav>
            <a href="/" style={{ margin: "0 10px", color: "white" }}>Home</a>
            <a href="/question-answering" style={{ margin: "0 10px", color: "white" }}>Question Answering</a>
            <a href="/summarization" style={{ margin: "0 10px", color: "white" }}>Summarization</a>
            <a href="/translation" style={{ margin: "0 10px", color: "white" }}>Translation</a>
          </nav>
        </header>
        {children}
        <footer style={{ background: "#f1f1f1", textAlign: "center", padding: "10px" }}>
          <p>&copy; {new Date().getFullYear()} Study Center Platform</p>
        </footer>
      </body>
    </html>
  );
}
