import React, { useState, useEffect } from 'react';

interface LoaderProps {
  message: string;
  progress: number;
}

const SystemCheckLoader = () => {
    const [status, setStatus] = useState<string>('ECU');
    const [dots, setDots] = useState<string>('');
    const systemComponents = ['ECU', 'FUEL', 'IGNITION', 'A.I. LINK'];

    useEffect(() => {
        let componentIndex = 0;
        const statusInterval = setInterval(() => {
            componentIndex = (componentIndex + 1) % systemComponents.length;
            setStatus(systemComponents[componentIndex]);
        }, 1500);

        return () => clearInterval(statusInterval);
    }, []);

    useEffect(() => {
        const dotsInterval = setInterval(() => {
            setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);
        return () => clearInterval(dotsInterval);
    }, []);

    return (
        <div className="w-48 h-24 bg-background border-2 border-primary/50 p-4 font-mono text-primary text-lg shadow-glow flex flex-col justify-between">
            <div className="flex justify-between items-center">
                <span className="animate-pulse">SYSTEM CHECK</span>
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-150"></div>
                </div>
            </div>
            <div className="text-right">
                <span>{status}{dots}</span>
                <span className="text-primary/50 animate-pulse"> OK</span>
            </div>
        </div>
    );
};


const Loader: React.FC<LoaderProps> = ({ message, progress }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center w-full max-w-sm px-4">
      <SystemCheckLoader />
      <div className="w-full bg-border h-2.5">
        <div 
          className="bg-primary h-2.5 transition-all duration-300 ease-linear" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-text-secondary font-rajdhani tracking-wider text-lg">{message}</p>
    </div>
  );
};

export default Loader;