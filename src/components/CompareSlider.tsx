import { useState, useRef } from 'react';

export function CompareSlider({ original, generated }: { original: string, generated: string }) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setPosition(percent);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[4/3] overflow-hidden rounded-[32px] cursor-ew-resize select-none shadow-lg"
      onPointerMove={(e) => e.buttons === 1 && handleMove(e.clientX)}
      onPointerDown={(e) => handleMove(e.clientX)}
    >
      {/* Generated Image (Bottom) */}
      <img src={generated} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="Generated design" />
      
      {/* Original Image (Top, clipped) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img src={original} className="absolute inset-0 w-full h-full object-cover" alt="Original room" />
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.3)]"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="flex gap-1">
            <div className="w-0.5 h-4 bg-gray-400 rounded-full"></div>
            <div className="w-0.5 h-4 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </div>
      
      {/* Labels */}
      <div className="absolute top-6 left-6 bg-black/40 text-white px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-md pointer-events-none">
        Original
      </div>
      <div className="absolute top-6 right-6 bg-black/40 text-white px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-md pointer-events-none">
        Reimagined
      </div>
    </div>
  );
}
