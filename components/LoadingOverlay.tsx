
import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "Applying institutional colors...",
  "Formatting typography for print...",
  "Positioning university logo...",
  "Optimizing layout for academic standards...",
  "Generating final flyer design...",
  "Polishing visual hierarchy..."
];

export const LoadingOverlay: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-blue-600 font-bold">IUG</span>
        </div>
      </div>
      <p className="mt-6 text-slate-600 font-medium animate-pulse">{MESSAGES[msgIndex]}</p>
    </div>
  );
};
