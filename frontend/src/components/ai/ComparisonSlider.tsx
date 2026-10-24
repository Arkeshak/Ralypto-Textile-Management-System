import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Columns, SplitSquareVertical, Sparkles, Maximize2 } from 'lucide-react';

interface ComparisonSliderProps {
  originalImage: string;
  generatedImage: string;
  garmentName?: string;
  height?: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
  originalImage,
  generatedImage,
  garmentName,
  height = 'h-[500px]',
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage (0 - 100)
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  return (
    <div className="space-y-3">
      {/* View Mode Toggle Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Drag the central divider to compare garment fit</span>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              viewMode === 'slider'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Split Slider</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Interactive Comparison Slider */}
      {viewMode === 'slider' ? (
        <div
          ref={containerRef}
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className={`relative ${height} w-full rounded-3xl overflow-hidden select-none cursor-ew-resize border border-slate-200/90 shadow-lg bg-slate-900`}
        >
          {/* Background Layer: Generated AI Try-on Result */}
          <img
            src={generatedImage}
            alt="AI Virtual Try-On Preview"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* AI Result Pill Badge */}
          <div className="absolute top-4 right-4 z-20 pointer-events-none">
            <span className="px-3 py-1.5 rounded-full bg-blue-600/90 text-white font-bold text-xs shadow-md backdrop-blur-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Try-On Result</span>
            </span>
          </div>

          {/* Foreground Layer: Clipped Original Person Image */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={originalImage}
              alt="Original Customer Photo"
              className="absolute inset-0 w-full h-full object-cover max-w-none"
              style={{
                width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%',
                height: '100%',
              }}
            />
          </div>

          {/* Original Photo Pill Badge */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
            <span className="px-3 py-1.5 rounded-full bg-slate-900/80 text-white font-bold text-xs shadow-md backdrop-blur-md">
              Original Photo
            </span>
          </div>

          {/* Slider Divider Line & Thumb */}
          <div
            className="absolute top-0 bottom-0 z-30 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize flex items-center justify-center -ml-0.5"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="w-9 h-9 rounded-full bg-white text-slate-800 shadow-xl border-2 border-blue-600 flex items-center justify-center font-bold text-xs select-none">
              &harr;
            </div>
          </div>
        </div>
      ) : (
        /* Mode 2: Side-by-Side Comparison */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`relative ${height} rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100`}>
            <img src={originalImage} alt="Original" className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 rounded-full bg-slate-900/80 text-white font-bold text-xs backdrop-blur-md">
                Original Photo
              </span>
            </div>
          </div>

          <div className={`relative ${height} rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100`}>
            <img src={generatedImage} alt="AI Virtual Try-On" className="w-full h-full object-cover" />
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 rounded-full bg-blue-600/90 text-white font-bold text-xs backdrop-blur-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Try-On Result</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
