import React, { useState } from 'react';
import type { AppliedMod } from '../types';
import { downloadSpecSheet } from '../utils/exportUtils';

interface SpecSheetModalProps {
    isOpen: boolean;
    onClose: () => void;
    originalImage: string;
    modifiedImage: string;
    mods: AppliedMod[];
}

const SPEC_SHEET_CONTENT_ID = 'spec-sheet-content';

// A simple component to render a fake barcode
const FakeBarcode: React.FC = () => (
    <div className="flex h-16 items-end gap-px">
        <div className="w-1 h-full bg-text"></div>
        <div className="w-px h-full bg-text"></div>
        <div className="w-0.5 h-3/4 bg-text"></div>
        <div className="w-px h-full bg-text"></div>
        <div className="w-1 h-1/2 bg-text"></div>
        <div className="w-0.5 h-full bg-text"></div>
        <div className="w-px h-3/4 bg-text"></div>
        <div className="w-1 h-full bg-text"></div>
        <div className="w-px h-1/2 bg-text"></div>
        <div className="w-0.5 h-full bg-text"></div>
        <div className="w-px h-full bg-text"></div>
        <div className="w-1 h-3/4 bg-text"></div>
        <div className="w-px h-full bg-text"></div>
        <div className="w-0.5 h-1/2 bg-text"></div>
        <div className="w-1 h-full bg-text"></div>
        <div className="w-px h-3/4 bg-text"></div>
        <div className="w-0.5 h-full bg-text"></div>
        <div className="w-1 h-1/2 bg-text"></div>
        <div className="w-px h-full bg-text"></div>
        <div className="w-0.5 h-3/4 bg-text"></div>
    </div>
);

const SpecSheetModal: React.FC<SpecSheetModalProps> = ({ isOpen, onClose, originalImage, modifiedImage, mods }) => {
    const [isExporting, setIsExporting] = useState(false);

    const totalCost = mods.reduce((acc, mod) => acc + mod.cost, 0);
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    const handleDownload = async (format: 'jpeg' | 'png' | 'pdf') => {
        setIsExporting(true);
        try {
            await downloadSpecSheet(SPEC_SHEET_CONTENT_ID, format);
        } finally {
            setIsExporting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-surface border border-border w-full max-w-4xl h-full max-h-[95vh] shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-border flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-orbitron font-bold text-text uppercase tracking-widest">Build Sheet</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-primary transition-colors text-xs font-rajdhani uppercase tracking-wider">Close</button>
                </div>

                <div className="flex-grow overflow-y-auto p-2 sm:p-4 md:p-8 bg-background">
                    <div id={SPEC_SHEET_CONTENT_ID} className="bg-white text-black font-sans w-full mx-auto p-6">
                        <header className="flex justify-between items-center pb-4 border-b-2 border-black">
                            <div>
                                <h1 className="text-3xl font-orbitron font-bold tracking-wider">Y2K TUNER</h1>
                                <p className="text-xs font-semibold tracking-widest uppercase">AI MODIFICATION REPORT</p>
                            </div>
                            <div className="w-10 h-10 bg-primary"></div>
                        </header>

                        <section className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-bold text-xs uppercase tracking-wider mb-1">BEFORE</h3>
                                <div className="bg-gray-100 border border-gray-300 h-64">
                                    <img src={originalImage} alt="Original Car" className="w-full h-full object-contain" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-xs uppercase tracking-wider mb-1 text-primary">AFTER</h3>
                                <div className="bg-gray-100 border border-gray-300 h-64">
                                    <img src={modifiedImage} alt="Modified Car" className="w-full h-full object-contain" />
                                </div>
                            </div>
                        </section>
                        
                        <section className="border-t-8 border-black pt-4">
                             <h2 className="font-orbitron text-xl font-bold tracking-wider mb-3">INSTALLED MODIFICATIONS</h2>
                             <div className="text-sm space-y-2 font-mono">
                                <div className="grid grid-cols-12 gap-x-4 font-bold border-b border-black pb-1">
                                    <div className="col-span-3">PART</div>
                                    <div className="col-span-6">DESCRIPTION</div>
                                    <div className="col-span-3 text-right">MSRP (PART ONLY)</div>
                                </div>
                                {mods.map((mod, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-x-4 py-1.5 border-b border-gray-200">
                                        <div className="col-span-3 font-bold">{mod.part}</div>
                                        <div className="col-span-6 text-xs leading-snug">{mod.prompt}</div>
                                        <div className="col-span-3 text-right">{formatter.format(mod.cost)}</div>
                                    </div>
                                ))}
                                {mods.length === 0 && <p className="text-center col-span-12 py-4 text-gray-500">No modifications installed.</p>}
                             </div>
                        </section>

                        <footer className="mt-6 border-t-2 border-black pt-4 flex justify-between items-end">
                            <div>
                                <p className="text-xs text-gray-500">Prices are AI-generated estimates for parts only.</p>
                                <FakeBarcode />
                            </div>
                            <div className="text-right">
                                <p className="font-bold uppercase tracking-wider">Total Mod Cost</p>
                                <p className="text-4xl font-orbitron font-bold">{formatter.format(totalCost)}</p>
                            </div>
                        </footer>
                    </div>
                </div>

                <div className="p-4 bg-background border-t border-border flex flex-col sm:flex-row justify-end items-center gap-4 flex-shrink-0">
                     <p className="text-sm text-text-secondary/70 font-rajdhani">
                        {isExporting ? 'Generating file...' : 'Download as:'}
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => handleDownload('jpeg')} disabled={isExporting} className="px-4 py-2 bg-primary/10 text-primary border border-primary/50 hover:bg-primary/20 transition-colors font-orbitron font-semibold tracking-wider disabled:opacity-50 disabled:cursor-wait">
                            JPG
                        </button>
                        <button onClick={() => handleDownload('png')} disabled={isExporting} className="px-4 py-2 bg-primary/10 text-primary border border-primary/50 hover:bg-primary/20 transition-colors font-orbitron font-semibold tracking-wider disabled:opacity-50 disabled:cursor-wait">
                            PNG
                        </button>
                        <button onClick={() => handleDownload('pdf')} disabled={isExporting} className="px-4 py-2 bg-primary/10 text-primary border border-primary/50 hover:bg-primary/20 transition-colors font-orbitron font-semibold tracking-wider disabled:opacity-50 disabled:cursor-wait">
                            PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpecSheetModal;