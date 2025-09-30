import React from 'react';
import type { UploadedImage } from '../types';
import { urlToUploadedImage } from '../utils/imageUtils';
import { SAMPLE_IMAGES } from '../utils/constants';

interface SampleImagesProps {
  onImageUpload: (image: UploadedImage) => void;
}

export const SampleImages: React.FC<SampleImagesProps> = ({ onImageUpload }) => {

  const handleSampleClick = async (sample: typeof SAMPLE_IMAGES[number]) => {
    try {
      const fileName = `${sample.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      const uploadedImage = await urlToUploadedImage(sample.url, fileName);
      onImageUpload(uploadedImage);
    } catch (error) {
      console.error("Failed to load sample image:", error);
      alert("Could not load the sample image. Please try again.");
    }
  };

  return (
    <div className="bg-surface p-6 border border-border">
      <h3 className="text-sm font-orbitron tracking-[0.1em] uppercase text-text-secondary mb-4 text-center">Or, try a sample</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SAMPLE_IMAGES.map((sample, index) => (
          <div
            key={index}
            className="aspect-video bg-background overflow-hidden cursor-pointer group relative transition-transform duration-200 hover:scale-105 hover:shadow-glow"
            onClick={() => handleSampleClick(sample)}
          >
            <img 
              src={sample.url} 
              alt={sample.name} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors"></div>
             <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary transition-colors"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
