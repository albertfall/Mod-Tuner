import React from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="relative group flex items-center">
      {children}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs
        bg-primary text-background text-xs font-rajdhani font-semibold tracking-wider
        px-3 py-1.5 rounded-md
        opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20
        shadow-lg">
        {text}
        <div className="absolute left-1/2 -translate-x-1/2 top-full
          w-0 h-0
          border-x-4 border-x-transparent
          border-t-4 border-t-primary">
        </div>
      </div>
    </div>
  );
};

export default Tooltip;