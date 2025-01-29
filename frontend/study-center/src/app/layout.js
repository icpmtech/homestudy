import "./styles/globals.css";

import { Inter } from 'next/font/google';
import { HomeIcon, QuestionMarkCircleIcon, ScissorsIcon, GlobeAltIcon, CalculatorIcon } from '@heroicons/react/24/outline';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "Study Center",
  description: "Next-gen learning platform with AI-powered tools",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-900 text-gray-100`}>
        {/* Floating Header */}
        <header className="fixed top-0 left-0 w-full bg-gray-800/90 backdrop-blur-md py-3 px-6 flex items-center justify-between z-50 border-b border-gray-700 shadow-xl">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Study Center
          </h1>
          <nav className="hidden md:flex gap-6" aria-label="Main Navigation">
            {[
              ['Home', '/', HomeIcon],
              ['QA', '/question-answering', QuestionMarkCircleIcon],
              ['Summarize', '/summarization', ScissorsIcon],
              ['Translate', '/translation', GlobeAltIcon],
              ['Math', '/solve-math', CalculatorIcon]
            ].map(([label, path, Icon]) => (
              <a 
                key={path}
                href={path} 
                className="flex items-center gap-2 hover:text-purple-300 transition-colors duration-200 relative group"
              >
                <Icon className="w-5 h-5" />
                {label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 transition-all group-hover:w-full"></span>
              </a>
            ))}
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1 pt-20 pb-24 px-4 md:px-8">{children}</main>

        {/* Mobile Bottom Navigation */}
        <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 w-max bg-gray-800/90 backdrop-blur-lg rounded-full px-4 py-2 flex gap-4 shadow-2xl border border-gray-700">
          {[
            ['Home', '/', HomeIcon],
            ['QA', '/question-answering', QuestionMarkCircleIcon],
            ['Summarize', '/summarization', ScissorsIcon],
            ['Translate', '/translation', GlobeAltIcon],
            ['Math', '/solve-math', CalculatorIcon]
          ].map(([label, path, Icon]) => (
            <a 
              key={path}
              href={path} 
              className="flex flex-col items-center p-2 rounded-full hover:bg-gray-700/40 transition-all group relative"
            >
              <Icon className="w-6 h-6 text-purple-300 group-hover:text-pink-400 transition-colors" />
              <span className="text-xs mt-1 text-gray-300 group-hover:text-white">{label}</span>
            </a>
          ))}
        </footer>
      </body>
    </html>
  );
}