'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function AdvancedSearchSection() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/ai-search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto py-12">
      {/* Grid Background */}
      <div className="absolute inset-0 -z-10">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'linear-gradient(to right, #0f0f10 1px, transparent 1px), linear-gradient(to bottom, #0f0f10 1px, transparent 1px)',
            backgroundSize: '1rem 1rem',
            filter: 'blur(1px)',
          }}
        />
      </div>

      <div className="relative">
        {/* Search Container with Multiple Layers */}
        <div className="search-container relative">
          {/* Glow Layer (outermost) */}
          <div 
            className={`absolute inset-0 -m-8 rounded-2xl overflow-hidden pointer-events-none transition-opacity duration-500 ${
              isFocused ? 'opacity-60' : 'opacity-40'
            }`}
            style={{ filter: 'blur(30px)' }}
          >
            <div 
              className="absolute inset-0"
              style={{
                background: 'conic-gradient(#000, #402fb5 5%, #000 38%, #000 50%, #cf30aa 60%, #000 87%)',
                width: '200%',
                height: '200%',
                left: '-50%',
                top: '-50%',
                animation: isFocused ? 'rotateFast 4s linear infinite' : 'rotateSlow 8s linear infinite',
              }}
            />
          </div>

          {/* Dark Border Background */}
          <div className="absolute -inset-2 rounded-xl overflow-hidden pointer-events-none">
            <div 
              className="absolute inset-0"
              style={{
                background: 'conic-gradient(rgba(0, 0, 0, 0), #18116a, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 0) 50%, #6e1b60, rgba(0, 0, 0, 0) 60%)',
                width: '200%',
                height: '200%',
                left: '-50%',
                top: '-50%',
                animation: isFocused ? 'rotateFast2 4s linear infinite' : 'rotateSlow2 8s linear infinite',
              }}
            />
          </div>

          {/* White/Border Layer */}
          <div 
            className="absolute -inset-1 rounded-xl overflow-hidden pointer-events-none"
            style={{ filter: 'blur(2px)' }}
          >
            <div 
              className="absolute inset-0"
              style={{
                background: 'conic-gradient(rgba(0, 0, 0, 0) 0%, #a099d8, rgba(0, 0, 0, 0) 8%, rgba(0, 0, 0, 0) 50%, #dfa2da, rgba(0, 0, 0, 0) 58%)',
                width: '200%',
                height: '200%',
                left: '-50%',
                top: '-50%',
                animation: isFocused ? 'rotateFast3 4s linear infinite' : 'rotateSlow3 8s linear infinite',
              }}
            />
          </div>

          {/* Main Border */}
          <div 
            className="absolute -inset-0.5 rounded-xl overflow-hidden pointer-events-none"
            style={{ filter: 'blur(0.5px)' }}
          >
            <div 
              className="absolute inset-0"
              style={{
                background: 'conic-gradient(#1c191c, #402fb5 5%, #1c191c 14%, #1c191c 50%, #cf30aa 60%, #1c191c 64%)',
                width: '200%',
                height: '200%',
                left: '-50%',
                top: '-50%',
                animation: isFocused ? 'rotateFast4 4s linear infinite' : 'rotateSlow4 8s linear infinite',
              }}
            />
          </div>

          {/* Main Search Form */}
          <form onSubmit={handleSearch} className="relative">
            <div className="relative flex items-center">
              {/* Search Input */}
              <div className="relative flex-1">
                {/* Pink Glow Mask (moves on hover) */}
                <div 
                  className={`absolute w-8 h-5 bg-[#cf30aa] top-3 left-2 rounded-full pointer-events-none transition-opacity duration-500 ${
                    isFocused ? 'opacity-0' : 'opacity-80'
                  }`}
                  style={{ filter: 'blur(20px)' }}
                />
                
                {/* Search Icon */}
                <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    fill="none"
                    className="feather feather-search"
                  >
                    <circle stroke="url(#search-gradient)" r="8" cy="11" cx="11" />
                    <line stroke="url(#search-line)" y2="16.65" y1="22" x2="16.65" x1="22" />
                    <defs>
                      <linearGradient gradientTransform="rotate(50)" id="search-gradient">
                        <stop stopColor="#f8e7f8" offset="0%" />
                        <stop stopColor="#b6a9b7" offset="50%" />
                      </linearGradient>
                      <linearGradient id="search-line">
                        <stop stopColor="#b6a9b7" offset="0%" />
                        <stop stopColor="#837484" offset="50%" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Input Gradient Mask (hides on focus) */}
                {!isFocused && (
                  <div 
                    className="absolute w-24 h-5 top-1/2 -translate-y-1/2 left-16 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, black)',
                    }}
                  />
                )}

                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Search workflows with AI..."
                  className="w-full h-14 px-16 bg-black border-none rounded-xl text-white text-lg placeholder:text-[#c0b9c0] focus:outline-none"
                />
              </div>

              {/* Filter Button */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <div className="relative">
                  {/* Filter Border with Gradient */}
                  <div 
                    className="absolute -inset-0.5 rounded-lg overflow-hidden"
                  >
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: 'conic-gradient(rgba(0, 0, 0, 0), #3d3a4f, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0) 50%, #3d3a4f, rgba(0, 0, 0, 0) 100%)',
                        width: '600px',
                        height: '600px',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%) rotate(90deg)',
                        filter: 'brightness(1.35)',
                        animation: 'rotateFilter 4s linear infinite',
                      }}
                    />
                  </div>

                  {/* Filter Button */}
                  <button
                    type="button"
                    className="relative w-10 h-10 rounded-lg flex items-center justify-center z-10 overflow-hidden"
                    style={{
                      background: 'linear-gradient(180deg, #161329, black, #1d1b4b)',
                      border: '1px solid transparent',
                    }}
                  >
                    <SlidersHorizontal className="w-5 h-5 text-[#d6d6e6]" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Search Description */}
        <div className="text-center mt-6 text-white/70">
          <p className="text-sm">
            Try: "send slack notification when form submitted" or "gmail to sheets automation"
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes rotateSlow {
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes rotateSlow2 {
          100% { transform: translate(-50%, -50%) rotate(370deg); }
        }
        @keyframes rotateSlow3 {
          100% { transform: translate(-50%, -50%) rotate(350deg); }
        }
        @keyframes rotateSlow4 {
          100% { transform: translate(-50%, -50%) rotate(365deg); }
        }
        @keyframes rotateFast {
          100% { transform: translate(-50%, -50%) rotate(420deg); }
        }
        @keyframes rotateFast2 {
          100% { transform: translate(-50%, -50%) rotate(442deg); }
        }
        @keyframes rotateFast3 {
          100% { transform: translate(-50%, -50%) rotate(443deg); }
        }
        @keyframes rotateFast4 {
          100% { transform: translate(-50%, -50%) rotate(430deg); }
        }
        @keyframes rotateFilter {
          100% { transform: translate(-50%, -50%) rotate(450deg); }
        }
      `}</style>
    </div>
  );
}

