import React, { useState, useCallback } from 'react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageDataUrl: string;
  brightness: number;
  contrast: number;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, imageDataUrl, brightness, contrast }) => {
  const [format, setFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [quality, setQuality] = useState(0.9);

  const handleDownload = useCallback(() => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error("Could not get canvas context");
        onClose();
        return;
      }
      
      // Apply brightness and contrast filters before drawing the image
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(img, 0, 0);

      const mimeType = `image/${format}`;
      const dataUrl = canvas.toDataURL(mimeType, format === 'jpeg' ? quality : undefined);

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `modified-car.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onClose();
    };
    img.onerror = () => {
      console.error("Failed to load image for export");
      alert("An error occurred while preparing the image for download.");
      onClose();
    };
    img.src = imageDataUrl;
  }, [format, quality, imageDataUrl, onClose, brightness, contrast]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-surface border border-border p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-orbitron font-bold mb-6 text-text">Export Image</h2>
        
        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">File Format</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="format" 
                  value="jpeg" 
                  checked={format === 'jpeg'} 
                  onChange={() => setFormat('jpeg')}
                  className="h-4 w-4 bg-background border-border text-primary focus:ring-primary"
                />
                <span className="text-text-secondary">JPG</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="format" 
                  value="png" 
                  checked={format === 'png'} 
                  onChange={() => setFormat('png')}
                  className="h-4 w-4 bg-background border-border text-primary focus:ring-primary"
                />
                <span className="text-text-secondary">PNG</span>
              </label>
            </div>
          </div>

          {/* Quality Slider (for JPG) */}
          {format === 'jpeg' && (
            <div>
              <label htmlFor="quality" className="block text-sm font-medium text-text-secondary mb-2">
                Quality: <span className="font-mono bg-background py-0.5 px-1.5">{Math.round(quality * 100)}%</span>
              </label>
              <input
                id="quality"
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full h-2 bg-border appearance-none cursor-pointer accent-primary"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-background text-text-secondary hover:bg-border transition-colors font-rajdhani font-semibold tracking-wider"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-primary text-background font-orbitron font-semibold hover:shadow-glow-hover transition-all shadow-glow tracking-wider"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
