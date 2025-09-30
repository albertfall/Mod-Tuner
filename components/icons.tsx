import React from 'react';

type IconProps = {
  className?: string;
};

export const CarIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M22.5 14.25h-1.334a3.003 3.003 0 0 0-2.91 2.385 1.502 1.502 0 0 1-2.941.488 2.993 2.993 0 0 0-2.146-1.554 2.993 2.993 0 0 0-2.338.225A1.5 1.5 0 0 1 8.25 14.25H1.5a.75.75 0 0 1 0-1.5h1.178l1.73-3.028A3.75 3.75 0 0 1 7.756 8.25h8.488a3.75 3.75 0 0 1 3.348 1.472l1.73 3.028H22.5a.75.75 0 0 1 0 1.5ZM4.5 18a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm15 0a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" />
  </svg>
);


export const UploadIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

export const CameraIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
        <circle cx="12" cy="13" r="3"></circle>
    </svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.9 3.9-3.9 1.9 3.9 1.9 1.9 3.9 1.9-3.9 3.9-1.9-3.9-1.9Z"></path>
    <path d="M19 12h-2"></path>
    <path d="M19 12h2"></path>
    <path d="M12 19v-2"></path>
    <path d="M12 19v2"></path>
    <path d="m5 5-1.4 1.4"></path>
    <path d="m19 19-1.4-1.4"></path>
    <path d="m5 19 1.4-1.4"></path>
    <path d="m19 5-1.4 1.4"></path>
  </svg>
);

export const DownloadIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

export const ShareIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
    <polyline points="16 6 12 2 8 6"></polyline>
    <line x1="12" y1="2" x2="12" y2="15"></line>
  </svg>
);

export const RedoIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m21 7-4-4-4 4"></path>
        <path d="M17 3v5a4 4 0 0 1-4 4H5"></path>
    </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
        <path d="M21 3v5h-5"></path>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
        <path d="M3 21v-5h5"></path>
    </svg>
);


export const VideoIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m22 8-6 4 6 4V8Z"></path>
        <rect x="2" y="6" width="14" height="12" rx="2" ry="2"></rect>
    </svg>
);

export const SpecSheetIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

export const FlamesIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
    </svg>
);

export const TribalIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 13c-2.42.38-4.11.22-5-.5-1.11-.9-1.54-3.3-4-4.5-2.46-1.2-4.22.4-5.5 2-1.28 1.6-.5 4 .5 6 .5.5 1.6 1.1 2.5 1.5.9.4 2.2.5 3.5.5"></path>
        <path d="M4 11c2.42-.38 4.11-.22 5 .5 1.11.9 1.54 3.3 4 4.5 2.46 1.2 4.22-.4 5.5-2 1.28-1.6-.5-4-.5-6-.5-.5-1.6-1.1-2.5-1.5-.9-.4-2.2-.5-3.5-.5"></path>
    </svg>
);

export const SponsorIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M7 10.25h10M7 13.75h5M18 19l-4-4H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6.5a2.5 2.5 0 0 1-2.5 2.5H18Z"></path>
    </svg>
);

export const StripesIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="10" y1="2" x2="6" y2="22"></line>
        <line x1="18" y1="2" x2="14" y2="22"></line>
    </svg>
);

// Wheel Icons
export const MultiSpokeWheelIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="3"></circle>
        <line x1="12" y1="5" x2="12" y2="9"></line>
        <line x1="12" y1="15" x2="12" y2="19"></line>
        <line x1="16.24" y1="7.76" x2="13.41" y2="10.59"></line>
        <line x1="10.59" y1="13.41" x2="7.76" y2="16.24"></line>
        <line x1="19" y1="12" x2="15" y2="12"></line>
        <line x1="9" y1="12" x2="5" y2="12"></line>
        <line x1="16.24" y1="16.24" x2="13.41" y2="13.41"></line>
        <line x1="10.59" y1="10.59" x2="7.76" y2="7.76"></line>
    </svg>
);

export const MeshWheelIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 2L12 5"></path>
        <path d="M12 19L12 22"></path>
        <path d="M22 12L19 12"></path>
        <path d="M5 12L2 12"></path>
        <path d="M19.07 4.93L17 7"></path>
        <path d="M7 17L4.93 19.07"></path>
        <path d="M19.07 19.07L17 17"></path>
        <path d="M7 7L4.93 4.93"></path>
        <circle cx="12" cy="12" r="4"></circle>
    </svg>
);

export const FiveSpokeWheelIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="2"></circle>
        <path d="M12 2v8"></path>
        <path d="m19.1 7.4-6.1 4.6"></path>
        <path d="m16.1 18.2-3.1-7.2"></path>
        <path d="m7.9 18.2 3.1-7.2"></path>
        <path d="m4.9 7.4 6.1 4.6"></path>
    </svg>
);

export const DeepDishWheelIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6"></circle>
        <circle cx="12" cy="12" r="2"></circle>
    </svg>
);

export const TurbofanWheelIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 2a10 10 0 0 0-10 10c0 .2 0 .4.1.6"></path>
        <path d="M22 12a10 10 0 0 0-10-10c-.2 0-.4 0-.6.1"></path>
        <path d="M12 22a10 10 0 0 0 10-10c0-.2 0-.4-.1-.6"></path>
        <path d="M2 12a10 10 0 0 0 10 10c.2 0 .4 0 .6-.1"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

// Exhaust Icons
export const SingleExitIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M8 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"></path>
        <path d="M14 18h6"></path>
        <path d="M12 12h8"></path>
        <circle cx="6" cy="12" r="2"></circle>
    </svg>
);

export const DualExitIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M8 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"></path>
        <path d="M20 18h-4"></path>
        <path d="M20 6h-4"></path>
        <path d="M12 12h4"></path>
        <circle cx="6" cy="12" r="2"></circle>
    </svg>
);


// Background Icons
export const TsukubaIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 9a3 3 0 0 0-3 3v6h3"></path>
        <path d="M12 12h1.5a1.5 1.5 0 0 1 0 3H12"></path>
        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0z"></path>
    </svg>
);

export const NurburgringIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M15 5H9v3h6V5z"></path>
        <path d="M18.3 8.7a9 9 0 1 0-12.6 0"></path>
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>
    </svg>
);

export const DragStripIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M8 6h8v12H8z"></path>
        <circle cx="12" cy="9" r="1"></circle>
        <circle cx="12" cy="12" r="1"></circle>
        <circle cx="12" cy="15" r="1"></circle>
    </svg>
);

export const HighwayIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M7 2h10"></path>
        <path d="M3 22h18"></path>
        <path d="m7 2 4 10"></path>
        <path d="m17 2-4 10"></path>
        <path d="M12 12v10"></path>
    </svg>
);

export const ParkingGarageIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M13 13H4a2 2 0 0 0-2 2v5h13v-7a2 2 0 0 0-2-2z"></path>
        <path d="M22 20h-5.632a2 2 0 0 0-1.92 1.447L14 23h-2l.649-1.553A2 2 0 0 0 10.72 20H2"></path>
        <path d="M9 13l-4-4"></path>
        <path d="M13 13l4-4"></path>
        <path d="M2 13h18v-2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"></path>
    </svg>
);

export const CityStreetsIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M6 21V3a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v18"></path>
        <path d="M12 21v-4"></path>
        <path d="M10 3h4"></path>
        <path d="M10 7h4"></path>
        <path d="M10 11h4"></path>
        <path d="M10 15h4"></path>
    </svg>
);

export const PhotoshootStudioIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v4"></path>
      <path d="M12 15V3"></path>
      <path d="M8 3H6l-2 3h4l2-3h4l2 3h4l-2-3h-2"></path>
    </svg>
);

export const CanyonRoadIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 21c3.28-1.5 4.72-4.5 4-8s-2.8-5-6-5"></path>
      <path d="M22 3c-3.28 1.5-4.72 4.5-4 8s2.8 5 6 5"></path>
      <path d="M12 3v18"></path>
    </svg>
);

// Text-based Brand Icons
const BrandIcon: React.FC<{ brand: string } & IconProps> = ({ brand, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" className={className}>
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
            {brand}
        </text>
    </svg>
);

export const HksIcon: React.FC<IconProps> = (props) => <BrandIcon brand="HKS" {...props} />;
export const GreddyIcon: React.FC<IconProps> = (props) => <BrandIcon brand="GReddy" {...props} />;
export const SpoonIcon: React.FC<IconProps> = (props) => <BrandIcon brand="Spoon" {...props} />;
export const AdvanIcon: React.FC<IconProps> = (props) => <BrandIcon brand="ADVAN" {...props} />;
export const HooniganIcon: React.FC<IconProps> = (props) => <BrandIcon brand="HNGN" {...props} />;
export const HolleyIcon: React.FC<IconProps> = (props) => <BrandIcon brand="Holley" {...props} />;
export const MomoIcon: React.FC<IconProps> = (props) => <BrandIcon brand="MOMO" {...props} />;
export const BbsIcon: React.FC<IconProps> = (props) => <BrandIcon brand="BBS" {...props} />;
export const RecaroIcon: React.FC<IconProps> = (props) => <BrandIcon brand="RECARO" {...props} />;
export const FalkenIcon: React.FC<IconProps> = (props) => <BrandIcon brand="FALKEN" {...props} />;
export const ToyoIcon: React.FC<IconProps> = (props) => <BrandIcon brand="TOYO" {...props} />;
export const SparcoIcon: React.FC<IconProps> = (props) => <BrandIcon brand="sparco" {...props} />;
export const BremboIcon: React.FC<IconProps> = (props) => <BrandIcon brand="brembo" {...props} />;
export const BilsteinIcon: React.FC<IconProps> = (props) => <BrandIcon brand="BILSTEIN" {...props} />;