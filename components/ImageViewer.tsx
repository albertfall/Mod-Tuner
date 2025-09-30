import React from 'react';
import Loader from './Loader';
import ImageSlider from './ImageSlider';

interface ImageViewerProps {
  originalImage: string;
  modifiedImage: string | null;
  generatedVideoUrl: string | null;
  loadingMessage: string;
  brightness: number;
  contrast: number;
  progress: number;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ 
  originalImage, 
  modifiedImage, 
  generatedVideoUrl,
  loadingMessage, 
  brightness,
  contrast,
  progress,
}) => {
  const renderContent = () => {
    if (loadingMessage) {
      return <Loader message={loadingMessage} progress={progress} />;
    }
    
    if (generatedVideoUrl) {
      return (
        <video
          src={generatedVideoUrl}
          controls
          autoPlay
          loop
          className="w-full h-full object-contain"
          style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
        />
      );
    }

    if (modifiedImage) {
      return (
        <ImageSlider 
          originalSrc={originalImage} 
          modifiedSrc={modifiedImage}
          brightness={brightness}
          contrast={contrast}
        />
      );
    }
    
    // Initial state
    return (
       <>
          <img src={originalImage} alt="Original car" className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <p className="text-center text-text-secondary text-lg p-4 font-orbitron uppercase tracking-widest">Describe a mod to get started</p>
          </div>
      </>
    );
  };

  return (
    <div className="relative w-full aspect-video overflow-hidden border border-border bg-background flex items-center justify-center">
      {renderContent()}
    </div>
  );
};

export default ImageViewer;