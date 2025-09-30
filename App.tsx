import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ModificationControls from './components/ModificationControls';
import ImageViewer from './components/ImageViewer';
import HistoryViewer from './components/HistoryViewer';
import { editImageWithPrompt, generateVideoFromImage, getModificationSuggestions, getModificationCost } from './services/geminiService';
import { base64ToUploadedImage } from './utils/imageUtils';
import type { UploadedImage, AppliedMod } from './types';
import type { Suggestion } from './services/geminiService';
import { DownloadIcon, RedoIcon, ShareIcon, VideoIcon, SpecSheetIcon } from './components/icons';
import ExportModal from './components/ExportModal';
import VideoExportModal from './components/VideoExportModal';
import SpecSheetModal from './components/SpecSheetModal';
import Tooltip from './components/Tooltip';
import { SampleImages } from './components/SampleImages';

const LOADING_MESSAGES = [
  'Tuning injection parameters...',
  'Polishing the chrome...',
  'Applying vinyls...',
  'Charging the nitrous...',
  'Hitting the streets...'
];

const MULTI_ANGLE_LOADING_MESSAGES = [
    'Setting up the photoshoot...',
    'Generating front-quarter shot...',
    'Capturing side profile...',
    'Getting the rear-quarter angle...'
];

const VIDEO_LOADING_MESSAGES = [
    'Briefing the film crew...',
    'Sending request to video model...',
    'Generating keyframes for the cinematic...',
    'Rendering the final cut (this can take a few minutes)...',
    'Applying post-production effects...'
];


const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<UploadedImage | null>(null);
  const [modifiedImages, setModifiedImages] = useState<string[] | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<string[]>>([]);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>('Original');
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [progress, setProgress] = useState<number>(0);
  const [selectedAngleIndex, setSelectedAngleIndex] = useState(0);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isVideoExportModalOpen, setIsVideoExportModalOpen] = useState(false);
  const [isSpecSheetOpen, setIsSpecSheetOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Suggestion[] | null>(null);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [appliedMods, setAppliedMods] = useState<AppliedMod[]>([]);
  
  const loadingIntervalRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    setSelectedAngleIndex(0);
  }, [modifiedImages]);

  const selectedImage = modifiedImages ? modifiedImages[selectedAngleIndex] : null;
  const canShare = !!(navigator.share && navigator.canShare);

  const getAiSuggestions = useCallback(async (image: UploadedImage, partCategory?: string) => {
    setIsFetchingSuggestions(true);
    setAiSuggestions(null);
    try {
      const suggestions = await getModificationSuggestions(image.base64, image.mimeType, partCategory);
      setAiSuggestions(suggestions);
    } catch (e) {
      console.error("Failed to fetch AI suggestions:", e);
      // Silently fail, don't show an error to the user for this feature
    } finally {
      setIsFetchingSuggestions(false);
    }
  }, []);

  const resetStateForNewImage = (image: UploadedImage) => {
    setOriginalImage(image);
    setModifiedImages(null);
    setGeneratedVideoUrl(null);
    setError(null);
    setHistory([]);
    setBrightness(100);
    setContrast(100);
    setSelectedAngleIndex(0);
    setAppliedMods([]);
    getAiSuggestions(image);
  };

  const handleImageUpload = (image: UploadedImage) => {
    resetStateForNewImage(image);
  };

  const handleRefreshSuggestions = (part: string) => {
    if (originalImage) {
      getAiSuggestions(originalImage, part);
    }
  };
  
  const startLoading = (messages: string[]) => {
      setError(null);
      setModifiedImages(null);
      setGeneratedVideoUrl(null);
      setProgress(0);

      let messageIndex = 0;
      setLoadingMessage(messages[messageIndex]);
      
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      loadingIntervalRef.current = window.setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setLoadingMessage(messages[messageIndex]);
      }, 5000);

      progressIntervalRef.current = window.setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            return 95;
          }
          const remaining = 100 - prev;
          const increment = remaining / 40;
          return Math.min(prev + increment, 95);
        });
      }, 500);
  }

  const stopLoading = () => {
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setLoadingMessage('');
    setProgress(0);
  }

  const handleGenerate = useCallback(async (part: string, promptText: string, ratio: string, advancedPrompt: string, generateAngles: boolean) => {
    if (!originalImage) {
      setError("Please upload an image first.");
      return;
    }

    const messages = generateAngles ? MULTI_ANGLE_LOADING_MESSAGES : LOADING_MESSAGES;
    startLoading(messages);

    try {
      let newImages: string[] = [];
      const nonPartMods = ["Background", "Paint Color", "Underglow", "Interior"];

      const getBasePrompt = (p: string, pt: string): string => {
        const prompts: { [key: string]: string } = {
          'Paint Color': `Change the car's paint to ${pt}.`,
          'Underglow': `Add ${pt} to the car.`,
          'Interior': `Modify the car's interior. ${pt}.`,
          'Background': pt,
          'Exhaust': `Modify the car's exhaust to be ${pt}.`,
          'default': `Modify the car in the image. Specifically, change the ${p.toLowerCase()} to ${pt}.`
        };
        return prompts[p] || prompts['default'];
      };

      if (!generateAngles) {
        let fullPrompt = getBasePrompt(part, promptText);
        fullPrompt += ` ${advancedPrompt} Keep the rest of the car and the background the same unless the background is the subject of the change.`;
        if (ratio !== 'Original') fullPrompt += ` The output image must have a ${ratio} aspect ratio.`;

        const result = await editImageWithPrompt(originalImage.base64, originalImage.mimeType, fullPrompt);
        if (result) {
          const newImage = `data:image/jpeg;base64,${result}`;
          newImages = [newImage];
        }
      } else {
        const baseModificationPrompts: { [key: string]: string } = {
          'Background': `Change the background to ${promptText}.`,
          'Paint Color': `Change the car's paint to ${promptText}.`,
          'Underglow': `Add ${promptText} to the car.`,
          'Interior': `Modify the car's interior to: ${promptText}.`,
          'Exhaust': `Modify the car's exhaust to be ${promptText}.`,
          'default': `Modify the car's ${part.toLowerCase()} to be ${promptText}.`,
        };

        const basePrompt = baseModificationPrompts[part] || baseModificationPrompts['default'];
        
        const angleInstructions = [
          `Angle 1 (Front-Quarter): A dynamic photograph from a front-three-quarter perspective. The camera should be low to the ground, capturing both the front grille/headlights and the side profile of the car prominently. Emphasize the front wheel.`,
          `Angle 2 (Side Profile): A clean, direct side profile shot. The camera must be perfectly parallel to the side of the car, capturing its full length from front wheel to rear wheel. The car should fill the frame. This is a classic side view.`,
          `Angle 3 (Rear-Quarter): A dynamic photograph from a rear-three-quarter perspective. The camera should capture both the taillights/rear bumper and the side profile of the car prominently. Emphasize the rear wheel.`
        ];
        
        const anglePrompts = angleInstructions.map(instruction => {
          return `Your task is to generate one of three images for a photoshoot. First, apply this specific modification to the car: "${basePrompt}". Then, render the **fully modified car** from this specific, non-negotiable angle: "${instruction}". It is absolutely critical that the modification, background, scene, lighting, and color tone are identical across all generated images. The only change between images should be the camera's perspective. The modification MUST be clearly visible and consistent. Do not revert to the original car's appearance.`;
        });

        const promises = anglePrompts.map(p => {
          let finalPrompt = `${p} ${advancedPrompt}`;
          if (ratio !== 'Original') finalPrompt += ` The output image must have a ${ratio} aspect ratio.`;
          return editImageWithPrompt(originalImage.base64, originalImage.mimeType, finalPrompt);
        });

        const results = await Promise.all(promises);
        newImages = results.filter(res => res).map(result => `data:image/jpeg;base64,${result}`);
      }
      
      if (newImages.length > 0) {
        setModifiedImages(newImages);
        setHistory(prev => [newImages, ...prev].slice(0, 5));
        
        // Add to mod list
        const cost = await getModificationCost(part, promptText);
        const newMod: AppliedMod = { part, prompt: promptText, cost };
        setAppliedMods(prev => [...prev, newMod]);

      } else {
        setError("The AI could not generate any modifications. Please try a different prompt.");
      }
      setProgress(100);
    } catch (e) {
      console.error(e);
      setError("An error occurred while communicating with the AI. Please try again.");
    } finally {
      stopLoading();
    }
  }, [originalImage]);
  
  const handleGenerateVideo = useCallback(async (imageToAnimate: string | null) => {
    if (!imageToAnimate) {
        setError("No modified image to generate a video from.");
        return;
    }
    
    startLoading(VIDEO_LOADING_MESSAGES);
    
    try {
      const base64Data = imageToAnimate.split(',')[1];
      const videoUrl = await generateVideoFromImage(base64Data, 'image/jpeg');
      if (videoUrl) {
          setGeneratedVideoUrl(videoUrl);
          setModifiedImages(null);
      } else {
          setError("The AI could not generate a video. Please try again.");
      }
      setProgress(100);
    } catch (e) {
        console.error(e);
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred while generating the video.");
        }
    } finally {
        stopLoading();
    }
  }, []);

  const handleUseModified = useCallback(async (imageToUse: string | null) => {
    if (!imageToUse) return;
    const uploadedImage = await base64ToUploadedImage(imageToUse.split(',')[1], 'chained-modification.jpg');
    // Partially reset state, keeping history and applied mods
    setOriginalImage(uploadedImage);
    setModifiedImages(null);
    setGeneratedVideoUrl(null);
    setError(null);
    setBrightness(100);
    setContrast(100);
    setSelectedAngleIndex(0);
    getAiSuggestions(uploadedImage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [getAiSuggestions]);

  const handleSelectHistory = (images: string[]) => {
    setModifiedImages(images);
    setGeneratedVideoUrl(null);
    setBrightness(100);
    setContrast(100);
  };
  
  const handleShare = async () => {
    if (!canShare) return;
    try {
      if (generatedVideoUrl) {
        const response = await fetch(generatedVideoUrl);
        const blob = await response.blob();
        const file = new File([blob], 'y2k-tuner-video.mp4', { type: 'video/mp4' });
         if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: 'AI Car Cinematic', text: 'Check out this video I generated with Y2K Tuner!' });
         } else { alert("Your browser doesn't support sharing this video file."); }
      } else if (selectedImage) {
        const uploadedImage = await base64ToUploadedImage(selectedImage.split(',')[1], 'share.jpg');
        if (navigator.canShare({ files: [uploadedImage.file] })) {
          await navigator.share({ files: [uploadedImage.file], title: 'AI Car Modification', text: 'Check out this car I customized with Y2K Tuner!' });
        } else { alert("Your browser doesn't support sharing this image file."); }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Could not share the file.');
    }
  };
  
  const handleDownload = () => {
      if (generatedVideoUrl) {
          setIsVideoExportModalOpen(true);
      } else if (selectedImage) {
          setIsExportModalOpen(true);
      }
  };

  const showActionButtons = !loadingMessage && (!!modifiedImages || !!generatedVideoUrl);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {!originalImage ? (
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
            <ImageUploader onImageUpload={handleImageUpload} />
            <SampleImages onImageUpload={handleImageUpload} />
            {error && (
              <div className="bg-secondary/10 border border-secondary text-secondary px-6 py-4 text-center font-rajdhani tracking-wide shadow-glow-secondary">
                <p>{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/3 flex-shrink-0">
              <ModificationControls 
                onGenerate={handleGenerate} 
                disabled={!!loadingMessage}
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
                brightness={brightness}
                setBrightness={setBrightness}
                contrast={contrast}
                setContrast={setContrast}
                aiSuggestions={aiSuggestions}
                isFetchingSuggestions={isFetchingSuggestions}
                onRefreshSuggestions={handleRefreshSuggestions}
              />
            </div>
            <div className="w-full lg:w-2/3 flex flex-col gap-4">
              <ImageViewer 
                originalImage={originalImage.url} 
                modifiedImage={selectedImage}
                generatedVideoUrl={generatedVideoUrl}
                loadingMessage={loadingMessage}
                brightness={brightness}
                contrast={contrast}
                progress={progress}
              />

              {showActionButtons && (
                <div className="bg-surface border border-border p-3 flex justify-between items-center min-h-[7rem]">
                   {/* Thumbnails */}
                   <div className="flex gap-3 flex-wrap">
                      {modifiedImages && modifiedImages.length > 1 && modifiedImages.map((img, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedAngleIndex(index)}
                          className={`w-24 aspect-video overflow-hidden cursor-pointer transition-all duration-200 ring-2 ${selectedAngleIndex === index ? 'ring-primary scale-105 shadow-glow' : 'ring-transparent hover:ring-primary/50'}`}
                        >
                          <img src={img} alt={`Angle ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        {!generatedVideoUrl && selectedImage && (
                            <Tooltip text="View build spec sheet & costs.">
                                <button
                                    onClick={() => setIsSpecSheetOpen(true)}
                                    className="bg-surface text-text w-12 h-12 flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-all duration-200 hover:scale-110"
                                    aria-label="View Spec Sheet"
                                >
                                    <SpecSheetIcon className="w-6 h-6" />
                                </button>
                            </Tooltip>
                        )}
                        {!generatedVideoUrl && selectedImage && (
                            <Tooltip text="Use this mod as the new base image for more edits.">
                                <button
                                    onClick={() => handleUseModified(selectedImage)}
                                    className="bg-surface text-text w-12 h-12 flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-all duration-200 hover:scale-110"
                                    aria-label="Use This Image for Next Modification"
                                >
                                    <RedoIcon className="w-6 h-6" />
                                </button>
                            </Tooltip>
                        )}
                        {!generatedVideoUrl && selectedImage && (
                            <Tooltip text="Generate a short, cinematic video of this car. (May take a few minutes)">
                                <button
                                  onClick={() => handleGenerateVideo(selectedImage)}
                                  className="bg-surface text-text w-12 h-12 flex items-center justify-center border border-border hover:border-secondary hover:text-secondary transition-all duration-200 hover:scale-110"
                                  aria-label="Generate Cinematic Video"
                                >
                                  <VideoIcon className="w-6 h-6" />
                                </button>
                            </Tooltip>
                        )}
                        {canShare && (
                          <button
                            onClick={handleShare}
                            className="bg-surface text-text w-12 h-12 flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-all duration-200 hover:scale-110"
                            aria-label="Share" title="Share"
                          >
                            <ShareIcon className="w-6 h-6" />
                          </button>
                        )}
                        <button
                          onClick={handleDownload}
                          className="bg-primary text-background w-12 h-12 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-glow-hover shadow-glow"
                          aria-label="Download" title="Download"
                        >
                          <DownloadIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
              )}

              <HistoryViewer 
                history={history}
                onSelect={handleSelectHistory}
                activeHistorySet={modifiedImages}
              />
              {error && (
                <div className="bg-secondary/10 border border-secondary text-secondary px-6 py-4 text-center font-rajdhani tracking-wide shadow-glow-secondary">
                  <p>{error}</p>
                </div>
              )}
              {selectedImage && (
                  <ExportModal
                    isOpen={isExportModalOpen}
                    onClose={() => setIsExportModalOpen(false)}
                    imageDataUrl={selectedImage}
                    brightness={brightness}
                    contrast={contrast}
                  />
              )}
              {generatedVideoUrl && (
                  <VideoExportModal
                    isOpen={isVideoExportModalOpen}
                    onClose={() => setIsVideoExportModalOpen(false)}
                    videoUrl={generatedVideoUrl}
                  />
              )}
              {selectedImage && originalImage && (
                <SpecSheetModal
                  isOpen={isSpecSheetOpen}
                  onClose={() => setIsSpecSheetOpen(false)}
                  originalImage={originalImage.url}
                  modifiedImage={selectedImage}
                  mods={appliedMods}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;