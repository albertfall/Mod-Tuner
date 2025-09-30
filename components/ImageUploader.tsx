
import React, { useCallback, useState } from 'react';
import type { UploadedImage } from '../types';
import { CameraIcon, UploadIcon } from './icons';
import CameraCaptureModal from './CameraCaptureModal';

interface ImageUploaderProps {
  onImageUpload: (image: UploadedImage) => void;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleFileChange = useCallback(async (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
      }
      const base64 = await fileToBase64(file);
      onImageUpload({
        file,
        url: URL.createObjectURL(file),
        base64,
        mimeType: file.type,
      });
    }
  }, [onImageUpload]);

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  }, [handleFileChange]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div
          className={`relative flex flex-col items-center justify-center w-full min-h-[16rem] border-2 border-dashed transition-colors duration-300 ${isDragging ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:border-primary/50'}`}
        >
          <div
            className="absolute inset-0 z-0"
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
          />
          <label htmlFor="file-upload" className="relative z-10 flex flex-col items-center justify-center text-center p-6 cursor-pointer">
            <UploadIcon className="w-16 h-16 text-border mb-6" />
            <p className="text-xl font-orbitron uppercase tracking-widest text-text">
              <span className="text-primary">Click to upload</span>
            </p>
            <p className="text-text-secondary mt-2 font-rajdhani tracking-wider">or drag & drop</p>
            <input
              type="file"
              id="file-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files)}
            />
          </label>
        </div>

        <button
          onClick={() => setIsCameraOpen(true)}
          className={`relative flex flex-col items-center justify-center w-full min-h-[16rem] border-2 border-dashed transition-colors duration-300 border-border bg-surface hover:border-primary/50`}
        >
          <div className="flex flex-col items-center justify-center text-center p-6">
            <CameraIcon className="w-16 h-16 text-border mb-6" />
            <p className="text-xl font-orbitron uppercase tracking-widest text-text">
              <span className="text-primary">Take a Photo</span>
            </p>
            <p className="text-text-secondary mt-2 font-rajdhani tracking-wider">Use your device</p>
          </div>
        </button>
      </div>

      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onImageCapture={onImageUpload}
      />
    </>
  );
};

export default ImageUploader;