import { SparklesIcon, BookOpenIcon, ScissorsIcon, GlobeAltIcon, CalculatorIcon } from "@heroicons/react/24/solid";

export default function HomePage() {
  const features = [
    {
      title: "Question Answering",
      href: "/question-answering",
      icon: BookOpenIcon,
      color: "from-purple-400 to-pink-500",
    },
    {
      title: "Summarization",
      href: "/summarization",
      icon: ScissorsIcon,
      color: "from-pink-400 to-rose-500",
    },
    {
      title: "Translation",
      href: "/translation",
      icon: GlobeAltIcon,
      color: "from-blue-400 to-cyan-500",
    },
    {
      title: "Math Solver",
      href: "/solve-math",
      icon: CalculatorIcon,
      color: "from-green-400 to-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-4 animate-float">
            Study Center
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Your AI-powered learning companion for 
            <span className="text-purple-300"> homework help</span>, 
            <span className="text-pink-300"> content understanding</span>, and 
            <span className="text-blue-300"> study optimization</span>
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <a
              key={index}
              href={feature.href}
              className={`group relative bg-gradient-to-br ${feature.color} rounded-2xl p-6 transform transition-all hover:scale-105 hover:shadow-2xl`}
            >
              <div className="absolute inset-0 bg-black/30 rounded-2xl backdrop-blur-sm" />
              <div className="relative z-10">
                <feature.icon className="w-12 h-12 mb-4 text-white/90" />
                <h2 className="text-2xl font-bold mb-2">{feature.title}</h2>
                <p className="text-gray-100/80">AI-powered solution for instant help</p>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="animate-wave">👉</span>
                  <span>Try now</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-2xl font-bold text-purple-400">1M+</div>
            <div className="text-sm text-gray-300">Questions Solved</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-2xl font-bold text-pink-400">500K+</div>
            <div className="text-sm text-gray-300">Summaries Generated</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-2xl font-bold text-blue-400">50+</div>
            <div className="text-sm text-gray-300">Languages Supported</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-2xl font-bold text-green-400">24/7</div>
            <div className="text-sm text-gray-300">Availability</div>
          </div>
        </div>
      </div>
    </div>
  );
}