import React, { useState, useCallback } from 'react';
import type { Suggestion } from '../services/geminiService';
import {
  CarIcon, SparklesIcon, RefreshIcon
} from './icons';
import Tooltip from './Tooltip';

interface ModificationControlsProps {
  onGenerate: (part: string, promptText: string, ratio: string, advancedPrompt: string, generateAngles: boolean) => void;
  disabled: boolean;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  brightness: number;
  setBrightness: (b: number) => void;
  contrast: number;
  setContrast: (c: number) => void;
  aiSuggestions: Suggestion[] | null;
  isFetchingSuggestions: boolean;
  onRefreshSuggestions: (part: string) => void;
}

const PART_CATEGORIES = [
  "Wheels", "Front Bumper", "Rear Bumper", "Spoiler", "Side Skirts", "Headlights", "Full Body Kit",
  "Paint Color", "Underglow", "Vinyl Decals", "Background", "Interior", "Exhaust"
];

const PART_PRESETS = {
  "Wheels": [
    { name: "Volk TE37", prompt: "a set of bronze Volk TE37 wheels" },
    { name: "BBS LM", prompt: "a set of silver BBS LM wheels with a polished lip" },
    { name: "Work Meister S1", prompt: "a set of white Work Meister S1 3P wheels" },
    { name: "Enkei RPF1", prompt: "a set of silver Enkei RPF1 wheels" },
    { name: "Advan RG-D2", prompt: "a set of black Advan RG-D2 wheels" },
  ],
  "Spoiler": [
    { name: "Carbon GT Wing", prompt: "a large, high-mount carbon fiber GT wing" },
    { name: "Ducktail Spoiler", prompt: "a subtle, body-colored ducktail spoiler" },
    { name: "APR GTC-300", prompt: "an APR GTC-300 carbon fiber adjustable wing" },
  ],
  "Front Bumper": [
    { name: "Vertex Style", prompt: "a clean Vertex style front bumper with a front lip spoiler" },
    { name: "Bomex Type-R", prompt: "a Bomex Type-R style front bumper with large vents" },
    { name: "Drift Bumper", prompt: "an aggressive, vented drift-style front bumper with canards" },
  ],
  "Rear Bumper": [
    { name: "JDM Rear Bumper", prompt: "a JDM style rear bumper with a rear diffuser" },
    { name: "Custom Diffuser", prompt: "add a custom carbon fiber rear diffuser" },
  ],
  "Side Skirts": [
    { name: "OEM+ Side Skirts", prompt: "a set of subtle OEM+ style side skirts" },
    { name: "Veilside Style", prompt: "a set of aggressive Veilside style side skirts" },
  ],
  "Full Body Kit": [
    { name: "Rocket Bunny Kit", prompt: "a full Rocket Bunny widebody kit with riveted overfenders" },
    { name: "Liberty Walk Kit", prompt: "a full Liberty Walk widebody kit" },
    { name: "Veilside Fortune", prompt: "the iconic Veilside Fortune full body kit" },
  ],
  "Vinyl Decals": [
    { name: "Racing Stripes", prompt: "a pair of thick racing stripes in matte black running down the center of the car" },
    { name: "Sponsor Stack", prompt: "a stack of various JDM tuner sponsor logos on the lower front fenders, like Falken, GReddy, and HKS" },
    { name: "Tribal Flames", prompt: "a classic 90s-style tribal flame vinyl decal in silver and black on the sides of the car" },
    { name: "Itasha Style", prompt: "a full-body Itasha style anime wrap" },
  ],
  "Exhaust": [
    { name: "Single Exit Cannon", prompt: "a large, 4-inch single-exit 'cannon' style exhaust with a burnt titanium tip" },
    { name: "Dual Exit System", prompt: "a clean dual-exit exhaust system with polished quad tips" },
    { name: "HKS Hi-Power", prompt: "an HKS Hi-Power cat-back exhaust system" },
  ],
  "Interior": [
    { name: "Racing Seats", prompt: "a pair of red Bride Low Max racing bucket seats" },
    { name: "Steering Wheel", prompt: "a Nardi deep corn steering wheel with a quick-release hub" },
    { name: "Roll Cage", prompt: "a full bolt-in roll cage in metallic blue" },
  ],
};

const ModificationControls: React.FC<ModificationControlsProps> = ({
  onGenerate,
  disabled,
  aspectRatio,
  setAspectRatio,
  brightness,
  setBrightness,
  contrast,
  setContrast,
  aiSuggestions,
  isFetchingSuggestions,
  onRefreshSuggestions,
}) => {
  const [selectedPart, setSelectedPart] = useState<string>(PART_CATEGORIES[0]);
  const [promptText, setPromptText] = useState('');
  const [advancedPrompt, setAdvancedPrompt] = useState('');
  const [generateAngles, setGenerateAngles] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptText.trim() === '') {
      alert('Please enter a modification description.');
      return;
    }
    onGenerate(selectedPart, promptText, aspectRatio, advancedPrompt, generateAngles);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSelectedPart(suggestion.category);
    setPromptText(suggestion.prompt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleRefreshClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRefreshSuggestions(selectedPart);
  }, [onRefreshSuggestions, selectedPart]);

  const presetsForPart = PART_PRESETS[selectedPart as keyof typeof PART_PRESETS];

  return (
    <div className="bg-surface border border-border p-6 flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="part-category" className="block text-sm font-orbitron tracking-[0.1em] uppercase text-text-secondary mb-2">
            1. Select Part
          </label>
          <select
            id="part-category"
            value={selectedPart}
            onChange={(e) => setSelectedPart(e.target.value)}
            disabled={disabled}
            className="w-full bg-background border border-border px-3 py-2 text-text focus:ring-primary focus:border-primary font-rajdhani"
          >
            {PART_CATEGORIES.map(part => (
              <option key={part} value={part}>{part}</option>
            ))}
          </select>
        </div>

        {presetsForPart && (
            <div className="animate-fade-in">
                <label className="block text-xs font-orbitron tracking-widest uppercase text-text-secondary/80 mb-2">
                    Popular Presets
                </label>
                <div className="flex flex-wrap gap-2">
                    {presetsForPart.map((preset) => (
                        <button
                            key={preset.name}
                            type="button"
                            onClick={() => setPromptText(preset.prompt)}
                            disabled={disabled}
                            className="px-3 py-1.5 text-xs font-rajdhani font-semibold bg-background border border-border text-text-secondary hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                        >
                            {preset.name}
                        </button>
                    ))}
                </div>
            </div>
        )}

        <div>
          <label htmlFor="prompt-text" className="block text-sm font-orbitron tracking-[0.1em] uppercase text-text-secondary mb-2">
            2. Describe Modification
            <span className="text-xs normal-case font-rajdhani text-text-secondary/70"> (or use a preset)</span>
          </label>
          <textarea
            id="prompt-text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            disabled={disabled}
            rows={3}
            placeholder={`e.g., "Volk TE37 wheels in bronze" or "a vibrant candy apple red"`}
            className="w-full bg-background border border-border px-3 py-2 text-text focus:ring-primary focus:border-primary font-rajdhani resize-none"
          />
        </div>

        <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-orbitron tracking-[0.1em] uppercase text-text-secondary">
                    3. Output Settings
                </label>
                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs text-primary font-rajdhani font-bold hover:underline">
                    {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                </button>
            </div>
        </div>

        {showAdvanced && (
             <div className="space-y-4 animate-fade-in">
                 <div>
                    <label htmlFor="advanced-prompt" className="block text-sm font-medium text-text-secondary mb-1 font-rajdhani">
                        Advanced Prompting <span className="text-xs italic">(Optional)</span>
                    </label>
                    <textarea
                        id="advanced-prompt"
                        value={advancedPrompt}
                        onChange={(e) => setAdvancedPrompt(e.target.value)}
                        disabled={disabled}
                        rows={2}
                        placeholder="Add details like 'in a cinematic style', 'at night', 'with motion blur'"
                        className="w-full bg-background border border-border px-3 py-2 text-text focus:ring-primary focus:border-primary font-rajdhani resize-none text-sm"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2 font-rajdhani">Aspect Ratio</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Original', '16:9', '4:3'].map(ratio => (
                        <button type="button" key={ratio} onClick={() => setAspectRatio(ratio)} disabled={disabled}
                          className={`py-2 text-sm transition-colors duration-200 border ${aspectRatio === ratio ? 'bg-primary text-background border-primary' : 'bg-background text-text-secondary border-border hover:border-primary/50'}`}>
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>
             </div>
        )}

        <div className="flex items-center">
            <input
                type="checkbox"
                id="generate-angles"
                checked={generateAngles}
                onChange={(e) => setGenerateAngles(e.target.checked)}
                disabled={disabled}
                className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
            />
            <label htmlFor="generate-angles" className="ml-3 block text-sm text-text-secondary font-rajdhani">
                Generate 3-Angle Photoshoot <span className="text-primary/80 font-bold">(Slower)</span>
            </label>
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="w-full flex items-center justify-center gap-3 bg-primary text-background font-orbitron font-bold text-lg py-3 uppercase tracking-widest
          hover:shadow-glow-hover transition-all duration-200 shadow-glow
          disabled:bg-border disabled:text-text-secondary disabled:cursor-not-allowed disabled:shadow-none"
        >
          <CarIcon className="w-6 h-6" />
          Install Part
        </button>
      </form>
      
      <div className="border-t border-border pt-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-orbitron tracking-[0.1em] uppercase text-text-secondary flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-primary" />
            AI Suggestions
          </h3>
          <Tooltip text="Get new suggestions for the selected part.">
            <button
              onClick={handleRefreshClick}
              disabled={isFetchingSuggestions || disabled}
              className="text-text-secondary hover:text-primary disabled:text-border disabled:cursor-not-allowed transition-colors"
              aria-label="Refresh Suggestions"
            >
              <RefreshIcon className={`w-5 h-5 ${isFetchingSuggestions ? 'animate-spin' : ''}`} />
            </button>
          </Tooltip>
        </div>
        
        {isFetchingSuggestions ? (
          <div className="text-center py-4 font-rajdhani text-text-secondary">Generating ideas...</div>
        ) : aiSuggestions && aiSuggestions.length > 0 ? (
          <div className="space-y-2">
            {aiSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={disabled}
                className="w-full text-left p-3 bg-background border border-border hover:border-primary/50 hover:bg-primary/10 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="font-bold text-sm text-primary font-rajdhani tracking-wider">{suggestion.category}</p>
                <p className="text-sm text-text-secondary font-rajdhani">{suggestion.prompt}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-sm font-rajdhani text-text-secondary">No suggestions available. Try refreshing.</div>
        )}
      </div>
      
      {/* Post-Generation Adjustments */}
      <div className="border-t border-border pt-6 space-y-4">
        <h3 className="text-sm font-orbitron tracking-[0.1em] uppercase text-text-secondary mb-2">
          Post-Generation Adjustments
        </h3>
        <div className="space-y-4">
            <div>
                <label htmlFor="brightness" className="block text-sm font-medium text-text-secondary mb-1 font-rajdhani">
                    Brightness: <span className="font-mono bg-background py-0.5 px-1.5">{brightness}%</span>
                </label>
                <input
                    id="brightness" type="range" min="50" max="150" value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-border appearance-none cursor-pointer accent-primary"
                />
            </div>
            <div>
                <label htmlFor="contrast" className="block text-sm font-medium text-text-secondary mb-1 font-rajdhani">
                    Contrast: <span className="font-mono bg-background py-0.5 px-1.5">{contrast}%</span>
                </label>
                <input
                    id="contrast" type="range" min="50" max="150" value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-border appearance-none cursor-pointer accent-primary"
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default ModificationControls;