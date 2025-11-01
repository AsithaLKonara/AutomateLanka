'use client';

import { useEffect, useState } from 'react';

export default function FloatingIcons() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative h-80 flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Icon Container */}
      <div className="flex flex-row items-center justify-center gap-4 relative z-10">
        {/* Small Icon 1 - Adobe/Illustrator */}
        <div
          className="icon-circle w-12 h-12 transition-transform duration-500"
          style={{
            transform: isHovered ? 'rotate(15deg) scale(1.1)' : 'rotate(0deg) scale(1)',
          }}
        >
          <div className="relative w-full h-full rounded-full flex items-center justify-center bg-[rgba(248,248,248,0.01)] shadow-[0px_0px_8px_0px_rgba(248,248,248,0.25)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)]">
            <svg className="w-6 h-6" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <rect fill="#CC9B7A" width="512" height="512" rx="104.187" ry="105.042"></rect>
              <path fill="#1F1F1E" fillRule="nonzero" d="M318.663 149.787h-43.368l78.952 212.423 43.368.004-78.952-212.427zm-125.326 0l-78.952 212.427h44.255l15.932-44.608 82.846-.004 16.107 44.612h44.255l-79.126-212.427h-45.317zm-4.251 128.341l26.91-74.701 27.083 74.701h-53.993z"></path>
            </svg>
          </div>
        </div>

        {/* Medium Icon - Meta AI */}
        <div
          className="icon-circle w-16 h-16 transition-transform duration-500"
          style={{
            transform: isHovered ? 'rotate(-20deg) scale(1.15)' : 'rotate(0deg) scale(1)',
          }}
        >
          <div className="relative w-full h-full rounded-full flex items-center justify-center bg-[rgba(248,248,248,0.01)] shadow-[0px_0px_8px_0px_rgba(248,248,248,0.25)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)]">
            <svg className="w-8 h-8" viewBox="0 0 287.56 191" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="meta-gradient" x1="62.34" y1="101.45" x2="260.34" y2="91.45">
                  <stop offset="0" stopColor="#0064e1"></stop>
                  <stop offset="0.4" stopColor="#0064e1"></stop>
                  <stop offset="0.83" stopColor="#0073ee"></stop>
                  <stop offset="1" stopColor="#0082fb"></stop>
                </linearGradient>
              </defs>
              <path fill="#0081fb" d="M31.06,126c0,11,2.41,19.41,5.56,24.51A19,19,0,0,0,53.19,160c8.1,0,15.51-2,29.79-21.76,11.44-15.83,24.92-38,34-52l15.36-23.6c10.67-16.39,23-34.61,37.18-47C181.07,5.6,193.54,0,206.09,0c21.07,0,41.14,12.21,56.5,35.11,16.81,25.08,25,56.67,25,89.27,0,19.38-3.82,33.62-10.32,44.87C271,180.13,258.72,191,238.13,191V160c17.63,0,22-16.2,22-34.74,0-26.42-6.16-55.74-19.73-76.69-9.63-14.86-22.11-23.94-35.84-23.94-14.85,0-26.8,11.2-40.23,31.17-7.14,10.61-14.47,23.54-22.7,38.13l-9.06,16c-18.2,32.27-22.81,39.62-31.91,51.75C84.74,183,71.12,191,53.19,191c-21.27,0-34.72-9.21-43-23.09C3.34,156.6,0,141.76,0,124.85Z"></path>
            </svg>
          </div>
        </div>

        {/* Large Icon - ChatGPT/OpenAI */}
        <div
          className="icon-circle w-24 h-24 transition-transform duration-500"
          style={{
            transform: isHovered ? 'rotate(25deg) scale(1.2)' : 'rotate(0deg) scale(1)',
          }}
        >
          <div className="relative w-full h-full rounded-full flex items-center justify-center bg-[rgba(248,248,248,0.01)] shadow-[0px_0px_8px_0px_rgba(248,248,248,0.25)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24" strokeWidth="0">
              <path d="M9.75 14a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 .75-.75Zm4.5 0a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 .75-.75Z"></path>
              <path d="M12 2c2.214 0 4.248.657 5.747 1.756.136.099.268.204.397.312.584.235 1.077.546 1.474.952.85.869 1.132 2.037 1.132 3.368 0 .368-.014.733-.052 1.086l.633 1.478.043.022A4.75 4.75 0 0 1 24 15.222v1.028c0 .529-.309.987-.565 1.293-.28.336-.636.653-.966.918a13.84 13.84 0 0 1-1.299.911l-.024.015-.006.004-.039.025c-.223.135-.45.264-.68.386-.46.245-1.122.571-1.941.895C16.845 21.344 14.561 22 12 22c-2.561 0-4.845-.656-6.479-1.303a19.046 19.046 0 0 1-1.942-.894 14.081 14.081 0 0 1-.535-.3l-.144-.087-.04-.025-.006-.004-.024-.015a13.16 13.16 0 0 1-1.299-.911 6.913 6.913 0 0 1-.967-.918C.31 17.237 0 16.779 0 16.25v-1.028a4.75 4.75 0 0 1 2.626-4.248l.043-.022.633-1.478a10.195 10.195 0 0 1-.052-1.086c0-1.331.282-2.498 1.132-3.368.397-.406.89-.717 1.474-.952.129-.108.261-.213.397-.312C7.752 2.657 9.786 2 12 2Zm-8 9.654v6.669a17.59 17.59 0 0 0 2.073.98C7.595 19.906 9.686 20.5 12 20.5c2.314 0 4.405-.594 5.927-1.197a17.59 17.59 0 0 0 2.073-.98v-6.669l-.038-.09c-.046.061-.095.12-.145.177-.793.9-2.057 1.259-3.782 1.259-1.59 0-2.738-.544-3.508-1.492a4.323 4.323 0 0 1-.355-.508h-.344a4.323 4.323 0 0 1-.355.508C10.704 12.456 9.555 13 7.965 13c-1.725 0-2.989-.359-3.782-1.259a3.026 3.026 0 0 1-.145-.177Zm6.309-1.092c.445-.547.708-1.334.851-2.301.057-.357.087-.718.09-1.079v-.031c-.001-.762-.166-1.26-.43-1.568l-.008-.01c-.341-.391-1.046-.689-2.533-.529-1.505.163-2.347.537-2.824 1.024-.462.473-.705 1.18-.705 2.32 0 .605.044 1.087.135 1.472.092.384.231.672.423.89.365.413 1.084.75 2.657.75.91 0 1.527-.223 1.964-.564.14-.11.268-.235.38-.374Zm2.504-2.497c.136 1.057.403 1.913.878 2.497.442.545 1.134.938 2.344.938 1.573 0 2.292-.337 2.657-.751.384-.435.558-1.151.558-2.361 0-1.14-.243-1.847-.705-2.319-.477-.488-1.318-.862-2.824-1.025-1.487-.161-2.192.139-2.533.529-.268.308-.437.808-.438 1.578v.02c.002.299.023.598.063.894Z"></path>
            </svg>
          </div>
        </div>

        {/* Medium Icon 2 - Anthropic Claude */}
        <div
          className="icon-circle w-16 h-16 transition-transform duration-500"
          style={{
            transform: isHovered ? 'rotate(-15deg) scale(1.15)' : 'rotate(0deg) scale(1)',
          }}
        >
          <div className="relative w-full h-full rounded-full flex items-center justify-center bg-[rgba(248,248,248,0.01)] shadow-[0px_0px_8px_0px_rgba(248,248,248,0.25)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 16 16">
              <path fill="url(#claude-gradient)" d="M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z"></path>
              <defs>
                <radialGradient id="claude-gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(16.1326 5.4553 -43.70045 129.2322 1.588 6.503)">
                  <stop offset=".067" stopColor="#9168C0"></stop>
                  <stop offset=".343" stopColor="#5684D1"></stop>
                  <stop offset=".672" stopColor="#1BA1E3"></stop>
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Small Icon 2 - N8N/Automation */}
        <div
          className="icon-circle w-12 h-12 transition-transform duration-500"
          style={{
            transform: isHovered ? 'rotate(10deg) scale(1.1)' : 'rotate(0deg) scale(1)',
          }}
        >
          <div className="relative w-full h-full rounded-full flex items-center justify-center bg-[rgba(248,248,248,0.01)] shadow-[0px_0px_8px_0px_rgba(248,248,248,0.25)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)]">
            <svg className="w-6 h-6 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.87-.78-7-4.24-7-8.5V8.3l7-3.5 7 3.5v3.2c0 4.26-3.13 7.72-7 8.5z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Animated Beam Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-40 z-0">
        <div className="w-full h-full bg-gradient-to-b from-transparent via-cyan-500 to-transparent animate-pulse opacity-50"></div>
      </div>

      {/* Additional Light Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
}

