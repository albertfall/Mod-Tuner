import React, { useState, useCallback } from 'react';
import { convertVideoToGif } from '../utils/videoUtils';

interface VideoExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

const VideoExportModal: React.FC<VideoExportModalProps> = ({ isOpen, onClose, videoUrl }) => {
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadMp4 = useCallback(() => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = 'y2k-tuner-video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  }, [videoUrl, onClose]);

  const handleDownloadGif = useCallback(async () => {
    setIsConverting(true);
    setProgress(0);
    setError(null);
    try {
      const gifBlob = await convertVideoToGif(videoUrl, (p) => {
        setProgress(p);
      });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(gifBlob);
      link.download = 'y2k-tuner-video.gif';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      onClose();
    } catch (err) {
      console.error("Failed to convert video to GIF:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during conversion.");
    } finally {
      setIsConverting(false);
    }
  }, [videoUrl, onClose]);

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
        <h2 className="text-xl font-orbitron font-bold mb-6 text-text">Export Video</h2>
        
        {isConverting ? (
          <div className="space-y-4 text-center">
            <p className="text-text-secondary font-rajdhani tracking-wider">Converting to GIF...</p>
            <div className="w-full bg-border h-2.5">
              <div 
                className="bg-primary h-2.5 transition-all duration-300 ease-linear" 
                style={{ width: `${Math.round(progress * 100)}%` }}
              ></div>
            </div>
            <p className="font-mono text-primary">{Math.round(progress * 100)}%</p>
          </div>
        ) : error ? (
           <div className="space-y-4 text-center">
             <p className="text-secondary font-rajdhani tracking-wider">Conversion Failed</p>
             <p className="text-text-secondary text-sm">{error}</p>
             <button
                onClick={onClose}
                className="w-full mt-4 px-4 py-2 bg-background text-text-secondary hover:bg-border transition-colors font-rajdhani font-semibold tracking-wider"
              >
                Close
              </button>
           </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary font-rajdhani">Choose a format to download.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button
                  onClick={handleDownloadMp4}
                  className="px-4 py-3 bg-primary/10 text-primary border border-primary/50 hover:bg-primary/20 transition-colors font-orbitron font-semibold tracking-wider"
                >
                  MP4 Video
                </button>
                <button
                  onClick={handleDownloadGif}
                  className="px-4 py-3 bg-primary/10 text-primary border border-primary/50 hover:bg-primary/20 transition-colors font-orbitron font-semibold tracking-wider"
                >
                  Animated GIF
                </button>
            </div>
          </div>
        )}

        {!isConverting && !error && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-background text-text-secondary hover:bg-border transition-colors font-rajdhani font-semibold tracking-wider"
              >
                Cancel
              </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default VideoExportModal;