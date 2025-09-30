import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ImageSliderProps {
  originalSrc: string;
  modifiedSrc: string;
  brightness: number;
  contrast: number;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ originalSrc, modifiedSrc, brightness, contrast }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMoveEvent = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const stopDragging = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMoveEvent);
      window.addEventListener('mouseup', stopDragging);
      window.addEventListener('touchend', stopDragging);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMoveEvent);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchend', stopDragging);
    };
  }, [isDragging, handleMove]);
  
  const startDragging = useCallback((clientX: number) => {
    setIsDragging(true);
    handleMove(clientX);
  }, [handleMove]);

  // Add fade-in animation on mount
  useEffect(() => {
    if (containerRef.current) {
        containerRef.current.style.opacity = '1';
    }
  }, []);

  return (
    <div 
        ref={containerRef}
        className="relative w-full h-full select-none opacity-0 transition-opacity duration-500 cursor-ew-resize"
        onMouseDown={(e) => {
            e.preventDefault();
            startDragging(e.clientX);
        }}
        onTouchStart={(e) => {
            startDragging(e.touches[0].clientX);
        }}
    >
      <img
        src={originalSrc}
        alt="Original"
        className="absolute w-full h-full object-contain pointer-events-none"
      />
      <div
        className="absolute w-full h-full overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={modifiedSrc}
          alt="Modified"
          className="w-full h-full object-contain"
          style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
        />
      </div>
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-primary/75 pointer-events-none"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -left-5 bg-primary h-10 w-10 flex items-center justify-center shadow-md pointer-events-none">
            <svg className="w-6 h-6 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;