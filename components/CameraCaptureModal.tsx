
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { UploadedImage } from '../types';
import { base64ToUploadedImage } from '../utils/imageUtils';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageCapture: (image: UploadedImage) => void;
}

const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({ isOpen, onClose, onImageCapture }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cleanupStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startStream = useCallback(async () => {
    cleanupStream();
    setCapturedImage(null);
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please ensure permissions are granted and try again.");
    }
  }, [cleanupStream]);

  useEffect(() => {
    if (isOpen) {
      startStream();
    } else {
      cleanupStream();
    }
    
    return () => {
        cleanupStream();
    };
  }, [isOpen, startStream, cleanupStream]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      cleanupStream();
    }
  };

  const handleUsePhoto = async () => {
    if (capturedImage) {
      const base64 = capturedImage.split(',')[1];
      const uploadedImage = await base64ToUploadedImage(base64, 'captured-photo.jpg', 'image/jpeg');
      onImageCapture(uploadedImage);
      onClose();
    }
  };

  const handleRetake = () => {
    startStream();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-surface border border-border p-4 w-full max-w-4xl h-full max-h-[90vh] shadow-2xl flex flex-col">
        <h2 className="text-xl font-orbitron font-bold mb-4 text-text text-center">Take a Photo</h2>
        
        <div className="relative flex-grow bg-background flex items-center justify-center">
            {error && <p className="text-secondary text-center p-4">{error}</p>}
            
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                className={`w-full h-full object-contain ${capturedImage || error ? 'hidden' : 'block'}`} 
            />
            
            {capturedImage && (
                <img src={capturedImage} alt="Captured preview" className="w-full h-full object-contain" />
            )}

            <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="mt-4 flex justify-center gap-4">
          {capturedImage ? (
            <>
              <button
                onClick={handleRetake}
                className="px-6 py-3 bg-background text-text-secondary hover:bg-border transition-colors font-rajdhani font-semibold tracking-wider"
              >
                Retake
              </button>
              <button
                onClick={handleUsePhoto}
                className="px-6 py-3 bg-primary text-background font-orbitron font-semibold hover:shadow-glow-hover transition-all shadow-glow tracking-wider"
              >
                Use Photo
              </button>
            </>
          ) : (
            <button
                onClick={handleCapture}
                disabled={!stream || !!error}
                className="w-20 h-20 rounded-full border-4 border-white bg-primary/20 disabled:bg-border disabled:cursor-not-allowed"
                aria-label="Capture Photo"
            />
          )}
        </div>
        <button
            onClick={onClose}
            className="absolute top-3 right-3 text-text-secondary hover:text-primary transition-colors text-xs font-rajdhani uppercase tracking-wider"
          >
            Close
        </button>
      </div>
    </div>
  );
};

export default CameraCaptureModal;
