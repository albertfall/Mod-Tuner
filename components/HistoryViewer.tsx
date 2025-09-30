import React from 'react';

interface HistoryViewerProps {
  history: Array<string[]>;
  onSelect: (images: string[]) => void;
  activeHistorySet: string[] | null;
}

const HistoryViewer: React.FC<HistoryViewerProps> = ({ history, onSelect, activeHistorySet }) => {
  if (history.length === 0) {
    return null;
  }
  
  // Use JSON string comparison to check for deep equality of the arrays
  const activeSetString = activeHistorySet ? JSON.stringify(activeHistorySet) : null;

  return (
    <div className="bg-surface/80 backdrop-blur-sm p-4 border border-border">
      <h3 className="text-sm font-orbitron tracking-[0.1em] uppercase text-text-secondary mb-3">History</h3>
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {history.map((imageSet, index) => {
          if (!imageSet || imageSet.length === 0) return null;
          
          const isSetActive = activeSetString === JSON.stringify(imageSet);

          return (
            <div
              key={index}
              className={`flex-shrink-0 w-32 aspect-video overflow-hidden cursor-pointer transition-all duration-200 ring-2 ${isSetActive ? 'ring-primary scale-105 shadow-glow' : 'ring-transparent hover:ring-primary/50'}`}
              onClick={() => onSelect(imageSet)}
            >
              <img
                src={imageSet[0]} // Show the first image of the set as the thumbnail
                alt={`History item ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default HistoryViewer;