import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-surface/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center">
        <h1 
          className="text-3xl font-orbitron font-bold text-text tracking-[0.1em] uppercase"
          style={{ textShadow: '0 0 10px #00FFFF' }}
        >
          Y2K Tuner
        </h1>
      </div>
    </header>
  );
};

export default Header;